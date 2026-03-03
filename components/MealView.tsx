"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2 } from "lucide-react";
import EditModal from "./EditModal";
import DeleteConfirm from "./DeleteConfirm";
import { offlineFetch } from "@/lib/api";

export default function MealView({ refreshTrigger }: { refreshTrigger: number }) {
    const [meals, setMeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [filterDate, setFilterDate] = useState("");
    const [filterMealType, setFilterMealType] = useState("");

    const [editingMeal, setEditingMeal] = useState<any | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchMeals = async () => {
        setLoading(true);
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
        setLoading(false);
    };

    useEffect(() => {
        fetchMeals();
    }, [filterDate, filterMealType, refreshTrigger]);

    const handleEditSave = async (data: any) => {
        if (!editingMeal) return;
        try {
            await offlineFetch(`/api/meals/${editingMeal.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            setEditingMeal(null);
            fetchMeals();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await offlineFetch(`/api/meals/${deletingId}`, { method: "DELETE" });
            setDeletingId(null);
            fetchMeals();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="glass-panel p-6 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold tracking-tight text-stone-800">Meal Entries Dashboard</h2>
                <div className="flex gap-4">
                    <input
                        type="date"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        className="w-auto"
                    />
                    <select
                        value={filterMealType}
                        onChange={e => setFilterMealType(e.target.value)}
                        className="w-auto"
                    >
                        <option value="">All Meals</option>
                        <option value="Brunch">Brunch</option>
                        <option value="Dinner">Dinner</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Meal</th>
                            <th>Food Item</th>
                            <th>Cooked</th>
                            <th>Returned</th>
                            <th>Consumed</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="p-4 text-center text-gray-500">Loading...</td></tr>
                        ) : meals.length === 0 ? (
                            <tr><td colSpan={7} className="p-4 text-center text-gray-500">No entries found</td></tr>
                        ) : (
                            meals.map(meal => (
                                <tr key={meal.id} className="border-b border-stone-200 hover:bg-stone-50 transition-colors flex-none">
                                    <td className="p-4 text-sm text-stone-600">{new Date(meal.date).toLocaleDateString()}</td>
                                    <td className="p-4 text-sm text-stone-600">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${meal.mealType === 'Brunch' ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                                            {meal.mealType}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-stone-800">{meal.foodItem}</td>
                                    <td className="p-4 text-sm text-stone-600">{meal.cookedQty}</td>
                                    <td className="p-4 text-sm text-stone-600">{meal.returnedQty}</td>
                                    <td className="p-4 text-sm text-emerald-600 font-bold">{meal.consumedQty}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingMeal(meal)} className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-all duration-200">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => setDeletingId(meal.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {editingMeal && (
                <EditModal
                    initialData={editingMeal}
                    onClose={() => setEditingMeal(null)}
                    onSave={handleEditSave}
                />
            )}

            {deletingId && (
                <DeleteConfirm
                    onConfirm={handleDelete}
                    onCancel={() => setDeletingId(null)}
                />
            )}
        </div>
    );
}
