"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileEdit, TrendingUp, TableProperties } from "lucide-react";

export default function BottomNavbar() {
    const pathname = usePathname();

    const tabs = [
        {
            name: "Log",
            path: "/",
            icon: <FileEdit size={24} />,
        },
        {
            name: "Sheet",
            path: "/sheet",
            icon: <TableProperties size={24} />,
        },
        {
            name: "Insights",
            path: "/insights",
            icon: <TrendingUp size={24} />,
        },
    ];

    return (
        <nav className="fixed bottom-6 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-stone-200/50 z-50">
            <div className="flex items-center justify-around h-16 max-w-md mx-auto">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.path;
                    return (
                        <Link
                            key={tab.name}
                            href={tab.path}
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 ${isActive ? "text-[#F36F21]" : "text-stone-400 hover:text-stone-600"
                                }`}
                        >
                            <div className={isActive ? "scale-110 transition-transform duration-200" : ""}>
                                {tab.icon}
                            </div>
                            <span className="text-[10px] font-medium tracking-wide">
                                {tab.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
