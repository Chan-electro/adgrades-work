"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Receipt, Package, Clock, ArrowRight, Play, DollarSign, Activity, File, Download, Plus } from 'lucide-react';
import { Card, Button, Badge, PageHeader } from '@/components/ui-migrated';
import { SmallOrb, LoadingBar, SignatureAnimation, ConfettiEffect, CountUp } from '@/components/visuals';
import { toast } from 'sonner';

// --- Sub Components for Tabs ---

const ResearchTab = ({ onRunResearch, isRunning, hasResearch, docs }: any) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Research Documents</h3>
            <Button onClick={onRunResearch} disabled={isRunning}>
                {isRunning ? 'Running Analysis...' : 'Run Research (n8n)'}
            </Button>
        </div>

        {isRunning && (
            <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-4 mb-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">Generating market analysis...</span>
                </div>
                <LoadingBar isLoading={true} />
            </Card>
        )}

        {(hasResearch || docs.length > 0) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {docs.length > 0 ? docs.map((doc: any) => (
                        <div key={doc.id} className="p-4 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                            <div className="flex gap-4 items-center">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600"><FileText className="h-5 w-5" /></div>
                                <div>
                                    <p className="font-medium">{doc.title || 'Market Research Doc'}</p>
                                    <p className="text-xs text-zinc-500">Generated on {new Date(doc.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">View Doc</Button>
                        </div>
                    )) : (
                        // Placeholder if simply "hasResearch" is true but no docs loaded yet
                        <div className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
                            <div className="flex gap-4 items-center">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600"><FileText className="h-5 w-5" /></div>
                                <div>
                                    <p className="font-medium">Market Competitor Analysis (Demo)</p>
                                    <p className="text-xs text-zinc-500">Generated just now</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">View Doc</Button>
                        </div>
                    )}
                </Card>
            </motion.div>
        )}
    </div>
);

const PackagesTab = ({ onGenerateAgreement }: any) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Packages & Proposals</h3>
        </div>
        <Card>
            <div className="p-6 flex justify-between items-center">
                <div className="flex gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                        <Package className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">Q3 Growth Accelerator</h4>
                        <p className="text-sm text-zinc-500">SEO + Paid Ads • 6 Months</p>
                        <p className="mt-1 font-mono font-medium">$12,500 / month</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Proposal</Button>
                    <Button onClick={onGenerateAgreement}>Generate Agreement</Button>
                </div>
            </div>
        </Card>
    </div>
);

