import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import * as XLSX from 'xlsx';
import { formatDateDDMMYYYY } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const startDate = request.nextUrl.searchParams.get('startDate');
        const endDate = request.nextUrl.searchParams.get('endDate');

        const supabase = await createClient();
        const PAGE_SIZE = 1000;
        let allData: any[] = [];
        let hasMore = true;
        let page = 0;

        while (hasMore) {
            let query = supabase
                .from('meal_entries')
                .select('*')
                .order('date', { ascending: false })
                .order('created_at', { ascending: true });

            if (startDate && endDate) {
                query = query.gte('date', startDate).lte('date', endDate);
            }

            const { data, error } = await query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

            if (error) throw error;

            if (data && data.length > 0) {
                allData = allData.concat(data);
                if (data.length < PAGE_SIZE) {
                    hasMore = false;
                } else {
                    page++;
                }
            } else {
                hasMore = false;
            }
        }

        if (allData.length === 0) {
            return NextResponse.json({ error: 'No data', empty: true }, { status: 404 });
        }

        const liveData = allData;

        const worksheetData: any[] = [];
        let previousDate: string | null = null;
        let previousMealType: string | null = null;

        liveData.forEach((meal: any) => {
            if (previousDate && (previousDate !== meal.date || previousMealType !== meal.meal_type)) {
                worksheetData.push({}); // Empty row separator
            }

            const formattedDate = formatDateDDMMYYYY(meal.date);

            worksheetData.push({
                'Date': formattedDate,
                'Meal Type': meal.meal_type,
                'Food Item': meal.food_item,
                'Volunteers Count': meal.volunteers_count,
                'Staff Count': meal.staff_count,
                'Cooked Qty': meal.cooked_qty,
                'Returned Qty': meal.returned_qty,
                'Consumed Qty': meal.consumed_qty,
                'Per Person Qty': Number(meal.per_person_qty).toFixed(2),
                'Remarks': meal.remarks || '',
            });

            previousDate = meal.date;
            previousMealType = meal.meal_type;
        });

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);

        // Define column formatting
        worksheet['!cols'] = [
            { wch: 12 }, // Date
            { wch: 12 }, // Meal Type
            { wch: 35 }, // Food Item
            { wch: 16 }, // Volunteers
            { wch: 12 }, // Staff
            { wch: 12 }, // Cooked
            { wch: 12 }, // Returned
            { wch: 14 }, // Consumed
            { wch: 16 }, // Per Person
            { wch: 50 }, // Remarks
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Meals');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buffer, {
            headers: {
                'Content-Disposition': 'attachment; filename="bhiksha_data.xlsx"',
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            },
        });
    } catch (error: any) {
        console.error("Supabase GET Download Error:", error);
        return NextResponse.json({ error: 'Failed to generate Excel file', details: error?.message || String(error) }, { status: 500 });
    }
}
