import db from "@/lib/db";
import NoteCard from "./components/note-card";
import { useLiveQuery } from "dexie-react-hooks";
import NewNoteButton from "@/components/widgets/new-note-btn";

export default function HomePage() {
  const data = useLiveQuery(async () => {
    const res = await db.notes.orderBy("updated").reverse().limit(40).toArray();
    return res.filter((i) => !i.deleted);
  });

  return (
    <div className="overflow-y-auto p-4 pb-20 md:pb-4">
      <h2 className="text-2xl">Notes</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data?.map((note) => <NoteCard key={note.id} data={note} />)}
      </div>

      <NewNoteButton isFloating className="md:hidden" />
    </div>
  );
}
