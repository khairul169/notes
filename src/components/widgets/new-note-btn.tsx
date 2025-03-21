import React from "react";
import { Button } from "../ui/button";
import { Note } from "@shared/schema";
import * as uuid from "uuid";
import { cn, getTitle } from "@/lib/utils";
import { useNavigate } from "react-router";
import db from "@/lib/db";
import { MdAdd } from "react-icons/md";

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

    const content = "# 📒 New Note";
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
      className={cn(
        "h-12",
        isFloating && "fixed right-4 bottom-4 z-10 rounded-xl shadow-md",
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
