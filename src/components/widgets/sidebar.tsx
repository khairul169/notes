import { Button } from "../ui/button";
import { MdAdd, MdOutlineInsertDriveFile } from "react-icons/md";
import RippleButton from "../ui/ripple-button";
import { useLiveQuery } from "dexie-react-hooks";
import db from "@/lib/db";
import * as uuid from "uuid";
import { cn, getTitle } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router";
import { createStore, useStore } from "zustand";
import { useEffect } from "react";
import { Note } from "@shared/schema";

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
          "bg-background fixed top-0 bottom-0 left-0 z-20 flex w-[80%] -translate-x-full flex-col overflow-hidden rounded-r-2xl transition-all md:static md:max-w-[250px] md:translate-0 md:rounded-none",
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
      className="h-12 w-full justify-start"
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
    <div className="flex flex-1 flex-col overflow-y-auto">
      {notes?.map((note) => <NoteItem key={note.id} data={note} />)}
    </div>
  );
};

const NoteItem = ({ data }: { data: Note }) => (
  <RippleButton
    href={`/note/${data.id}`}
    className="hover:bg-surface-container w-full px-4 py-2.5 transition-colors"
  >
    <MdOutlineInsertDriveFile className="shrink-0" />
    <span className="truncate">{data.title}</span>
  </RippleButton>
);
