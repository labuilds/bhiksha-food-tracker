import { createClient } from "@/utils/supabase/server";
import HomeClient from "@/components/HomeClient";

export const dynamic = 'force-dynamic';

export default async function Home() {
    const supabase = await createClient();

    const { data: meals, error } = await supabase
        .from('meal_entries')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(20);

    if (error) {
        console.error("Error fetching initial meals:", error);
    }

    const initialMeals = meals?.map((meal: any) => ({
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
    })) || [];

    return (
        <HomeClient initialMeals={initialMeals} />
    );
}
