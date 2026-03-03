import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

        const updateData: any = {};
        if (date) updateData.date = new Date(date).toISOString().split('T')[0];
        if (mealType) updateData.meal_type = mealType;
        if (volunteersCount !== undefined) updateData.volunteers_count = volunteersCount;
        if (staffCount !== undefined) updateData.staff_count = staffCount;
        if (foodItem) updateData.food_item = foodItem;
        if (cookedQty !== undefined) updateData.cooked_qty = cookedQty;
        if (returnedQty !== undefined) updateData.returned_qty = returnedQty;
        updateData.consumed_qty = consumedQty;
        updateData.per_person_qty = perPersonQty;
        if (remarks !== undefined) updateData.remarks = remarks;
        updateData.sync_status = false;

        const { data: meal, error } = await supabase
            .from('meal_entries')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(meal);
    } catch (error) {
        console.error("Supabase PUT Error:", error);
        return NextResponse.json({ error: 'Failed to update meal entry' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const { error } = await supabase
            .from('meal_entries')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Supabase DELETE Error:", error);
        return NextResponse.json({ error: 'Failed to delete meal entry' }, { status: 500 });
    }
}
