import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppbarActions, AppbarButton } from "@/components/widgets/appbar";
import { MdDeleteOutline, MdMoreVert } from "react-icons/md";
import { deleteNote } from "../lib/services";
import { Note } from "@/lib/db";

const Actions = ({
  data,
  refetch,
}: {
  data?: Note | null;
  refetch: () => void;
}) => {
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
          <DropdownMenuItem onClick={onDelete}>
            <MdDeleteOutline /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </AppbarActions>
  );
};

export default Actions;
