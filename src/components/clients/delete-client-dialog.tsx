'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface DeleteClientDialogProps {
    clientId: string;
    clientName: string;
    onDeleted: () => void;
    trigger?: React.ReactNode;
}

export function DeleteClientDialog({ clientId, clientName, onDeleted, trigger }: DeleteClientDialogProps) {
    const [open, setOpen] = useState(false);
    const [confirmName, setConfirmName] = useState('');
    const [loading, setLoading] = useState(false);

    const isConfirmValid = confirmName.trim().toLowerCase() === clientName.trim().toLowerCase();

    const handleDelete = async () => {
        if (!isConfirmValid) {
            toast.error('Please type the client name correctly to confirm deletion');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete client');
            }

            toast.success(`Client "${clientName}" has been deleted successfully`);
            setOpen(false);
            onDeleted();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setConfirmName('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="destructive" size="sm" className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Delete Client
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        Delete Client
                    </DialogTitle>
                    <DialogDescription className="text-left">
                        This action cannot be undone. This will permanently delete the client
                        <strong className="text-foreground"> "{clientName}" </strong>
                        and all associated data including:
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-6">
                        <li>All invoices associated with this client</li>
                        <li>All agreements associated with this client</li>
                        <li>All research documents for this client</li>
                        <li>All related documents and files</li>
                    </ul>

                    <div className="space-y-3">
                        <Label htmlFor="confirm-name" className="text-sm font-medium">
                            Type <span className="font-bold text-foreground">{clientName}</span> to confirm deletion:
                        </Label>
                        <Input
                            id="confirm-name"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            placeholder="Type client name here..."
                            className={`${isConfirmValid ? 'border-green-500 focus-visible:ring-green-500' : ''}`}
                            disabled={loading}
                        />
                        {confirmName && !isConfirmValid && (
                            <p className="text-xs text-destructive">
                                Name doesn't match. Please type exactly: {clientName}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={!isConfirmValid || loading}
                    >
                        {loading ? 'Deleting...' : 'Delete Client Permanently'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
