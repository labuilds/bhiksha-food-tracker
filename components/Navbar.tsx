"use client";

import { useState, useEffect } from "react";
import { CloudOff, RefreshCw, Lock } from "lucide-react";
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
        <nav className="fixed w-full bg-white/80 backdrop-blur-md border-b border-stone-200 top-0 z-40 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center text-[#F36F21] font-bold text-lg tracking-tight">
                        B
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center text-xs text-stone-600">
                        {isOnline ? (
                            <span className="flex items-center gap-1.5 text-emerald-600 hidden sm:flex">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Online
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-red-500">
                                <CloudOff size={14} /> <span className="hidden sm:inline">Offline</span>
                            </span>
                        )}
                    </div>

                    <button
                        onClick={triggerSync}
                        disabled={!isOnline || syncing}
                        title="Sync Data"
                        className={`p-1.5 rounded-md transition-all duration-300 ${!isOnline
                            ? "text-stone-300 cursor-not-allowed"
                            : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                            }`}
                    >
                        <RefreshCw size={18} className={syncing ? "animate-spin text-orange-500" : ""} />
                    </button>

                    <form action={logout}>
                        <button
                            type="submit"
                            title="Lock App"
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-all duration-300"
                        >
                            <Lock size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </nav>
    );
}
