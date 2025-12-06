'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ClientForm } from './client-form';

interface ClientCreateDialogProps {
    onClientCreated: (client: any) => void;
    trigger?: React.ReactNode;
}

export function ClientCreateDialog({ onClientCreated, trigger }: ClientCreateDialogProps) {
    const [open, setOpen] = useState(false);

    const handleSuccess = (client: any) => {
        onClientCreated(client);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Client
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>
                        Enter the client details below. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <ClientForm
                    onSuccess={handleSuccess}
                    onCancel={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
