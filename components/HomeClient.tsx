"use client";

import { useState } from "react";
import DataEntryForm from "@/components/DataEntryForm";
import MealView from "@/components/MealView";
import ItemSearch from "@/components/ItemSearch";
import { saveMealEntry } from "@/app/actions/meals";

export default function HomeClient({ initialMeals }: { initialMeals: any[] }) {
    const [activeTab, setActiveTab] = useState<"dashboard" | "search">("dashboard");

    return (
        <div className="space-y-8 pt-24 pb-12">
            <section className="glass-panel p-4 sm:p-6 md:p-8">
                <DataEntryForm action={saveMealEntry} />
            </section>

            <section className="pt-2">
                <div className="flex gap-2 mb-6 p-1 bg-stone-50 border border-stone-200 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab("dashboard")}
                        className={`px-5 py-2.5 font-medium text-sm rounded-md transition-all duration-300 ${activeTab === "dashboard"
                            ? "bg-[#F36F21] shadow-md text-white"
                            : "text-stone-500 hover:text-stone-700 hover:bg-stone-100"
                            }`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab("search")}
                        className={`px-5 py-2.5 font-medium text-sm rounded-md transition-all duration-300 ${activeTab === "search"
                            ? "bg-[#F36F21] shadow-md text-white"
                            : "text-stone-500 hover:text-stone-700 hover:bg-stone-100"
                            }`}
                    >
                        Item Analysis
                    </button>
                </div>

                {activeTab === "dashboard" ? (
                    <MealView initialMeals={initialMeals} />
                ) : (
                    <ItemSearch />
                )}
            </section>
        </div>
    );
}
