'use client';

import { PageHeader } from '@/components/ui-migrated';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SavedPackagesList } from '@/components/packages/saved-packages-list';

export default function SavedPackagesPage() {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push('/packages')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Generator
                </Button>
                <h1 className="text-3xl font-bold">Saved Packages Library</h1>
            </div>

            <SavedPackagesList />
        </div>
    );
}
