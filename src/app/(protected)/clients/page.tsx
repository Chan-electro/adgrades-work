"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, ArrowRight, Filter } from 'lucide-react';
import { Card, Button, Input, PageHeader, Badge } from '@/components/ui-migrated';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Client {
    id: string;
    name: string;
    industry: string | null;
    website: string | null;
    createdAt: string;
}

export default function ClientsPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await fetch('/api/clients');
                if (!res.ok) throw new Error('Failed to fetch clients');
                const data = await res.json();
                setClients(data);
            } catch (error) {
                console.error('Error fetching clients:', error);
                toast.error('Failed to load clients');
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    const filteredClients = clients.filter((client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.industry && client.industry.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Clients"
                description="Manage your client relationships and profiles."
                actions={
                    <Button onClick={() => router.push('/clients/create')}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Client
                    </Button>
                }
            />

            <Card className="overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between bg-muted/20">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search clients..."
                            className="pl-9 bg-background"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" /> Filter
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-10 text-center text-muted-foreground">Loading clients...</div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-border">
                                {filteredClients.map((client, i) => (
                                    <motion.div
                                        key={`mobile-${client.id}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => router.push(`/clients/${client.id}`)}
                                        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-foreground truncate">{client.name}</p>
                                                <p className="text-sm text-muted-foreground truncate">{client.industry || 'No industry'}</p>
                                            </div>
                                            <div className="flex items-center gap-3 ml-4">
                                                <Badge variant="success">Active</Badge>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <table className="w-full text-sm text-left hidden md:table">
                                <thead className="bg-muted/50 text-muted-foreground font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Client Name</th>
                                        <th className="px-6 py-3 hidden lg:table-cell">Industry</th>
                                        <th className="px-6 py-3 hidden lg:table-cell">Website</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Created</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredClients.map((client, i) => (
                                        <motion.tr
                                            key={client.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => router.push(`/clients/${client.id}`)}
                                            className="group bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                                        >
                                            <td className="px-6 py-4 font-medium text-foreground">{client.name}</td>
                                            <td className="px-6 py-4 text-muted-foreground hidden lg:table-cell">{client.industry || '-'}</td>
                                            <td className="px-6 py-4 text-muted-foreground hidden lg:table-cell">{client.website || '-'}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="success">Active</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">{new Date(client.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <ArrowRight className="inline-block h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                    {!loading && filteredClients.length === 0 && (
                        <div className="p-10 text-center text-muted-foreground">No clients found.</div>
                    )}
                </div>
            </Card>
        </div >
    );
}
