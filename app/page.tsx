"use client";

import { useState } from "react";
import DataEntryForm from "@/components/DataEntryForm";
import MealView from "@/components/MealView";
import ItemSearch from "@/components/ItemSearch";
import { offlineFetch } from "@/lib/api";

export default function Home() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [activeTab, setActiveTab] = useState<"dashboard" | "search">("dashboard");

    const handleEntrySubmit = async (data: any) => {
        try {
            await offlineFetch("/api/meals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            // Trigger a refresh of the views
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-8 pt-24 pb-12">
            <section className="glass-panel p-4 sm:p-6 md:p-8">
                <DataEntryForm onSubmit={handleEntrySubmit} />
            </section>

            <section className="pt-2">
                <div className="flex gap-2 mb-6 p-1 bg-gray-900/50 backdrop-blur border border-gray-800 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab("dashboard")}
                        className={`px-5 py-2.5 font-medium text-sm rounded-md transition-all duration-300 ${activeTab === "dashboard"
                            ? "bg-blue-600 shadow-lg shadow-blue-500/30 text-white"
                            : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                            }`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab("search")}
                        className={`px-5 py-2.5 font-medium text-sm rounded-md transition-all duration-300 ${activeTab === "search"
                            ? "bg-blue-600 shadow-lg shadow-blue-500/30 text-white"
                            : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                            }`}
                    >
                        Item Analysis
                    </button>
                </div>

                {activeTab === "dashboard" ? (
                    <MealView refreshTrigger={refreshTrigger} />
                ) : (
                    <ItemSearch />
                )}
            </section>
        </div>
    );
}
