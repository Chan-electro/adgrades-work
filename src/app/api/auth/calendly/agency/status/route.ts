/**
 * GET /api/auth/calendly/agency/status
 * 
 * Returns the shared agency Calendly connection status.
 * Any authenticated user can view this.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const connection = await prisma.agencyCalendlyConnection.findFirst({
            select: {
                calendlyUri: true,
                schedulingUrl: true,
                ownerEmail: true,
                ownerName: true,
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
            ownerEmail: connection.ownerEmail,
            ownerName: connection.ownerName,
            organization: connection.organization,
            connectedAt: connection.createdAt,
        });
    } catch (error) {
        console.error("Error checking agency Calendly status:", error);
        return NextResponse.json(
            { error: "Failed to check agency Calendly status" },
            { status: 500 }
        );
    }
}
