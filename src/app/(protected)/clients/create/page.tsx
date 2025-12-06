'use client';

import { useRouter } from 'next/navigation';
import { ClientForm } from '@/components/clients/client-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateClientPage() {
    const router = useRouter();

    const handleSuccess = (client: any) => {
        // Redirect to clients list or dashboard after success
        // Since we don't have a clients list page confirmed, we'll go back or to finance
        router.back();
    };

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Create New Client</CardTitle>
                    <CardDescription>
                        Add a new client to your database for invoices and agreements.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ClientForm onSuccess={handleSuccess} onCancel={() => router.back()} />
                </CardContent>
            </Card>
        </div>
    );
}
