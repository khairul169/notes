import { useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import db, { Note } from "@/lib/db";
import { useQuery } from "@/hooks/useQuery";
import { putNoteContent } from "./services";
import { BlockDocument, BlockEditor } from "@/components/ui/block-editor";
import * as htmlToText from "html-to-text";

export function useNoteQuery(id: string) {
  return useQuery(async () => {
    const data = await db.notes.get(id!);
    if (!data) {
      throw new Error("Note not found");
    }

    return data;
  }, [id]);
}

export function useOnChange(editor: BlockEditor, data?: Note | null) {
  return useDebounce(
    useCallback(
      async (document: BlockDocument) => {
        if (!data?.id) return;

        const html = await editor.blocksToHTMLLossy(document as never);
        const plain = htmlToText.convert(html);
        return putNoteContent(data.id, document, plain);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [data?.id]
    ),
    1000
  );
}
