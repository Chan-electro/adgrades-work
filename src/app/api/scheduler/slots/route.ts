import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/availability";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const dateStr = searchParams.get("date");

    if (!userId || !dateStr) {
        return NextResponse.json(
            { error: "userId and date are required" },
            { status: 400 }
        );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const date = new Date(dateStr);
    const slots = await getAvailableSlots(userId, date);

    return NextResponse.json({
        slots: slots.map((slot) => ({
            start: slot.start.toISOString(),
            end: slot.end.toISOString(),
        })),
    });
}
