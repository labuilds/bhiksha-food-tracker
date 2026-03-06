"use client";

import { useState, useEffect, useRef } from "react";
import { CopyPlus, Send, Loader2, CheckCircle2 } from "lucide-react";

type MealType = "Brunch" | "Dinner";

interface DataEntryFormProps {
    initialData?: any;
    action?: (formData: FormData) => Promise<void>;
    isEditing?: boolean;
}

export default function DataEntryForm({ initialData, action, isEditing = false }: DataEntryFormProps) {
    const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : "");
    const [mealType, setMealType] = useState<MealType>(initialData?.mealType || "Brunch");

    const [volunteersCount, setVolunteersCount] = useState(initialData?.volunteersCount?.toString() || "");
    const [staffCount, setStaffCount] = useState(initialData?.staffCount?.toString() || "");

    useEffect(() => {
        if (!initialData?.date && !date) {
            const lastDate = localStorage.getItem('last_used_date');
            if (lastDate) {
                setDate(lastDate);
            } else {
                setDate(new Date().toISOString().split('T')[0]);
            }
        }
        if (!initialData?.mealType) {
            const lastMeal = localStorage.getItem('last_used_meal');
            if (lastMeal === 'Brunch' || lastMeal === 'Dinner') {
                setMealType(lastMeal as MealType);
            }
        }
        if (!initialData?.volunteersCount) {
            const lastVolunteers = localStorage.getItem('last_used_volunteers');
            if (lastVolunteers) setVolunteersCount(lastVolunteers);
        }
        if (!initialData?.staffCount) {
            const lastStaff = localStorage.getItem('last_used_staff');
            if (lastStaff) setStaffCount(lastStaff);
        }
    }, [initialData, date]);
    const [foodItem, setFoodItem] = useState(initialData?.foodItem || "");
    const [cookedQty, setCookedQty] = useState(initialData?.cookedQty?.toString() || "");
    const [returnedQty, setReturnedQty] = useState(initialData?.returnedQty?.toString() || "");
    const [remarks, setRemarks] = useState(initialData?.remarks || "");

    const [foodItemsList, setFoodItemsList] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        fetch("/api/food-items")
            .then(res => res.json())
            .then(data => setFoodItemsList(Array.isArray(data) ? data : []))
            .catch(console.error);
    }, []);

    const consumedQty = Math.max(0, (parseFloat(cookedQty) || 0) - (parseFloat(returnedQty) || 0));
    const totalPeople = (parseInt(volunteersCount) || 0) + (parseInt(staffCount) || 0);
    const perPersonQty = totalPeople > 0 ? (consumedQty / totalPeople) : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("date", date);
            formData.append("meal_type", mealType);
            formData.append("volunteers_count", volunteersCount);
            formData.append("staff_count", staffCount);
            formData.append("food_item", foodItem);
            formData.append("cooked_qty", cookedQty);
            formData.append("returned_qty", returnedQty);
            formData.append("remarks", remarks);

            if (action) {
                await action(formData);
            }

            if (!isEditing) {
                setFoodItem("");
                setCookedQty("");
                setReturnedQty("");
                setRemarks("");

                // Track persisting fields across tab switches
                localStorage.setItem('last_used_date', date);
                localStorage.setItem('last_used_meal', mealType);
                localStorage.setItem('last_used_volunteers', volunteersCount);
                localStorage.setItem('last_used_staff', staffCount);

                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                }, 3000);
            }
        } catch (error) {
            console.error("Error saving entry:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full relative">
            <div className="bg-white border text-stone-800 border-stone-200 shadow-sm rounded-2xl flex-1 overflow-y-auto px-4 pt-4 pb-20 flex flex-col gap-6 mb-[100px]">
                <h2 className="text-2xl font-bold tracking-tight text-stone-800 mb-2">{isEditing ? "Edit Meal Entry" : "New Meal Entry"}</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label>Date</label>
                        <input type="date" name="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full" suppressHydrationWarning />
                    </div>
                    <div>
                        <label>Meal Type</label>
                        <select name="meal_type" value={mealType} onChange={e => setMealType(e.target.value as MealType)} className="w-full" suppressHydrationWarning>
                            <option value="Brunch">Brunch</option>
                            <option value="Dinner">Dinner</option>
                        </select>
                    </div>
                    <div>
                        <label>Volunteers</label>
                        <input type="number" name="volunteers_count" required min="0" value={volunteersCount} onChange={e => setVolunteersCount(e.target.value)} className="w-full" suppressHydrationWarning />
                    </div>
                    <div>
                        <label>Staff</label>
                        <input type="number" name="staff_count" required min="0" value={staffCount} onChange={e => setStaffCount(e.target.value)} className="w-full" suppressHydrationWarning />
                    </div>
                </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1" ref={dropdownRef}>
                    <label>Food Item</label>
                    <div className="relative">
                        <input
                            type="text"
                            name="food_item"
                            required
                            value={foodItem}
                            onChange={e => {
                                setFoodItem(e.target.value);
                                setIsDropdownOpen(true);
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                            className="w-full"
                            placeholder="e.g. Rice, Dal"
                            autoComplete="off"
                            suppressHydrationWarning
                        />
                        {isDropdownOpen && (
                            <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border border-stone-200 rounded-lg shadow-lg">
                                {foodItemsList.filter(item => item.toLowerCase().includes(foodItem.toLowerCase())).length === 0 ? (
                                    <li className="p-3 text-sm text-stone-500">No items found</li>
                                ) : (
                                    foodItemsList
                                        .filter(item => item.toLowerCase().includes(foodItem.toLowerCase()))
                                        .map(item => (
                                            <li
                                                key={item}
                                                className="p-3 text-sm hover:bg-stone-50 cursor-pointer"
                                                onClick={() => {
                                                    setFoodItem(item);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                {item}
                                            </li>
                                        ))
                                )}
                            </ul>
                        )}
                    </div>
                </div>
                <div>
                    <label>Cooked Qty (kg/L)</label>
                    <input type="number" name="cooked_qty" step="0.01" required min="0" value={cookedQty} onChange={e => setCookedQty(e.target.value)} className="w-full" suppressHydrationWarning />
                </div>
                <div>
                    <label>Returned Qty (kg/L)</label>
                    <input type="number" name="returned_qty" step="0.01" min="0" value={returnedQty} onChange={e => setReturnedQty(e.target.value)} className="w-full" suppressHydrationWarning />
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
                    <input type="text" name="remarks" value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full" placeholder="Add any notes..." suppressHydrationWarning />
                </div>
            </div>

            <div className="absolute bottom-4 left-0 right-0 z-20 px-2 flex justify-center">
                <button type="submit" disabled={loading} className="primary-btn flex items-center justify-center gap-2 w-full md:w-auto mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-xl transition-all">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : isEditing ? <Send size={18} /> : <CopyPlus size={18} />}
                    {loading ? "Saving..." : isEditing ? "Save Changes" : "Save Entry"}
                </button>
            </div>

            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-50 border border-green-200 text-green-800 shadow-sm rounded-md px-4 py-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
                    <CheckCircle2 size={18} className="text-green-600" />
                    <span className="text-sm font-medium">Food Item Saved Successfully</span>
                </div>
            )}
        </form>
    );
}
