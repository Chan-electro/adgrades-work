'use client';

import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

export function TopBar() {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/auth/session')
            .then((res) => res.json())
            .then((data) => {
                if (data.session) {
                    setUserId(data.session.userId);
                }
            });
    }, []);

    return (
        <header className="flex h-16 items-center justify-end border-b bg-card px-6 gap-4">
            <ModeToggle />
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                    <User className="h-4 w-4" />
                </div>
                <span>{userId || 'Loading...'}</span>
            </div>
        </header>
    );
}
