import { Button } from "../ui/button";
import { MdAdd, MdOutlineInsertDriveFile } from "react-icons/md";
import RippleButton from "../ui/ripple-button";
import { useLiveQuery } from "dexie-react-hooks";
import db, { Note } from "@/lib/db";
import * as uuid from "uuid";
import { cn, getTitle } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router";
import { createStore, useStore } from "zustand";
import { useEffect } from "react";

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
          className="fixed md:hidden inset-0 z-[19] bg-black/10 cursor-pointer"
          role="button"
          onClick={() => sidebarStore.setState({ open: false })}
        />
      )}

      <aside
        className={cn(
          "bg-background w-[80%] md:max-w-[250px] flex flex-col fixed top-0 bottom-0 left-0 z-20 rounded-r-2xl overflow-hidden -translate-x-full transition-all md:rounded-none md:static md:translate-0",
          open && "flex -translate-x-0"
        )}
      >
        <div className="p-4">
          <NewNoteButton />
        </div>

        <NoteList />
      </aside>
    </>
  );
}

const NewNoteButton = () => {
  const navigate = useNavigate();

  const onPress = () => {
    const content = "# New Note";
    const data: Note = {
      id: uuid.v7(),
      title: getTitle(content),
      content: content,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.notes.add(data);
    navigate(`/note/${data.id}`);
  };

  return (
    <Button
      className="w-full h-12 justify-start"
      variant="filled"
      onClick={onPress}
    >
      <MdAdd />
      New Note
    </Button>
  );
};

const NoteList = () => {
  const notes = useLiveQuery(() =>
    db.notes
      .orderBy("updatedAt")
      .reverse()
      .filter((i) => !i.deletedAt)
      .limit(20)
      .toArray()
  );

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {notes?.map((note) => (
        <NoteItem key={note.id} data={note} />
      ))}
    </div>
  );
};

const NoteItem = ({ data }: { data: Note }) => (
  <RippleButton
    href={`/note/${data.id}`}
    className="py-2.5 px-4 w-full transition-colors hover:bg-surface-container"
  >
    <MdOutlineInsertDriveFile className="shrink-0" />
    <span className="truncate">{data.title}</span>
  </RippleButton>
);
