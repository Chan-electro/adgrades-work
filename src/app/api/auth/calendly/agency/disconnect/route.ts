/**
 * POST /api/auth/calendly/agency/disconnect
 * 
 * Disconnects the shared agency Calendly account.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function POST() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
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
