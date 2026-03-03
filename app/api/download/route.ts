import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET() {
    try {
        const meals = await prisma.mealEntry.findMany({
            orderBy: { date: 'desc' },
        });

        const worksheetData = meals.map((meal) => ({
            Date: meal.date.toISOString().split('T')[0],
            'Meal Type': meal.mealType,
            'Food Item': meal.foodItem,
            'Volunteers Count': meal.volunteersCount,
            'Staff Count': meal.staffCount,
            'Cooked Qty': meal.cookedQty,
            'Returned Qty': meal.returnedQty,
            'Consumed Qty': meal.consumedQty,
            'Per Person Qty': meal.perPersonQty.toFixed(2),
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
        return NextResponse.json({ error: 'Failed to generate Excel file' }, { status: 500 });
    }
}
