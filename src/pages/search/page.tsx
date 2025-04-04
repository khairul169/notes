import { useQuery } from "@/hooks/useQuery";
import { fts, Note } from "@/lib/db";
import { useSearchParams } from "react-router";
import NoteCard from "../home/components/note-card";
import NewNoteButton from "@/components/widgets/new-note-btn";
import Loader from "@/components/ui/loader";

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get("query");

  const { data, loading } = useQuery(async () => {
    const res = await fts.searchAndGet<Note>("notes", query);
    return res.filter((i) => !i.deleted).slice(0, 100);
  }, [query]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="overflow-y-auto p-4 pb-20 md:p-8 md:pb-8">
      <h2 className="text-2xl">Search results for "{query}"</h2>

      {!data?.length ? (
        <p className="mt-4">Notes not found.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.map((note) => <NoteCard key={note.id} data={note} />)}
        </div>
      )}

      <NewNoteButton isFloating className="md:hidden" />
    </div>
  );
}
