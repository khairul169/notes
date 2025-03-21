import { MdOutlineInsertDriveFile } from "react-icons/md";
import RippleButton from "../ui/ripple-button";
import { useLiveQuery } from "dexie-react-hooks";
import db from "@/lib/db";
import { cn, extractEmoji } from "@/lib/utils";
import { useLocation } from "react-router";
import { createStore, useStore } from "zustand";
import { useEffect } from "react";
import { Note } from "@shared/schema";
import icon from "@/assets/favicon.svg";
import NewNoteButton from "./new-note-btn";

export const sidebarStore = createStore(() => ({ open: false }));

export default function Sidebar() {
  const open = useStore(sidebarStore, (state) => state.open);
  const { pathname } = useLocation();

  useEffect(() => {
    sidebarStore.setState({ open: false });
  }, [pathname]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[19] cursor-pointer bg-black/10 md:hidden"
          role="button"
          onClick={() => sidebarStore.setState({ open: false })}
        />
      )}

      <aside
        className={cn(
          "bg-surface-container md:bg-background fixed top-0 bottom-0 left-0 z-20 flex w-[80%] -translate-x-full flex-col overflow-hidden rounded-r-2xl shadow-md transition-all md:static md:max-w-[250px] md:translate-0 md:rounded-none md:shadow-none",
          open && "flex -translate-x-0"
        )}
      >
        <div className="p-4">
          <RippleButton href="/" className="flex h-12 items-center">
            <img src={icon} alt="Notes" className="size-8" />
            <p className="ml-2 text-2xl">Notes</p>
          </RippleButton>

          <NewNoteButton className="mt-4 hidden md:flex" />
        </div>

        <div className="flex-1 gap-4 overflow-y-auto">
          <NoteList />
          <TagsList />
        </div>
      </aside>
    </>
  );
}

const NoteList = () => {
  const notes = useLiveQuery(() =>
    db.notes
      .orderBy("updatedAt")
      .reverse()
      .filter((i) => !i.deletedAt)
      .limit(5)
      .toArray()
  );
  if (!notes?.length) {
    return null;
  }

  return (
    <>
      <p className="text-on-background/80 mt-4 mb-2 ml-4 text-sm">
        Last Updated
      </p>

      <div>{notes?.map((note) => <NoteItem key={note.id} data={note} />)}</div>
    </>
  );
};

const NoteItem = ({ data }: { data: Note }) => {
  const icon = extractEmoji(data.title);

  return (
    <RippleButton
      href={`/note/${data.id}`}
      className="hover:bg-surface-container w-full px-4 py-3 transition-colors md:py-2.5"
    >
      {!icon && <MdOutlineInsertDriveFile className="shrink-0" />}
      <span className="truncate">{data.title}</span>
    </RippleButton>
  );
};

const TagsList = () => {
  const tags = useLiveQuery(() =>
    db.notes
      .filter((i) => !i.deletedAt)
      .toArray()
      .then((i) => [...new Set(i.flatMap((i) => i.tags))])
  );
  if (!tags?.length) {
    return null;
  }

  return (
    <>
      <p className="text-on-background/80 mt-4 mb-2 ml-4 text-sm">Tags</p>

      <div className="flex flex-row flex-wrap gap-2 p-4 pt-2">
        {tags?.map((tag) => (
          <RippleButton
            key={tag}
            href={`/search?query=${encodeURIComponent("#" + tag)}`}
            className="border-outline/60 hover:bg-surface-container-highest rounded-full border px-4 py-1 text-sm md:px-2 md:py-0.5"
          >
            {tag}
          </RippleButton>
        ))}
      </div>
    </>
  );
};
