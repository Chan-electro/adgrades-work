/**
 * GET /api/auth/calendly/agency/authorize
 * 
 * Initiates OAuth flow for shared agency Calendly account.
 * Only admins should be able to connect the agency account.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { getAuthorizationUrl } from "@/lib/calendly";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.redirect(
                new URL("/login", process.env.NEXTAUTH_URL)
            );
        }

        // Generate state with "agency" flag
        const state = Buffer.from(
            JSON.stringify({
                type: "agency",
                userId: session.user.id,
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
