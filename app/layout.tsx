import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Bhiksha Hall Food Tracker",
    description: "Offline-first application for tracking food waste at the Isha Foundation Ashram.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} min-h-screen flex flex-col antialiased`}>
                <Navbar />
                <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
                    {children}
                </main>
            </body>
        </html>
    );
}
