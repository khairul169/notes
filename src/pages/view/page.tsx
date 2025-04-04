import db, { Note } from "@/lib/db";
import { useParams } from "react-router";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/loader";
import { useNoteQuery, useOnChange } from "./lib/hooks";
import Actions from "./components/actions";
import BlockEditor, {
  BlockDocument,
  useBlockEditor,
} from "@/components/ui/block-editor";
import { getAttachment, storeAttachment } from "./lib/services";
import { toast } from "sonner";

export default function ViewNotePage() {
  const { id } = useParams();

  const { data, loading, error, refetch } = useNoteQuery(id!);
  const editor = useBlockEditor(
    {
      initialContent: data?.content as BlockDocument,
      async uploadFile(file) {
        if (file.size > 1024 * 1024 * 5) {
          toast.error("Cannot store file!", {
            description: "Max file size: 5 MB",
          });
          throw new Error("Upload Failed");
        }

        return storeAttachment(id!, file);
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
  const onChange = useOnChange(editor, data);

  if (loading) {
    return <Loader />;
  }

  if (error || !data) {
    return (
      <div className="p-4">
        <p>{error?.message || "Cannot load data!"}</p>
      </div>
    );
  }

  return (
    <>
      <Actions data={data} refetch={refetch} />

      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        <DeletedAlert data={data} refetch={refetch} />

        <BlockEditor
          editor={editor}
          onChange={() => onChange(editor.document)}
          className="mt-6"
        />
      </div>
    </>
  );
}

const DeletedAlert = ({
  data,
  refetch,
}: {
  data?: Note | null;
  refetch: () => void;
}) => {
  const onRestore = async () => {
    await db.notes.update(data!.id, { updated: Date.now(), deleted: null });
    refetch();
  };

  if (!data?.deleted) {
    return null;
  }

  return (
    <Alert className="mb-4 flex items-center p-2 pl-4">
      <AlertCircle className="mb-1" />
      <AlertTitle className="flex-1">This note has been deleted.</AlertTitle>
      <Button size="sm" variant="filled" onClick={onRestore}>
        Restore
      </Button>
    </Alert>
  );
};
