import MarkdownEditor, {
  MarkdownEditorRef,
} from "@/components/ui/markdown-editor";
import db from "@/lib/db";
import { useEffect, useRef } from "react";
import { useParams } from "react-router";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Note } from "@shared/schema";
import { useLiveQuery } from "dexie-react-hooks";
import { useMdxPlugins, useNoteQuery, useOnChange } from "./lib/hooks";
import Actions from "./components/actions";

export default function ViewNotePage() {
  const ref = useRef<MarkdownEditorRef>(null!);
  const curVersion = useRef(0);
  const { id } = useParams();
  const lastUpdate = useLiveQuery(
    () => db.notes.get(id!).then((i) => i?.updated || 0),
    [id]
  );

  const { data, loading, error, refetch } = useNoteQuery(id!, {
    editor: ref,
    version: curVersion,
  });
  const onChange = useOnChange(data, curVersion);
  const plugins = useMdxPlugins(id!);

  useEffect(() => {
    if (lastUpdate && curVersion.current < lastUpdate) {
      curVersion.current = lastUpdate;
      refetch();
    }
  }, [lastUpdate, refetch]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <Actions data={data} refetch={refetch} />

      <div className="flex flex-1 flex-col overflow-hidden px-1 md:p-4">
        <DeletedAlert data={data} refetch={refetch} />
        <MarkdownEditor
          ref={ref}
          markdown={data?.content || ""}
          className="scrollable flex-1 overflow-y-auto"
          contentEditableClassName="min-h-[50vh]"
          onChange={onChange}
          plugins={plugins}
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
