/**
 * POST /api/auth/calendly/agency/disconnect
 * 
 * Disconnects the shared agency Calendly account.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
    try {
        const session = await getSession();

        if (!session?.userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Delete the agency Calendly connection
        await prisma.agencyCalendlyConnection.deleteMany({});

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error disconnecting agency Calendly:", error);
        return NextResponse.json(
            { error: "Failed to disconnect agency Calendly" },
            { status: 500 }
        );
    }
}
