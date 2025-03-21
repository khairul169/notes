import { useMemo } from "react";
import { mdxImagePlugin } from "./utils";
import { useDebounce } from "@/hooks/useDebounce";
import { Note } from "@shared/schema";
import db from "@/lib/db";
import { useQuery } from "@/hooks/useQuery";
import { MarkdownEditorRef } from "@/components/ui/markdown-editor";
import { putNoteContent } from "./services";

export function useNoteQuery(
  id: string,
  ref: {
    editor: React.RefObject<MarkdownEditorRef>;
    version: React.RefObject<number>;
  }
) {
  return useQuery(async () => {
    const data = await db.notes.get(id!);
    if (!data) {
      throw new Error("Note not found");
    }

    ref.version.current = data.updated;
    ref.editor.current?.setMarkdown(data.content);

    setTimeout(() => {
      ref.editor.current.focus(undefined, { defaultSelection: "rootStart" });
    }, 100);

    return data;
  }, [id]);
}

export function useOnChange(
  data?: Note | null,
  versionRef?: React.RefObject<number>
) {
  return useDebounce(async (content: string) => {
    if (data) {
      const res = await putNoteContent(data.id, content);
      versionRef!.current = res;
    }
  }, 500);
}

export function useMdxPlugins(id: string) {
  return useMemo(
    () => [
      // Editor Plugins
      mdxImagePlugin(id),
    ],
    [id]
  );
}
