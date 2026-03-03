"use client";

import { useState, useEffect } from "react";
import { CopyPlus, Send } from "lucide-react";

type MealType = "Brunch" | "Dinner";

interface DataEntryFormProps {
    initialData?: any;
    action?: (formData: FormData) => Promise<void>;
    isEditing?: boolean;
}

export default function DataEntryForm({ initialData, action, isEditing = false }: DataEntryFormProps) {
    const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [mealType, setMealType] = useState<MealType>(initialData?.mealType || "Brunch");
    const [volunteersCount, setVolunteersCount] = useState(initialData?.volunteersCount?.toString() || "");
    const [staffCount, setStaffCount] = useState(initialData?.staffCount?.toString() || "");
    const [foodItem, setFoodItem] = useState(initialData?.foodItem || "");
    const [cookedQty, setCookedQty] = useState(initialData?.cookedQty?.toString() || "");
    const [returnedQty, setReturnedQty] = useState(initialData?.returnedQty?.toString() || "");
    const [remarks, setRemarks] = useState(initialData?.remarks || "");

    const [foodItemsList, setFoodItemsList] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch("/api/food-items")
            .then(res => res.json())
            .then(data => setFoodItemsList(Array.isArray(data) ? data : []))
            .catch(console.error);
    }, []);

    const consumedQty = Math.max(0, (parseFloat(cookedQty) || 0) - (parseFloat(returnedQty) || 0));
    const totalPeople = (parseInt(volunteersCount) || 0) + (parseInt(staffCount) || 0);
    const perPersonQty = totalPeople > 0 ? (consumedQty / totalPeople) : 0;

    const handleAction = async (formData: FormData) => {
        setLoading(true);
        if (action) {
            await action(formData);
        }

        if (!isEditing) {
            setFoodItem("");
            setCookedQty("");
            setReturnedQty("");
            setRemarks("");
            // Keep date, mealType, counts same for faster multi-item entry
        }
        setLoading(false);
    };

    return (
        <form action={handleAction} className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-stone-800 mb-2">{isEditing ? "Edit Meal Entry" : "New Meal Entry"}</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <label>Date</label>
                    <input type="date" name="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full" />
                </div>
                <div>
                    <label>Meal Type</label>
                    <select name="meal_type" value={mealType} onChange={e => setMealType(e.target.value as MealType)} className="w-full">
                        <option value="Brunch">Brunch</option>
                        <option value="Dinner">Dinner</option>
                    </select>
                </div>
                <div>
                    <label>Volunteers</label>
                    <input type="number" name="volunteers_count" required min="0" value={volunteersCount} onChange={e => setVolunteersCount(e.target.value)} className="w-full" />
                </div>
                <div>
                    <label>Staff</label>
                    <input type="number" name="staff_count" required min="0" value={staffCount} onChange={e => setStaffCount(e.target.value)} className="w-full" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                    <label>Food Item</label>
                    <input
                        type="text"
                        name="food_item"
                        required
                        list="food-items-list"
                        value={foodItem}
                        onChange={e => setFoodItem(e.target.value)}
                        className="w-full"
                        placeholder="e.g. Rice, Dal"
                    />
                    <datalist id="food-items-list">
                        {foodItemsList.map(item => <option key={item} value={item} />)}
                    </datalist>
                </div>
                <div>
                    <label>Cooked Qty (kg/L)</label>
                    <input type="number" name="cooked_qty" step="0.01" required min="0" value={cookedQty} onChange={e => setCookedQty(e.target.value)} className="w-full" />
                </div>
                <div>
                    <label>Returned Qty (kg/L)</label>
                    <input type="number" name="returned_qty" step="0.01" required min="0" value={returnedQty} onChange={e => setReturnedQty(e.target.value)} className="w-full" />
                </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 p-5 rounded-xl flex flex-wrap gap-8 items-center">
                <div>
                    <span className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Consumed Qty</span>
                    <span className="text-3xl font-bold text-emerald-600">{consumedQty.toFixed(2)}</span>
                </div>
                <div className="h-10 w-px bg-stone-200 hidden sm:block"></div>
                <div>
                    <span className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Per Person</span>
                    <span className="text-3xl font-bold text-blue-600">{perPersonQty.toFixed(3)}</span>
                </div>
            </div>

            <div>
                <label>Remarks (Optional)</label>
                <input type="text" name="remarks" value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full" placeholder="Add any notes..." />
            </div>

            <button type="submit" disabled={loading} className="primary-btn mt-4 flex items-center justify-center gap-2 w-full md:w-auto self-start">
                {isEditing ? <Send size={18} /> : <CopyPlus size={18} />}
                {loading ? "Saving..." : isEditing ? "Save Changes" : "Save Entry"}
            </button>
        </form>
    );
}
