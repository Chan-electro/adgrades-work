"use client";

import { PopupButton } from "react-calendly";

interface CalendlyPopupButtonProps {
    url: string;
    text?: string;
    className?: string;
    prefill?: {
        name?: string;
        email?: string;
    };
}

/**
 * Popup button that opens Calendly booking modal when clicked
 */
export function CalendlyPopupButton({
    url,
    text = "Schedule Meeting",
    className = "",
    prefill
}: CalendlyPopupButtonProps) {
    return (
        <PopupButton
            url={url}
            prefill={prefill}
            rootElement={document.body}
            text={text}
            className={`px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors ${className}`}
        />
    );
}

interface QuickBookButtonProps {
    url: string;
    eventName: string;
    prefill?: {
        name?: string;
        email?: string;
    };
}

/**
 * Quick Book button with icon for event type cards
 */
export function QuickBookButton({ url, prefill }: QuickBookButtonProps) {
    return (
        <PopupButton
            url={url}
            prefill={prefill}
            rootElement={document.body}
            text="Quick Book"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
        />
    );
}
