import { useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Note } from "@/lib/db";
import { useQuery } from "@/hooks/useQuery";
import { getNote, putNoteContent } from "./services";
import * as htmlToText from "html-to-text";
import {
  BlockDocument,
  BlockEditor,
  useBlockEditor,
} from "@/components/ui/block-editor";
import { getAttachment, storeAttachment } from "./services";
import { toast } from "sonner";

export function useNoteQuery(id: string) {
  return useQuery(() => getNote(id), [id]);
}

export function useEditor(data?: Note | null) {
  return useBlockEditor(
    {
      initialContent: data?.content as BlockDocument,
      async uploadFile(file) {
        if (!data?.id) {
          throw new Error("Note not found");
        }
        if (file.size > 1024 * 1024 * 5) {
          toast.error("Cannot store file!", {
            description: "Max file size: 5 MB",
          });
          throw new Error("Upload Failed");
        }

        return storeAttachment(data.id, file);
      },

      async resolveFileUrl(url) {
        const attachment = await getAttachment(url);
        if (attachment) {
          return attachment;
        }

        return url;
      },
    },
    [data?.content]
  );
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
