import { useQuery } from "@/hooks/useQuery";
import { fts, Note } from "@/lib/db";
import { useSearchParams } from "react-router";
import NoteCard from "../home/components/note-card";

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get("query");

  const { data } = useQuery(async () => {
    const res = await fts.searchAndGet<Note>("notes", query);
    return res.filter((i) => !i.deletedAt);
  }, [query]);

  return (
    <div className="p-4">
      <h2 className="text-2xl">Search results for "{query}"</h2>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {data?.map((note) => (
          <NoteCard key={note.id} data={note} />
        ))}
      </div>
    </div>
  );
}
