import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { getUserAvailability, setUserAvailability } from "@/lib/availability";

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const availability = await getUserAvailability(session.user.id);

    if (!availability) {
        return NextResponse.json({
            days: [1, 2, 3, 4, 5], // Mon-Fri default
            startTime: "09:00",
            endTime: "17:00",
            timeZone: "UTC",
        });
    }

    return NextResponse.json(availability);
}

export async function POST(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    await setUserAvailability(session.user.id, {
        days: body.days,
        startTime: body.startTime,
        endTime: body.endTime,
        timeZone: body.timeZone || "UTC",
    });

    return NextResponse.json({ success: true });
}
