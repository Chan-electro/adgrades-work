"use client";

import React, { useState, useEffect } from "react";
import { PageHeader, Card, Button, Input } from "@/components/ui-migrated";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { User, Building, Monitor, Save, Moon, Sun, Laptop } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // State for Profile
    const [profile, setProfile] = useState({
        name: "Demo User",
        email: "admin@adgrades.work",
        role: "Administrator",
    });

    // State for Company/Agency
    const [company, setCompany] = useState({
        name: "",
        address: "",
        website: "",
        taxId: "",
    });

    // Prevent hydration mismatch & fetch data
    useEffect(() => {
        setMounted(true);
        fetch("/api/settings/agency")
            .then((res) => res.json())
            .then((data) => {
                if (data && !data.error) {
                    setCompany({
                        name: data.name || "",
                        address: data.address || "",
                        website: data.website || "",
                        taxId: data.taxId || "",
                    });
                }
            })
            .catch((err) => console.error(err));
    }, []);

    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        toast.info("Profile update is disabled in this demo.");
    };

    const handleCompanySave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/settings/agency", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(company),
            });

            if (res.ok) {
                toast.success("Agency settings saved successfully");
            } else {
                toast.error("Failed to save settings");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    if (!mounted) return null;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Settings"
                description="Manage your account, agency details, and application preferences."
            />

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/50">
                    <TabsTrigger value="profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="company">
                        <Building className="mr-2 h-4 w-4" />
                        Agency Info
                    </TabsTrigger>
                    <TabsTrigger value="appearance">
                        <Monitor className="mr-2 h-4 w-4" />
                        Appearance
                    </TabsTrigger>
                </TabsList>

                {/* --- Profile Tab --- */}
                <TabsContent value="profile" className="mt-6 space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-medium text-foreground mb-4">Personal Information</h3>
                        <form onSubmit={handleProfileSave} className="space-y-4 max-w-xl">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="bg-muted/50"
                                />
                                <p className="text-xs text-muted-foreground">Email cannot be changed in demo mode.</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <Input
                                    id="role"
                                    value={profile.role}
                                    disabled
                                    className="bg-muted/50"
                                />
                            </div>
                            <div className="pt-2">
                                <Button type="submit">
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Card>
                </TabsContent>

                {/* --- Company Tab --- */}
                <TabsContent value="company" className="mt-6 space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-medium text-foreground mb-4">Agency Details</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            These details will appear on your generated invoices and agreements.
                        </p>
                        <form onSubmit={handleCompanySave} className="space-y-4 max-w-xl">
                            <div className="grid gap-2">
                                <Label htmlFor="companyName">Agency Name</Label>
                                <Input
                                    id="companyName"
                                    value={company.name}
                                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="companyAddress">Business Address</Label>
                                <Input
                                    id="companyAddress"
                                    value={company.address}
                                    onChange={(e) => setCompany({ ...company, address: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        value={company.website}
                                        onChange={(e) => setCompany({ ...company, website: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="taxId">Tax ID / EIN</Label>
                                    <Input
                                        id="taxId"
                                        value={company.taxId}
                                        onChange={(e) => setCompany({ ...company, taxId: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <Button type="submit">
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Agency Info
                                </Button>
                            </div>
                        </form>
                    </Card>
                </TabsContent>

                {/* --- Appearance Tab --- */}
                <TabsContent value="appearance" className="mt-6 space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-medium text-foreground mb-2">Theme Preferences</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Customize how AdGrades looks on your device.
                        </p>

                        <div className="grid grid-cols-3 gap-4 max-w-2xl">
                            {/* Light Mode */}
                            <button
                                onClick={() => setTheme("light")}
                                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-accent ${theme === "light" ? "border-primary bg-accent/50" : "border-muted"
                                    }`}
                            >
                                <div className="flex h-20 w-full items-center justify-center rounded-lg bg-white shadow-sm border border-zinc-200">
                                    <div className="h-10 w-10 text-zinc-900 bg-zinc-100 rounded-md flex items-center justify-center">
                                        <Sun className="h-6 w-6" />
                                    </div>
                                </div>
                                <span className="font-medium text-sm">Light</span>
                                {theme === "light" && <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />}
                            </button>

                            {/* Dark Mode */}
                            <button
                                onClick={() => setTheme("dark")}
                                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-accent ${theme === "dark" ? "border-primary bg-accent/50" : "border-muted"
                                    }`}
                            >
                                <div className="flex h-20 w-full items-center justify-center rounded-lg bg-zinc-950 shadow-sm border border-zinc-800">
                                    <div className="h-10 w-10 text-zinc-100 bg-zinc-800 rounded-md flex items-center justify-center">
                                        <Moon className="h-6 w-6" />
                                    </div>
                                </div>
                                <span className="font-medium text-sm">Dark</span>
                                {theme === "dark" && <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />}
                            </button>

                            {/* System Mode */}
                            <button
                                onClick={() => setTheme("system")}
                                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-accent ${theme === "system" ? "border-primary bg-accent/50" : "border-muted"
                                    }`}
                            >
                                <div className="flex h-20 w-full items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-border">
                                    <div className="h-10 w-10 text-foreground bg-muted rounded-md flex items-center justify-center">
                                        <Laptop className="h-6 w-6" />
                                    </div>
                                </div>
                                <span className="font-medium text-sm">System</span>
                                {theme === "system" && <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />}
                            </button>
                        </div>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
