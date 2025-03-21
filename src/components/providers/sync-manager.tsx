/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDebounce } from "@/hooks/useDebounce";
import api from "@/lib/api";
import db, { Attachment } from "@/lib/db";
import { noteSchema } from "@shared/schema";
import { IndexableType } from "dexie";
import { useCallback, useEffect, useRef } from "react";

type Syncable = Record<
  string,
  Partial<{
    parse: (i: any) => any;
    serialize: (i: any) => any;
  }>
>;

const syncInterval = 60000;
const syncable: Syncable = {
  notes: {
    parse: noteSchema.parse,
  },
  attachments: {
    parse: (item: Attachment) => {
      // decode data from base64 to blob
      const data = new Blob([Buffer.from(item.data, "base64")], {
        type: item.type,
      });
      return { ...item, data };
    },
    serialize: async (item: Attachment) => {
      // encode data to base64
      const data = Buffer.from(await item.data.arrayBuffer());
      return { ...item, data: data.toString("base64") };
    },
  },
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
        const remoteData = remote.data.map((i) => {
          const parser = syncable[name].parse;
          return parser ? parser(i) : i;
        });
        await db.table(name).bulkPut(remoteData);

        // Apply changes to remote
        const localData = await db
          .table(name)
          .where("updated")
          .above(lastSync)
          .toArray();
        const serialized = await Promise.all(
          localData.map(async (i) => {
            return Promise.resolve(syncable[name].serialize?.(i) || i);
          })
        );

        if (serialized.length > 0) {
          await api.sync.$post({
            json: { name: name as never, data: serialized },
          });
        }

        // Update last sync
        await db._meta.put({ name, lastSync: now });
      }
    } catch (err) {
      console.error(err);
    }

    syncRef.current = false;
  }, 300);

  const onUpdate = useCallback(async (name: string, data: unknown) => {
    const serialized = await Promise.resolve(
      syncable[name].serialize?.(data) || data
    );
    await api.sync.$post({
      json: { name: name as never, data: [serialized] },
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(onSync, syncInterval);
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
