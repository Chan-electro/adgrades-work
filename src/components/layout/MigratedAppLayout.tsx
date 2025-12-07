"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Receipt, Settings, LogOut, Sun, Moon, Menu, X, User, Calendar, Sparkles, LineChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui-migrated'; // Use migrated UI components

export const MigratedAppLayout = ({ children }: { children?: React.ReactNode }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { resolvedTheme, setTheme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);

    React.useEffect(() => {
        setMounted(true);
        // Fetch user session to get the logged-in user's name
        fetch('/api/auth/session')
            .then(res => res.json())
            .then(data => {
                if (data.userId) {
                    setUserName(data.userId);
                }
            })
            .catch(() => { });
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
            router.push('/login');
        }
    };

    const isDark = resolvedTheme === 'dark';
    const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Users, label: 'Clients', path: '/clients' },
        { icon: LineChart, label: 'Finance', path: '/finance' },
        { icon: Calendar, label: 'Scheduler', path: '/scheduler' },
        { icon: FileText, label: 'Agreements', path: '/agreements' },
        { icon: Receipt, label: 'Invoices', path: '/invoices' },
        { icon: Sparkles, label: 'Prompt Gen', path: '/prompt-generator' },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card flex flex-col lg:static lg:flex ${isSidebarOpen ? 'flex' : 'hidden'
                    }`}
                initial={false}
                animate={{ x: isSidebarOpen ? 0 : 0 }}
            >
                <div className="flex h-16 items-center border-b border-border px-6">
                    {mounted ? (
                        <img
                            src={isDark ? "/adgrades-logo-dark.png" : "/adgrades-logo.png"}
                            alt="AdGrades Work"
                            className="h-10 w-auto object-contain"
                        />
                    ) : (
                        <div className="h-10 w-32 bg-muted/20 animate-pulse rounded" />
                    )}
                    <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${pathname.startsWith(item.path)
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto w-full px-3 pb-4">
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                        <Settings className="h-5 w-5" />
                        Settings
                    </Link>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                            <Menu className="h-6 w-6" />
                        </button>
                        <h2 className="text-lg font-semibold hidden md:block capitalize">
                            {pathname.split('/')[1] || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        >
                            {mounted ? (isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <div className="h-5 w-5" />}
                        </button>

                        <div className="flex items-center gap-3 border-l border-border pl-4">
                            <div className="hidden text-right text-sm md:block">
                                <p className="font-medium text-foreground">{userName || 'Admin User'}</p>
                                <p className="text-xs text-muted-foreground">Admin</p>
                            </div>
                            <div className="relative group cursor-pointer">
                                <div className="h-9 w-9 overflow-hidden rounded-full bg-blue-100 border border-blue-200 dark:bg-blue-900 dark:border-blue-800 flex items-center justify-center">
                                    <User className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                                </div>
                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-md border border-zinc-200 bg-white p-1 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all dark:border-zinc-800 dark:bg-zinc-950">
                                    <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background p-4 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="mx-auto max-w-7xl h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};
