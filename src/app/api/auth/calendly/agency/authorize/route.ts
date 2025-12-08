/**
 * GET /api/auth/calendly/agency/authorize
 * 
 * Initiates OAuth flow for shared agency Calendly account.
 * Only admins should be able to connect the agency account.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAuthorizationUrl } from "@/lib/calendly";

export async function GET() {
    try {
        const session = await getSession();

        if (!session?.userId) {
            return NextResponse.redirect(
                new URL("/login", process.env.NEXTAUTH_URL)
            );
        }

        // Generate state with "agency" flag
        const state = Buffer.from(
            JSON.stringify({
                type: "agency",
                userId: session.userId,
                timestamp: Date.now(),
            })
        ).toString("base64");

        const authUrl = getAuthorizationUrl(state);
        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error("Error initiating agency Calendly OAuth:", error);
        return NextResponse.redirect(
            new URL("/scheduler?error=calendly_auth_failed", process.env.NEXTAUTH_URL)
        );
    }
}
