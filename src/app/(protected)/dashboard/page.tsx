"use client"

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Users, FileText, Receipt, ArrowRight, Activity, Plus } from 'lucide-react';
import { Card, Button, PageHeader, Badge } from '@/components/ui-migrated';
import { CountUp, DashboardPipeline } from '@/components/visuals';

const StatCard = ({ title, value, icon: Icon, color, onClick }: any) => (
    <Card
        className="p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
        onClick={onClick}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className="mt-2 text-3xl font-bold text-foreground">
                    <CountUp end={value} />
                </div>
            </div>
            <div className={`rounded-full p-3 ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
    </Card>
);

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState({ totalClients: 0, activeAgreements: 0, outstandingInvoices: 0 });
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/dashboard/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                    setActivities(data.activities);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8">
            <PageHeader title="Dashboard" description="Overview of your agency workflow" />

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
                <motion.div variants={item}>
                    <StatCard
                        title="Total Clients"
                        value={stats.totalClients}
                        icon={Users}
                        color="bg-blue-500"
                        onClick={() => router.push('/clients')}
                    />
                </motion.div>
                <motion.div variants={item}>
                    <StatCard
                        title="Signed Agreements"
                        value={stats.activeAgreements}
                        icon={FileText}
                        color="bg-indigo-500"
                        onClick={() => router.push('/agreements')}
                    />
                </motion.div>
                <motion.div variants={item}>
                    <StatCard
                        title="Outstanding Invoices"
                        value={stats.outstandingInvoices}
                        icon={Receipt}
                        color="bg-amber-500"
                        onClick={() => router.push('/invoices')}
                    />
                </motion.div>
            </motion.div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                <motion.div className="md:col-span-2 space-y-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    {/* Main Action & Visual */}
                    <Card className="p-8 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Grow your agency</h3>
                            <p className="text-blue-100 mb-6 max-w-md">Ready to onboard a new client? Start the workflow by creating a client profile or choosing an existing one.</p>
                            <Button
                                onClick={() => router.push('/clients')}
                                className="bg-white text-blue-600 hover:bg-blue-50 border-none"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Client / Browse List
                            </Button>
                        </div>
                        {/* Abstract bg shapes */}
                        <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute bottom-0 right-20 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl" />
                    </Card>

                    {/* Pipeline Visual */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Live Workflow Status</h4>
                        <DashboardPipeline />
                    </div>
                </motion.div>

                {/* Activity Feed */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                    <Card className="h-full flex flex-col">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h3 className="font-semibold">Recent Activity</h3>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="p-6 space-y-6 flex-1">
                            {activities.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                            ) : (
                                activities.map((act) => (
                                    <div key={act.id} className="flex gap-4 group cursor-pointer">
                                        <div className="relative mt-1">
                                            <div className={`h-2 w-2 rounded-full ring-4 ring-background ${act.type === 'success' ? 'bg-emerald-500' :
                                                act.type === 'info' ? 'bg-blue-500' : 'bg-zinc-400'
                                                }`} />
                                            <div className="absolute top-2 left-1 h-full w-px bg-border -z-10 group-last:hidden" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{act.text}</p>
                                            <p className="text-xs text-muted-foreground">{act.time}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 border-t border-border">
                            <Button variant="ghost" size="sm" className="w-full text-muted-foreground">View All Activity</Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
