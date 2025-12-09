"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Receipt, Package, Clock, ArrowRight, ArrowLeft, Play, DollarSign, Activity,
    Download, Plus, Mail, Phone, Globe, MapPin, Building2, User, Trash2,
    Briefcase, Target, Search
} from 'lucide-react';
import { Card, Button, Badge, PageHeader } from '@/components/ui-migrated';
import { SmallOrb, LoadingBar, SignatureAnimation, ConfettiEffect, CountUp } from '@/components/visuals';
import { toast } from 'sonner';
import { DeleteClientDialog } from '@/components/clients/delete-client-dialog';
import { ClientEditDialog } from '@/components/clients/client-edit-dialog';
import { PackageGenerator } from '@/components/packages/package-generator';
import { SavedPackagesList } from '@/components/packages/saved-packages-list';

// --- Sub Components for Tabs ---

const ResearchTab = ({ onRunResearch, isRunning, hasResearch, docs }: any) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Research Documents</h3>
            <Button onClick={onRunResearch} disabled={isRunning}>
                <Search className="mr-2 h-4 w-4" />
                {isRunning ? 'Running Analysis...' : 'Generate Research Prompt'}
            </Button>
        </div>

        {isRunning && (
            <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-4 mb-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">Redirecting to Prompt Generator...</span>
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
                        <div className="p-8 text-center text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>No research documents yet</p>
                            <p className="text-sm">Click "Generate Research Prompt" to get started</p>
                        </div>
                    )}
                </Card>
            </motion.div>
        )}

        {!hasResearch && docs.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground border-dashed">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No research documents yet</p>
                <p className="text-sm mb-4">Generate a research prompt to perform market analysis</p>
                <Button onClick={onRunResearch} disabled={isRunning}>
                    <Search className="mr-2 h-4 w-4" />
                    Generate Research Prompt
                </Button>
            </Card>
        )}
    </div>
);

