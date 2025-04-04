import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppbarActions, AppbarButton } from "@/components/widgets/appbar";
import { MdDeleteOutline, MdMoreVert, MdOutlinePushPin } from "react-icons/md";
import { deleteNote, getNote, updateNote } from "../lib/services";
import { Note } from "@/lib/db";
import { toast } from "sonner";
import { useLiveQuery } from "dexie-react-hooks";

const Actions = ({
  data,
  refetch,
}: {
  data?: Note | null;
  refetch: () => void;
}) => {
  const pinned = useLiveQuery(
    () => getNote(data!.id).then((i) => i?.pinned > 0),
    [data!.id]
  );

  const onTogglePinned = async () => {
    try {
      await updateNote(data!.id, { pinned: pinned ? 0 : 1 });
      toast.success(`Note ${pinned ? "unpinned" : "pinned"}.`);
    } catch (err) {
      toast.error((err as Error).message || "An error occured.");
    }
  };

  const onDelete = async () => {
    if (
      data?.id &&
      window.confirm("Are you sure you want to delete this note?")
    ) {
      await deleteNote(data.id);
      refetch();
    }
  };

  return (
    <AppbarActions>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <AppbarButton>
            <MdMoreVert className="size-6" />
          </AppbarButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" className="mr-4">
          <DropdownMenuItem onClick={onTogglePinned}>
            <MdOutlinePushPin /> {pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete}>
            <MdDeleteOutline /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </AppbarActions>
  );
};

export default Actions;
