import { useDebounce } from "@/hooks/useDebounce";
import api from "@/lib/api";
import db from "@/lib/db";
import { noteSchema } from "@shared/schema";
import { IndexableType } from "dexie";
// import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useEffect, useRef } from "react";
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
        const lastSync = await db._meta
          .where({ name })
          .first()
          .then((i) => i?.lastSync || 0);
        const now = Date.now();

        const remote = await api.sync
          .$get({ query: { n: name as never, t: lastSync.toString() } })
          .then((i) => i.json());

        // Apply changes from remote
        const remoteData = remote.data.map((i) => syncable[name].parse(i));
        await db.table(name).bulkPut(remoteData);

        // Apply changes to remote
        const localData = await db
          .table(name)
          .where("updated")
          .above(lastSync)
          .toArray();
        await api.sync.$post({
          json: { name: name as never, data: localData },
        });

        // Update last sync
        await db._meta.put({ name, lastSync: now });
      }
    } catch (err) {
      console.error(err);
    }

    syncRef.current = false;
  }, 300);

  const onUpdate = useCallback(async (name: string, data: unknown) => {
    await api.sync.$post({
      json: { name: name as never, data: [data] },
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(onSync, syncInterval);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listeners: Record<string, any>[] = [];

    for (const name of Object.keys(syncable)) {
      const table = db.table(name);

      const createFn = (_: IndexableType, obj: unknown) => {
        onUpdate(name, obj);
      };
      const updateFn = (changes: object, _key: IndexableType, obj: object) => {
        onUpdate(name, { ...obj, ...changes });
      };

      table.hook("creating", createFn);
      table.hook("updating", updateFn);
      listeners.push({ table: name, creating: createFn, updating: updateFn });
    }

    // Initial sync
    onSync();

    return () => {
      for (const listener of listeners) {
        const table = db.table(listener.table);
        table.hook("creating").unsubscribe(listener.creating);
        table.hook("updating").unsubscribe(listener.updating);
      }
      clearInterval(timer);
    };
  }, [onSync, onUpdate]);

  return null;
}