const PackagesTab = ({ clientId, onGenerateAgreement }: any) => {
    const [showGenerator, setShowGenerator] = useState(false);

    const handlePackageSelect = async (pkg: any) => {
        try {
            // Parse services if string, or use as is
            let services = pkg.services;
            if (typeof services === 'string') {
                try {
                    services = JSON.parse(services);
                } catch (e) {
                    services = [];
                }
            }

            const res = await fetch(`/api/clients/${clientId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selectedPackage: pkg.name,
                    packagePrice: pkg.price,
                    packageServices: JSON.stringify(services)
                })
            });

            if (res.ok) {
                toast.success(`Package "${pkg.name}" assigned to client!`);
                onGenerateAgreement(); // Refresh parent
            } else {
                toast.error('Failed to assign package');
            }
        } catch (error) {
            toast.error('Error assigning package');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Packages & Proposals</h3>
                {!showGenerator && (
                    <Button onClick={() => setShowGenerator(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New / Select Standard
                    </Button>
                )}
                {showGenerator && (
                    <Button variant="outline" onClick={() => setShowGenerator(false)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Saved Packages
                    </Button>
                )}
            </div>

            {showGenerator ? (
                <PackageGenerator preselectedClientId={clientId} onSuccess={onGenerateAgreement} />
            ) : (
                <div className="space-y-4">
                    <Card className="p-6 bg-muted/20 border-dashed">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium">Saved Packages Library</h4>
                            <p className="text-xs text-muted-foreground">Packages you've created and saved in the Custom Builder</p>
                        </div>
                        <SavedPackagesList selectable={true} onSelect={handlePackageSelect} />
                    </Card>
                </div>
            )}
        </div>
    );
};

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

const InvoicesTab = ({ invoices, onPay, onEdit }: any) => (
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
                                <Badge variant={inv.status?.toLowerCase() === 'paid' ? 'success' : inv.status?.toLowerCase() === 'overdue' ? 'danger' : 'neutral'}>
                                    {inv.status}
                                </Badge>
                                {inv.justPaid && <div className="absolute left-1/2 top-1/2"><ConfettiEffect active={true} /></div>}
                            </td>
                            <td className="p-4 text-right">
                                {inv.status?.toLowerCase() !== 'paid' && (
                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onEdit(inv.id)}
                                        >
                                            <FileText className="h-4 w-4 mr-1" /> Edit
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => onPay(inv.id)}>Mark Paid</Button>
                                    </div>
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
            if (Array.isArray(researchData)) {
                setResearchDocs(researchData);
                setHasResearch(researchData.length > 0);
            }
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

    // Calculate total revenue from paid invoices
    const totalRevenue = invoices
        .filter((inv: any) => inv.status === 'Paid')
        .reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);

    // Handlers
    const handleRunResearch = () => {
        setResearchRunning(true);
        setActiveTab('research');

        // Redirect to prompt generator with client ID
        setTimeout(() => {
            router.push(`/prompt-generator?clientId=${id}`);
        }, 500);
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

    const handleClientDeleted = () => {
        router.push('/clients');
    };

    const handleClientUpdated = (updatedClient: any) => {
        setClient(updatedClient);
        toast.success("Client updated successfully");
        router.refresh();
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'research', label: 'Research', icon: Search },
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

    // Dynamic Timeline
    const timelineEvents = [
        { text: `Client Profile Created`, date: client.createdAt, type: 'creation' },
        ...invoices.map(i => ({ text: `Invoice #${i.invoiceNumber} Generated`, date: i.createdAt, type: 'invoice' })),
        ...agreements.map(a => ({ text: `Agreement Created`, date: a.createdAt, type: 'agreement' })),
        ...researchDocs.map(r => ({ text: `Research: ${r.title}`, date: r.createdAt, type: 'research' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-8">
            {/* Header Card - Revamped */}
            <Card className="p-0 overflow-hidden border-none shadow-md">
                <div className="h-32 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 relative">
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-80">
                        <SmallOrb />
                    </div>
                </div>
                <div className="p-6 pt-0 relative">
                    <div className="-mt-12 mb-4 flex flex-col lg:flex-row justify-between lg:items-end gap-4">
                        <div className="flex items-end gap-4">
                            <div className="h-24 w-24 rounded-xl bg-white dark:bg-zinc-900 p-1 shadow-lg flex-shrink-0 ring-2 ring-white dark:ring-zinc-950">
                                <div className="h-full w-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-3xl font-bold text-white">
                                    {client.name.substring(0, 2).toUpperCase()}
                                </div>
                            </div>
                            <div className="pb-1 translate-y-4">
                                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{client.name}</h1>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {client.industry && (
                                        <Badge variant="neutral" className="text-xs">
                                            <Briefcase className="h-3 w-3 mr-1" />
                                            {client.industry}
                                        </Badge>
                                    )}
                                    {client.businessModel && (
                                        <Badge variant="neutral" className="text-xs">
                                            <Target className="h-3 w-3 mr-1" />
                                            {client.businessModel}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <ClientEditDialog
                            client={client}
                            onClientUpdated={handleClientUpdated}
                            trigger={
                                <Button variant="outline">
                                    Edit Profile
                                </Button>
                            }
                        />
                        <Button onClick={handleRunResearch} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                            <Search className="mr-2 h-4 w-4" /> Run Research
                        </Button>
                        <Button variant="outline" onClick={() => router.push(`/agreements/create?clientId=${id}`)}>
                            <Plus className="mr-2 h-4 w-4" /> Agreement
                        </Button>
                        <Button variant="outline" onClick={() => router.push(`/invoices/create?clientId=${id}`)}>
                            <Plus className="mr-2 h-4 w-4" /> Invoice
                        </Button>
                        <DeleteClientDialog
                            clientId={id}
                            clientName={client.name}
                            onDeleted={handleClientDeleted}
                            trigger={
                                <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            }
                        />
                    </div>
                </div>
            </Card>

            {/* Contact Info & Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact Information */}
                <Card className="p-6 lg:col-span-2">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {client.contactPerson && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Contact Person</p>
                                    <p className="font-medium">{client.contactPerson}</p>
                                </div>
                            </div>
                        )}
                        {client.email && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <Mail className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <a href={`mailto:${client.email}`} className="font-medium text-blue-600 hover:underline">{client.email}</a>
                                </div>
                            </div>
                        )}
                        {client.phone && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Phone className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Phone</p>
                                    <a href={`tel:${client.phone}`} className="font-medium">{client.phone}</a>
                                </div>
                            </div>
                        )}
                        {client.website && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <Globe className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Website</p>
                                    <a
                                        href={client.website?.startsWith('http') ? client.website : `https://${client.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-blue-600 hover:underline"
                                    >
                                        {client.website}
                                    </a>
                                </div>
                            </div>
                        )}
                        {client.address && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 md:col-span-2">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                    <MapPin className="h-4 w-4 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Address</p>
                                    <p className="font-medium">{client.address}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Quick Stats */}
                <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        Quick Stats
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                Total Revenue
                            </span>
                            <span className="font-bold text-lg text-green-600">
                                ₹{totalRevenue.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Agreements</span>
                            <span className="font-medium">{agreements.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Invoices</span>
                            <span className="font-medium">{invoices.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Open Invoices</span>
                            <span className="font-medium text-amber-500">{invoices.filter((i: any) => i.status !== 'Paid').length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Research Docs</span>
                            <span className="font-medium">{researchDocs.length}</span>
                        </div>
                        <div className="pt-2 border-t border-border">
                            <p className="text-xs text-muted-foreground">
                                Client since {new Date(client.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

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
                                <div className="space-y-6 pl-2 border-l border-zinc-200 dark:border-zinc-800 ml-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {timelineEvents.length > 0 ? timelineEvents.map((item, i) => (
                                        <div key={i} className="relative pl-6">
                                            <div className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-zinc-950 ${item.type === 'creation' ? 'bg-green-500' :
                                                item.type === 'invoice' ? 'bg-amber-500' :
                                                    item.type === 'agreement' ? 'bg-blue-500' :
                                                        'bg-purple-500'
                                                }`} />
                                            <p className="text-sm font-medium text-foreground">{item.text}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-muted-foreground pl-4">No recent activity</p>
                                    )}
                                </div>
                            </Card>

                            {/* Business Info Card */}
                            {(client.companyInfo || client.niche || client.domainOrIndustry) && (
                                <Card className="p-6">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        Business Profile
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        {client.domainOrIndustry && (
                                            <div>
                                                <p className="text-muted-foreground text-xs">Domain/Industry</p>
                                                <p className="font-medium">{client.domainOrIndustry}</p>
                                            </div>
                                        )}
                                        {client.niche && (
                                            <div>
                                                <p className="text-muted-foreground text-xs">Niche</p>
                                                <p className="font-medium">{client.niche}</p>
                                            </div>
                                        )}
                                        {client.companyInfo && (
                                            <div>
                                                <p className="text-muted-foreground text-xs">About</p>
                                                <p className="font-medium line-clamp-4">{client.companyInfo}</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}
                    {activeTab === 'research' && (
                        <ResearchTab isRunning={isResearchRunning} hasResearch={hasResearch} docs={researchDocs} onRunResearch={handleRunResearch} />
                    )}
                    {activeTab === 'packages' && (
                        <PackagesTab clientId={id} onGenerateAgreement={() => {
                            router.refresh();
                        }} />
                    )}
                    {activeTab === 'agreements' && (
                        <AgreementsTab agreements={agreements} onSign={handleSignAgreement} onDownload={handleDownloadAgreement} agreementDocs={agreementDocs} />
                    )}
                    {activeTab === 'invoices' && (
                        <InvoicesTab
                            invoices={invoices}
                            onPay={handlePayInvoice}
                            onEdit={(id: string) => router.push(`/invoices/create?invoiceId=${id}`)}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
