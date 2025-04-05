import db, { Note } from "@/lib/db";
import { useParams } from "react-router";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/loader";
import { useEditor, useNoteQuery, useOnChange } from "./lib/hooks";
import Actions from "./components/actions";
import BlockEditor from "@/components/ui/block-editor";

export default function ViewNotePage() {
  const { id } = useParams();

  const { data, loading, error, refetch } = useNoteQuery(id!);
  const editor = useEditor(data);
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

      <div className="flex flex-1 flex-col overflow-y-auto md:p-4">
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
