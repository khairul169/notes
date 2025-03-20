import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { MdMenu, MdSearch } from "react-icons/md";
import { Button } from "../ui/button";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useDebounce } from "@/hooks/useDebounce";
import { sidebarStore } from "./sidebar";
import { createStore, useStore } from "zustand";
import { useEffect } from "react";

type AppbarStore = {
  actions: React.ReactNode;
};

const appbarStore = createStore<AppbarStore>(() => ({
  actions: null,
}));

export default function Appbar({ className }: { className?: string }) {
  const actions = useStore(appbarStore, (i) => i.actions);

  return (
    <div
      className={cn(
        "flex items-center bg-surface-container-low md:bg-surface-container-high overflow-hidden h-12 md:rounded-full md:pl-4",
        className
      )}
    >
      <AppbarButton
        className="md:hidden"
        onClick={() => sidebarStore.setState({ open: true })}
      >
        <MdMenu className="size-5" />
      </AppbarButton>

      <MdSearch
        className="hidden md:block mr-2 pointer-events-none opacity-50 peer-focus-visible:opacity-80 transition-opacity"
        size={24}
      />

      <SearchBar />

      {actions}
    </div>
  );
}

export function AppbarButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "rounded-none h-full w-14 text-on-surface focus-visible:ring-0",
        className
      )}
      variant="ghost"
      {...props}
    />
  );
}

export function AppbarActions({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    appbarStore.setState({ actions: children });
    return () => {
      appbarStore.setState({ actions: null });
    };
  }, [children]);

  return null;
}

const SearchBar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const query = params.get("query");

  const onChange = useDebounce((text: string) => {
    if (!text?.length) {
      return;
    }

    if (pathname !== "/search") {
      return navigate(`/search?query=${text}`);
    }

    setParams((prev) => {
      prev.set("query", text);
      return prev;
    });
  }, 300);

  return (
    <Input
      placeholder="Search..."
      className="flex-1 focus-visible:ring-0 dark:bg-transparent border-0 h-12 pl-0 pr-0"
      defaultValue={query || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
