import { cn } from "@/lib/utils";
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
        "bg-background md:bg-surface-container-high relative z-[1001] flex h-12 items-center overflow-hidden md:rounded-full md:pl-4",
        className
      )}
    >
      <AppbarButton
        className="md:hidden"
        onClick={() => sidebarStore.setState({ open: true })}
      >
        <MdMenu className="size-6" />
      </AppbarButton>

      <MdSearch
        className="pointer-events-none mr-2 hidden opacity-50 transition-opacity peer-focus-visible:opacity-80 md:block"
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
        "text-on-surface h-full w-14 rounded-none focus-visible:ring-0",
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
    <input
      placeholder="Search..."
      className="h-12 flex-1 border-0 pr-0 pl-0 outline-0 focus-visible:ring-0 dark:bg-transparent"
      defaultValue={query || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
