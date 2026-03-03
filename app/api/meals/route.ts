import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const mealType = searchParams.get('mealType');
    const foodItem = searchParams.get('foodItem');

    let query = supabase.from('meal_entries').select('*').order('date', { ascending: false });

    if (dateStr) {
        // Match exact date using postgres date format YYYY-MM-DD
        const searchDate = new Date(dateStr).toISOString().split('T')[0];
        query = query.eq('date', searchDate);
    }

    if (mealType) {
        query = query.eq('meal_type', mealType);
    }

    if (foodItem) {
        query = query.ilike('food_item', `%${foodItem}%`);
    }

    try {
        const { data: meals, error } = await query;
        if (error) throw error;

        // Map snake_case from DB to camelCase for frontend
        const mappedMeals = meals.map((meal: any) => ({
            id: meal.id,
            date: meal.date,
            mealType: meal.meal_type,
            volunteersCount: meal.volunteers_count,
            staffCount: meal.staff_count,
            foodItem: meal.food_item,
            cookedQty: meal.cooked_qty,
            returnedQty: meal.returned_qty,
            consumedQty: meal.consumed_qty,
            perPersonQty: meal.per_person_qty,
            remarks: meal.remarks,
            syncStatus: meal.sync_status
        }));

        return NextResponse.json(mappedMeals);
    } catch (error) {
        console.error("Supabase GET Error:", error);
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

        const dbDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        const { data: meal, error } = await supabase.from('meal_entries').insert([{
            date: dbDate,
            meal_type: mealType,
            volunteers_count: volunteersCount,
            staff_count: staffCount,
            food_item: foodItem,
            cooked_qty: cookedQty,
            returned_qty: returnedQty,
            consumed_qty: consumedQty,
            per_person_qty: perPersonQty,
            remarks: remarks,
            sync_status: false,
        }]).select().single();

        if (error) throw error;

        return NextResponse.json(meal, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create meal entry' }, { status: 500 });
    }
}
