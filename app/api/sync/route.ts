import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export async function POST() {
    try {
        // Find unsynced records
        const { data: unsyncedMeals, error: unsyncedError } = await supabase
            .from('meal_entries')
            .select('id')
            .eq('sync_status', false);

        if (unsyncedError) throw unsyncedError;

        if (!unsyncedMeals || unsyncedMeals.length === 0) {
            return NextResponse.json({ message: 'Already synced', count: 0 });
        }

        // Query all records for complete Excel file
        const { data: allMeals, error: allMealsError } = await supabase
            .from('meal_entries')
            .select('*')
            .order('date', { ascending: false });

        if (allMealsError) throw allMealsError;

        const worksheetData = allMeals.map((meal: any) => ({
            Date: meal.date,
            'Meal Type': meal.meal_type,
            'Food Item': meal.food_item,
            'Volunteers Count': meal.volunteers_count,
            'Staff Count': meal.staff_count,
            'Cooked Qty': meal.cooked_qty,
            'Returned Qty': meal.returned_qty,
            'Consumed Qty': meal.consumed_qty,
            'Per Person Qty': Number(meal.per_person_qty).toFixed(2),
            Remarks: meal.remarks || '',
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Meals');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // TODO: Upload `buffer` to Cloud Storage (e.g. AWS S3, Google Cloud Storage, etc.)
        // For now, this is a placeholder representing a successful upload.
        console.log(`Mock upload of ${buffer.length} bytes to Cloud Storage completed.`);

        // Mark as synced
        const unsyncedIds = unsyncedMeals.map((m: any) => m.id);
        const { error: updateError } = await supabase
            .from('meal_entries')
            .update({ sync_status: true })
            .in('id', unsyncedIds);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, count: unsyncedIds.length });
    } catch (error) {
        console.error('Sync failed:', error);
        return NextResponse.json({ error: 'Failed to sync data' }, { status: 500 });
    }
}
