import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCalendarEvent } from "@/lib/google-calendar";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { userId, guestName, guestEmail, guestNotes, startTime, endTime } = body;

    if (!userId || !guestName || !guestEmail || !startTime || !endTime) {
        return NextResponse.json(
            { error: "Missing required fields" },
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

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Create Google Calendar event
    let googleEventId: string | null = null;
    try {
        googleEventId = await createCalendarEvent(
            userId,
            `Meeting with ${guestName}`,
            guestNotes || `Booked via Meeting Scheduler\nGuest: ${guestName} (${guestEmail})`,
            start,
            end,
            guestEmail
        );
    } catch (error) {
        console.error("Failed to create Google Calendar event:", error);
        // Continue without calendar event - still save to DB
    }

    // Save meeting to database
    const meeting = await prisma.meeting.create({
        data: {
            userId,
            guestName,
            guestEmail,
            guestNotes,
            startTime: start,
            endTime: end,
            googleEventId,
        },
    });

    return NextResponse.json({
        success: true,
        meeting: {
            id: meeting.id,
            startTime: meeting.startTime.toISOString(),
            endTime: meeting.endTime.toISOString(),
            googleEventId: meeting.googleEventId,
        },
    });
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const meetings = await prisma.meeting.findMany({
        where: { userId },
        orderBy: { startTime: "asc" },
    });

    return NextResponse.json({
        meetings: meetings.map((m) => ({
            id: m.id,
            guestName: m.guestName,
            guestEmail: m.guestEmail,
            guestNotes: m.guestNotes,
            startTime: m.startTime.toISOString(),
            endTime: m.endTime.toISOString(),
        })),
    });
}
