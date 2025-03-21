import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ComponentProps } from "react";

export default function Loader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-1 items-center justify-center", className)}
      {...props}
    >
      <Loader2 className="size-10 animate-spin" />
    </div>
  );
}
