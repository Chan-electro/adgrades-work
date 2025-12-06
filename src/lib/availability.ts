import { prisma } from "@/lib/prisma";
import { getFreeBusy } from "@/lib/google-calendar";

export interface TimeSlot {
    start: Date;
    end: Date;
}

export interface AvailabilitySettings {
    days: number[]; // 0=Sunday, 1=Monday, etc.
    startTime: string; // "09:00"
    endTime: string; // "17:00"
    timeZone: string;
}

const SLOT_DURATION_MINUTES = 30;

export async function getUserAvailability(
    userId: string
): Promise<AvailabilitySettings | null> {
    const availability = await prisma.availability.findUnique({
        where: { userId },
    });

    if (!availability) return null;

    return {
        days: JSON.parse(availability.days),
        startTime: availability.startTime,
        endTime: availability.endTime,
        timeZone: availability.timeZone,
    };
}

export async function getAvailableSlots(
    userId: string,
    date: Date
): Promise<TimeSlot[]> {
    const availability = await getUserAvailability(userId);
    if (!availability) return [];

    const dayOfWeek = date.getDay();
    if (!availability.days.includes(dayOfWeek)) return [];

    // Parse start and end times
    const [startHour, startMinute] = availability.startTime.split(":").map(Number);
    const [endHour, endMinute] = availability.endTime.split(":").map(Number);

    const dayStart = new Date(date);
    dayStart.setHours(startHour, startMinute, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(endHour, endMinute, 0, 0);

    // Get busy slots from Google Calendar
    let busySlots: TimeSlot[] = [];
    try {
        busySlots = await getFreeBusy(userId, dayStart, dayEnd);
    } catch (error) {
        console.error("Error fetching calendar busy slots:", error);
        // Continue without calendar data
    }

    // Get already booked meetings from our database
    const bookedMeetings = await prisma.meeting.findMany({
        where: {
            userId,
            startTime: { gte: dayStart },
            endTime: { lte: dayEnd },
        },
    });

    const allBusy = [
        ...busySlots,
        ...bookedMeetings.map((m) => ({ start: m.startTime, end: m.endTime })),
    ];

    // Generate all possible slots
    const slots: TimeSlot[] = [];
    let current = new Date(dayStart);

    while (current < dayEnd) {
        const slotEnd = new Date(current.getTime() + SLOT_DURATION_MINUTES * 60000);

        if (slotEnd <= dayEnd) {
            // Check if slot overlaps with any busy period
            const isConflict = allBusy.some(
                (busy) => current < busy.end && slotEnd > busy.start
            );

            if (!isConflict) {
                slots.push({
                    start: new Date(current),
                    end: new Date(slotEnd),
                });
            }
        }

        current = slotEnd;
    }

    return slots;
}

export async function setUserAvailability(
    userId: string,
    settings: AvailabilitySettings
): Promise<void> {
    await prisma.availability.upsert({
        where: { userId },
        create: {
            userId,
            days: JSON.stringify(settings.days),
            startTime: settings.startTime,
            endTime: settings.endTime,
            timeZone: settings.timeZone,
        },
        update: {
            days: JSON.stringify(settings.days),
            startTime: settings.startTime,
            endTime: settings.endTime,
            timeZone: settings.timeZone,
        },
    });
}
