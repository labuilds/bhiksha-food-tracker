import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function POST() {
    try {
        // Find unsynced records
        const unsyncedMeals = await prisma.mealEntry.findMany({
            where: { syncStatus: false },
            select: { id: true }
        });

        if (unsyncedMeals.length === 0) {
            return NextResponse.json({ message: 'Already synced', count: 0 });
        }

        // Query all records for complete Excel file
        const allMeals = await prisma.mealEntry.findMany({
            orderBy: { date: 'desc' },
        });

        const worksheetData = allMeals.map((meal: any) => ({
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

        // TODO: Upload `buffer` to Cloud Storage (e.g. AWS S3, Google Cloud Storage, etc.)
        // For now, this is a placeholder representing a successful upload.
        console.log(`Mock upload of ${buffer.length} bytes to Cloud Storage completed.`);

        // Mark as synced
        const unsyncedIds = unsyncedMeals.map((m: any) => m.id);
        await prisma.mealEntry.updateMany({
            where: { id: { in: unsyncedIds } },
            data: { syncStatus: true }
        });

        return NextResponse.json({ success: true, count: unsyncedIds.length });
    } catch (error) {
        console.error('Sync failed:', error);
        return NextResponse.json({ error: 'Failed to sync data' }, { status: 500 });
    }
}
