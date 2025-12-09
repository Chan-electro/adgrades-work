'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui-migrated';
import { Button } from '@/components/ui/button';
import { Package, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface SavedPackagesListProps {
    onSelect?: (pkg: any) => void;
    selectable?: boolean;
    compact?: boolean;
}

export function SavedPackagesList({ onSelect, selectable = false, compact = false }: SavedPackagesListProps) {
    const [packages, setPackages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await fetch('/api/packages/saved');
            if (res.ok) {
                const data = await res.json();
                setPackages(data);
            }
        } catch (error) {
            toast.error('Failed to load packages');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="py-8 text-center text-muted-foreground">Loading saved packages...</div>;
    }

    if (packages.length === 0) {
        return (
            <div className="py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No Saved Packages</h3>
                <p className="text-muted-foreground">Create custom packages and save them to your library.</p>
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 ${compact ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6`}>
            {packages.map((pkg) => {
                let services = [];
                try {
                    services = JSON.parse(pkg.services);
                } catch (e) {
                    services = [];
                }

                return (
                    <Card key={pkg.id} className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-600" />
                                    {pkg.name}
                                </h3>
                                {/* Future: Delete button */}
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{pkg.description || 'No description'}</p>

                            <div className="bg-muted/50 p-3 rounded-md mb-4 text-xs">
                                <strong className="block mb-2 text-foreground">Includes {services.length} Services:</strong>
                                <ul className="space-y-1 text-muted-foreground">
                                    {services.slice(0, 3).map((s: any, i: number) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <span className="w-1 h-1 bg-zinc-400 rounded-full" />
                                            {s.name || s.title}
                                        </li>
                                    ))}
                                    {services.length > 3 && <li className="pl-3 opacity-70">+{services.length - 3} more</li>}
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-4 border-t">
                            <span className="text-lg font-bold text-foreground">₹{pkg.price.toLocaleString()}</span>
                            {selectable && (
                                <Button size="sm" onClick={() => onSelect && onSelect(pkg)} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Check className="w-4 h-4 mr-2" />
                                    Select
                                </Button>
                            )}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
