"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { QuickBookButton } from "@/components/CalendlyPopup";
import { CalendlyEmbed } from "@/components/CalendlyEmbed";

const DAYS = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
];

interface CalendlyEvent {
    uri: string;
    name: string;
    status: "active" | "canceled";
    start_time: string;
    end_time: string;
    location: {
        type: string;
        location?: string;
        join_url?: string;
    } | null;
    invitees_counter: {
        total: number;
        active: number;
    };
}

interface CalendlyEventType {
    uri: string;
    name: string;
    active: boolean;
    scheduling_url: string;
    duration: number;
    color: string;
    description_plain: string;
}


export default function SchedulerPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        }>
            <SchedulerPageContent />
        </Suspense>
    );
}

function SchedulerPageContent() {
    const searchParams = useSearchParams();

    // Availability state
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");

    // Calendly state
    const [calendlyStatus, setCalendlyStatus] = useState<{
        connected: boolean;
        isExpired?: boolean;
        isAgency?: boolean;
        calendlyUri?: string;
        schedulingUrl?: string;
        ownerName?: string;
        ownerEmail?: string;
    } | null>(null);
    const [calendlyLoading, setCalendlyLoading] = useState(true);
    const [disconnecting, setDisconnecting] = useState(false);
    const [events, setEvents] = useState<CalendlyEvent[]>([]);
    const [eventTypes, setEventTypes] = useState<CalendlyEventType[]>([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [expandedEventType, setExpandedEventType] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Toast notification state
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        fetchAvailability();
        fetchCalendlyStatus();

        // Handle OAuth callback messages
        const calendlyParam = searchParams.get("calendly");
        const errorParam = searchParams.get("error");

        if (calendlyParam === "connected") {
            showToast("Calendly connected successfully!", "success");
            // Clean up URL
            window.history.replaceState({}, "", "/scheduler");
        } else if (errorParam) {
            showToast(`Error: ${errorParam.replace(/_/g, " ")}`, "error");
            window.history.replaceState({}, "", "/scheduler");
        }
    }, [searchParams]);

    function showToast(message: string, type: "success" | "error") {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    }

    async function fetchAvailability() {
        try {
            const res = await fetch("/api/scheduler/availability");
            if (res.ok) {
                const data = await res.json();
                setSelectedDays(data.days);
                setStartTime(data.startTime);
                setEndTime(data.endTime);
            }
        } catch (error) {
            console.error("Failed to fetch availability:", error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchCalendlyStatus() {
        try {
            // First try agency connection, then fall back to user connection
            const agencyRes = await fetch("/api/auth/calendly/agency/status");
            if (agencyRes.ok) {
                const data = await agencyRes.json();
                if (data.connected) {
                    setCalendlyStatus({ ...data, isAgency: true });
                    // Don't fetch events/event types for agency - just use booking widget
                    return;
                }
            }

            // Fall back to per-user connection
            const res = await fetch("/api/auth/calendly/status");
            if (res.ok) {
                const data = await res.json();
                setCalendlyStatus(data);

                // Fetch events and event types if connected
                if (data.connected && !data.isExpired) {
                    fetchCalendlyData();
                }
            }
        } catch (error) {
            console.error("Failed to fetch Calendly status:", error);
        } finally {
            setCalendlyLoading(false);
        }
    }

    async function fetchCalendlyData() {
        setEventsLoading(true);
        try {
            const [eventsRes, eventTypesRes, userRes] = await Promise.all([
                fetch("/api/calendly/events?count=10"),
                fetch("/api/calendly/event-types"),
                fetch("/api/calendly/user"),
            ]);

            if (eventsRes.ok) {
                const eventsData = await eventsRes.json();
                setEvents(eventsData.events || []);
            }

            if (eventTypesRes.ok) {
                const eventTypesData = await eventTypesRes.json();
                setEventTypes(eventTypesData.eventTypes || []);
            }

            // Always update scheduling URL from user info
            if (userRes.ok) {
                const userData = await userRes.json();
                if (userData.schedulingUrl) {
                    setCalendlyStatus(prev => prev ? { ...prev, schedulingUrl: userData.schedulingUrl } : prev);
                }
            }
        } catch (error) {
            console.error("Failed to fetch Calendly data:", error);
        } finally {
            setEventsLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch("/api/scheduler/availability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    days: selectedDays,
                    startTime,
                    endTime,
                }),
            });

            if (res.ok) {
                showToast("Availability saved successfully!", "success");
            }
        } catch (error) {
            console.error("Failed to save availability:", error);
            showToast("Failed to save availability", "error");
        } finally {
            setSaving(false);
        }
    }

    async function handleConnectCalendly() {
        // Use agency endpoint for shared Calendly account
        window.location.href = "/api/auth/calendly/agency/authorize";
    }

    async function handleDisconnectCalendly() {
        if (!confirm("Are you sure you want to disconnect Calendly?")) return;

        setDisconnecting(true);
        try {
            // Use agency disconnect if it's an agency connection
            const endpoint = calendlyStatus?.isAgency
                ? "/api/auth/calendly/agency/disconnect"
                : "/api/auth/calendly/disconnect";

            const res = await fetch(endpoint, { method: "POST" });
            if (res.ok) {
                setCalendlyStatus({ connected: false });
                setEvents([]);
                setEventTypes([]);
                showToast("Calendly disconnected", "success");
            } else {
                throw new Error("Failed to disconnect");
            }
        } catch (error) {
            console.error("Failed to disconnect Calendly:", error);
            showToast("Failed to disconnect Calendly", "error");
        } finally {
            setDisconnecting(false);
        }
    }

    function toggleDay(day: number) {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter((d) => d !== day));
        } else {
            setSelectedDays([...selectedDays, day].sort());
        }
    }

    function formatEventTime(startTime: string, endTime: string) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const dateStr = start.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
        const timeStr = `${start.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        })} - ${end.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        })}`;
        return { dateStr, timeStr };
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-6">Scheduler Settings</h1>

            {/* Toast Notification */}
            {toast && (
                <div
                    className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${toast.type === "success"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                        }`}
                >
                    {toast.message}
                </div>
            )}

            {/* Calendly Integration Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-blue-600"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-medium">Calendly Integration</h2>
                            <p className="text-sm text-gray-500">
                                Connect your Calendly account to sync scheduling
                            </p>
                        </div>
                    </div>

                    {calendlyLoading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    ) : calendlyStatus?.connected ? (
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                Connected
                            </span>
                            <button
                                onClick={handleDisconnectCalendly}
                                disabled={disconnecting}
                                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                {disconnecting ? "Disconnecting..." : "Disconnect"}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleConnectCalendly}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                />
                            </svg>
                            Connect Calendly
                        </button>
                    )}
                </div>

                {/* Calendly Data */}
                {calendlyStatus?.connected && !calendlyLoading && (
                    <div className="border-t pt-4 mt-4">
                        {calendlyStatus.isExpired && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                                <span className="text-yellow-700 text-sm">
                                    Your Calendly session has expired. Please reconnect.
                                </span>
                                <button
                                    onClick={handleConnectCalendly}
                                    className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700"
                                >
                                    Reconnect
                                </button>
                            </div>
                        )}

                        {/* Scheduling URL with Copy */}
                        {calendlyStatus.schedulingUrl && (
                            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Your Scheduling URL</h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Share this link to let others book time with you
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(calendlyStatus.schedulingUrl!);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${copied
                                            ? "bg-green-500 text-white"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                            }`}
                                    >
                                        {copied ? (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                </svg>
                                                Copy Link
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="mt-2 p-2 bg-white rounded border border-blue-100 text-sm text-gray-700 font-mono truncate">
                                    {calendlyStatus.schedulingUrl}
                                </div>
                            </div>
                        )}

                        {eventsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-gray-500">Loading Calendly data...</span>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Event Types */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Your Event Types</h3>
                                    {eventTypes.length === 0 ? (
                                        <p className="text-sm text-gray-500">No event types found</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {eventTypes.map((eventType) => (
                                                <div
                                                    key={eventType.uri}
                                                    className="border rounded-lg overflow-hidden"
                                                >
                                                    <div className="p-3 hover:bg-gray-50">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-3 h-3 rounded-full"
                                                                    style={{ backgroundColor: eventType.color }}
                                                                ></div>
                                                                <span className="font-medium text-sm">
                                                                    {eventType.name}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {eventType.duration} min
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <QuickBookButton
                                                                    url={eventType.scheduling_url}
                                                                    eventName={eventType.name}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <a
                                                                href={eventType.scheduling_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-blue-600 hover:underline"
                                                            >
                                                                Open booking page →
                                                            </a>
                                                            <button
                                                                onClick={() => setExpandedEventType(
                                                                    expandedEventType === eventType.uri ? null : eventType.uri
                                                                )}
                                                                className="text-xs text-gray-600 hover:text-gray-800"
                                                            >
                                                                {expandedEventType === eventType.uri ? "Hide embed ▲" : "Show embed ▼"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {expandedEventType === eventType.uri && (
                                                        <div className="border-t bg-gray-50 p-2">
                                                            <CalendlyEmbed
                                                                url={eventType.scheduling_url}
                                                                height="500px"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Upcoming Events */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Upcoming Events</h3>
                                    {events.length === 0 ? (
                                        <p className="text-sm text-gray-500">No upcoming events</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {events.slice(0, 5).map((event) => {
                                                const { dateStr, timeStr } = formatEventTime(
                                                    event.start_time,
                                                    event.end_time
                                                );
                                                return (
                                                    <div
                                                        key={event.uri}
                                                        className={`p-3 border rounded-lg ${event.status === "canceled"
                                                            ? "bg-gray-50 opacity-60"
                                                            : ""
                                                            }`}
                                                    >
                                                        <div className="font-medium text-sm">
                                                            {event.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {dateStr} • {timeStr}
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            {event.invitees_counter.active} invitee(s)
                                                        </div>
                                                        {event.status === "canceled" && (
                                                            <span className="text-xs text-red-500">
                                                                Canceled
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Book a Meeting - Inline Embed */}
                        {calendlyStatus.schedulingUrl && !calendlyStatus.isExpired && (
                            <div className="mt-6 border-t pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Book a Meeting</h3>
                                        <p className="text-sm text-gray-500">
                                            Select a time slot below to schedule a client meeting
                                        </p>
                                    </div>
                                    <a
                                        href={calendlyStatus.schedulingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        Open in new tab
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                                <div className="bg-white rounded-lg border overflow-hidden">
                                    <CalendlyEmbed
                                        url={calendlyStatus.schedulingUrl}
                                        height="700px"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
