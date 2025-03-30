import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import RippleButton from "./ripple-button";

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40 aria-invalid:border-error inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        elevated:
          "bg-surface-container-low text-primary shadow-xs hover:shadow-sm",
        filled:
          "bg-primary text-on-primary hover:bg-primary/90 hover:shadow-xs",
        tonal:
          "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90 hover:shadow-xs",
        error: "bg-error text-on-error hover:shadow-xs",
        ghost: "text-primary bg-transparent",
        outlined:
          "border-outline text-primary hover:bg-surface-container-high border",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 px-6 has-[>svg]:px-4",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "elevated",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof RippleButton> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  return (
    <RippleButton
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      wrapperClassName="justify-center"
      {...props}
    />
  );
}

export { Button, buttonVariants };
