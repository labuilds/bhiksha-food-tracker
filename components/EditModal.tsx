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
                        action={async (formData) => {
                            await onSave({
                                date: formData.get("date") as string,
                                mealType: formData.get("meal_type") as string,
                                volunteersCount: parseInt(formData.get("volunteers_count") as string) || 0,
                                staffCount: parseInt(formData.get("staff_count") as string) || 0,
                                foodItem: formData.get("food_item") as string,
                                cookedQty: parseFloat(formData.get("cooked_qty") as string) || 0,
                                returnedQty: parseFloat(formData.get("returned_qty") as string) || 0,
                                remarks: formData.get("remarks") as string,
                            });
                        }}
                        isEditing={true}
                    />
                </div>
            </div>
        </div>
    );
}
