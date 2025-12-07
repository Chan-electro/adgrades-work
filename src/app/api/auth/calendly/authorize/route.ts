/**
 * GET /api/auth/calendly/authorize
 * 
 * Initiates the Calendly OAuth flow by redirecting to Calendly's authorization page.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { getAuthorizationUrl } from "@/lib/calendly";

export async function GET() {
    try {
        // Check if user is authenticated
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.redirect(
                new URL("/scheduler/login", process.env.NEXTAUTH_URL)
            );
        }

        // Generate state parameter with user ID for security
        const state = Buffer.from(
            JSON.stringify({
                userId: session.user.id,
                timestamp: Date.now(),
            })
        ).toString("base64");

        // Get Calendly authorization URL
        const authUrl = getAuthorizationUrl(state);

        // Redirect to Calendly
        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error("Error initiating Calendly OAuth:", error);
        return NextResponse.redirect(
            new URL("/scheduler?error=calendly_auth_failed", process.env.NEXTAUTH_URL)
        );
    }
}
