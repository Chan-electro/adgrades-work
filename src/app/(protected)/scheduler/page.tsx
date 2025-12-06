"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const DAYS = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
];

export default function AvailabilitySettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");

    useEffect(() => {
        fetchAvailability();
    }, []);

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
                alert("Availability saved successfully!");
            }
        } catch (error) {
            console.error("Failed to save availability:", error);
            alert("Failed to save availability");
        } finally {
            setSaving(false);
        }
    }

    function toggleDay(day: number) {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter((d) => d !== day));
        } else {
            setSelectedDays([...selectedDays, day].sort());
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-6">Availability Settings</h1>

            <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-medium mb-3">Available Days</h2>
                    <div className="flex flex-wrap gap-2">
                        {DAYS.map((day) => (
                            <button
                                key={day.value}
                                onClick={() => toggleDay(day.value)}
                                className={`px-4 py-2 rounded-lg border transition-colors ${selectedDays.includes(day.value)
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                                    }`}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-medium mb-3">Working Hours</h2>
                    <div className="flex items-center gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <span className="text-gray-500 mt-6">to</span>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">End Time</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="px-3 py-2 border rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Your Booking Link</h3>
                <p className="text-sm text-gray-600">
                    Share this link with others to let them book time with you.
                </p>
                <code className="block mt-2 p-2 bg-white rounded border text-sm">
                    {typeof window !== "undefined" ? `${window.location.origin}/book/[your-user-id]` : "/book/[your-user-id]"}
                </code>
            </div>
        </div>
    );
}
