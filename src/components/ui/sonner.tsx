import settingsStore from "@/stores/settings.store";
import { Toaster as Sonner, ToasterProps } from "sonner";
import { useStore } from "zustand";

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useStore(settingsStore, (i) => i.theme);

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--md-sys-color-surface-container)",
          "--normal-text": "var(--md-sys-color-on-surface)",
          "--normal-border": "none",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
