import api from "@/lib/api";
import db from "@/lib/db";
import { noteSchema } from "@shared/schema";
import { useCallback, useEffect, useRef } from "react";
import { z } from "zod";

const syncable: Record<string, z.ZodSchema> = { notes: noteSchema };

export default function SyncManager() {
  const syncRef = useRef(false);

  const onSync = useCallback(async () => {
    if (syncRef.current) return;

    syncRef.current = true;

    try {
      for (const name of Object.keys(syncable)) {
        const lastLocal = await db
          .table(name)
          .orderBy("updatedAt")
          .reverse()
          .first();
        const timestamp = lastLocal?.updatedAt?.toISOString();
        const remote = await api.sync
          .$get({ query: { name, timestamp } })
          .then((i) => i.json());

        const localData = await db
          .table(name)
          .where("updatedAt")
          .above(new Date(remote.timestamp || 0))
          .toArray();

        // Send local data to remote
        await api.sync.$post({ json: { name, data: localData } });

        // Store remote data
        await db
          .table(name)
          .bulkPut(remote.data.map((i) => syncable[name].parse(i)));
      }
    } catch (err) {
      console.error(err);
    }

    syncRef.current = false;
  }, []);

  useEffect(() => {
    const timer = setInterval(onSync, 10000);
    onSync();
    return () => {
      clearInterval(timer);
    };
  }, [onSync]);

  return null;
}
