import { useQuery } from "@/hooks/useQuery";
import { fts } from "@/lib/db";
import { useSearchParams } from "react-router";
import NoteCard from "../home/components/note-card";
import { Note } from "@shared/schema";
import NewNoteButton from "@/components/widgets/new-note-btn";

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get("query");

  const { data } = useQuery(async () => {
    const res = await fts.searchAndGet<Note>("notes", query);
    return res.filter((i) => !i.deletedAt);
  }, [query]);

  return (
    <div className="overflow-y-auto p-4 pb-20 md:pb-4">
      <h2 className="text-2xl">Search results for "{query}"</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data?.map((note) => <NoteCard key={note.id} data={note} />)}
      </div>

      <NewNoteButton isFloating className="md:hidden" />
    </div>
  );
}
