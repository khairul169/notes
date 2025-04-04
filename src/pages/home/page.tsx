import db from "@/lib/db";
import NoteCard from "./components/note-card";
import { useLiveQuery } from "dexie-react-hooks";
import Loader from "@/components/ui/loader";
import NewNoteButton from "@/components/widgets/new-note-btn";

export default function HomePage() {
  const data = useLiveQuery(async () => {
    const res = await db.notes
      .orderBy("[pinned+updated]")
      .reverse()
      .limit(32)
      .toArray();
    return res.filter((i) => !i.deleted);
  });

  if (data == null) {
    return <Loader />;
  }

  return (
    <div className="overflow-y-auto p-4 pb-20 md:p-8 md:pb-8">
      <h2 className="text-2xl">Notes</h2>

      {!data?.length ? (
        <p className="mt-4">No notes yet. Click "New Note" to add one.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.map((note) => <NoteCard key={note.id} data={note} />)}
        </div>
      )}

      <NewNoteButton isFloating className="md:hidden" />
    </div>
  );
}
