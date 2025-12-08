/**
 * GET /api/auth/calendly/status
 * 
 * Checks if the current user has connected their Calendly account.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getSession();

        if (!session?.userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const connection = await prisma.calendlyConnection.findUnique({
            where: { userId: session.userId },
            select: {
                calendlyUri: true,
                schedulingUrl: true,
                organization: true,
                expiresAt: true,
                createdAt: true,
            },
        });

        if (!connection) {
            return NextResponse.json({
                connected: false,
            });
        }

        // Check if token is expired
        const isExpired = new Date() > new Date(connection.expiresAt);

        return NextResponse.json({
            connected: true,
            isExpired,
            calendlyUri: connection.calendlyUri,
            schedulingUrl: connection.schedulingUrl,
            organization: connection.organization,
            connectedAt: connection.createdAt,
        });
    } catch (error) {
        console.error("Error checking Calendly status:", error);
        return NextResponse.json(
            { error: "Failed to check Calendly status" },
            { status: 500 }
        );
    }
}
