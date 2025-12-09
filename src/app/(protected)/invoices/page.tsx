'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Download, FileText } from 'lucide-react';
import { generateInvoiceHTML } from '@/lib/generators/invoice-generator';
import { toast } from 'sonner';
type Invoice = {
    id: string;
    clientId: string | null;
    clientName: string | null;
    amount: number;
    currency: string;
    status: string;
    invoiceNumber: string;
    dueDate: string;
    client?: {
        name: string;
    };
};

export default function InvoicesPage() {

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    // const [invoiceDocs, setInvoiceDocs] = useState<any[]>([]); // Removed doc fetching
    const [loading, setLoading] = useState(true);

    const getClientName = (invoice: Invoice) => {
        if (invoice.clientName) return invoice.clientName;
        if (invoice.client) return invoice.client.name;
        return 'Unknown Client';
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    async function fetchInvoices() {
        try {
            // First try to seed if empty (for demo purposes)
            await fetch('/api/finance/invoices', { method: 'POST' });

            const res = await fetch('/api/finance/invoices');
            if (res.ok) {
                const data = await res.json();
                setInvoices(data);
            }
            // Removed document fetching
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
        } finally {
            setLoading(false);
        }
    }

    async function markAsPaid(invoiceId: string, amount: number) {
        if (!confirm('Are you sure you want to mark this invoice as PAID?')) return;

        try {
            const res = await fetch('/api/finance/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoiceId,
                    amount,
                    type: 'offline', // Default to offline for quick action
                    transactionId: 'MANUAL-' + Date.now()
                })
            });

            if (res.ok) {
                fetchInvoices(); // Refresh list
            }
        } catch (error) {
            console.error('Failed to mark as paid:', error);
        }
    }

    // Handle download of invoice PDF
    const handleDownloadInvoice = async (invoice: any) => {
        try {
            // Parse items if they are a string
            let items = [];
            if (typeof invoice.items === 'string') {
                try {
                    items = JSON.parse(invoice.items);
                } catch (e) {
                    console.error('Failed to parse items', e);
                }
            } else if (Array.isArray(invoice.items)) {
                items = invoice.items;
            }

            const invoiceData = {
                ...invoice,
                items,
                date: invoice.createdAt,
                // Ensure other fields are mapped if needed.
                // generateInvoiceHTML expects: businessName, businessAddress (optional)
                // We might settle for defaults or empty if not stored in invoice record.
                // Ideally we should store business info in invoice record for immutability, 
                // but checking schema, we don't. We rely on defaults or current settings?
                // For now, use defaults in generator.
            };

            const html = generateInvoiceHTML(invoiceData);
            const fileName = `Invoice_${invoice.invoiceNumber}.pdf`;

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
                filename: fileName,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };

            html2pdf().from(element).set(opt).save();

        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to generate PDF');
        }
    };

    if (loading) return <div className="p-6">Loading invoices...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Invoices</h2>
                <Link href="/invoices/create">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Invoice
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {invoices.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No invoices found. Create your first invoice!
                    </div>
                )}
                {invoices.map((invoice) => (
                    <Card key={invoice.id}>
                        <CardHeader>
                            <CardTitle className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                                <span>{invoice.invoiceNumber}</span>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <span className={`text-sm px-2 py-1 rounded-full ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                        invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                        {invoice.status.toUpperCase()}
                                    </span>
                                    {invoice.status !== 'paid' && (
                                        <>
                                            <Link href={`/invoices/create?invoiceId=${invoice.id}`}>
                                                <Button size="sm" variant="ghost">
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => markAsPaid(invoice.id, invoice.amount)}
                                            >
                                                Mark Paid
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => handleDownloadInvoice(invoice)}
                                    >
                                        <Download className="w-3 h-3 mr-1" />
                                        PDF
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Client: <Link href={`/clients/${invoice.clientId}`} className="hover:underline text-blue-600">{getClientName(invoice)}</Link></p>
                            <p>Amount: {invoice.currency} {invoice.amount}</p>
                            <p>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
