"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import DeleteConfirm from "./DeleteConfirm";
import { offlineFetch } from "@/lib/api";
import { updateSpecificMetric } from "@/app/actions/meals";
import { formatDateDDMMYYYY } from "@/lib/utils/format";

export default function SheetView() {
    const [meals, setMeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [filterDate, setFilterDate] = useState("");
    const [filterMealType, setFilterMealType] = useState("");

    const [editingCell, setEditingCell] = useState<{ id: string, field: 'cookedQty' | 'returnedQty' | 'foodItem' } | null>(null);
    const [editValue, setEditValue] = useState<string>("");
    const [successFlash, setSuccessFlash] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Initialize from localStorage
    useEffect(() => {
        const lastDate = localStorage.getItem('last_used_date');
        const lastMeal = localStorage.getItem('last_used_meal');

        if (lastDate) {
            setFilterDate(lastDate);
        } else {
            setFilterDate(new Date().toISOString().split('T')[0]);
        }

        if (lastMeal) {
            setFilterMealType(lastMeal);
        } else {
            setFilterMealType("Brunch");
        }
    }, []);

    const fetchMeals = async (silent = false) => {
        if (!filterDate || !filterMealType) return;

        if (!silent) setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterDate) params.append("date", filterDate);
            if (filterMealType) params.append("mealType", filterMealType);

            const res = await fetch(`/api/meals?${params.toString()}`);
            const data = await res.json();
            setMeals(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        }
        if (!silent) setLoading(false);
    };

    useEffect(() => {
        fetchMeals(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterDate, filterMealType]);

    // Focus input when editing starts
    useEffect(() => {
        if (editingCell && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingCell]);

    const startEditing = (meal: any, field: 'cookedQty' | 'returnedQty' | 'foodItem') => {
        setEditingCell({ id: meal.id, field });
        setEditValue(meal[field]?.toString() || (field === 'foodItem' ? "" : "0"));
    };

    const handleInlineSave = async () => {
        if (!editingCell) return;
        const { id, field } = editingCell;

        const isNumericField = field === 'cookedQty' || field === 'returnedQty';
        const numValue = parseFloat(editValue) || 0;
        const finalValue = isNumericField ? numValue : editValue;

        // Clear editing state
        setEditingCell(null);

        const originalMeals = [...meals];
        let originalMeal: any = null;

        // Optimistic UI Update
        setMeals(current => current.map(m => {
            if (m.id === id) {
                originalMeal = { ...m };
                const updated = { ...m, [field]: finalValue };
                // Recalculate directly
                updated.consumedQty = Math.max(0, (parseFloat(updated.cookedQty) || 0) - (parseFloat(updated.returnedQty) || 0));
                const totalPeople = (parseInt(updated.staffCount) || 0) + (parseInt(updated.volunteersCount) || 0);
                updated.perPersonQty = totalPeople > 0 ? (updated.consumedQty / totalPeople) : 0;
                return updated;
            }
            return m;
        }));

        setSuccessFlash(`${id}-${field}`);
        setTimeout(() => setSuccessFlash(null), 1000);

        try {
            let payload: any = {};
            if (field === 'cookedQty') payload.cooked_qty = numValue;
            if (field === 'returnedQty') payload.returned_qty = numValue;
            if (field === 'foodItem') payload.food_item = editValue;

            const updatedRow = await updateSpecificMetric(id, payload);

            // Sync with DB guaranteed values
            setMeals(current => current.map(m => m.id === id ? updatedRow : m));
        } catch (error) {
            console.error("Save failed, reverting:", error);
            setMeals(originalMeals); // Revert on error
            alert("Failed to save value. Reverting.");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleInlineSave();
        } else if (e.key === 'Escape') {
            setEditingCell(null);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await offlineFetch(`/api/meals/${deletingId}`, { method: "DELETE" });
            setDeletingId(null);
            fetchMeals(true);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="glass-panel p-4 md:p-6 mt-4 md:mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold tracking-tight text-stone-800">Meal Sheet</h2>
                <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-stone-500 hidden sm:block">Date:</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}
                            className="w-full md:w-auto"
                            suppressHydrationWarning
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-stone-500 hidden sm:block">Meal:</label>
                        <select
                            value={filterMealType}
                            onChange={e => setFilterMealType(e.target.value)}
                            className="w-full md:w-auto"
                            suppressHydrationWarning
                        >
                            <option value="">All Meals</option>
                            <option value="Brunch">Brunch</option>
                            <option value="Dinner">Dinner</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="mb-4 text-sm font-medium text-stone-600">
                Viewing entries for: <span className="text-stone-900 border-b border-orange-300 pb-0.5">{formatDateDDMMYYYY(filterDate)}</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="bg-stone-50">
                            <th className="p-3 whitespace-nowrap text-stone-500 font-semibold text-sm">Food Item</th>
                            <th className="p-3 whitespace-nowrap text-stone-500 font-semibold text-sm">Cooked</th>
                            <th className="p-3 whitespace-nowrap text-stone-500 font-semibold text-sm">Returned</th>
                            <th className="p-3 whitespace-nowrap text-stone-500 font-semibold text-sm">Consumed</th>
                            <th className="p-3 whitespace-nowrap text-stone-500 font-semibold text-sm">Per Person</th>
                            <th className="p-3 whitespace-nowrap text-stone-500 font-semibold text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="p-6 text-center text-stone-500">Loading meals...</td></tr>
                        ) : meals.length === 0 ? (
                            <tr><td colSpan={6} className="p-6 text-center text-stone-500">No entries found for this selection</td></tr>
                        ) : (
                            meals.map(meal => (
                                <tr key={meal.id} className="border-t border-stone-100 hover:bg-stone-50 transition-colors">
                                    {/* Excel Editable Food Item */}
                                    <td
                                        className={`p-0 whitespace-nowrap transition-colors duration-500 border-x border-transparent hover:border-stone-200 cursor-cell
                                            ${successFlash === `${meal.id}-foodItem` ? 'bg-emerald-100' : ''}`}
                                        onClick={() => editingCell?.id !== meal.id && startEditing(meal, 'foodItem')}
                                    >
                                        {editingCell?.id === meal.id && editingCell?.field === 'foodItem' ? (
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                className="w-full h-full p-3 font-medium text-sm border-2 border-orange-500 outline-none m-0 bg-white"
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                                onBlur={handleInlineSave}
                                                onKeyDown={handleKeyDown}
                                            />
                                        ) : (
                                            <div className="p-3 text-sm font-medium text-stone-800">{meal.foodItem}</div>
                                        )}
                                    </td>

                                    {/* Excel Editable Cooked Qty */}
                                    <td
                                        className={`p-0 whitespace-nowrap transition-colors duration-500 border-x border-transparent hover:border-stone-200 cursor-cell
                                            ${successFlash === `${meal.id}-cookedQty` ? 'bg-emerald-100' : ''}`}
                                        onClick={() => editingCell?.id !== meal.id && startEditing(meal, 'cookedQty')}
                                    >
                                        {editingCell?.id === meal.id && editingCell?.field === 'cookedQty' ? (
                                            <input
                                                ref={inputRef}
                                                type="number"
                                                step="0.01"
                                                className="w-full h-full p-3 text-sm border-2 border-orange-500 outline-none m-0 bg-white"
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                                onBlur={handleInlineSave}
                                                onKeyDown={handleKeyDown}
                                            />
                                        ) : (
                                            <div className="p-3 text-sm text-stone-600">{meal.cookedQty}</div>
                                        )}
                                    </td>

                                    {/* Excel Editable Returned Qty */}
                                    <td
                                        className={`p-0 whitespace-nowrap transition-colors duration-500 border-x border-transparent hover:border-stone-200 cursor-cell
                                            ${successFlash === `${meal.id}-returnedQty` ? 'bg-emerald-100' : ''}`}
                                        onClick={() => editingCell?.id !== meal.id && startEditing(meal, 'returnedQty')}
                                    >
                                        {editingCell?.id === meal.id && editingCell?.field === 'returnedQty' ? (
                                            <input
                                                ref={inputRef}
                                                type="number"
                                                step="0.01"
                                                className="w-full h-full p-3 text-sm border-2 border-orange-500 outline-none m-0 bg-white"
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                                onBlur={handleInlineSave}
                                                onKeyDown={handleKeyDown}
                                            />
                                        ) : (
                                            <div className="p-3 text-sm text-stone-600">{meal.returnedQty}</div>
                                        )}
                                    </td>

                                    <td className="p-3 text-sm text-emerald-600 font-bold whitespace-nowrap">{meal.consumedQty}</td>
                                    <td className="p-3 text-sm text-blue-600 font-medium whitespace-nowrap">{Number(meal.perPersonQty || 0).toFixed(3)}</td>
                                    <td className="p-3 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => setDeletingId(meal.id)} className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {deletingId && (
                <DeleteConfirm
                    onConfirm={handleDelete}
                    onCancel={() => setDeletingId(null)}
                />
            )}
        </div>
    );
}
