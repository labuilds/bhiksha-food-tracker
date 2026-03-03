"use client";

import { X } from "lucide-react";
import DataEntryForm from "./DataEntryForm";

export default function EditModal({ initialData, onClose, onSave }: { initialData: any, onClose: () => void, onSave: (data: any) => Promise<void> }) {
    return (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 z-10 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
                <div className="p-4 sm:p-6 pb-2">
                    <DataEntryForm
                        initialData={initialData}
                        onSubmit={async (data) => {
                            await onSave(data);
                        }}
                        isEditing={true}
                    />
                </div>
            </div>
        </div>
    );
}
