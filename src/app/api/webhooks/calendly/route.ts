/**
 * POST /api/webhooks/calendly
 * 
 * Handles incoming webhooks from Calendly.
 * 
 * Webhook events:
 * - invitee.created: When someone books a meeting
 * - invitee.canceled: When someone cancels a meeting
 * - routing_form_submission.created: When a routing form is submitted
 * 
 * @see https://developer.calendly.com/api-docs/docs/webhook-overview
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/calendly";

interface CalendlyWebhookPayload {
    event: string;
    created_at: string;
    created_by: string;
    payload: {
        uri: string;
        email?: string;
        name?: string;
        status?: string;
        timezone?: string;
        event?: string;
        scheduled_event?: {
            uri: string;
            name: string;
            status: string;
            start_time: string;
            end_time: string;
            location?: {
                type: string;
                location?: string;
                join_url?: string;
            };
        };
        questions_and_answers?: Array<{
            question: string;
            answer: string;
        }>;
        tracking?: {
            utm_source?: string;
            utm_medium?: string;
            utm_campaign?: string;
        };
        cancel_url?: string;
        reschedule_url?: string;
        no_show?: {
            uri?: string;
            created_at?: string;
        };
        reconfirmation?: {
            created_at?: string;
            confirmed_at?: string;
        };
    };
}

export async function POST(request: NextRequest) {
    try {
        // Get the raw body for signature verification
        const rawBody = await request.text();

        // Get the signature from headers
        const signature = request.headers.get("Calendly-Webhook-Signature");

        if (!signature) {
            console.error("Missing Calendly webhook signature");
            return NextResponse.json(
                { error: "Missing signature" },
                { status: 401 }
            );
        }

        // Verify the webhook signature
        const isValid = verifyWebhookSignature(rawBody, signature);

        if (!isValid) {
            console.error("Invalid Calendly webhook signature");
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 }
            );
        }

        // Parse the webhook payload
        const payload: CalendlyWebhookPayload = JSON.parse(rawBody);

        console.log(`Received Calendly webhook: ${payload.event}`);
        console.log("Payload:", JSON.stringify(payload, null, 2));

        // Handle different webhook events
        switch (payload.event) {
            case "invitee.created":
                await handleInviteeCreated(payload);
                break;

            case "invitee.canceled":
                await handleInviteeCanceled(payload);
                break;

            case "routing_form_submission.created":
                await handleRoutingFormSubmission(payload);
                break;

            default:
                console.log(`Unhandled webhook event: ${payload.event}`);
        }

        // Always return 200 to acknowledge receipt
        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Error processing Calendly webhook:", error);
        // Still return 200 to prevent Calendly from retrying
        return NextResponse.json(
            { error: "Webhook processing failed", received: true },
            { status: 200 }
        );
    }
}

/**
 * Handle invitee.created event (new booking)
 */
async function handleInviteeCreated(payload: CalendlyWebhookPayload) {
    const { email, name, scheduled_event, questions_and_answers } = payload.payload;

    console.log("New booking created:");
    console.log(`  - Invitee: ${name} (${email})`);
    console.log(`  - Event: ${scheduled_event?.name}`);
    console.log(`  - Start: ${scheduled_event?.start_time}`);
    console.log(`  - End: ${scheduled_event?.end_time}`);

    if (questions_and_answers && questions_and_answers.length > 0) {
        console.log("  - Q&A:");
        questions_and_answers.forEach((qa) => {
            console.log(`    ${qa.question}: ${qa.answer}`);
        });
    }

    // TODO: Implement custom logic here, such as:
    // - Create a record in your database
    // - Send a notification to your team
    // - Integrate with your CRM
    // - Trigger a workflow in n8n
}

/**
 * Handle invitee.canceled event (canceled booking)
 */
async function handleInviteeCanceled(payload: CalendlyWebhookPayload) {
    const { email, name, scheduled_event } = payload.payload;

    console.log("Booking canceled:");
    console.log(`  - Invitee: ${name} (${email})`);
    console.log(`  - Event: ${scheduled_event?.name}`);

    // TODO: Implement custom logic here, such as:
    // - Update the record in your database
    // - Send a notification to your team
    // - Free up resources
}

/**
 * Handle routing_form_submission.created event
 */
async function handleRoutingFormSubmission(payload: CalendlyWebhookPayload) {
    console.log("Routing form submitted");
    console.log("Payload:", JSON.stringify(payload.payload, null, 2));

    // TODO: Implement custom logic for routing form submissions
}
