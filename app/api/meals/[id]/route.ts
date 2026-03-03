import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const body = await request.json();
        const {
            date,
            mealType,
            volunteersCount,
            staffCount,
            foodItem,
            cookedQty,
            returnedQty,
            remarks,
        } = body;

        const consumedQty = Math.max(0, cookedQty - returnedQty);
        const totalPeople = volunteersCount + staffCount;
        const perPersonQty = totalPeople > 0 ? (consumedQty / totalPeople) : 0;

        const meal = await prisma.mealEntry.update({
            where: { id },
            data: {
                ...(date && { date: new Date(date) }),
                ...(mealType && { mealType }),
                ...(volunteersCount !== undefined && { volunteersCount }),
                ...(staffCount !== undefined && { staffCount }),
                ...(foodItem && { foodItem }),
                ...(cookedQty !== undefined && { cookedQty }),
                ...(returnedQty !== undefined && { returnedQty }),
                consumedQty,
                perPersonQty,
                ...(remarks !== undefined && { remarks }),
                syncStatus: false,
            },
        });

        return NextResponse.json(meal);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update meal entry' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        await prisma.mealEntry.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete meal entry' }, { status: 500 });
    }
}
