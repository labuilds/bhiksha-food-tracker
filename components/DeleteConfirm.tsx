"use client";

import { AlertTriangle, X } from "lucide-react";

export default function DeleteConfirm({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) {
    return (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-md overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4 text-red-500">
                        <div className="bg-red-50 border border-red-200 p-3 rounded-full">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-red-600">Confirm Deletion</h3>
                    </div>
                    <p className="text-stone-600 mb-8 leading-relaxed">Are you sure you want to delete this meal entry? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={onCancel} className="px-5 py-2.5 border border-stone-200 bg-white rounded-lg font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-50 transition-colors">
                            Cancel
                        </button>
                        <button onClick={onConfirm} className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-sm transition-all duration-300">
                            Delete Entry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
