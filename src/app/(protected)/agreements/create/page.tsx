'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { FileText, Download, Plus, Trash2, Calendar, Save, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils"
// Import ClientCreateDialog if path allows, or assume shared components
import { ClientCreateDialog } from '@/components/clients/client-create-dialog';

function CreateAgreementContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const loadId = searchParams.get('loadId');
    const clientIdParam = searchParams.get('clientId');

    const [formData, setFormData] = useState({
        id: '',
        clientId: '',
        clientName: '',
        clientAddress: '',
        clientRepName: '',
        clientRepDesignation: '',
        clientContact: '',
        agreementDate: new Date().toISOString().split('T')[0],
        commencementDate: '',
        termMonths: '3',
        firstMonthFee: '',
        subsequentMonthsFee: '',
        totalFee: '',
        paymentSchedule: 'advance',
        lateFeePerDay: '500',
        gracePeriodDays: '3',
        revisionsPerDeliverable: '2',
        clientResponseHours: '48',
        reportingFrequency: 'bi-weekly',
        terminationNoticeDays: '15',
        agencyRepName: 'Chandan B Krishna',
        agencyContact: '+91 80736 98913'
    });

    // Client Selection State
    const [clients, setClients] = useState<any[]>([]);

    // Services State
    const [selectedServices, setSelectedServices] = useState<any[]>([]);
    const [customServices, setCustomServices] = useState<any[]>([]);

    // Fetch clients on mount
    useEffect(() => {
        fetch('/api/clients')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setClients(data);
                    // Pre-select client if passed or if loaded
                    if (clientIdParam && !formData.clientId) {
                        const client = data.find(c => c.id === clientIdParam);
                        if (client) handleClientSelectInternal(client);
                    }
                }
            })
            .catch(err => console.error(err));
    }, [clientIdParam]);

    // Load agreement if loadId is present
    useEffect(() => {
        if (loadId) {
            fetch('/api/agreements') // Ideally fetch specific, but list works for now
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        const agreement = data.find(a => a.id === loadId);
                        if (agreement) {
                            try {
                                const content = typeof agreement.content === 'string'
                                    ? JSON.parse(agreement.content)
                                    : agreement.content;

                                // Restore form data
                                setFormData(prev => ({ ...prev, ...content.formData, id: agreement.id }));
                                if (content.selectedServices) setSelectedServices(content.selectedServices);
                                if (content.customServices) setCustomServices(content.customServices);

                                toast.success('Agreement data loaded');
                            } catch (e) {
                                console.error('Failed to parse loaded content', e);
                                toast.error('Failed to parse agreement data');
                            }
                        }
                    }
                });
        }
    }, [loadId]);

    const handleClientSelectInternal = (client: any) => {
        setFormData((prev) => ({
            ...prev,
            clientId: client.id,
            clientName: client.name,
            clientAddress: client.address || '',
            clientContact: client.phone || '',
        }));
    };

    const handleClientSelect = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            handleClientSelectInternal(client);
            toast.success('Client details loaded');
        }
    };

    const handleClientCreated = (newClient: any) => {
        setClients([newClient, ...clients]);
        handleClientSelectInternal(newClient);
        toast.success('Client created and selected');
    };

    // Services Definition (Copied from original)
    const services = [
        {
            id: 'smma',
            label: 'Social Media Management',
            tiers: [
                { key: 'smma_basic', label: 'Basic', price: '₹12,999/month', description: '1 platform • 12 static posts • 8 story frames • Monthly report • 1 revision' },
                { key: 'smma_pro', label: 'Pro', price: '₹26,999/month', description: '2 platforms • 16 static posts • 12 story frames • A/B testing • 2 revisions' },
                { key: 'smma_superb', label: 'Superb', price: '₹42,999/month', description: '3 platforms • 20 static posts • 16 story frames • Weekly calls' }
            ],
            fullDescription: 'Comprehensive social media management including account audit, monthly content calendar, caption writing with hashtag strategy, community management (responding to comments/DMs during working hours), and monthly performance reports with actionable insights.'
        },
        {
            id: 'video_editing',
            label: 'Video Editing',
            tiers: [
                { key: 'video_basic_short', label: 'Basic Reel (≤60s)', price: '₹1,500/reel', description: 'Clean edit, auto captions, 1 track, 1 revision' },
                { key: 'video_basic_long', label: 'Basic Reel (61-120s)', price: '₹2,500/reel', description: 'Extended basic edit' },
                { key: 'video_intermediate_short', label: 'Intermediate (≤60s)', price: '₹3,500/reel', description: 'Storyboard, motion text, SFX, 2 revisions' },
                { key: 'video_intermediate_long', label: 'Intermediate (61-120s)', price: '₹6,000/reel', description: 'Enhanced features for longer content' },
                { key: 'video_commercial', label: 'Commercial Ad', price: 'From ₹25,000', description: 'Full post-production with color grading' },
                { key: 'video_explainer', label: 'Explainer/2D Animation', price: 'From ₹20,000/min', description: 'Script, design, animation, VO direction' }
            ],
            fullDescription: 'Professional post-production editing.'
        },
        {
            id: 'performance_marketing',
            label: 'Performance Marketing',
            tiers: [
                { key: 'ads_basic', label: 'Basic', price: '₹18,000/month', description: 'Single platform (Meta OR Google) • Ad spend ≤₹40,000' },
                { key: 'ads_pro', label: 'Pro', price: '₹30,000/month', description: '2 platforms • Landing page feedback • Ad spend ≤₹80,000' },
                { key: 'ads_superb', label: 'Superb', price: '₹50,000/month', description: 'Full integration • Creative testing • Ad spend ≤₹1,20,000' }
            ],
            fullDescription: 'Complete campaign setup and optimization.'
        },
        {
            id: 'website',
            label: 'Website Development',
            tiers: [
                { key: 'site_basic', label: 'Basic', price: '₹19,999 + ₹1,500/month', description: '5 pages • Responsive • On-page SEO' },
                { key: 'site_standard', label: 'Standard (CMS)', price: '₹34,999 + ₹2,500/month', description: '10 pages • Blog/CMS • 2 revisions' },
                { key: 'site_premium', label: 'Premium', price: '₹59,999 + ₹3,500/month', description: '20 pages • High-fidelity design • Priority SLA' },
                { key: 'site_ecommerce', label: 'E-commerce', price: '₹74,999 + ₹6,000/month', description: '100 SKUs • Payment gateway • CRO elements' }
            ],
            fullDescription: 'End-to-end website builds and maintenance.'
        },
        {
            id: 'funnel',
            label: 'Funnel Marketing',
            tiers: [
                { key: 'funnel_custom', label: 'Custom Quote', price: 'Contact to scope', description: 'Landing pages • Automation • A/B testing' }
            ],
            fullDescription: 'Strategic blueprints for sales funnels.'
        },
        {
            id: 'shoots',
            label: 'Ad Shoots',
            tiers: [
                { key: 'shoot_custom', label: 'Quoted Per Shoot', price: 'Contact to scope', description: 'Moodboards • Shoot direction • 5-10 edited outputs' }
            ],
            fullDescription: 'Complete pre-production planning and execution.'
        }
    ];

    const addService = (serviceId: string, tier: string) => {
        const service = services.find(s => s.id === serviceId);
        if (!service) return;
        const selectedTier = service.tiers.find(t => t.key === tier);
        if (!selectedTier) return;

        setSelectedServices([...selectedServices, {
            id: Date.now(),
            serviceId,
            serviceLabel: service.label,
            tier: selectedTier.label,
            price: selectedTier.price,
            description: selectedTier.description,
            fullDescription: service.fullDescription
        }]);
    };

    const removeService = (id: number) => {
        setSelectedServices(selectedServices.filter(s => s.id !== id));
    };

    const addCustomService = () => {
        setCustomServices([...customServices, {
            id: Date.now(),
            title: '',
            description: ''
        }]);
    };

    const updateCustomService = (id: number, field: string, value: string) => {
        setCustomServices(customServices.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        ));
    };

    const removeCustomService = (id: number) => {
        setCustomServices(customServices.filter(s => s.id !== id));
    };

    const handleSave = async (saveAsDraft = true) => {
        if (!formData.clientId) {
            toast.error('Please select a client before saving.');
            return;
        }

        try {
            const res = await fetch('/api/agreements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: formData.clientId,
                    // If we have an ID (editing), pass it? API currently creates new.
                    // Ideally we should UPDATE if id exists. But POST usually creates.
                    // For now, we create new versions or we need to check PUT support.
                    // Assuming CREATE new for history is safer, or check backend implementation.
                    // Existing backend uses POST create.
                    content: JSON.stringify({ formData, selectedServices, customServices }),
                    status: 'Draft',
                }),
            });

            if (res.ok) {
                const saved = await res.json();
                toast.success('Agreement saved successfully');
                // Set the ID so subsequent edits/downloads use this ID
                setFormData(prev => ({ ...prev, id: saved.id }));
                if (!saveAsDraft) return saved.id; // Return ID for download flow

                // If just saving, maybe redirect?
                // router.push('/agreements'); 
                // Or stay to allow download.
            } else {
                toast.error('Failed to save agreement');
            }
        } catch (error) {
            toast.error('Error saving agreement');
        }
        return null;
    };

    const termEndDate = formData.commencementDate ?
        new Date(new Date(formData.commencementDate).setMonth(new Date(formData.commencementDate).getMonth() + parseInt(formData.termMonths))).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) :
        '[Term End Date]';

    // generateAgreementHTML is now defined at the bottom of the file
    const handleDownload = async () => {
        // Ensure saved first to get ID
        let currentId = formData.id;
        if (!currentId) {
            currentId = await handleSave(false);
            if (!currentId) return; // Save failed
        }

        const html = generateAgreementHTML({ formData, selectedServices, customServices });
        const filename = `Service_Agreement_${formData.clientName ? formData.clientName.replace(/ /g, '_') : 'Client'}`;

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

        html2pdf().from(element).set(opt).save();
    };

    return (
        <div className="min-h-screen bg-background font-inter p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push('/agreements')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold">Create/Edit Agreement</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Controls */}
                <div className="space-y-6">
                    <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
                        <h2 className="text-xl font-bold mb-4">Client</h2>
                        <div className="flex gap-2 mb-4">
                            <Select onValueChange={handleClientSelect} value={formData.clientId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select client..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <ClientCreateDialog onClientCreated={handleClientCreated} />
                        </div>
                        <Input
                            placeholder="Client Name"
                            value={formData.clientName}
                            onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                            className="mb-2"
                        />
                        <Input
                            placeholder="Address"
                            value={formData.clientAddress}
                            onChange={e => setFormData({ ...formData, clientAddress: e.target.value })}
                        />
                    </div>

                    {/* Simplified Services Selection UI */}
                    <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
                        <h2 className="text-xl font-bold mb-4">Services</h2>
                        <div className="grid gap-2">
                            {services.map(s => (
                                <div key={s.id}>
                                    <Label className="font-bold">{s.label}</Label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {s.tiers.map(t => (
                                            <Button
                                                key={t.key}
                                                variant={selectedServices.some(sel => sel.serviceId === s.id && sel.tier === t.label) ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => addService(s.id, t.key)}
                                            >
                                                {t.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold">Selected Services:</h3>
                            <ul className="list-disc pl-5">
                                {selectedServices.map(s => (
                                    <li key={s.id} className="flex justify-between">
                                        {s.serviceLabel} - {s.tier}
                                        <Trash2 className="w-4 h-4 cursor-pointer text-red-500" onClick={() => removeService(s.id)} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
                        <h2 className="text-xl font-bold mb-4">Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date</Label>
                                <Input type="date" value={formData.commencementDate} onChange={e => setFormData({ ...formData, commencementDate: e.target.value })} />
                            </div>
                            <div>
                                <Label>Duration (Months)</Label>
                                <Input type="number" value={formData.termMonths} onChange={e => setFormData({ ...formData, termMonths: e.target.value })} />
                            </div>
                            <div>
                                <Label>Monthly Fee</Label>
                                <Input value={formData.firstMonthFee} onChange={e => setFormData({ ...formData, firstMonthFee: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button onClick={() => handleSave(true)} className="flex-1">
                            <Save className="w-4 h-4 mr-2" />
                            Save Draft
                        </Button>
                        <Button onClick={() => handleSave(false).then(() => router.push('/agreements'))} className="flex-1" variant="secondary">
                            Save & Exit
                        </Button>
                        <Button onClick={handleDownload} className="flex-1" variant="default">
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                    </div>
                </div>

                {/* Live Preview (Simplified text) */}
                <div className="bg-muted p-6 rounded-xl h-fit sticky top-6">
                    <h2 className="text-xl font-bold mb-4">Preview Summary</h2>
                    <div className="space-y-4 bg-white p-4 rounded shadow-sm text-sm">
                        <p><strong>Client:</strong> {formData.clientName}</p>
                        <p><strong>Date:</strong> {formData.agreementDate}</p>
                        <p><strong>Services:</strong></p>
                        <ul className="list-disc pl-4">
                            {selectedServices.map(s => <li key={s.id}>{s.serviceLabel} ({s.tier})</li>)}
                        </ul>
                        <p><strong>Fees:</strong> {formData.firstMonthFee ? `INR ${formData.firstMonthFee}` : 'TBD'}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 text-center">Use "PDF" button to view full document</p>
                </div>
            </div>
        </div>
    );
}

export default function CreateAgreementPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreateAgreementContent />
        </Suspense>
    );
}

export function generateAgreementHTML(data: any) {
    const { formData, selectedServices, customServices } = data;

    const servicesHtml = (selectedServices || []).map((service: any, index: number) => `
        <div class="service-item">
            <div style="font-weight: 600; font-size: 11pt; color: #0f172a;">${index + 1}. ${service.serviceLabel} (${service.tier})</div>
            <p style="color: #475569; font-style: italic; font-size: 9pt; margin-top: 2px;">${service.fullDescription}</p>
            <p style="margin-top: 4px; font-size: 9.5pt;">${service.description}</p>
        </div>
    `).join('');

    const customServicesHtml = (customServices || []).map((service: any, index: number) => `
        <div class="service-item">
            <div style="font-weight: 600; font-size: 11pt; color: #0f172a;">${(selectedServices || []).length + index + 1}. ${service.title || '[Custom Service]'}</div>
            <p style="margin-top: 4px; font-size: 9.5pt;">${service.description || ''}</p>
        </div>
    `).join('');

    // Date calculations
    const agreementDate = formData.agreementDate ? new Date(formData.agreementDate) : new Date();
    const formattedAgreementDate = agreementDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const startDate = formData.commencementDate ? new Date(formData.commencementDate) : null;
    const formattedStartDate = startDate ? startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Start Date]';

    let formattedEndDate = '[End Date]';
    let formattedReviewDate = '[Review Date]';

    if (startDate && formData.termMonths) {
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + parseInt(formData.termMonths));
        formattedEndDate = endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        // Review date: 7 days after term end
        const reviewDate = new Date(endDate);
        reviewDate.setDate(reviewDate.getDate() + 7);
        formattedReviewDate = reviewDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    // Onboarding date (assuming 5 days from start date similar to template logic)
    // Template says "5 business days from 1 December 2025" (Start Date)
    // We'll use start date text.

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Service Agreement - ${formData.clientName || 'Client'}</title>
    <style>
        @page { size: A4; margin: 25mm 25mm; }
        body { 
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 10pt; 
            line-height: 1.5; 
            color: #334155; /* Slate 700 */
            max-width: 180mm; /* Constrain width for readability within margins */
            margin: 0 auto;
            background: white;
        }
        .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            margin-bottom: 40px; 
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 20px;
        }
        .logo { height: 40px; }
        .header-text { text-align: right; }
        h1 { 
            font-size: 18pt; 
            font-weight: 700; 
            color: #0f172a;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .subtitle {
            font-size: 9pt;
            color: #64748b;
            margin-top: 5px;
        }
        h3 { 
            font-size: 11pt; 
            font-weight: 700; 
            color: #0f172a; /* Slate 900 */
            margin-top: 30px; 
            margin-bottom: 10px; 
            text-transform: uppercase;
            page-break-after: avoid; /* Don't break right after a heading */
        }
        p { margin-bottom: 10px; text-align: justify; }
        strong { color: #0f172a; font-weight: 600; }
        ul { page-break-inside: avoid; }
        .service-list {
            margin-top: 15px;
            margin-bottom: 20px;
            border-left: 3px solid #e2e8f0;
            padding-left: 20px;
            page-break-inside: avoid;
        }
        .service-item {
            margin-bottom: 15px;
            page-break-inside: avoid;
        }
        .service-title {
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 2px;
        }
        .meta-data-grid {
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 20px; 
            margin: 15px 0;
            background: #f8fafc;
            padding: 15px;
            border-radius: 4px;
            page-break-inside: avoid;
        }
        .meta-item { text-align: center; }
        .meta-label { font-size: 8pt; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
        .meta-value { font-weight: 600; color: #0f172a; }

        /* Page break controls */
        .page-break { page-break-before: always; }
        .section { page-break-inside: avoid; }
        
        .signature-section { margin-top: 60px; page-break-inside: avoid; page-break-before: always; }
        .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 30px; }
        .signature-box { page-break-inside: avoid; }
        .signature-line { border-bottom: 1px solid #000; margin-bottom: 8px; height: 1px; width: 100%; margin-top: 40px; }
        
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 8pt;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
        }
    </style>
</head>
<body>

    <div class="header">
        <img src="/adgrades-logo.png" alt="AdGrades" class="logo">
        <div class="header-text">
            <h1>Service Agreement</h1>
            <div class="subtitle">AdGrades x ${formData.clientName || 'Client'}</div>
        </div>
    </div>

    <p>This Service Agreement (<strong>"Agreement"</strong>) is formally entered into on this <strong>${formattedAgreementDate}</strong>, by and between:</p>

    <ul style="padding-left: 30px; margin-bottom: 15px;">
        <li><strong>AdGrades</strong>, a marketing agency maintaining its principal place of business at Bangalore, Karnataka, India, hereinafter referred to as the "Agency"; and</li>
        <li><strong>${formData.clientName || '[Client Name]'}</strong>, ${formData.clientAddress || 'a service provider maintaining its principal place of business at [Address]'}, hereinafter referred to as the "Client".</li>
    </ul>

    <p>The Agency and the Client shall hereinafter be collectively referred to as the "Parties" and individually as a "Party".</p>

    <h3>1. DEFINITIONS</h3>
    <p style="margin-left: 20px;"><strong>1.1</strong> "Services" shall mean the marketing, development, and performance services meticulously described in Section 2 (Scope of Services / Exhibit A) of this Agreement.</p>
    <p style="margin-left: 20px;"><strong>1.2</strong> "Commencement Date" shall be defined as ${formattedStartDate}.</p>
    <p style="margin-left: 20px;"><strong>1.3</strong> "Term" shall denote the initial ${formData.termMonths || '0'} month period, commencing on the Commencement Date and concluding on ${formattedEndDate} (inclusive), unless prematurely terminated in strict accordance with the provisions of this Agreement.</p>

    <h3>2. SCOPE OF SERVICES (EXHIBIT A)</h3>
    <p>The Agency formally covenants and agrees to furnish the following services to the Client during the Term:</p>
    
    <div class="service-list">
        ${servicesHtml}
        ${customServicesHtml}
    </div>

    <h3>3. TERM</h3>
    <p><strong>3.1</strong> This Agreement shall officially commence on ${formattedStartDate} and shall continue in force for a duration of ${formData.termMonths || '0'} months, terminating on ${formattedEndDate}, unless it is earlier terminated in accordance with the provisions stipulated herein.</p>

    <h3>4. RELATIONSHIP OF THE PARTIES</h3>
    <p>The Agency is an independent contractor and not an employee, partner, or joint venturer of the Client. The Agency shall define its own means, methods, and schedules to accomplish the Services, provided deliverables meet the agreed timelines.</p>

    <h3>5. FEES & PAYMENT TERMS (EXHIBIT B)</h3>
    <p><strong>5.1 Quoted Fee:</strong> The Agency's quoted monthly fee is established at INR ${formData.quotedFee || formData.totalFee || '0'}.</p>
    <p><strong>5.2 Negotiated Fee:</strong> The Parties hereby agree to a fee of INR ${formData.totalFee || formData.firstMonthFee || '0'} per month for the Term.</p>
    <p><strong>5.3 Total for Term:</strong> The total fee payable for the Term shall be INR ${formData.totalFee || '0'}.</p>
    <p><strong>5.4 Payment Schedule:</strong></p>
    <p style="margin-left: 20px;">a) The fee for Month 1, amounting to INR ${formData.firstMonthFee || '-'}, is due and payable prior to the Commencement Date (i.e., on or before ${formattedStartDate}).</p>
    <p><strong>5.5 Payment Method:</strong> Payment shall be executed via UPI or Bank Transfer to AdGrades' official account (with detailed account information to be formally provided).</p>
    <p><strong>5.6 Late Payment:</strong> Any payments not fully received within three (3) calendar days of the stipulated due date shall be subject to a late fee of INR ${formData.lateFeePerDay || '500'} per diem until the outstanding amount is remitted. The Agency reserves the right to suspend the provision of Services after seven (7) days of continuous non-payment.</p>
    <p><strong>5.7</strong> All stated fees are exclusive of applicable taxes. Any and all requisite taxes, duties, or levies shall be charged additionally and shall be the sole responsibility of the Client for payment.</p>

    <h3>6. SERVICE RULES</h3>
    <p><strong>6.1 Revisions:</strong> A maximum of two (2) rounds of revisions are comprehensively included per deliverable. Any and all additional revisions requested shall be billed at the Agency's prevailing hourly rate.</p>
    <p><strong>6.2 Client Response Time:</strong> The Client formally agrees to furnish all necessary approvals, assets, and feedback within ${formData.clientResponseHours || 'forty-eight (48)'} hours of the Agency's request to prevent delays in the project timeline.</p>
    <p><strong>6.3 Working Hours:</strong> The Agency's standard working hours are designated as Monday through Saturday, 10:00 AM – 7:00 PM Indian Standard Time (IST).</p>
    <p><strong>6.4 Approval Flow:</strong> Final and definitive approval for all creative content and material rests solely with the Client prior to any public publishing or dissemination.</p>

    <h3>7. COMMUNICATION & REPORTING</h3>
    <p><strong>7.1 Primary Channel:</strong> The primary channel for communication shall be WhatsApp. Secondary channels include Email and Slack (if mutually requested and agreed upon).</p>
    <p><strong>7.2 Points of Contact:</strong></p>
    <ul style="padding-left: 30px; margin-bottom: 10px;">
        <li>Agency: ${formData.agencyRepName || 'Chandan B Krishna'}: ${formData.agencyContact || '+91 80736 98913'}</li>
        <li>Client: ${formData.clientRepName || '[Representative Name]'}: ${formData.clientContact || '[Contact Number]'}</li>
    </ul>
    <p><strong>7.3 Reporting Frequency:</strong> The Client shall receive weekly performance snapshots (via WhatsApp or Email) and a comprehensive, detailed monthly report at the close of each calendar month.</p>

    <div class="page-break"></div>

    <h3>8. CONFIDENTIALITY</h3>
    <p><strong>8.1</strong> Each Party hereby covenants to maintain the strict confidentiality of all proprietary and non-public information disclosed by the other Party and shall utilise such information exclusively for the purpose of fulfilling the obligations set forth in this Agreement.</p>
    <p><strong>8.2</strong> These confidentiality obligations shall survive the termination of this Agreement for a period of three (3) years.</p>

    <h3>9. TERMINATION</h3>
    <p><strong>9.1</strong> Either Party retains the right to terminate this Agreement by providing the other Party with fifteen (15) days' prior written notice.</p>
    <p><strong>9.2</strong> Should the Client elect to terminate the Agreement mid-month, the fees for the current month shall remain due and payable and shall be strictly non-refundable.</p>
    <p><strong>9.3</strong> Subsequent to termination and the full settlement of all outstanding invoices, the Agency shall formally hand over all work-in-progress and completed deliverables to the Client.</p>

    <h3>10. LIMITATION OF LIABILITY</h3>
    <p><strong>10.1</strong> The Agency shall not be held liable for any indirect, incidental, consequential, or special damages whatsoever.</p>
    <p><strong>10.2</strong> The Agency's maximum aggregate liability for any and all claims arising out of or directly related to this Agreement shall in no event exceed the total fee paid by the Client for the most recently completed service month.</p>

    <h3>11. OWNERSHIP OF WORK</h3>
    <p><strong>11.1</strong> Upon the full and final payment of all sums due under the terms of this Agreement, the Client shall acquire full ownership of the final deliverables produced specifically for the Client. Source files (including design files, code repository links, etc.) may be transferred as mutually agreed upon and documented in the onboarding plan.</p>
    <p><strong>11.2</strong> The Agency shall retain the irrevocable right to showcase the completed work in its professional portfolio and marketing materials, provided that the Client's confidential information is not disclosed without the Client's explicit prior written permission.</p>

    <h3>12. WARRANTIES & DISCLAIMERS</h3>
    <p><strong>12.1</strong> The Agency warrants that the Services shall be executed with reasonable professional skill and care.</p>
    <p><strong>12.2</strong> Except for the warranties expressly provided herein, the Agency hereby disclaims all other warranties, whether express or implied.</p>

    <h3>13. FORCE MAJEURE</h3>
    <p>Neither Party shall be held liable for any delay or failure to perform its obligations hereunder if such delay or failure is caused by events demonstrably beyond its reasonable control (such as Acts of God, labour strikes, governmental action, etc.). The period for performance shall be equitably extended for the duration of any such delay.</p>

    <div class="page-break"></div>

    <h3>14. DISPUTE RESOLUTION & JURISDICTION</h3>
    <p><strong>14.1</strong> The Parties shall endeavour, in good faith, to resolve any disputes arising amicably through mutual discussion.</p>
    <p><strong>14.2</strong> Should a dispute remain unresolved within a period of thirty (30) days, the matter shall be subject to the exclusive jurisdiction of the courts situated in Bangalore, Karnataka, India.</p>

    <h3>15. ENTIRE AGREEMENT</h3>
    <p>This Agreement (including all referenced Exhibits) constitutes the entire and exclusive agreement between the Parties concerning its subject matter. Any and all amendments hereto must be documented in writing and formally executed by the authorized signatories of both Parties.</p>

    <h3>16. MISCELLANEOUS</h3>
    <p><strong>16.1 Notices:</strong> All formal notices must be in writing and delivered to the addresses specified in the header of this Agreement or as subsequently updated in writing.</p>
    <p><strong>16.2 Assignment:</strong> Neither Party may assign its rights or delegate its obligations under this Agreement without the prior written consent of the other Party, with the sole exception of assignment to a successor in interest.</p>
    <p><strong>16.3 Severability:</strong> Should any provision of this Agreement be deemed unenforceable by a court of competent jurisdiction, the remaining provisions shall nonetheless remain in full force and effect.</p>

    <h3>17. ONBOARDING & TIMELINES</h3>
    <p><strong>17.1</strong> The Agency shall deliver a comprehensive onboarding plan within five (5) business days from ${formattedStartDate}, providing meticulous details on milestones, page counts, required Client assets, and target launch dates.</p>
    <p><strong>17.2</strong> Illustrative Website Development Milestones:</p>
    <ul style="padding-left: 30px; margin-bottom: 10px;">
        <li>Day 0–5: Comprehensive requirement gathering and sitemap finalisation.</li>
        <li>Day 6–15: Design mockup creation and formal Client approvals.</li>
        <li>Day 16–35: Development execution and internal Quality Assurance (QA).</li>
        <li>Day 36–45: Staging environment reviews and final launch (contingent upon timely Client approvals).</li>
    </ul>
    <p>(The precise, final timelines shall be meticulously captured within the onboarding plan.)</p>

    <h3>18. PERFORMANCE REVIEW AFTER TERM</h3>
    <p><strong>18.1</strong> Within seven (7) calendar days following ${formattedEndDate}, the Parties shall formally convene to:</p>
    <p style="margin-left: 20px;">a) Review the actual performance against the Key Performance Indicators (KPIs) agreed upon in the onboarding plan.</p>
    <p style="margin-left: 20px;">b) Determine and agree upon the scope of work and associated fee for any future engagement.</p>
    <p style="margin-left: 20px;">c) Execute a new formal agreement or formally amend this existing Agreement, provided both Parties are in mutual assent.</p>

    <div class="signature-section">
        <p><strong>IN WITNESS WHEREOF</strong>, the Parties have duly caused this Agreement to be executed by their respective authorized representatives on the date first written above.</p>

        <div class="signature-grid">
            <div class="signature-box">
                <p><strong>For AdGrades</strong></p>
                <p>Name: <strong>Chandan B Krishna</strong></p>
                <p>Designation: CEO</p>
                <div class="signature-line"></div>
                <p>Signature</p>
                <p>Date: ${formattedAgreementDate}</p>
            </div>
            <div class="signature-box">
                <p><strong>For ${formData.clientName || 'Client'}</strong></p>
                <p>Name: ${formData.clientRepName || '________________________________'}</p>
                <p>Designation: ${formData.clientRepDesignation || '________________________________'}</p>
                <div class="signature-line"></div>
                <p>Signature</p>
                <p>Date: ________________________________</p>
            </div>
        </div>
    </div>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p><strong>EXHIBIT A</strong> — DETAILED SCOPE (to attach the onboarding plan)</p>
        <p><strong>EXHIBIT B</strong> — FEES & PAYMENT SCHEDULE (as per Section 4)</p>
    </div>
    
    <div class="footer">
        AdGrades Marketing Agency • Service Agreement • Confidential
    </div>

</body>
</html>`;
}

