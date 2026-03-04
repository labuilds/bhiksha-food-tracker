"use client";

import { useState, useEffect } from "react";
import { CloudOff, CloudUpload, Download, RefreshCw, Lock } from "lucide-react";
import { processOfflineQueue } from "@/lib/sync";
import { logout } from "@/app/actions/auth";

export default function Navbar() {
    const [isOnline, setIsOnline] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            setTimeout(() => triggerSync(), 1000); // Trigger sync when back online
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const triggerSync = async () => {
        if (!isOnline || syncing) return;
        setSyncing(true);
        try {
            const success = await processOfflineQueue();
            if (success) {
                setLastSync(new Date());
            }
        } catch (error) {
            console.error("Sync failed", error);
        }
        setSyncing(false);
    };

    // Auto-sync polling every 5 minutes if online
    useEffect(() => {
        const interval = setInterval(() => {
            triggerSync();
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [isOnline]);

    return (
        <nav className="fixed w-full bg-white border-b border-stone-200 top-0 z-40 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F36F21] rounded-xl flex items-center justify-center text-white font-bold text-xl tracking-tight">
                        B
                    </div>
                    <h1 className="font-bold text-xl tracking-tight text-stone-800 hidden sm:block">Bhiksha Hall Food Tracker</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-stone-600 hidden md:flex">
                        {isOnline ? (
                            <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                </span>
                                Online
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-stone-500 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-full">
                                <CloudOff size={14} /> Offline Mode
                            </span>
                        )}

                        {lastSync && (
                            <span className="text-xs ml-2 text-stone-500">
                                Last synced: <span className="text-stone-700">{lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                        )}
                    </div>

                    <button
                        onClick={triggerSync}
                        disabled={!isOnline || syncing}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${!isOnline
                            ? "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
                            : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 shadow-sm"
                            }`}
                    >
                        <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
                        <span className="hidden sm:inline">{syncing ? "Syncing..." : "Sync Now"}</span>
                    </button>

                    <a
                        href="/api/download"
                        className="flex items-center gap-2 px-4 py-2 bg-[#F36F21] hover:bg-[#D95E1A] text-white rounded-lg text-sm font-medium transition-all duration-300"
                    >
                        <Download size={16} />
                        <span className="hidden sm:inline">Export Data</span>
                    </a>

                    <form action={logout}>
                        <button
                            type="submit"
                            title="Lock App"
                            className="flex items-center gap-2 px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg text-sm font-medium border border-transparent hover:border-stone-200 transition-all duration-300 ml-1"
                        >
                            <Lock size={16} />
                            <span className="hidden lg:inline text-xs font-semibold uppercase tracking-wider">Lock</span>
                        </button>
                    </form>
                </div>
            </div>
        </nav>
    );
}
