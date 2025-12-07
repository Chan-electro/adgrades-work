/**
 * POST /api/auth/calendly/disconnect
 * 
 * Disconnects the user's Calendly account by removing the connection.
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

        // Delete the Calendly connection
        await prisma.calendlyConnection.delete({
            where: { userId: session.user.id },
        });

        return NextResponse.json({
            success: true,
            message: "Calendly disconnected successfully",
        });
    } catch (error) {
        // Handle case where connection doesn't exist
        if (
            error instanceof Error &&
            error.message.includes("Record to delete does not exist")
        ) {
            return NextResponse.json({
                success: true,
                message: "No Calendly connection found",
            });
        }

        console.error("Error disconnecting Calendly:", error);
        return NextResponse.json(
            { error: "Failed to disconnect Calendly" },
            { status: 500 }
        );
    }
}
