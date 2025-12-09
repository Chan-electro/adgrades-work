'use client';

import { useState, useEffect } from 'react';
import { Download, Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, Input, PageHeader, Textarea } from '@/components/ui-migrated';
import { generateInvoiceHTML, calculateInvoiceTotal } from '@/lib/generators/invoice-generator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner';
import { Label } from "@/components/ui/label";
import { ClientCreateDialog } from '@/components/clients/client-create-dialog';

import { Suspense } from 'react';

function CreateInvoiceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const invoiceId = searchParams.get('invoiceId');
    const clientIdParam = searchParams.get('clientId');
    const [loading, setLoading] = useState(false);

    // Invoice State
    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: '',
        clientId: '',
        clientName: '',
        clientAddress: '',
        businessName: 'AdGrades Creative Agency',
        businessAddress: 'VINAYAKA INDUSTRIES, BEHIND KMF CATTEL FEED FACTORY, GANDHINAGAR, K HOSKOPPAL, HASSAN-573201',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        items: [{ description: '', quantity: 1, rate: 0 }],
        taxRate: 0,
        discount: 0,
        sequence: '0001',
        notes: ''
    });

    // Client Selection State
    const [clients, setClients] = useState<any[]>([]);

    // Fetch clients, agency settings, and next invoice number on mount
    useEffect(() => {
        // Fetch clients
        fetch('/api/clients')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setClients(data);
            })
            .catch(err => console.error(err));

        // Try to fetch agency settings to prefill business info
        fetch('/api/settings/agency')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setInvoiceData(prev => ({
                        ...prev,
                        businessName: data.name || prev.businessName,
                        businessAddress: data.address || prev.businessAddress
                    }))
                }
            })
            .catch(console.error);

        fetch('/api/finance/invoices/next-number')
            .then(res => res.json())
            .then(data => {
                if (data && data.sequence && !invoiceId) {
                    setInvoiceData(prev => ({
                        ...prev,
                        sequence: data.sequence,
                        invoiceNumber: data.nextNumber
                    }));
                }
            })
            .catch(console.error);

        // Handle Edit Mode or Pre-select Client
        if (invoiceId) {
            setLoading(true);
            fetch(`/api/finance/invoices/${invoiceId}`)
                .then(res => res.json())
                .then(data => {
                    if (data) {
                        let parsedItems = [];
                        try {
                            parsedItems = typeof data.items === 'string' ? JSON.parse(data.items) : data.items;
                        } catch (e) { console.error("Failed to parse items", e); }

                        setInvoiceData(prev => ({
                            ...prev,
                            invoiceNumber: data.invoiceNumber || prev.invoiceNumber,
                            clientId: data.clientId || '',
                            clientName: data.clientName || '',
                            clientAddress: data.clientAddress || '',
                            businessName: prev.businessName, // Keep agency current, or store in DB? DB doesn't have business info usually
                            // Adjust date parsing if needed
                            dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
                            items: parsedItems.length ? parsedItems : prev.items,
                            taxRate: data.taxRate || 0,
                            discount: data.discount || 0,
                            sequence: data.invoiceNumber?.split('-').pop() || prev.sequence,
                            notes: data.notes || ''
                        }));
                    }
                })
                .finally(() => setLoading(false));
        } else if (clientIdParam) {
            handleClientSelect(clientIdParam);
        }
    }, [invoiceId, clientIdParam]);

    const handleClientSelect = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            const updateData: any = {
                clientId: client.id,
                clientName: client.name,
                clientAddress: client.address || '',
            };

            // Auto-fill from Package Generator if available
            if (client.packagePrice && client.packageServices) {
                try {
                    const services = JSON.parse(client.packageServices);

                    // Check if it's a custom package or standard
                    // Ideally we check if services is array of valid items. 
                    // If it is, map them.

                    let newItems: any[] = [];

                    if (Array.isArray(services) && services.length > 0) {
                        // It's a list from our custom builder (or standard package services list)
                        // If it's custom builder, items have individual prices (maybe).
                        // If not, we might finding price distribution tricky.
                        // However, for Custom Package, we want individual line items.

                        // Let's see if we can calculate per-item price or just listing them.
                        // If total package price is differnet from sum of parts (overridden), 
                        // we need to be careful.
                        // Strategy: 
                        // 1. If sum of parts == packagePrice, list explicitly with prices.
                        // 2. If diff, maybe list first item with adjusted price or Pro-rata?
                        // Simple approach: List description as breakdown, single line item?
                        // User requested: "select those services in the fields and same in invoice"
                        // Implies separate fields.

                        const sumOfParts = services.reduce((acc: number, s: any) => acc + (s.price || 0), 0);

                        if (Math.abs(sumOfParts - client.packagePrice) < 1) {
                            // Prices match sum of parts, so we can list individually
                            newItems = services.map((s: any) => ({
                                description: s.name + (s.description ? ` - ${s.description}` : ''),
                                quantity: 1,
                                rate: s.price || 0
                            }));
                        } else {
                            // Prices override. We can't easily assign per-item price.
                            // Option A: List items with 0 price and one "Package Fee" item.
                            // Option B: Pro-rata distribution (complex UI).
                            // Option C: Single line item "Custom Package" with description listing services.

                            // Let's go with Option C for now as it safeguards the total.
                            const details = services.map((s: any) => s.name).join(', ');
                            newItems = [{
                                description: `${client.selectedPackage} - ${details}`,
                                quantity: 1,
                                rate: client.packagePrice
                            }];
                        }
                    } else {
                        // Fallback for old format or empty
                        newItems = [{
                            description: `${client.selectedPackage} - Monthly Subscription`,
                            quantity: 1,
                            rate: client.packagePrice
                        }];
                    }

                    updateData.items = newItems;
                    toast.success(`Loaded package: ${client.selectedPackage}`);

                } catch (e) {
                    console.error("Failed to parse package info", e);
                }
            }

            setInvoiceData((prev) => ({
                ...prev,
                ...updateData,
            }));
            toast.success('Client details loaded');
        }
    };

    const handleClientCreated = (newClient: any) => {
        setClients([newClient, ...clients]);
        setInvoiceData((prev) => ({
            ...prev,
            clientId: newClient.id,
            clientName: newClient.name,
            clientAddress: newClient.address || '',
        }));
        toast.success('Client created and selected');
    };

    const addInvoiceItem = () => {
        setInvoiceData({
            ...invoiceData,
            items: [...invoiceData.items, { description: '', quantity: 1, rate: 0 }]
        });
    };

    const updateInvoiceItem = (index: number, field: keyof typeof invoiceData.items[0], value: any) => {
        const newItems = [...invoiceData.items];
        (newItems[index] as any)[field] = value;
        setInvoiceData({ ...invoiceData, items: newItems });
    };

    const removeInvoiceItem = (index: number) => {
        const newItems = invoiceData.items.filter((_, i) => i !== index);
        setInvoiceData({ ...invoiceData, items: newItems });
    };

    // calculateInvoiceTotal is now imported from generator, but we need to adapt the state or call it with standard format
    // The generator expects { items: [], taxRate: 0, discount: 0 } which matches invoiceData structure roughly.
    const { total: calculatedTotal } = calculateInvoiceTotal(invoiceData);


    // generateInvoiceHTML is imported

    const handleSave = async () => {
        setLoading(true);
        try {
            const { total } = calculateInvoiceTotal(invoiceData);
            const fullInvoiceNo = `AG-${new Date().getFullYear().toString().slice(-2)}${invoiceData.sequence}`;

            const url = invoiceId ? `/api/finance/invoices/${invoiceId}` : '/api/finance/invoices';
            const method = invoiceId ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoiceNumber: fullInvoiceNo,
                    amount: total,
                    currency: 'INR',
                    status: invoiceId ? undefined : 'draft', // Don't reset status on edit unless needed
                    dueDate: invoiceData.dueDate || new Date().toISOString(),
                    clientId: invoiceData.clientId,
                    clientName: invoiceData.clientName,
                    clientAddress: invoiceData.clientAddress,
                    items: invoiceData.items,
                    taxRate: invoiceData.taxRate,
                    discount: invoiceData.discount,
                    notes: invoiceData.notes,
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to save invoice');
            }


            toast.success('Invoice saved successfully');
            router.push('/invoices');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        const html = generateInvoiceHTML(invoiceData);
        const fullInvoiceNo = `AG-${new Date().getFullYear().toString().slice(-2)}${invoiceData.sequence}`;
        const filename = `Invoice_${fullInvoiceNo}`;

        // @ts-ignore
        const html2pdf = (await import('html2pdf.js')).default;
        const element = document.createElement('div');
        element.innerHTML = html;
        const styleTag = element.querySelector('style');
        if (styleTag) {
            styleTag.innerHTML = styleTag.innerHTML.replace(/body\s*{/g, '.pdf-container {');
        }
        element.className = 'pdf-container';
        const opt = {
            margin: 0,
            filename: `${filename}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };

        // Download locally only - prevent server clutter/orphan files
        html2pdf().from(element).set(opt).save();
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Create Invoice"
                description="Generate a new invoice for your clients."
                actions={
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to List
                    </Button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Invoice Configuration */}
                <Card className="p-6 space-y-6 h-fit">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Invoice Details</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="seq">Sequence #</Label>
                            <Input
                                id="seq"
                                value={invoiceData.sequence}
                                onChange={(e) => setInvoiceData({ ...invoiceData, sequence: e.target.value })}
                                placeholder="0001"
                                maxLength={4}
                            />
                            <p className="text-xs text-muted-foreground">
                                Result: AG-{new Date().getFullYear().toString().slice(-2)}{invoiceData.sequence || 'XXXX'}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={invoiceData.dueDate}
                                onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Client Selection</Label>
                        <div className="flex gap-2">
                            <div className="flex-1 min-w-0">
                                <Select onValueChange={handleClientSelect} value={invoiceData.clientId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select existing client..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Fixed width for button to prevent overflow/shrink */}
                            <div className="flex-shrink-0">
                                <ClientCreateDialog onClientCreated={handleClientCreated} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="clientName">Client Display Name</Label>
                            <Input
                                id="clientName"
                                value={invoiceData.clientName}
                                onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="clientAddress">Client Address</Label>
                            <Textarea
                                id="clientAddress"
                                value={invoiceData.clientAddress}
                                onChange={(e) => setInvoiceData({ ...invoiceData, clientAddress: e.target.value })}
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                        <h4 className="text-sm font-medium text-muted-foreground">Business Details (Yours)</h4>
                        <div className="grid gap-2">
                            <Label htmlFor="bizName">Your Business Name</Label>
                            <Input
                                id="bizName"
                                value={invoiceData.businessName}
                                onChange={(e) => setInvoiceData({ ...invoiceData, businessName: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="bizAddress">Your Address</Label>
                            <Textarea
                                id="bizAddress"
                                value={invoiceData.businessAddress}
                                onChange={(e) => setInvoiceData({ ...invoiceData, businessAddress: e.target.value })}
                                rows={2}
                            />
                        </div>
                    </div>
                </Card>

                {/* Line Items */}
                <Card className="p-6 flex flex-col h-full min-h-[500px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground">Line Items</h3>
                        <Button onClick={addInvoiceItem} size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                        </Button>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-2">
                        {invoiceData.items.map((item, index) => (
                            <div key={index} className="group relative p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Description</Label>
                                        <Input
                                            placeholder="Item description"
                                            value={item.description}
                                            onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Qty</Label>
                                            <Input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateInvoiceItem(index, 'quantity', Number(e.target.value))}
                                                className="bg-background"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Rate (₹)</Label>
                                            <Input
                                                type="number"
                                                value={item.rate}
                                                onChange={(e) => updateInvoiceItem(index, 'rate', Number(e.target.value))}
                                                className="bg-background"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeInvoiceItem(index)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-border space-y-4 bg-muted/20 -mx-6 -mb-6 p-6 rounded-b-xl">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Tax Rate (%)</Label>
                                <Input
                                    type="number"
                                    value={invoiceData.taxRate}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, taxRate: Number(e.target.value) })}
                                    className="bg-background"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Discount (₹)</Label>
                                <Input
                                    type="number"
                                    value={invoiceData.discount}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, discount: Number(e.target.value) })}
                                    className="bg-background"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-lg font-medium text-muted-foreground">Total Amount</span>
                            <span className="text-2xl font-bold text-primary">
                                ₹{calculateInvoiceTotal(invoiceData).total.toFixed(2)}
                            </span>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button className="flex-1" onClick={handleSave} isLoading={loading}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Invoice
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={handleDownload}>
                                <Download className="w-4 h-4 mr-2" />
                                Preview PDF
                            </Button>
                        </div>
                    </div>
                </Card >
            </div >
        </div >
    );
}

export default function CreateInvoicePage() {
    return (
        <Suspense fallback={<div>Loading invoice editor...</div>}>
            <CreateInvoiceContent />
        </Suspense>
    );
}
