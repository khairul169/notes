import settingsStore from "@/stores/settings.store";
import { useStore } from "zustand";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { Switch } from "../ui/switch";
import { useEffect } from "react";

export default function ThemeSwitcher() {
  const theme = useStore(settingsStore, (i) => i.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <Switch
      thumb="[&_svg]:opacity-100"
      icon={theme === "dark" ? <MdDarkMode /> : <MdLightMode />}
      checked={theme === "dark"}
      onCheckedChange={(checked) => {
        settingsStore.setState({ theme: checked ? "dark" : "light" });
      }}
    />
  );
}
