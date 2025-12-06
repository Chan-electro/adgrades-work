import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

const isMockMode = !process.env.GOOGLE_CLIENT_ID;

export async function getGoogleCalendarClient(userId: string) {
    if (isMockMode) return null;

    const account = await prisma.account.findFirst({
        where: {
            userId,
            provider: "google",
        },
    });

    if (!account?.access_token) {
        throw new Error("No Google account linked");
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
    });

    return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function getFreeBusy(
    userId: string,
    timeMin: Date,
    timeMax: Date
): Promise<{ start: Date; end: Date }[]> {
    if (isMockMode) {
        console.log("⚠️ Mock Mode: Returning empty busy slots for calendar");
        return [];
    }

    const calendar = await getGoogleCalendarClient(userId);
    if (!calendar) return [];

    const account = await prisma.account.findFirst({
        where: { userId, provider: "google" },
        include: { user: true },
    });

    const response = await calendar.freebusy.query({
        requestBody: {
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            items: [{ id: account?.user.email || "primary" }],
        },
    });

    const busy = response.data.calendars?.[account?.user.email || "primary"]?.busy || [];

    return busy.map((slot) => ({
        start: new Date(slot.start!),
        end: new Date(slot.end!),
    }));
}

export async function createCalendarEvent(
    userId: string,
    summary: string,
    description: string,
    startTime: Date,
    endTime: Date,
    attendeeEmail: string
): Promise<string | null> {
    if (isMockMode) {
        console.log("⚠️ Mock Mode: simulating calendar event creation", { summary, startTime });
        return "mock-event-id-" + Date.now();
    }

    const calendar = await getGoogleCalendarClient(userId);
    if (!calendar) return null;

    const event = await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
            summary,
            description,
            start: {
                dateTime: startTime.toISOString(),
            },
            end: {
                dateTime: endTime.toISOString(),
            },
            attendees: [{ email: attendeeEmail }],
            reminders: {
                useDefault: true,
            },
        },
        sendUpdates: "all",
    });

    return event.data.id || null;
}
