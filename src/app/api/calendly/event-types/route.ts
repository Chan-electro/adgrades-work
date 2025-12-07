/**
 * GET /api/calendly/event-types
 * 
 * Fetches event types (meeting types) from Calendly for the authenticated user.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { getEventTypes, refreshAccessToken } from "@/lib/calendly";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get Calendly connection
        const connection = await prisma.calendlyConnection.findUnique({
            where: { userId: session.user.id },
        });

        if (!connection) {
            return NextResponse.json(
                { error: "Calendly not connected" },
                { status: 400 }
            );
        }

        let accessToken = connection.accessToken;

        // Check if token is expired and refresh if needed
        if (new Date() > new Date(connection.expiresAt)) {
            try {
                const newTokens = await refreshAccessToken(connection.refreshToken);

                const expiresAt = new Date(
                    (newTokens.created_at + newTokens.expires_in) * 1000
                );

                // Update tokens in database
                await prisma.calendlyConnection.update({
                    where: { userId: session.user.id },
                    data: {
                        accessToken: newTokens.access_token,
                        refreshToken: newTokens.refresh_token,
                        expiresAt,
                    },
                });

                accessToken = newTokens.access_token;
            } catch (refreshError) {
                console.error("Failed to refresh Calendly token:", refreshError);
                return NextResponse.json(
                    { error: "Calendly token expired. Please reconnect." },
                    { status: 401 }
                );
            }
        }

        // Fetch event types from Calendly
        const eventTypes = await getEventTypes(accessToken, connection.calendlyUri);

        return NextResponse.json({ eventTypes });
    } catch (error) {
        console.error("Error fetching Calendly event types:", error);
        return NextResponse.json(
            { error: "Failed to fetch Calendly event types" },
            { status: 500 }
        );
    }
}
