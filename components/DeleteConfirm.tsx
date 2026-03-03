"use client";

import { AlertTriangle, X } from "lucide-react";

export default function DeleteConfirm({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-md overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4 text-red-400">
                        <div className="bg-red-400/10 border border-red-500/20 p-3 rounded-full">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-400">Confirm Deletion</h3>
                    </div>
                    <p className="text-gray-400 mb-8 leading-relaxed">Are you sure you want to delete this meal entry? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={onCancel} className="px-5 py-2.5 border border-gray-700 bg-gray-800/50 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
                            Cancel
                        </button>
                        <button onClick={onConfirm} className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-medium hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300">
                            Delete Entry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
