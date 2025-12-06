export type Client = {
    id: string;
    name: string;
    industry?: string;
    website?: string;
    createdAt: string;
};

export type ResearchDoc = {
    id: string;
    clientId: string;
    title: string;
    url?: string;
    summary?: string;
    createdAt: string;
};

export type Service = {
    id: string;
    name: string;
    description?: string;
    basePrice: number;
    category?: string;
    active: boolean;
};

export type Package = {
    id: string;
    clientId: string;
    researchDocId?: string;
    totalValue: number;
    currency: string;
    termMonths: number;
    lineItems: Array<{ serviceId: string; qty: number; price: number }>;
    proposalDocUrl?: string;
    createdAt: string;
};

export type Agreement = {
    id: string;
    clientId: string;
    packageId: string;
    status: 'draft' | 'sent' | 'signed';
    agreementDocUrl?: string;
    signedAt?: string;
    createdAt: string;
};

export type Invoice = {
    id: string;
    clientId: string;
    agreementId: string;
    amount: number;
    currency: string;
    dueDate: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    invoiceNumber: string;
    invoiceDocUrl?: string;
    createdAt: string;
};

export type Activity = {
    id: string;
    clientId: string;
    userId: string;
    type: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
};

export const MOCK_CLIENTS: Client[] = [
    { id: '1', name: 'Acme Corp', industry: 'Technology', website: 'acme.com', createdAt: '2023-01-15' },
    { id: '2', name: 'Globex Inc', industry: 'Manufacturing', website: 'globex.com', createdAt: '2023-02-20' },
    { id: '3', name: 'Soylent Corp', industry: 'Food', website: 'soylent.com', createdAt: '2023-03-10' },
];

export const MOCK_RESEARCH_DOCS: ResearchDoc[] = [
    { id: '1', clientId: '1', title: 'Market Analysis 2023', url: '#', summary: 'Deep dive into tech trends.', createdAt: '2023-01-20' },
];

export const MOCK_SERVICES: Service[] = [
    { id: '1', name: 'SEO Audit', basePrice: 1500, category: 'Marketing', active: true },
    { id: '2', name: 'Content Strategy', basePrice: 2000, category: 'Marketing', active: true },
    { id: '3', name: 'Web Development', basePrice: 5000, category: 'Development', active: true },
];

export const MOCK_AGREEMENTS: Agreement[] = [
    { id: '1', clientId: '1', packageId: '1', status: 'signed', signedAt: '2023-02-01', createdAt: '2023-01-25' },
    { id: '2', clientId: '2', packageId: '2', status: 'sent', createdAt: '2023-02-25' },
];

export const MOCK_INVOICES: Invoice[] = [
    { id: '1', clientId: '1', agreementId: '1', amount: 5000, currency: 'USD', dueDate: '2023-03-01', status: 'paid', invoiceNumber: 'INV-001', createdAt: '2023-02-01' },
    { id: '2', clientId: '2', agreementId: '2', amount: 3000, currency: 'USD', dueDate: '2023-04-01', status: 'sent', invoiceNumber: 'INV-002', createdAt: '2023-03-01' },
];

export const MOCK_ACTIVITY: Activity[] = [
    { id: '1', clientId: '1', userId: 'admin', type: 'login', createdAt: '2023-01-15T10:00:00Z' },
    { id: '2', clientId: '1', userId: 'admin', type: 'view_doc', createdAt: '2023-01-20T14:00:00Z' },
];
