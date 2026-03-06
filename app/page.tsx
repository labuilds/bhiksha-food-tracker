import { saveMealEntry } from "@/app/actions/meals";
import DataEntryForm from "@/components/DataEntryForm";

export default function Home() {
    return (
        <div className="h-[calc(100vh-190px)] flex flex-col mx-auto w-full max-w-2xl px-2">
            <DataEntryForm action={saveMealEntry} />
        </div>
    );
}
