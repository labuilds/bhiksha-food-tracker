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
