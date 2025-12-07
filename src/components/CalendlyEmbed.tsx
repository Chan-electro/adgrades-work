"use client";

import { InlineWidget } from "react-calendly";

interface CalendlyEmbedProps {
    url: string;
    height?: string;
    prefill?: {
        name?: string;
        email?: string;
    };
}

/**
 * Inline Calendly widget for embedding booking calendar directly on the page
 */
export function CalendlyEmbed({ url, height = "630px", prefill }: CalendlyEmbedProps) {
    return (
        <div className="calendly-embed-container" style={{ minWidth: "320px", height }}>
            <InlineWidget
                url={url}
                prefill={prefill}
                styles={{
                    height: "100%",
                    width: "100%",
                }}
            />
        </div>
    );
}
