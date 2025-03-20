import { useDebounce } from "@/hooks/useDebounce";
import api from "@/lib/api";
import db from "@/lib/db";
import { noteSchema } from "@shared/schema";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useRef } from "react";
import { z } from "zod";

const syncInterval = 60000;
const syncable: Record<string, z.ZodSchema> = {
  notes: noteSchema,
};

export default function SyncManager() {
  const syncRef = useRef(false);

  const onSync = useDebounce(async () => {
    if (syncRef.current) return;

    syncRef.current = true;

    try {
      for (const name of Object.keys(syncable)) {
        const lastLocal = await db
          .table(name)
          .orderBy("updatedAt")
          .reverse()
          .first();
        const timestamp = new Date(lastLocal?.updatedAt || 0).getTime();
        const remote = await api.sync
          .$get({ query: { n: name, t: timestamp.toString() } })
          .then((i) => i.json());

        const localData = await db
          .table(name)
          .where("updatedAt")
          .above(new Date(remote.timestamp || 0))
          .toArray();

        // Send local data to remote
        await api.sync.$post({
          json: { name: name as never, data: localData },
        });

        // Store remote data
        const remoteData = remote.data.map((i) => syncable[name].parse(i));
        await db.table(name).bulkPut(remoteData);
      }
    } catch (err) {
      console.error(err);
    }

    syncRef.current = false;
  }, 300);

  useEffect(() => {
    const timer = setInterval(onSync, syncInterval);
    return () => {
      clearInterval(timer);
    };
  }, [onSync]);

  useLiveQuery(() => {
    const queries = Object.keys(syncable).map((key) =>
      db.table(key).orderBy("updatedAt").reverse().first()
    );
    onSync();
    return Promise.all(queries);
  });

  return null;
}
