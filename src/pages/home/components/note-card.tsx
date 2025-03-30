import RippleButton from "@/components/ui/ripple-button";
import Markdown from "react-markdown";
import { extractEmoji } from "@/lib/utils";
import { Note } from "@shared/schema";
import { MdOutlineInsertDriveFile } from "react-icons/md";

export default function NoteCard({ data }: { data: Note }) {
  const icon = extractEmoji(data.title);

  return (
    <RippleButton
      href={`/note/${data.id}`}
      className="bg-surface-container-high hover:bg-surface-container-highest w-full items-start rounded-lg px-4 py-2.5 transition-colors"
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

      <div className="prose prose-sm dark:prose-invert max-h-[100px] overflow-hidden text-sm [&>*]:mb-0 [&>*]:text-sm">
        <Markdown disallowedElements={["a", "img"]}>
          {data.content.split("\n").slice(1).join("\n")}
        </Markdown>
      </div>
      <div className="flex-1" />

      <p className="text-on-surface/60 truncate text-right text-xs">
        {new Date(data.updated).toLocaleString()}
      </p>
    </RippleButton>
  );
}
