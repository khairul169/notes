import React from "react";
import { Button } from "../ui/button";
import { nanoid } from "nanoid";
import { cn, getTitle } from "@/lib/utils";
import { useNavigate } from "react-router";
import db, { Note } from "@/lib/db";
import { MdAdd } from "react-icons/md";
import { BlockDocument } from "../ui/block-editor";

type NewNoteButtonProps = React.ComponentProps<typeof Button> & {
  isFloating?: boolean;
};

export default function NewNoteButton({
  className,
  isFloating,
  ...props
}: NewNoteButtonProps) {
  const navigate = useNavigate();

  const onPress = () => {
    if (!window.confirm("Are you sure you want to create a new note?")) {
      return;
    }

    const content: BlockDocument = [
      {
        type: "heading",
        content: "📒 New Note",
      } as never,
    ];
    const now = Date.now();
    const data: Note = {
      id: nanoid(),
      title: getTitle(content),
      content: content,
      summary: "",
      tags: [],
      created: now,
      updated: now,
    };
    db.notes.add(data);
    navigate(`/note/${data.id}`);
  };

  return (
    <Button
      className={cn(
        "h-12 rounded-xl",
        isFloating && "fixed right-4 bottom-4 z-10 shadow-md",
        className
      )}
      variant="filled"
      onClick={onPress}
      {...props}
    >
      <MdAdd />
      {isFloating ? "New Note" : "New Note"}
    </Button>
  );
}
