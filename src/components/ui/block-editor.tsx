import React from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/fonts/inter.css";
import { useStore } from "zustand";
import settingsStore from "@/stores/settings.store";

type BlockEditorProps = React.ComponentProps<typeof BlockNoteView>;

export function useBlockEditor(
  ...params: Parameters<typeof useCreateBlockNote>
) {
  const [options, deps] = params;
  const editor = useCreateBlockNote(options, deps);
  return editor;
}

export type BlockEditor = ReturnType<typeof useBlockEditor>;
export type BlockDocument = BlockEditor["document"];

export default function BlockEditor({ ...props }: BlockEditorProps) {
  const theme = useStore(settingsStore, (i) => i.theme);

  return <BlockNoteView theme={theme} emojiPicker {...props} />;
}
