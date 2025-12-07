/**
 * Calendly API Service
 * 
 * Handles OAuth flow and API interactions with Calendly
 */

import crypto from "crypto";

const CALENDLY_AUTH_BASE = "https://auth.calendly.com";
const CALENDLY_API_BASE = "https://api.calendly.com";

interface CalendlyTokens {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    created_at: number;
    scope: string;
    owner: string;
    organization: string;
}

interface CalendlyUser {
    uri: string;
    name: string;
    slug: string;
    email: string;
    scheduling_url: string;
    timezone: string;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
    current_organization: string;
}

interface CalendlyEventType {
    uri: string;
    name: string;
    active: boolean;
    slug: string;
    scheduling_url: string;
    duration: number;
    kind: string;
    color: string;
    description_plain: string;
    description_html: string;
}

interface CalendlyEvent {
    uri: string;
    name: string;
    status: "active" | "canceled";
    start_time: string;
    end_time: string;
    event_type: string;
    location: {
        type: string;
        location?: string;
        join_url?: string;
    } | null;
    invitees_counter: {
        total: number;
        active: number;
        limit: number;
    };
    created_at: string;
    updated_at: string;
    event_memberships: Array<{
        user: string;
        user_email: string;
        user_name: string;
    }>;
}

interface CalendlyInvitee {
    uri: string;
    email: string;
    name: string;
    status: "active" | "canceled";
    timezone: string;
    created_at: string;
    updated_at: string;
}

/**
 * Generate the Calendly OAuth authorization URL
 */
export function getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
        client_id: process.env.CALENDLY_CLIENT_ID!,
        redirect_uri: process.env.CALENDLY_REDIRECT_URI!,
        response_type: "code",
    });

    if (state) {
        params.append("state", state);
    }

    return `${CALENDLY_AUTH_BASE}/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access and refresh tokens
 */
export async function exchangeCodeForTokens(
    code: string
): Promise<CalendlyTokens> {
    const response = await fetch(`${CALENDLY_AUTH_BASE}/oauth/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: process.env.CALENDLY_CLIENT_ID!,
            client_secret: process.env.CALENDLY_CLIENT_SECRET!,
            code,
            redirect_uri: process.env.CALENDLY_REDIRECT_URI!,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to exchange code for tokens: ${error}`);
    }

    return response.json();
}

/**
 * Refresh expired access token using refresh token
 */
export async function refreshAccessToken(
    refreshToken: string
): Promise<CalendlyTokens> {
    const response = await fetch(`${CALENDLY_AUTH_BASE}/oauth/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            client_id: process.env.CALENDLY_CLIENT_ID!,
            client_secret: process.env.CALENDLY_CLIENT_SECRET!,
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to refresh access token: ${error}`);
    }

    return response.json();
}

/**
 * Get the current authenticated Calendly user
 */
export async function getCurrentUser(
    accessToken: string
): Promise<CalendlyUser> {
    const response = await fetch(`${CALENDLY_API_BASE}/users/me`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get current user: ${error}`);
    }

    const data = await response.json();
    return data.resource;
}

/**
 * Get user's event types (meeting types they've created)
 */
export async function getEventTypes(
    accessToken: string,
    userUri: string
): Promise<CalendlyEventType[]> {
    const params = new URLSearchParams({
        user: userUri,
        active: "true",
    });

    const response = await fetch(
        `${CALENDLY_API_BASE}/event_types?${params.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get event types: ${error}`);
    }

    const data = await response.json();
    return data.collection;
}

/**
 * Get scheduled events for a user
 */
export async function getScheduledEvents(
    accessToken: string,
    userUri: string,
    options?: {
        minStartTime?: string;
        maxStartTime?: string;
        status?: "active" | "canceled";
        count?: number;
    }
): Promise<CalendlyEvent[]> {
    const params = new URLSearchParams({
        user: userUri,
    });

    if (options?.minStartTime) {
        params.append("min_start_time", options.minStartTime);
    }
    if (options?.maxStartTime) {
        params.append("max_start_time", options.maxStartTime);
    }
    if (options?.status) {
        params.append("status", options.status);
    }
    if (options?.count) {
        params.append("count", options.count.toString());
    }

    const response = await fetch(
        `${CALENDLY_API_BASE}/scheduled_events?${params.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get scheduled events: ${error}`);
    }

    const data = await response.json();
    return data.collection;
}

/**
 * Get invitees for a specific event
 */
export async function getEventInvitees(
    accessToken: string,
    eventUri: string
): Promise<CalendlyInvitee[]> {
    // Extract the event UUID from the URI
    const eventUuid = eventUri.split("/").pop();

    const response = await fetch(
        `${CALENDLY_API_BASE}/scheduled_events/${eventUuid}/invitees`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get event invitees: ${error}`);
    }

    const data = await response.json();
    return data.collection;
}

/**
 * Verify Calendly webhook signature
 * 
 * @see https://developer.calendly.com/api-docs/ZG9jOjM2MzE2MDM4-webhook-signatures
 */
export function verifyWebhookSignature(
    payload: string,
    signature: string,
    tolerance: number = 180 // 3 minutes default tolerance
): boolean {
    const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;

    if (!signingKey) {
        console.error("CALENDLY_WEBHOOK_SIGNING_KEY not configured");
        return false;
    }

    try {
        // Parse the signature header
        // Format: t=<timestamp>,v1=<signature>
        const parts = signature.split(",");
        const timestampPart = parts.find((p) => p.startsWith("t="));
        const signaturePart = parts.find((p) => p.startsWith("v1="));

        if (!timestampPart || !signaturePart) {
            console.error("Invalid webhook signature format");
            return false;
        }

        const timestamp = timestampPart.substring(2);
        const receivedSignature = signaturePart.substring(3);

        // Check timestamp tolerance
        const currentTime = Math.floor(Date.now() / 1000);
        const webhookTime = parseInt(timestamp, 10);

        if (Math.abs(currentTime - webhookTime) > tolerance) {
            console.error("Webhook timestamp outside tolerance window");
            return false;
        }

        // Compute expected signature
        const signedPayload = `${timestamp}.${payload}`;
        const expectedSignature = crypto
            .createHmac("sha256", signingKey)
            .update(signedPayload)
            .digest("hex");

        // Compare signatures using timing-safe comparison
        return crypto.timingSafeEqual(
            Buffer.from(receivedSignature),
            Buffer.from(expectedSignature)
        );
    } catch (error) {
        console.error("Error verifying webhook signature:", error);
        return false;
    }
}

// Export types for use in other files
export type {
    CalendlyTokens,
    CalendlyUser,
    CalendlyEventType,
    CalendlyEvent,
    CalendlyInvitee,
};
