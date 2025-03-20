import RippleButton from "@/components/ui/ripple-button";
import { Note } from "@shared/schema";
import { MdOutlineInsertDriveFile } from "react-icons/md";

export default function NoteCard({ data }: { data: Note }) {
  return (
    <RippleButton
      href={`/note/${data.id}`}
      className="bg-surface-container-high hover:bg-surface-container-highest w-full items-start rounded-lg px-4 py-2.5 transition-colors"
      wrapperClassName="flex-col items-stretch h-full"
    >
      <div className="flex items-center gap-2 text-lg">
        <MdOutlineInsertDriveFile className="shrink-0" />
        <span className="truncate">{data.title}</span>
      </div>

      {data.tags?.length > 0 && (
        <div className="flex items-center gap-1 text-xs">
          {data.tags.map((tag, idx) => (
            <span
              key={tag + idx}
              className="border-surface-outline rounded-lg border px-2"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="max-h-[100px] flex-1 overflow-hidden text-sm">
        {data.content
          .split("\n")
          .slice(1)
          .map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
      </div>

      <p className="text-on-surface/60 truncate text-right text-xs">
        {data.updatedAt.toLocaleString()}
      </p>
    </RippleButton>
  );
}
