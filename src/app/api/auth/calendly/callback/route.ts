/**
 * GET /api/auth/calendly/callback
 * 
 * Handles the OAuth callback from Calendly after user authorization.
 * Exchanges the authorization code for access/refresh tokens and stores them.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForTokens, getCurrentUser } from "@/lib/calendly";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        // Handle error from Calendly
        if (error) {
            console.error("Calendly OAuth error:", error);
            return NextResponse.redirect(
                new URL(
                    `/scheduler?error=calendly_denied&message=${encodeURIComponent(error)}`,
                    process.env.NEXTAUTH_URL
                )
            );
        }

        // Validate authorization code
        if (!code) {
            return NextResponse.redirect(
                new URL("/scheduler?error=missing_code", process.env.NEXTAUTH_URL)
            );
        }

        // Get current session
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.redirect(
                new URL("/scheduler/login", process.env.NEXTAUTH_URL)
            );
        }

        // Validate state parameter and check if it's agency connection
        let isAgencyConnection = false;
        if (state) {
            try {
                const decodedState = JSON.parse(
                    Buffer.from(state, "base64").toString()
                );

                // Check if this is an agency connection
                if (decodedState.type === "agency") {
                    isAgencyConnection = true;
                } else {
                    // Check if state matches current user (for per-user connections)
                    if (decodedState.userId !== session.user.id) {
                        console.error("State mismatch: user ID doesn't match");
                        return NextResponse.redirect(
                            new URL("/scheduler?error=state_mismatch", process.env.NEXTAUTH_URL)
                        );
                    }
                }

                // Check timestamp (15 minute limit)
                const fifteenMinutes = 15 * 60 * 1000;
                if (Date.now() - decodedState.timestamp > fifteenMinutes) {
                    return NextResponse.redirect(
                        new URL("/scheduler?error=state_expired", process.env.NEXTAUTH_URL)
                    );
                }
            } catch {
                console.error("Failed to decode state parameter");
                return NextResponse.redirect(
                    new URL("/scheduler?error=invalid_state", process.env.NEXTAUTH_URL)
                );
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

        if (isAgencyConnection) {
            // Save as agency-wide shared connection
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

            return NextResponse.redirect(
                new URL("/scheduler?calendly=agency_connected", process.env.NEXTAUTH_URL)
            );
        }

        // Per-user connection
        // Ensure user exists in database (for internal auth users who don't have User records)
        await prisma.user.upsert({
            where: { id: session.user.id },
            create: {
                id: session.user.id,
                email: session.user.email || calendlyUser.email,
                name: session.user.name || calendlyUser.name,
                image: session.user.image || calendlyUser.avatar_url,
            },
            update: {
                // Only update if fields are empty
                email: session.user.email || calendlyUser.email,
            },
        });

        // Store or update Calendly connection
        await prisma.calendlyConnection.upsert({
            where: { userId: session.user.id },
            create: {
                userId: session.user.id,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt,
                calendlyUri: calendlyUser.uri,
                schedulingUrl: calendlyUser.scheduling_url,
                organization: calendlyUser.current_organization,
            },
            update: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt,
                calendlyUri: calendlyUser.uri,
                schedulingUrl: calendlyUser.scheduling_url,
                organization: calendlyUser.current_organization,
            },
        });

        // Redirect to scheduler with success
        return NextResponse.redirect(
            new URL("/scheduler?calendly=connected", process.env.NEXTAUTH_URL)
        );
    } catch (error) {
        console.error("Error in Calendly OAuth callback:", error);
        return NextResponse.redirect(
            new URL(
                `/scheduler?error=calendly_callback_failed&message=${encodeURIComponent(
                    error instanceof Error ? error.message : "Unknown error"
                )}`,
                process.env.NEXTAUTH_URL
            )
        );
    }
}
