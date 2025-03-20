import { useQuery } from "@/hooks/useQuery";
import db from "@/lib/db";
import NoteCard from "./components/note-card";

export default function HomePage() {
  const { data } = useQuery(async () => {
    const res = await db.notes
      .orderBy("updatedAt")
      .reverse()
      .limit(40)
      .toArray();
    return res.filter((i) => !i.deletedAt);
  });

  return (
    <div className="p-4">
      <h2 className="text-2xl">Notes</h2>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {data?.map((note) => (
          <NoteCard key={note.id} data={note} />
        ))}
      </div>
    </div>
  );
}
