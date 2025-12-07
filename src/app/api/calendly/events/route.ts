/**
 * GET /api/calendly/events
 * 
 * Fetches scheduled events from Calendly for the authenticated user.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import {
    getScheduledEvents,
    getEventInvitees,
    refreshAccessToken,
} from "@/lib/calendly";

export async function GET(request: NextRequest) {
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

        // Parse query parameters
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get("status") as "active" | "canceled" | null;
        const count = searchParams.get("count");
        const minStartTime =
            searchParams.get("minStartTime") || new Date().toISOString();

        // Fetch events from Calendly
        const events = await getScheduledEvents(
            accessToken,
            connection.calendlyUri,
            {
                status: status || "active",
                count: count ? parseInt(count, 10) : 25,
                minStartTime,
            }
        );

        // Optionally fetch invitees for each event
        const includeInvitees = searchParams.get("includeInvitees") === "true";

        if (includeInvitees) {
            const eventsWithInvitees = await Promise.all(
                events.map(async (event) => {
                    try {
                        const invitees = await getEventInvitees(accessToken, event.uri);
                        return { ...event, invitees };
                    } catch {
                        return { ...event, invitees: [] };
                    }
                })
            );
            return NextResponse.json({ events: eventsWithInvitees });
        }

        return NextResponse.json({ events });
    } catch (error) {
        console.error("Error fetching Calendly events:", error);
        return NextResponse.json(
            { error: "Failed to fetch Calendly events" },
            { status: 500 }
        );
    }
}
