'use client';

import { useState, useEffect } from 'react';
import { PackageCard, PackageDef } from './package-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientCreateDialog } from '@/components/clients/client-create-dialog';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Search, Loader2, Plus, Calculator, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { PACKAGES, INDIVIDUAL_SERVICES, ServiceItem } from '@/lib/constants/package-data';

interface PackageGeneratorProps {
    preselectedClientId?: string;
    onSuccess?: () => void;
}

export function PackageGenerator({ preselectedClientId, onSuccess }: PackageGeneratorProps = {}) {
    const [selectedPackage, setSelectedPackage] = useState<PackageDef | null>(null);
    const [clientId, setClientId] = useState<string>(preselectedClientId || '');
    const [clients, setClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    // Custom Package State
    const [mode, setMode] = useState<'standard' | 'custom'>('standard');
    const [customServices, setCustomServices] = useState<ServiceItem[]>([]);
    const [customPackageName, setCustomPackageName] = useState('Custom Package');
    const [customPrice, setCustomPrice] = useState<number>(0);
    const [isPriceOverridden, setIsPriceOverridden] = useState(false);

    useEffect(() => {
        if (!preselectedClientId) {
            fetchClients();
        }
    }, [preselectedClientId]);

    const fetchClients = async () => {
        try {
            const res = await fetch('/api/clients');
            if (res.ok) {
                const data = await res.json();
                setClients(data);
            }
        } catch (error) {
            console.error('Failed to fetch clients', error);
        }
    };

    const handleClientCreated = (newClient: any) => {
        setClients([newClient, ...clients]);
        setClientId(newClient.id);
        toast.success(`Client ${newClient.name} created and selected`);
    };

    const handleCustomServiceToggle = (service: ServiceItem, checked: boolean) => {
        let updated = [...customServices];
        if (checked) {
            updated.push(service);
        } else {
            updated = updated.filter(s => s.name !== service.name);
        }
        setCustomServices(updated);

        // Recalculate price if not manually overridden
        if (!isPriceOverridden) {
            const total = updated.reduce((sum, s) => sum + (s.price || 0), 0);
            setCustomPrice(total);
        }
    };

    const handleGenerate = async () => {
        if (!clientId) {
            toast.error('Please select a client');
            return;
        }

        let pkgName, pkgPrice, pkgServices;

        if (mode === 'standard') {
            if (!selectedPackage) {
                toast.error('Please select a package');
                return;
            }
            pkgName = selectedPackage.name;
            pkgPrice = selectedPackage.price;
            pkgServices = selectedPackage.services;
        } else {
            if (customServices.length === 0) {
                toast.error('Please select at least one service');
                return;
            }
            pkgName = customPackageName;
            pkgPrice = customPrice;
            pkgServices = customServices.map(s => ({ ...s, price: s.price })); // Ensure price is included
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selectedPackage: pkgName,
                    packagePrice: pkgPrice,
                    packageServices: JSON.stringify(pkgServices)
                })
            });

            if (res.ok) {
                toast.success('Package generated successfully!');
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.refresh();
                }
            } else {
                toast.error('Failed to update client with package');
            }
        } catch (error) {
            console.error('Error generating package:', error);
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {!preselectedClientId && (
                <div className="flex flex-col md:flex-row gap-6 items-end justify-between bg-card p-6 rounded-xl border shadow-sm">
                    <div className="space-y-4 w-full md:w-1/2">
                        <h2 className="text-xl font-semibold">1. Select Client</h2>
                        <div className="flex gap-2">
                            <div className="flex-1 space-y-2">
                                <Select value={clientId} onValueChange={setClientId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a client..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2 border-b">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search clients..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-8"
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                        {filteredClients.map(client => (
                                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                        ))}
                                        {filteredClients.length === 0 && (
                                            <div className="p-2 text-sm text-center text-muted-foreground">No clients found</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <ClientCreateDialog onClientCreated={handleClientCreated} />
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl font-semibold">{preselectedClientId ? 'Select Package' : '2. Select Package'}</h2>

                    <div className="bg-muted p-1 rounded-lg flex text-sm font-medium">
                        <button
                            onClick={() => setMode('standard')}
                            className={`px-4 py-1.5 rounded-md transition-all ${mode === 'standard' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Standard Packages
                        </button>
                        <button
                            onClick={() => setMode('custom')}
                            className={`px-4 py-1.5 rounded-md transition-all ${mode === 'custom' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Custom Builder
                        </button>
                    </div>
                </div>

                {mode === 'standard' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PACKAGES.map((pkg) => (
                            <PackageCard
                                key={pkg.id}
                                pkg={pkg}
                                isSelected={selectedPackage?.id === pkg.id}
                                onSelect={setSelectedPackage}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Service Selection */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="p-6">
                                <h3 className="font-medium mb-4 flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-primary" />
                                    Select Services to Include
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {INDIVIDUAL_SERVICES.map((service) => (
                                        <div key={service.name} className={`
                                            flex items-start space-x-3 p-4 rounded-lg border transition-all cursor-pointer
                                            ${customServices.find(s => s.name === service.name)
                                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                : 'border-border hover:border-primary/50'}
                                        `}
                                            onClick={() => {
                                                const isChecked = !!customServices.find(s => s.name === service.name);
                                                handleCustomServiceToggle(service, !isChecked);
                                            }}
                                        >
                                            <Checkbox
                                                checked={!!customServices.find(s => s.name === service.name)}
                                                onCheckedChange={(checked) => handleCustomServiceToggle(service, checked as boolean)}
                                                className="mt-1"
                                            />
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center w-full">
                                                    <Label className="font-medium cursor-pointer">{service.name}</Label>
                                                    {service.price && (
                                                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                                                            ₹{(service.price / 1000).toFixed(0)}k
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {service.description}
                                                </p>
                                                {service.items && (
                                                    <ul className="text-xs text-zinc-500 list-disc list-inside bg-muted/30 p-2 rounded mt-2">
                                                        {service.items.slice(0, 2).map((item, i) => (
                                                            <li key={i}>{item}</li>
                                                        ))}
                                                        {service.items.length > 2 && <li>+{service.items.length - 2} more</li>}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Package Configuration */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6">
                                <Card className="p-6 border-2 border-primary/20 shadow-lg">
                                    <div className="mb-6 pb-6 border-b border-border">
                                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-1">
                                            <Settings className="h-5 w-5 text-primary" />
                                            Package Configuration
                                        </h3>
                                        <p className="text-xs text-muted-foreground">Configure the final package details</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="pkgName">Package Name</Label>
                                            <Input
                                                id="pkgName"
                                                value={customPackageName}
                                                onChange={(e) => setCustomPackageName(e.target.value)}
                                                placeholder="e.g. Custom Growth Plan"
                                            />
                                        </div>

                                        <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground">Selected Services:</span>
                                                <span className="font-medium">{customServices.length}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-dashed border-zinc-300 dark:border-zinc-700">
                                                <span className="font-semibold">Total Value</span>
                                                <span className="font-mono text-zinc-500">₹{customServices.reduce((sum, s) => sum + (s.price || 0), 0).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <Label htmlFor="pkgPrice">Final Price (₹)</Label>
                                                {isPriceOverridden && (
                                                    <button
                                                        onClick={() => {
                                                            setIsPriceOverridden(false);
                                                            setCustomPrice(customServices.reduce((sum, s) => sum + (s.price || 0), 0));
                                                        }}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Reset to calculated
                                                    </button>
                                                )}
                                            </div>
                                            <Input
                                                id="pkgPrice"
                                                type="number"
                                                value={customPrice}
                                                onChange={(e) => {
                                                    setIsPriceOverridden(true);
                                                    setCustomPrice(Number(e.target.value));
                                                }}
                                                className="font-mono text-lg font-bold"
                                            />
                                            <p className="text-xs text-muted-foreground text-right">
                                                This will be the invoiced amount
                                            </p>
                                        </div>


                                        <div className="flex gap-2">
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={async () => {
                                                    if (!customPackageName || customServices.length === 0) {
                                                        toast.error('Please configure the package first');
                                                        return;
                                                    }

                                                    try {
                                                        const res = await fetch('/api/packages/saved', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                name: customPackageName,
                                                                price: customPrice,
                                                                services: customServices,
                                                                description: `Custom package with ${customServices.length} services`
                                                            })
                                                        });

                                                        if (res.ok) {
                                                            toast.success('Package saved to library!');
                                                        } else {
                                                            toast.error('Failed to save package');
                                                        }
                                                    } catch (e) {
                                                        toast.error('Error saving package');
                                                    }
                                                }}
                                                disabled={isLoading || customServices.length === 0}
                                            >
                                                Save to Library
                                            </Button>

                                            <Button
                                                size="lg"
                                                className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:to-primary"
                                                onClick={handleGenerate}
                                                disabled={isLoading || !clientId || customServices.length === 0}
                                            >
                                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Assign to Client
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}

                {mode === 'standard' && (
                    <div className="w-full flex items-center justify-end mt-6">
                        <Button
                            size="lg"
                            onClick={handleGenerate}
                            disabled={isLoading || !selectedPackage || !clientId}
                            className="w-full md:w-auto"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generate Package for Client
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
