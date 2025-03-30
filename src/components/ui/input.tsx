import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { EyeIcon, EyeOffIcon } from "lucide-react";

type InputProps = React.ComponentProps<"input"> & {
  label?: string;
  inputClassName?: string;
};

function Input({
  className,
  type,
  label,
  inputClassName,
  id,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div
      className={cn(
        "bg-surface-container-high relative space-y-1 rounded-t-md",
        "after:bg-on-surface-variant focus-within:after:bg-primary after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:transition-all focus-within:after:h-[2px]",
        className
      )}
    >
      <input
        {...props}
        id={id}
        type={type === "password" && showPassword ? "text" : type}
        data-slot="input"
        placeholder={" "}
        className={cn(
          "placeholder:text-on-surface-variant selection:bg-primary selection:text-on-primary peer text-on-surface flex h-[56px] w-full min-w-0 px-3 pt-3 pb-1 text-base transition-colors outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          inputClassName
        )}
      />

      {label ? (
        <label
          htmlFor={id}
          className={cn(
            "text-on-surface-variant pointer-events-none absolute top-1 left-3 origin-[0] scale-75 text-sm transition-all",
            "peer-focus:text-primary peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:top-1 peer-focus:scale-75"
          )}
        >
          {label}
          {props.required && <span className="text-error ml-0.5">*</span>}
        </label>
      ) : null}

      {type === "password" && (
        <Button
          variant="ghost"
          className="[&_svg]:text-on-surface absolute top-[9px] right-2 size-10 px-0 [&_svg]:!size-5"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </Button>
      )}
    </div>
  );
}

export { Input };
