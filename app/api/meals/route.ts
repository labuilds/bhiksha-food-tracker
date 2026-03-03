import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const mealType = searchParams.get('mealType');
    const foodItem = searchParams.get('foodItem');

    const where: any = {};

    if (dateStr) {
        const date = new Date(dateStr);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        where.date = {
            gte: date,
            lt: nextDay,
        };
    }

    if (mealType) {
        where.mealType = mealType;
    }

    if (foodItem) {
        where.foodItem = {
            contains: foodItem,
        };
    }

    try {
        const meals = await prisma.mealEntry.findMany({
            where,
            orderBy: { date: 'desc' },
        });
        return NextResponse.json(meals);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch meals' }, { status: 500 });
    }
}

export async function POST(request: Request) {
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

        const meal = await prisma.mealEntry.create({
            data: {
                date: date ? new Date(date) : undefined,
                mealType,
                volunteersCount,
                staffCount,
                foodItem,
                cookedQty,
                returnedQty,
                consumedQty,
                perPersonQty,
                remarks,
                syncStatus: false,
            },
        });

        return NextResponse.json(meal, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create meal entry' }, { status: 500 });
    }
}
