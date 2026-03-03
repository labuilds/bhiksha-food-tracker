"use client";

import { useState, useEffect } from "react";
import { CloudOff, CloudUpload, Download, RefreshCw } from "lucide-react";
import { processOfflineQueue } from "@/lib/sync";

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
        <nav className="fixed w-full bg-gray-900/60 backdrop-blur-xl border-b border-gray-800 top-0 z-40 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center text-white font-bold text-xl tracking-tight">
                        B
                    </div>
                    <h1 className="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white hidden sm:block drop-shadow-sm">Bhiksha Hall Food Tracker</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300 hidden md:flex">
                        {isOnline ? (
                            <span className="flex items-center gap-1.5 text-blue-400 bg-blue-900/30 border border-blue-500/30 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                Online
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-orange-400 bg-orange-900/30 border border-orange-500/30 px-2.5 py-1 rounded-full">
                                <CloudOff size={14} /> Offline Mode
                            </span>
                        )}

                        {lastSync && (
                            <span className="text-xs ml-2 text-gray-400">
                                Last synced: <span className="text-gray-300">{lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                        )}
                    </div>

                    <button
                        onClick={triggerSync}
                        disabled={!isOnline || syncing}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${!isOnline
                            ? "bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700/50"
                            : "bg-gray-800 text-blue-400 hover:bg-gray-700 hover:text-blue-300 border border-gray-700 shadow-sm"
                            }`}
                    >
                        <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
                        <span className="hidden sm:inline">{syncing ? "Syncing..." : "Sync Now"}</span>
                    </button>

                    <a
                        href="/api/download"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(79,70,229,0.6)] hover:-translate-y-0.5"
                    >
                        <Download size={16} />
                        <span className="hidden sm:inline">Export Data</span>
                    </a>
                </div>
            </div>
        </nav>
    );
}
