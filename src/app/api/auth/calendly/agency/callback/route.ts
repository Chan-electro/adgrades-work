/**
 * GET /api/auth/calendly/agency/callback
 * 
 * Handles OAuth callback for shared agency Calendly account.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForTokens, getCurrentUser } from "@/lib/calendly";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.redirect(
                new URL("/login", process.env.NEXTAUTH_URL)
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        if (error) {
            console.error("Calendly OAuth error:", error);
            return NextResponse.redirect(
                new URL(`/scheduler?error=${error}`, process.env.NEXTAUTH_URL)
            );
        }

        if (!code) {
            return NextResponse.redirect(
                new URL("/scheduler?error=missing_code", process.env.NEXTAUTH_URL)
            );
        }

        // Validate state
        if (state) {
            try {
                const stateData = JSON.parse(Buffer.from(state, "base64").toString());
                if (stateData.type !== "agency") {
                    // Not an agency callback, redirect to regular callback
                    return NextResponse.redirect(
                        new URL(`/api/auth/calendly/callback?code=${code}&state=${state}`, process.env.NEXTAUTH_URL)
                    );
                }
            } catch {
                console.error("Invalid state parameter");
            }
        }

        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(code);

        // Get Calendly user info
        const calendlyUser = await getCurrentUser(tokens.access_token);

        // Calculate token expiry
        const expiresAt = new Date(
            (tokens.created_at + tokens.expires_in) * 1000
        );

        // Delete any existing agency connection and create new one
        await prisma.agencyCalendlyConnection.deleteMany({});

        await prisma.agencyCalendlyConnection.create({
            data: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt,
                calendlyUri: calendlyUser.uri,
                schedulingUrl: calendlyUser.scheduling_url,
                ownerEmail: calendlyUser.email,
                ownerName: calendlyUser.name,
                organization: calendlyUser.current_organization,
            },
        });

        // Redirect to scheduler with success
        return NextResponse.redirect(
            new URL("/scheduler?calendly=agency_connected", process.env.NEXTAUTH_URL)
        );
    } catch (error) {
        console.error("Error in agency Calendly OAuth callback:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.redirect(
            new URL(
                `/scheduler?error=calendly_callback_failed&message=${encodeURIComponent(message)}`,
                process.env.NEXTAUTH_URL
            )
        );
    }
}
