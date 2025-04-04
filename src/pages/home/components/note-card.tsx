import RippleButton from "@/components/ui/ripple-button";
import { extractEmoji } from "@/lib/utils";
import { MdOutlineInsertDriveFile } from "react-icons/md";
import { Note } from "@/lib/db";

export default function NoteCard({ data }: { data: Note }) {
  const icon = extractEmoji(data.title);

  return (
    <RippleButton
      href={`/note/${data.id}`}
      className="bg-surface-container hover:bg-surface-container-high w-full items-start rounded-lg px-4 py-2.5 transition-colors"
      wrapperClassName="flex-col items-stretch h-full"
    >
      <div className="flex items-center gap-2 text-lg">
        {!icon && <MdOutlineInsertDriveFile className="shrink-0" />}
        <span className="truncate">{data.title}</span>
      </div>

      {data.tags?.length > 0 && (
        <div className="flex items-center gap-1 overflow-hidden text-xs">
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

      <div className="max-h-[100px] overflow-hidden text-sm [&>*]:mb-0 [&>*]:text-sm">
        {data.summary
          .substring(0, 180)
          .split("\n")
          .map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
      </div>
      <div className="flex-1" />

      <p className="text-on-surface/60 truncate text-right text-xs">
        {new Date(data.updated).toLocaleString()}
      </p>
    </RippleButton>
  );
}
