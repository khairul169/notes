import { cn } from "@/lib/utils";
import React, { MouseEvent, useEffect, useState } from "react";
import { Link } from "react-router";

type RippleButtonProps = React.ComponentProps<"button"> & {
  wrapperClassName?: string;
  rippleClassName?: string;
  duration?: number;
  href?: string;
};

const RippleButton = ({
  className,
  children,
  wrapperClassName,
  rippleClassName,
  duration = 1000,
  onClick,
  href,
  ...props
}: RippleButtonProps) => {
  const [buttonRipples, setButtonRipples] = useState<
    Array<{ x: number; y: number; size: number; key: number }>
  >([]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    createRipple(event);
    onClick?.(event);
  };

  const createRipple = (event: MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = { x, y, size, key: Date.now() };
    setButtonRipples((prevRipples) => [...prevRipples, newRipple]);
  };

  useEffect(() => {
    if (buttonRipples.length > 0) {
      const lastRipple = buttonRipples[buttonRipples.length - 1];
      const timeout = setTimeout(() => {
        setButtonRipples((prevRipples) =>
          prevRipples.filter((ripple) => ripple.key !== lastRipple.key)
        );
      }, duration);
      return () => clearTimeout(timeout);
    }
  }, [buttonRipples, duration]);

  const Comp = href ? Link : "button";

  return (
    <Comp
      className={cn("relative flex cursor-pointer overflow-hidden", className)}
      onClick={handleClick as never}
      to={href!}
      {...(props as object)}
    >
      <div
        className={cn(
          "relative z-10 flex w-full items-center gap-2",
          wrapperClassName
        )}
      >
        {children}
      </div>

      <span className="pointer-events-none absolute inset-0">
        {buttonRipples.map((ripple) => (
          <span
            className={cn(
              "animate-rippling absolute rounded-full bg-white/50 duration-500",
              rippleClassName
            )}
            key={ripple.key}
            style={{
              width: `${ripple.size}px`,
              height: `${ripple.size}px`,
              top: `${ripple.y}px`,
              left: `${ripple.x}px`,
              transform: `scale(0)`,
            }}
          />
        ))}
      </span>
    </Comp>
  );
};

RippleButton.displayName = "RippleButton";

export default RippleButton;
