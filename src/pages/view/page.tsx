import MarkdownEditor, {
  MarkdownEditorRef,
} from "@/components/ui/markdown-editor";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@/hooks/useQuery";
import db from "@/lib/db";
import { getTags, getTitle } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { useParams } from "react-router";
import { AlertCircle, Loader2 } from "lucide-react";
import { AppbarActions, AppbarButton } from "@/components/widgets/appbar";
import { MdDeleteOutline, MdMoreVert } from "react-icons/md";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Note } from "@shared/schema";
import { useLiveQuery } from "dexie-react-hooks";

export default function ViewNotePage() {
  const ref = useRef<MarkdownEditorRef>(null!);
  const curVersion = useRef(new Date(0));
  const { id } = useParams();
  const lastUpdate = useLiveQuery(
    () => db.notes.get(id!).then((i) => i?.updatedAt),
    [id]
  );

  const { data, loading, error, refetch } = useQuery(async () => {
    const data = await db.notes.get(id!);
    if (!data) {
      throw new Error("Note not found");
    }

    curVersion.current = data.updatedAt;
    ref.current?.setMarkdown(data.content);
    setTimeout(
      () => ref.current.focus(undefined, { defaultSelection: "rootStart" }),
      100
    );
    return data;
  }, [id]);

  useEffect(() => {
    if (lastUpdate && curVersion.current < lastUpdate) {
      curVersion.current = lastUpdate;
      refetch();
    }
  }, [lastUpdate, refetch]);

  const onChange = useDebounce((content: string) => {
    if (!data) {
      return;
    }

    const updatedAt = new Date();
    curVersion.current = updatedAt;

    db.notes.update(id!, {
      title: getTitle(content) || "Untitled",
      content,
      tags: getTags(content),
      updatedAt,
    });
  }, 500);

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

      <div className="flex flex-1 flex-col overflow-hidden p-4">
        <DeletedAlert data={data} refetch={refetch} />
        <MarkdownEditor
          ref={ref}
          markdown={data?.content || ""}
          className="scrollable flex-1 overflow-y-auto"
          contentEditableClassName="min-h-[50vh]"
          onChange={onChange}
        />

        <p className="mt-2 text-xs">
          Last Update: {lastUpdate?.toLocaleString() || "-"}
        </p>
      </div>
    </>
  );
}

const Actions = ({
  data,
  refetch,
}: {
  data?: Note | null;
  refetch: () => void;
}) => {
  const onDelete = async () => {
    if (
      !data?.id ||
      !window.confirm("Are you sure you want to delete this note?")
    ) {
      return;
    }

    // Mark note as deleted
    await db.notes.update(data.id, {
      updatedAt: new Date(),
      deletedAt: new Date(),
    });
    refetch();
  };

  return (
    <AppbarActions>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <AppbarButton>
            <MdMoreVert className="size-5" />
          </AppbarButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" className="mr-4">
          <DropdownMenuItem onClick={onDelete}>
            <MdDeleteOutline /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </AppbarActions>
  );
};

const DeletedAlert = ({
  data,
  refetch,
}: {
  data?: Note | null;
  refetch: () => void;
}) => {
  const onRestore = async () => {
    await db.notes.update(data!.id, { updatedAt: new Date(), deletedAt: null });
    refetch();
  };

  if (!data?.deletedAt) {
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
