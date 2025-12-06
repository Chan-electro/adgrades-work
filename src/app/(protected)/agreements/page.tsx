'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Download, FileText, Pencil } from 'lucide-react';
import { generateAgreementHTML } from './create/page';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type Agreement = {
    id: string;
    clientId: string;
    status: string;
    createdAt: string;
    content: string; // JSON string
    client?: {
        name: string;
    };
};

export default function AgreementsPage() {
    const [agreements, setAgreements] = useState<Agreement[]>([]);
    // const [agreementDocs, setAgreementDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchAgreements();
    }, []);

    async function fetchAgreements() {
        try {
            const res = await fetch('/api/agreements');
            if (res.ok) {
                const data = await res.json();
                setAgreements(Array.isArray(data) ? data : []);
                setAgreements(Array.isArray(data) ? data : []);
            }
            // Document fetching removed
        } catch (error) {
            console.error('Failed to fetch agreements:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleDownload = async (agreement: Agreement) => {
        try {
            const content = typeof agreement.content === 'string'
                ? JSON.parse(agreement.content)
                : agreement.content;

            const html = generateAgreementHTML(content);
            const clientName = agreement.client?.name || 'Client';
            const fileName = `Service_Agreement_${clientName.replace(/ /g, '_')}.pdf`;

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
        } catch (e) {
            console.error('Failed to download PDF', e);
            toast.error('Failed to generate PDF');
        }
    };

    if (loading) return <div className="p-6">Loading agreements...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Agreements</h2>
                <Link href="/agreements/create">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Agreement
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {agreements.length === 0 && (
                    <div className="text-center py-10 text-gray-500 border rounded-lg bg-muted/20">
                        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p>No agreements found. Create your first agreement!</p>
                    </div>
                )}

                {agreements.map((agreement) => {
                    const clientName = agreement.client?.name || 'Unknown Client';
                    // const docExists = agreementDocs.some(d => d.agreementId === agreement.id);

                    return (
                        <Card key={agreement.id}>
                            <CardHeader className="py-4">
                                <CardTitle className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center text-base">
                                    <div className="flex flex-col">
                                        <span className="font-bold">{clientName}</span>
                                        <span className="text-xs text-muted-foreground font-normal">
                                            #{agreement.id.slice(-6).toUpperCase()} • {new Date(agreement.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`text-xs px-2 py-1 rounded-full ${agreement.status === 'Signed' ? 'bg-green-100 text-green-800' :
                                            agreement.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {agreement.status}
                                        </span>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => router.push(`/agreements/create?loadId=${agreement.id}`)}
                                        >
                                            <Pencil className="w-3 h-3 mr-1" />
                                            Edit
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleDownload(agreement)}
                                        >
                                            <Download className="w-3 h-3 mr-1" />
                                            PDF
                                        </Button>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
