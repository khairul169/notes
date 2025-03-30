import { hc } from "hono/client";
import type { APIType } from "@server/main";
import { useMemo } from "react";
import settingsStore from "@/stores/settings.store";
import { useStore } from "zustand";

const initialURL = import.meta.env.VITE_API_URL || "/api";

export function useAPI() {
  const sync = useStore(settingsStore, (i) => i.sync);

  const client = useMemo(() => {
    return hc<APIType>(sync.url ? sync.url + "/api" : initialURL, {
      headers() {
        const token = sync.token
          ? Buffer.from(sync.token).toString("base64")
          : "";

        return {
          Authorization: token ? `Bearer ${token}` : "",
        };
      },
    });
  }, [sync]);

  return client;
}
