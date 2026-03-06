import { saveMealEntry } from "@/app/actions/meals";
import DataEntryForm from "@/components/DataEntryForm";

export const dynamic = 'force-dynamic';

export default function Home() {
    return (
        <div className="space-y-6 pt-6 pb-12 max-w-2xl mx-auto">
            <section className="glass-panel p-4 sm:p-6 md:p-8">
                <DataEntryForm action={saveMealEntry} />
            </section>
        </div>
    );
}
