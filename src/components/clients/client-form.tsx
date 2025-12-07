'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ClientFormProps {
    onSuccess?: (client: any) => void;
    onCancel?: () => void;
}

export function ClientForm({ onSuccess, onCancel }: ClientFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        website: '',
        address: '',
        contactPerson: '',
        email: '',
        phone: '',
        // Prompt generator fields
        companyInfo: '',
        domainOrIndustry: '',
        niche: '',
        businessModel: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Client name is required';
        if (!formData.industry.trim()) newErrors.industry = 'Industry is required';
        if (!formData.website.trim()) newErrors.website = 'Website is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.companyInfo.trim()) newErrors.companyInfo = 'Company info is required';
        if (!formData.domainOrIndustry.trim()) newErrors.domainOrIndustry = 'Domain/Industry is required';
        if (!formData.niche.trim()) newErrors.niche = 'Niche is required';
        if (!formData.businessModel) newErrors.businessModel = 'Business model is required';

        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create client');
            }

            toast.success('Client created successfully');
            if (onSuccess) onSuccess(data);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic Information</h3>

                <div className="space-y-2">
                    <Label htmlFor="name">Client Name <span className="text-destructive">*</span></Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter client business name"
                        disabled={loading}
                        className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person <span className="text-destructive">*</span></Label>
                        <Input
                            id="contactPerson"
                            name="contactPerson"
                            value={formData.contactPerson}
                            onChange={handleChange}
                            placeholder="Name of contact"
                            disabled={loading}
                            className={errors.contactPerson ? 'border-destructive' : ''}
                        />
                        {errors.contactPerson && <p className="text-xs text-destructive">{errors.contactPerson}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="industry">Industry <span className="text-destructive">*</span></Label>
                        <Input
                            id="industry"
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                            placeholder="e.g. Healthcare, Technology"
                            disabled={loading}
                            className={errors.industry ? 'border-destructive' : ''}
                        />
                        {errors.industry && <p className="text-xs text-destructive">{errors.industry}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="client@example.com"
                            disabled={loading}
                            className={errors.email ? 'border-destructive' : ''}
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
                        <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91..."
                            disabled={loading}
                            className={errors.phone ? 'border-destructive' : ''}
                        />
                        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="website">Website <span className="text-destructive">*</span></Label>
                    <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://..."
                        disabled={loading}
                        className={errors.website ? 'border-destructive' : ''}
                    />
                    {errors.website && <p className="text-xs text-destructive">{errors.website}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Address <span className="text-destructive">*</span></Label>
                    <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Full business address"
                        disabled={loading}
                        className={errors.address ? 'border-destructive' : ''}
                    />
                    {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                </div>
            </div>

            {/* Prompt Generator Fields Section */}
            <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Research & Strategy Info</h3>
                <p className="text-xs text-muted-foreground">These fields are used for generating research prompts and market analysis.</p>

                <div className="space-y-2">
                    <Label htmlFor="companyInfo">Company Description <span className="text-destructive">*</span></Label>
                    <Textarea
                        id="companyInfo"
                        name="companyInfo"
                        value={formData.companyInfo}
                        onChange={handleChange}
                        placeholder="Describe what the company does, its products/services, target audience, etc."
                        disabled={loading}
                        rows={3}
                        className={errors.companyInfo ? 'border-destructive' : ''}
                    />
                    {errors.companyInfo && <p className="text-xs text-destructive">{errors.companyInfo}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="domainOrIndustry">Domain/Industry Focus <span className="text-destructive">*</span></Label>
                        <Input
                            id="domainOrIndustry"
                            name="domainOrIndustry"
                            value={formData.domainOrIndustry}
                            onChange={handleChange}
                            placeholder="e.g. Digital Marketing, SaaS"
                            disabled={loading}
                            className={errors.domainOrIndustry ? 'border-destructive' : ''}
                        />
                        {errors.domainOrIndustry && <p className="text-xs text-destructive">{errors.domainOrIndustry}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="niche">Specific Niche <span className="text-destructive">*</span></Label>
                        <Input
                            id="niche"
                            name="niche"
                            value={formData.niche}
                            onChange={handleChange}
                            placeholder="e.g. E-commerce SEO, Medical Devices"
                            disabled={loading}
                            className={errors.niche ? 'border-destructive' : ''}
                        />
                        {errors.niche && <p className="text-xs text-destructive">{errors.niche}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="businessModel">Business Model <span className="text-destructive">*</span></Label>
                    <Select
                        onValueChange={(value) => handleSelectChange('businessModel', value)}
                        value={formData.businessModel}
                        disabled={loading}
                    >
                        <SelectTrigger className={errors.businessModel ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select business model..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="B2B">B2B (Business to Business)</SelectItem>
                            <SelectItem value="B2C">B2C (Business to Consumer)</SelectItem>
                            <SelectItem value="B2B2C">B2B2C (Business to Business to Consumer)</SelectItem>
                            <SelectItem value="D2C">D2C (Direct to Consumer)</SelectItem>
                            <SelectItem value="SaaS">SaaS (Software as a Service)</SelectItem>
                            <SelectItem value="Marketplace">Marketplace</SelectItem>
                            <SelectItem value="Subscription">Subscription</SelectItem>
                            <SelectItem value="Freemium">Freemium</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.businessModel && <p className="text-xs text-destructive">{errors.businessModel}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Client'}
                </Button>
            </div>
        </form>
    );
}
