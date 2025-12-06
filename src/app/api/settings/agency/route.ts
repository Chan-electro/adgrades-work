import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Get the first agency record or create a default one
        let agency = await prisma.agency.findFirst();

        if (!agency) {
            agency = await prisma.agency.create({
                data: {
                    name: "AdGrades Agency",
                    address: "123 Creative Blvd, Design City",
                    website: "https://adgrades.work",
                },
            });
        }

        return NextResponse.json(agency);
    } catch (error) {
        console.error("Error fetching agency settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { name, address, website, taxId } = body;

        // Determine if we are updating an existing record or creating a new one
        // In a single-tenant app context, we usually just have one Agency row.
        const existing = await prisma.agency.findFirst();

        let agency;
        if (existing) {
            agency = await prisma.agency.update({
                where: { id: existing.id },
                data: { name, address, website, taxId },
            });
        } else {
            agency = await prisma.agency.create({
                data: { name, address, website, taxId },
            });
        }

        return NextResponse.json(agency);
    } catch (error) {
        console.error("Error updating agency settings:", error);
        return NextResponse.json(
            { error: "Failed to update settings" },
            { status: 500 }
        );
    }
}