const AgreementsTab = ({ agreements, onSign, onDownload, agreementDocs }: any) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">Legal Agreements</h3>
        <Card>
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Last Updated</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {agreements.map((a: any) => {
                        const hasDoc = agreementDocs?.find((d: any) => d.agreementId === a.id);
                        return (
                            <tr key={a.id}>
                                <td className="p-4 font-medium">{a.name || `Agreement #${a.id.slice(-6).toUpperCase()}`}</td>
                                <td className="p-4">
                                    <Badge variant={a.status === 'Signed' ? 'success' : a.status === 'Sent' ? 'warning' : 'neutral'}>
                                        {a.status}
                                    </Badge>
                                </td>
                                <td className="p-4 text-zinc-500">{a.lastUpdated || new Date(a.updatedAt || a.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {hasDoc && (
                                            <Button size="sm" variant="outline" onClick={() => onDownload(a)}>
                                                <Download className="h-4 w-4 mr-1" /> PDF
                                            </Button>
                                        )}
                                        {a.status !== 'Signed' && (
                                            <Button size="sm" onClick={() => onSign(a.id)}>Mark Signed</Button>
                                        )}
                                        {a.status === 'Signed' && (
                                            <div className="flex justify-end">
                                                <SignatureAnimation />
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    {agreements.length === 0 && (
                        <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No agreements found</td></tr>
                    )}
                </tbody>
            </table>
        </Card>
    </div>
);

const InvoicesTab = ({ invoices, onPay }: any) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">Invoices</h3>
        <Card>
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                        <th className="p-4">#</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Due Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {invoices.map((inv: any) => (
                        <tr key={inv.id} className="relative">
                            <td className="p-4 font-mono">{inv.invoiceNumber || inv.id}</td>
                            <td className="p-4 font-medium">${inv.amount?.toLocaleString()}</td>
                            <td className="p-4 text-zinc-500">{inv.dueDate || 'N/A'}</td>
                            <td className="p-4">
                                <Badge variant={inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : 'neutral'}>
                                    {inv.status}
                                </Badge>
                                {inv.justPaid && <div className="absolute left-1/2 top-1/2"><ConfettiEffect active={true} /></div>}
                            </td>
                            <td className="p-4 text-right">
                                {inv.status !== 'Paid' && (
                                    <Button size="sm" variant="outline" onClick={() => onPay(inv.id)}>Mark Paid</Button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {invoices.length === 0 && (
                        <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No invoices found</td></tr>
                    )}
                </tbody>
            </table>
        </Card>
    </div>
);

// --- Main Client Detail Page ---
export default function ClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState<any>(null);

    // States for interactive demos / Real Data
    const [isResearchRunning, setResearchRunning] = useState(false);
    const [hasResearch, setHasResearch] = useState(false);
    const [researchDocs, setResearchDocs] = useState<any[]>([]);
    const [agreements, setAgreements] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [agreementDocs, setAgreementDocs] = useState<any[]>([]);

    useEffect(() => {
        if (!id) return;

        Promise.all([
            fetch(`/api/clients/${id}`).then(res => res.json()),
            fetch(`/api/research?clientId=${id}`).then(res => res.json()),
            fetch(`/api/agreements?clientId=${id}`).then(res => res.json()),
            fetch(`/api/finance/invoices?clientId=${id}`).then(res => res.json())
        ]).then(([clientData, researchData, agreementsData, invoicesData]) => {
            if (clientData && !clientData.error) setClient(clientData);
            if (Array.isArray(researchData)) setResearchDocs(researchData);
            if (Array.isArray(agreementsData)) setAgreements(agreementsData);
            if (Array.isArray(invoicesData)) setInvoices(invoicesData);
        }).catch(err => {
            console.error(err);
            toast.error("Failed to load some client data");
        })
            .finally(() => setLoading(false));

        // Fetch agreement documents
        fetch(`/api/documents?type=agreement&clientId=${id}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setAgreementDocs(data);
            })
            .catch(err => console.error('Failed to load agreement docs:', err));

    }, [id]);


    // Handlers
    const handleRunResearch = async () => {
        setResearchRunning(true);
        setActiveTab('research');

        // Attempt real API call if exists, fall back to mock delay for demo
        try {
            await fetch('/api/workflows/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId: id })
            });
            toast.success("Research workflow triggered");
        } catch (e) {
            console.error("Workflow trigger failed, using demo simulation");
        }

        setTimeout(() => {
            setResearchRunning(false);
            setHasResearch(true);
        }, 3000);
    };

    const handleSignAgreement = (agreementId: string) => {
        // Optimistic update
        setAgreements(prev => prev.map(a => a.id === agreementId ? { ...a, status: 'Signed' } : a));
        toast.success("Agreement marked as signed");
        // TODO: Call API to update status
    };

    const handlePayInvoice = (invoiceId: string) => {
        // Optimistic update
        setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'Paid', justPaid: true } : inv));
        toast.success("Invoice marked as paid");
        // TODO: Call API to update status
    };

    // Handle download of agreement PDF
    const handleDownloadAgreement = (agreement: any) => {
        const doc = agreementDocs.find(d => d.agreementId === agreement.id);
        if (doc && doc.filePath) {
            const url = `/api/documents/${doc.filePath.replace('storage/', '')}`;
            const link = document.createElement('a');
            link.href = url;

            let fileName = doc.fileName || `Agreement_${agreement.id}.pdf`;
            if (!fileName.toLowerCase().endsWith('.pdf')) fileName += '.pdf';

            link.download = fileName;
            link.click();
            toast.success('Downloading agreement PDF...');
        } else {
            toast.error('No PDF found for this agreement.');
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'research', label: 'Research', icon: Clock },
        { id: 'packages', label: 'Packages', icon: Package },
        { id: 'agreements', label: 'Agreements', icon: FileText },
        { id: 'invoices', label: 'Invoices', icon: DollarSign },
    ];

    if (loading) {
        return <div className="flex h-[50vh] items-center justify-center text-muted-foreground">Loading client workspace...</div>;
    }

    if (!client) {
        return <div className="flex h-[50vh] items-center justify-center text-muted-foreground">Client not found</div>;
    }

    return (
        <div className="space-y-8">
            {/* Header Card */}
            <Card className="p-0 overflow-hidden border-none shadow-md">
                <div className="h-32 bg-gradient-to-r from-blue-900 to-slate-900 relative">
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-80">
                        <SmallOrb />
                    </div>
                </div>
                <div className="p-6 pt-0 relative">
                    <div className="-mt-12 mb-4 flex justify-between items-end">
                        <div className="h-24 w-24 rounded-xl bg-white dark:bg-zinc-900 p-1 shadow-lg">
                            <div className="h-full w-full bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center text-3xl font-bold text-blue-600">
                                {client.name.substring(0, 2).toUpperCase()}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                            <Button onClick={handleRunResearch}>
                                <Play className="mr-2 h-4 w-4" /> Run Research
                            </Button>
                            <Button variant="outline" onClick={() => router.push(`/agreements/create?clientId=${id}`)}>
                                <Plus className="mr-2 h-4 w-4" /> Create Agreement
                            </Button>
                            <Button variant="outline" onClick={() => router.push(`/invoices/create?clientId=${id}`)}>
                                <Plus className="mr-2 h-4 w-4" /> Create Invoice
                            </Button>
                            <Button variant="outline" onClick={() => router.push(`/clients/${id}/services`)}>
                                Go to Sales & Services <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{client.name}</h1>
                        <div className="flex gap-4 text-sm text-zinc-500 mt-1">
                            <span>{client.industry || 'Unknown Industry'}</span>
                            <span>•</span>
                            <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{client.website || 'No Website'}</a>
                            {/* <span>•</span>
                    <span>Primary Contact</span> */}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Tabs Navigation */}
            <div className="border-b border-zinc-200 dark:border-zinc-800">
                <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto scrollbar-none pb-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                        flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                        ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300'}
                    `}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'overview' && (
                        <div className="grid md:grid-cols-3 gap-6">
                            <Card className="p-6 md:col-span-2">
                                <h3 className="font-semibold mb-4">Activity Timeline</h3>
                                <div className="space-y-6 pl-2 border-l border-zinc-200 dark:border-zinc-800 ml-2">
                                    {[
                                        { text: 'Client Profile Viewed', date: 'Just now' },
                                        { text: `Profile for ${client.name} created`, date: new Date(client.createdAt).toLocaleDateString() },
                                    ].map((item, i) => (
                                        <div key={i} className="relative pl-6">
                                            <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 ring-4 ring-white dark:ring-zinc-950" />
                                            <p className="text-sm font-medium">{item.text}</p>
                                            <p className="text-xs text-zinc-500">{item.date}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                            <Card className="p-6">
                                <h3 className="font-semibold mb-4">Quick Stats</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">LTV</span>
                                        <span className="font-medium font-mono">$0</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Agreements</span>
                                        <span className="font-medium">{agreements.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Open Invoices</span>
                                        <span className="font-medium text-amber-500">{invoices.filter((i: any) => i.status !== 'Paid').length}</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                    {activeTab === 'research' && (
                        <ResearchTab isRunning={isResearchRunning} hasResearch={hasResearch} docs={researchDocs} onRunResearch={handleRunResearch} />
                    )}
                    {activeTab === 'packages' && (
                        <PackagesTab onGenerateAgreement={() => router.push(`/agreements/create?clientId=${id}`)} />
                    )}
                    {activeTab === 'agreements' && (
                        <AgreementsTab agreements={agreements} onSign={handleSignAgreement} onDownload={handleDownloadAgreement} agreementDocs={agreementDocs} />
                    )}
                    {activeTab === 'invoices' && (
                        <InvoicesTab invoices={invoices} onPay={handlePayInvoice} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
