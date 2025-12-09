import { PackageGenerator } from '@/components/packages/package-generator';
import { PageHeader } from '@/components/ui-migrated';

export default function PackagesPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Package Generator"
                description="Select a package to automatically assign services and pricing to a client."
                actions={
                    <a href="/packages/saved" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2">
                        View Package Library
                    </a>
                }
            />
            <PackageGenerator />
        </div>
    );
}
