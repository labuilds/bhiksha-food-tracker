import { saveMealEntry } from "@/app/actions/meals";
import DataEntryForm from "@/components/DataEntryForm";

export default function Home() {
    return (
        <div className="space-y-6 max-w-2xl mx-auto h-full">
            <section className="glass-panel p-4 sm:p-6 md:p-8 h-full min-h-[calc(100vh-12rem)] flex flex-col">
                <DataEntryForm action={saveMealEntry} />
            </section>
        </div>
    );
}
