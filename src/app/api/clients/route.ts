import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming prisma instance is exported from here

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query');

        const where = query
            ? {
                OR: [
                    { name: { contains: query } },
                    { email: { contains: query } },
                    { contactPerson: { contains: query } },
                ],
            }
            : {};

        const clients = await (prisma as any).client.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        return NextResponse.json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            name,
            industry,
            website,
            address,
            contactPerson,
            email,
            phone,
            companyInfo,
            domainOrIndustry,
            niche,
            businessModel
        } = body;

        // Validate all required fields
        const requiredFields = [
            { field: 'name', value: name, label: 'Client name' },
            { field: 'industry', value: industry, label: 'Industry' },
            { field: 'website', value: website, label: 'Website' },
            { field: 'address', value: address, label: 'Address' },
            { field: 'contactPerson', value: contactPerson, label: 'Contact person' },
            { field: 'email', value: email, label: 'Email' },
            { field: 'phone', value: phone, label: 'Phone' },
            { field: 'companyInfo', value: companyInfo, label: 'Company info' },
            { field: 'domainOrIndustry', value: domainOrIndustry, label: 'Domain/Industry' },
            { field: 'niche', value: niche, label: 'Niche' },
            { field: 'businessModel', value: businessModel, label: 'Business model' },
        ];

        const missingFields = requiredFields
            .filter(f => !f.value || (typeof f.value === 'string' && !f.value.trim()))
            .map(f => f.label);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        const client = await (prisma as any).client.create({
            data: {
                name,
                industry,
                website,
                address,
                contactPerson,
                email,
                phone,
                companyInfo,
                domainOrIndustry,
                niche,
                businessModel,
            },
        });

        return NextResponse.json(client, { status: 201 });
    } catch (error) {
        console.error('Error creating client:', error);
        return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
    }
}
