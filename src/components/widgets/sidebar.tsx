import { MdOutlineInsertDriveFile, MdTag } from "react-icons/md";
import RippleButton from "../ui/ripple-button";
import { useLiveQuery } from "dexie-react-hooks";
import db from "@/lib/db";
import { cn, extractEmoji } from "@/lib/utils";
import { useLocation, useSearchParams } from "react-router";
import { createStore, useStore } from "zustand";
import React, { useEffect } from "react";
import { Note } from "@shared/schema";
import icon from "@/assets/favicon.svg";
import NewNoteButton from "./new-note-btn";
import { Button } from "../ui/button";
import { HomeIcon, SettingsIcon } from "lucide-react";

export const sidebarStore = createStore(() => ({ open: false }));

export default function Sidebar() {
  const open = useStore(sidebarStore, (state) => state.open);
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    sidebarStore.setState({ open: false });
  }, [pathname, searchParams]);

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
        <div className="p-2">
          <RippleButton href="/" className="m-2 flex h-12 items-center">
            <img src={icon} alt="Notes" className="size-8" />
            <p className="ml-2 text-2xl">Notes</p>
          </RippleButton>

          <NewNoteButton className="mt-4 hidden md:flex" />
        </div>

        <div className="flex-1 gap-4 overflow-y-auto">
          <NavList />
          <NoteList />
          <TagsList />
        </div>
      </aside>
    </>
  );
}

const NavList = () => {
  return (
    <div className="px-2 md:mt-2">
      <NavItem href="/" isExact title="Home" icon={<HomeIcon />} />
      <NavItem href="/settings" title="Settings" icon={<SettingsIcon />} />
    </div>
  );
};

const NavItem = ({
  title,
  icon,
  href,
  isExact,
}: {
  title: string;
  icon: React.ReactNode;
  href: string;
  isExact?: boolean;
}) => {
  const { pathname } = useLocation();
  const current = isExact ? pathname === href : pathname.startsWith(href);

  return (
    <Button
      variant={current ? "tonal" : "ghost"}
      className="w-full"
      wrapperClassName="justify-start"
      href={href}
    >
      {icon}
      {title}
    </Button>
  );
};

const NoteList = () => {
  const notes = useLiveQuery(() =>
    db.notes
      .orderBy("updated")
      .reverse()
      .filter((i) => !i.deleted)
      .limit(5)
      .toArray()
  );
  if (!notes?.length) {
    return null;
  }

  return (
    <>
      <p className="text-on-background/80 mt-4 mb-1 ml-6 text-xs">
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
      className="hover:bg-surface-container w-full px-6 py-3 transition-colors md:py-2.5"
    >
      {!icon && <MdOutlineInsertDriveFile className="shrink-0" />}
      <span className="truncate text-sm">{data.title}</span>
    </RippleButton>
  );
};

const TagsList = () => {
  const tags = useLiveQuery(() =>
    db.notes
      .filter((i) => !i.deleted)
      .toArray()
      .then((i) => [...new Set(i.flatMap((i) => i.tags))])
  );
  if (!tags?.length) {
    return null;
  }

  return (
    <>
      <p className="text-on-background/80 mt-4 mb-1 ml-6 text-xs">Tags</p>

      <div className="-ml-2 flex flex-row flex-wrap items-center gap-1 px-6 py-4 pt-2">
        {tags?.map((tag) => (
          <RippleButton
            key={tag}
            href={`/search?query=${encodeURIComponent("#" + tag)}`}
            className="hover:bg-surface-container-highest rounded-md px-2 py-1 text-sm"
            wrapperClassName="gap-1"
          >
            <MdTag className="text-on-surface/60" />
            {tag}
          </RippleButton>
        ))}
      </div>
    </>
  );
};
