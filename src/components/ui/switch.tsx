import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer bg-surface-container-highest focus-visible:border-ring focus-visible:ring-outline border-outline inline-flex h-8 w-13 shrink-0 cursor-pointer items-center rounded-full border-[2px] transition-all duration-300 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:ring-primary",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-outline pointer-events-none flex size-6 translate-x-[2px] items-center justify-center rounded-full ring-0 transition-all duration-300 [&_svg]:opacity-0",
          "data-[state=checked]:bg-on-primary data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=checked]:[&_svg]:opacity-100"
        )}
      >
        <CheckIcon className="size-4 transition-opacity duration-300" />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

export { Switch };
