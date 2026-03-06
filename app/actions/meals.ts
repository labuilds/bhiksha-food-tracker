"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveMealEntry(formData: FormData) {
    const supabase = await createClient();

    const date = formData.get("date") as string;
    const meal_type = formData.get("meal_type") as string;
    const food_item = formData.get("food_item") as string;
    const cooked_qty = parseFloat(formData.get("cooked_qty") as string) || 0;
    const returned_qty = parseFloat(formData.get("returned_qty") as string) || 0;
    const staff_count = parseInt(formData.get("staff_count") as string) || 0;
    const volunteers_count = parseInt(formData.get("volunteers_count") as string) || 0;
    const remarks = formData.get("remarks") as string;

    const consumed_qty = Math.max(0, cooked_qty - returned_qty);
    const total_people = staff_count + volunteers_count;
    const per_person_qty = total_people > 0 ? (consumed_qty / total_people) : 0;

    const dbDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    const { data, error } = await supabase.from('meal_entries').insert([{
        date: dbDate,
        meal_type,
        volunteers_count,
        staff_count,
        food_item,
        cooked_qty,
        returned_qty,
        consumed_qty,
        per_person_qty,
        remarks: remarks || "",
        sync_status: true,
    }]).select();

    if (error) {
        console.error("Supabase Action Error:", error);
        throw new Error("Failed to save meal entry");
    }

    revalidatePath('/');
}

export async function updateSpecificMetric(id: string, updates: { cooked_qty?: number; returned_qty?: number; food_item?: string }) {
    const supabase = await createClient();

    // 1. Fetch the existing record to get counts for recalculation
    const { data: existingData, error: fetchError } = await supabase
        .from('meal_entries')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError || !existingData) {
        console.error("Error fetching record for update:", fetchError);
        throw new Error("Record not found for update");
    }

    // 2. Prepare new values, falling back to existing data if no update provided
    const cooked_qty = updates.cooked_qty !== undefined ? updates.cooked_qty : existingData.cooked_qty;
    const returned_qty = updates.returned_qty !== undefined ? updates.returned_qty : existingData.returned_qty;
    const food_item = updates.food_item !== undefined ? updates.food_item : existingData.food_item;

    // 3. Recalculate metrics
    const consumed_qty = Math.max(0, cooked_qty - returned_qty);
    const total_people = existingData.staff_count + existingData.volunteers_count;
    const per_person_qty = total_people > 0 ? (consumed_qty / total_people) : 0;

    // 4. Update the record
    const { data: updatedData, error: updateError } = await supabase
        .from('meal_entries')
        .update({
            cooked_qty,
            returned_qty,
            consumed_qty,
            per_person_qty,
            food_item,
            // Keep sync status true as this is server side
        })
        .eq('id', id)
        .select()
        .single();

    if (updateError) {
        console.error("Error updating metric:", updateError);
        throw new Error("Failed to update metric");
    }

    revalidatePath('/sheet');

    // Return updated data mapped appropriately
    return {
        id: updatedData.id,
        date: updatedData.date,
        mealType: updatedData.meal_type,
        volunteersCount: updatedData.volunteers_count,
        staffCount: updatedData.staff_count,
        foodItem: updatedData.food_item,
        cookedQty: updatedData.cooked_qty,
        returnedQty: updatedData.returned_qty,
        consumedQty: updatedData.consumed_qty,
        perPersonQty: updatedData.per_person_qty,
        remarks: updatedData.remarks,
        syncStatus: updatedData.sync_status
    };
}
