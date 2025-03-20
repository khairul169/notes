import RippleButton from "@/components/ui/ripple-button";
import { Note } from "@/lib/db";
import { MdOutlineInsertDriveFile } from "react-icons/md";

export default function NoteCard({ data }: { data: Note }) {
  return (
    <RippleButton
      href={`/note/${data.id}`}
      className="py-2.5 px-4 items-start w-full transition-colors bg-surface-container-high hover:bg-surface-container-highest rounded-lg"
      wrapperClassName="flex-col items-stretch h-full"
    >
      <div className="flex items-center gap-2 text-lg">
        <MdOutlineInsertDriveFile className="shrink-0" />
        <span className="truncate">{data.title}</span>
      </div>

      {data.tags?.length > 0 && (
        <div className="flex items-center gap-1 text-xs">
          {data.tags.map((tag) => (
            <span className="px-2 rounded-lg border border-surface-outline">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="text-sm max-h-[100px] overflow-hidden flex-1">
        {data.content
          .split("\n")
          .slice(1)
          .map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
      </div>

      <p className="text-xs text-on-surface/60 truncate text-right">
        {data.updatedAt.toLocaleString()}
      </p>
    </RippleButton>
  );
}
