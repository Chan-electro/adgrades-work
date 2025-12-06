"use client"

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Card, Button, Input, PageHeader } from '@/components/ui-migrated';
import { CountUp } from '@/components/visuals';

export default function ServicesPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [generating, setGenerating] = useState(false);
    const [generated, setGenerated] = useState(false);

    // Mock Form State
    const [form, setForm] = useState({ value: 10000, term: 12 });

    const handleGenerate = () => {
        setGenerating(true);
        setTimeout(() => {
            setGenerating(false);
            setGenerated(true);
        }, 2000);
    };

    if (generated) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => router.push(`/clients/${id}`)} className="pl-0">
                    <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Back to Client
                </Button>
                <Card className="p-8 text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold">Package Generated Successfully!</h2>
                    <p className="text-zinc-500">The proposal document has been created and is ready for review.</p>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={() => setGenerated(false)}>Edit Inputs</Button>
                        <Button onClick={() => router.push(`/clients/${id}`)}>View in Client Profile</Button>
                    </div>
                </Card>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6 h-full">
            <Button variant="ghost" onClick={() => router.push(`/clients/${id}`)} className="pl-0">
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Back to Client
            </Button>
            <PageHeader title="Sales & Services Configuration" description="Configure the deal terms and services." />

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Sales Parameters</h2>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Estimated Deal Value</label>
                            <Input
                                type="number"
                                value={form.value}
                                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Contract Term (Months)</label>
                            <Input
                                type="number"
                                value={form.term}
                                onChange={(e) => setForm({ ...form, term: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Select Services</h2>
                        {['SEO Optimization', 'Paid Media Management', 'Content Marketing', 'Email Automation'].map(s => (
                            <div key={s} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                                <input type="checkbox" className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-600" />
                                <span className="text-sm font-medium">{s}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <div className="sticky top-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-6">Package Preview</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <span className="text-zinc-400">Total Value</span>
                                    <span className="text-3xl font-bold text-blue-400">
                                        <CountUp end={form.value} prefix="$" />
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-zinc-400">Term Length</span>
                                    <span className="text-xl font-medium">{form.term} Months</span>
                                </div>
                                <div className="pt-6 border-t border-border">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Monthly Recurring</span>
                                        <span>${Math.round(form.value / form.term).toLocaleString()} /mo</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8">
                                <Button
                                    className="w-full bg-blue-500 hover:bg-blue-400 text-white"
                                    onClick={handleGenerate}
                                    isLoading={generating}
                                >
                                    {generating ? 'Generating Proposal...' : 'Generate Package & Proposal'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
