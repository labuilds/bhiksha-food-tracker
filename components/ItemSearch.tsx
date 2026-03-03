"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

export default function ItemSearch() {
    const [searchTerm, setSearchTerm] = useState("");
    const [meals, setMeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [subTableData, setSubTableData] = useState<any[]>([]);
    const [loadingSub, setLoadingSub] = useState(false);

    useEffect(() => {
        const fetchSearch = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/meals?foodItem=${encodeURIComponent(searchTerm)}`);
                const data = await res.json();
                setMeals(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };

        const delayDebounceFn = setTimeout(() => {
            fetchSearch();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleExpand = async (meal: any) => {
        if (expandedRow === meal.id) {
            setExpandedRow(null);
            return;
        }

        setExpandedRow(meal.id);
        setLoadingSub(true);

        try {
            const dateStr = new Date(meal.date).toISOString().split('T')[0];
            const res = await fetch(`/api/meals?date=${dateStr}&mealType=${meal.mealType}`);
            const data = await res.json();
            setSubTableData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        }
        setLoadingSub(false);
    };

    return (
        <div className="glass-panel p-6 mt-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-stone-800 mb-6 mt-1">Item Data Analysis</h2>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by food item..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-stone-800 placeholder-stone-400 shadow-sm"
                    />
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="w-10"></th>
                            <th>Date</th>
                            <th>Meal</th>
                            <th>Food Item</th>
                            <th>Cooked</th>
                            <th>Consumed</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="p-4 text-center text-gray-500">Searching...</td></tr>
                        ) : meals.length === 0 ? (
                            <tr><td colSpan={7} className="p-4 text-center text-gray-500">No items found</td></tr>
                        ) : (
                            meals.map(meal => (
                                <React.Fragment key={meal.id}>
                                    <tr
                                        onClick={() => handleExpand(meal)}
                                        className={`border-b border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer ${expandedRow === meal.id ? 'bg-stone-100' : ''}`}
                                    >
                                        <td className="p-4">
                                            {expandedRow === meal.id ? <ChevronDown size={18} className="text-orange-500" /> : <ChevronRight size={18} className="text-stone-400" />}
                                        </td>
                                        <td className="p-4 text-sm text-stone-600">{new Date(meal.date).toLocaleDateString()}</td>
                                        <td className="p-4 text-sm text-stone-600">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${meal.mealType === 'Brunch' ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                                                {meal.mealType}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-semibold text-stone-800">{meal.foodItem}</td>
                                        <td className="p-4 text-sm text-stone-600">{meal.cookedQty}</td>
                                        <td className="p-4 text-sm font-bold text-emerald-600">{meal.consumedQty}</td>
                                        <td className="p-4 text-sm text-stone-500 max-w-[150px] truncate">{meal.remarks}</td>
                                    </tr>

                                    {expandedRow === meal.id && (
                                        <tr className="bg-stone-50 border-b border-stone-200">
                                            <td colSpan={7} className="p-6">
                                                <div className="pl-8 border-l-2 border-orange-200 ml-4 py-2">
                                                    <h4 className="text-sm font-medium text-stone-500 mb-4 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                                        Other menu items from {meal.mealType} on {new Date(meal.date).toLocaleDateString()}
                                                    </h4>

                                                    {loadingSub ? (
                                                        <div className="text-sm text-orange-600 animate-pulse">Loading menu analysis...</div>
                                                    ) : (
                                                        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
                                                            <table className="w-full text-left">
                                                                <thead className="bg-stone-50 border-b border-stone-200">
                                                                    <tr className="text-xs text-stone-500 uppercase tracking-wider">
                                                                        <th className="p-3 pl-5 font-medium">Food Item</th>
                                                                        <th className="p-3 font-medium">Cooked</th>
                                                                        <th className="p-3 font-medium">Returned</th>
                                                                        <th className="p-3 font-medium">Consumed</th>
                                                                        <th className="p-3 font-medium text-right pr-5">Per Person</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-stone-200">
                                                                    {subTableData.map(subItem => (
                                                                        <tr key={subItem.id} className={`text-sm hover:bg-stone-50 transition-colors ${subItem.id === meal.id ? 'bg-orange-50/50' : ''}`}>
                                                                            <td className="p-3 pl-5 font-medium text-stone-700 flex items-center gap-3 relative">
                                                                                {subItem.id === meal.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>}
                                                                                {subItem.foodItem}
                                                                                {subItem.id === meal.id && <span className="text-[10px] bg-orange-100 border border-orange-200 text-orange-600 px-2 py-0.5 rounded-full font-bold tracking-wider uppercase">Focus</span>}
                                                                            </td>
                                                                            <td className="p-3 text-stone-600">{subItem.cookedQty}</td>
                                                                            <td className="p-3 text-stone-600">{subItem.returnedQty}</td>
                                                                            <td className="p-3 font-bold text-emerald-600">{subItem.consumedQty}</td>
                                                                            <td className="p-3 text-stone-500 font-mono text-right pr-5">{subItem.perPersonQty.toFixed(3)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
