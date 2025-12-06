"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface TimeSlot {
    start: string;
    end: string;
}

export default function BookingPage() {
    const params = useParams();
    const userId = params.userId as string;

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(false);
    const [booked, setBooked] = useState(false);

    // Form fields
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [guestNotes, setGuestNotes] = useState("");

    useEffect(() => {
        if (userId) {
            fetchSlots(selectedDate);
        }
    }, [userId, selectedDate]);

    async function fetchSlots(date: Date) {
        setLoading(true);
        setSelectedSlot(null);
        try {
            const dateStr = date.toISOString().split("T")[0];
            const res = await fetch(`/api/scheduler/slots?userId=${userId}&date=${dateStr}`);
            if (res.ok) {
                const data = await res.json();
                setSlots(data.slots);
            }
        } catch (error) {
            console.error("Failed to fetch slots:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleBooking() {
        if (!selectedSlot || !guestName || !guestEmail) {
            alert("Please fill in all required fields");
            return;
        }

        setBooking(true);
        try {
            const res = await fetch("/api/scheduler/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    guestName,
                    guestEmail,
                    guestNotes,
                    startTime: selectedSlot.start,
                    endTime: selectedSlot.end,
                }),
            });

            if (res.ok) {
                setBooked(true);
            } else {
                const data = await res.json();
                alert(data.error || "Failed to book meeting");
            }
        } catch (error) {
            console.error("Failed to book:", error);
            alert("Failed to book meeting");
        } finally {
            setBooking(false);
        }
    }

    function formatTime(isoString: string) {
        return new Date(isoString).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function getNextDays(count: number): Date[] {
        const days: Date[] = [];
        const today = new Date();
        for (let i = 0; i < count; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push(date);
        }
        return days;
    }

    if (booked) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="bg-card rounded-2xl shadow-xl p-8 max-w-md text-center border border-border">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
                    <p className="text-muted-foreground mb-4">
                        Your meeting has been scheduled. You will receive a calendar invitation shortly.
                    </p>
                    <div className="bg-muted rounded-lg p-4 text-left">
                        <p className="text-sm text-foreground">
                            <strong>Date:</strong> {selectedDate.toLocaleDateString()}
                        </p>
                        <p className="text-sm text-foreground">
                            <strong>Time:</strong> {selectedSlot && `${formatTime(selectedSlot.start)} - ${formatTime(selectedSlot.end)}`}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 flex items-center justify-center">
            <div className="max-w-4xl w-full mx-auto">
                <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
                    <div className="bg-primary p-6 text-primary-foreground">
                        <h1 className="text-2xl font-bold">Book a Meeting</h1>
                        <p className="text-primary-foreground/80">Select a date and time that works for you</p>
                    </div>

                    <div className="p-6">
                        {/* Date Selection */}
                        <div className="mb-6">
                            <h2 className="text-lg font-medium mb-3 text-foreground">Select a Date</h2>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {getNextDays(14).map((date) => (
                                    <button
                                        key={date.toISOString()}
                                        onClick={() => setSelectedDate(date)}
                                        className={`flex-shrink-0 p-3 rounded-lg border text-center min-w-[80px] transition-colors ${selectedDate.toDateString() === date.toDateString()
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-card text-foreground border-border hover:border-primary"
                                            }`}
                                    >
                                        <div className="text-xs uppercase text-muted-foreground/80">
                                            {date.toLocaleDateString("en", { weekday: "short" })}
                                        </div>
                                        <div className="text-lg font-bold">{date.getDate()}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {date.toLocaleDateString("en", { month: "short" })}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Time Slots */}
                        <div className="mb-6">
                            <h2 className="text-lg font-medium mb-3 text-foreground">Select a Time</h2>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : slots.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No available slots for this date
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                    {slots.map((slot) => (
                                        <button
                                            key={slot.start}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`p-2 rounded-lg border text-sm transition-colors ${selectedSlot?.start === slot.start
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-card text-foreground border-border hover:border-primary"
                                                }`}
                                        >
                                            {formatTime(slot.start)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Booking Form */}
                        {selectedSlot && (
                            <div className="border-t border-border pt-6">
                                <h2 className="text-lg font-medium mb-3 text-foreground">Your Details</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={guestName}
                                            onChange={(e) => setGuestName(e.target.value)}
                                            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                                            Notes (optional)
                                        </label>
                                        <textarea
                                            value={guestNotes}
                                            onChange={(e) => setGuestNotes(e.target.value)}
                                            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                                            rows={3}
                                            placeholder="What would you like to discuss?"
                                        />
                                    </div>
                                    <button
                                        onClick={handleBooking}
                                        disabled={booking}
                                        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                    >
                                        {booking ? "Booking..." : "Confirm Booking"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
