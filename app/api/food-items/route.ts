import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: items, error } = await supabase
            .from('meal_entries')
            .select('food_item')
            .order('food_item', { ascending: true });

        if (error) throw error;

        // Extract unique items
        const uniqueItems = Array.from(new Set(items.map((i: any) => i.food_item)));

        return NextResponse.json(uniqueItems);
    } catch (error) {
        console.error("Supabase GET Food Items Error:", error);
        return NextResponse.json({ error: 'Failed to fetch food items' }, { status: 500 });
    }
}
