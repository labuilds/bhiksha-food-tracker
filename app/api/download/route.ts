import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export async function GET() {
    try {
        const { data: meals, error } = await supabase
            .from('meal_entries')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;

        const worksheetData = meals.map((meal: any) => ({
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

        return new NextResponse(buffer, {
            headers: {
                'Content-Disposition': 'attachment; filename="bhiksha_data.xlsx"',
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });
    } catch (error) {
        console.error("Supabase GET Download Error:", error);
        return NextResponse.json({ error: 'Failed to generate Excel file' }, { status: 500 });
    }
}
