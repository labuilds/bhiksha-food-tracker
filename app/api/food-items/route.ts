import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const items = await prisma.mealEntry.findMany({
            select: { foodItem: true },
            distinct: ['foodItem'],
            orderBy: { foodItem: 'asc' }
        });

        return NextResponse.json(items.map(i => i.foodItem));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch food items' }, { status: 500 });
    }
}
