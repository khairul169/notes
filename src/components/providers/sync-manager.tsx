/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAPI } from "@/hooks/useAPI";
import { useDebounce } from "@/hooks/useDebounce";
import db, { Attachment } from "@/lib/db";
import settingsStore from "@/stores/settings.store";
import { noteSchema } from "@shared/schema";
import { IndexableType } from "dexie";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "zustand";

type Syncable = Record<
  string,
  Partial<{
    parse: (i: any) => any;
    serialize: (i: any) => any;
    limit: number;
  }>
>;

const syncInterval = 60000;
const syncable: Syncable = {
  notes: {
    parse: noteSchema.parse,
    limit: 10,
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
    limit: 1,
  },
};

async function pushToRemote(
  name: string,
  lastSync: number,
  api: ReturnType<typeof useAPI>
) {
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
    const res = await api.sync.$post({
      json: { name: name as never, data: serialized },
    });
    if (!res.ok) {
      throw new Error("Failed to sync: " + res.statusText);
    }
  }
}

async function pullFromRemote(
  name: string,
  lastSync: number,
  api: ReturnType<typeof useAPI>
) {
  const limit = syncable[name].limit || 10;
  let curPage = 1;
  let timestamp = 0;

  while (curPage > 0) {
    const res = await api.sync
      .$get({
        query: {
          name,
          t: lastSync.toString(),
          limit: String(limit),
          page: String(curPage),
        },
      })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to sync: " + res.statusText);
        }
        return res.json();
      });

    curPage = res.next != null ? res.next : 0;

    const remoteData = res.data.map((i) => {
      const parser = syncable[name].parse;
      return parser ? parser(i) : i;
    });
    await db.table(name).bulkPut(remoteData);
    timestamp = res.timestamp;
  }

  return timestamp;
}

export default function SyncManager() {
  const syncRef = useRef(false);
  const settings = useStore(settingsStore, (state) => state.sync);
  const api = useAPI();
  const [isSyncing, setIsSyncing] = useState(false);

  const onSync = useDebounce(
    useCallback(async () => {
      if (!navigator.onLine || syncRef.current || !settings.enabled) return;

      syncRef.current = true;
      setIsSyncing(true);

      try {
        for (const name of Object.keys(syncable)) {
          const lastSync = await db._meta
            .where({ name })
            .first()
            .then((i) => i?.lastSync || 0);

          // Apply changes to remote
          await pushToRemote(name, lastSync, api);

          // Apply changes from remote
          const timestamp = await pullFromRemote(name, lastSync, api);

          // Update last sync
          await db._meta.put({ name, lastSync: timestamp });
        }
      } catch (err) {
        console.error(err);
      }

      syncRef.current = false;
      setIsSyncing(false);
    }, [settings, setIsSyncing, api]),
    300
  );

  const onUpdate = useCallback(
    async (name: string, data: unknown) => {
      if (!navigator.onLine || syncRef.current || !settings.enabled) return;

      syncRef.current = true;
      setIsSyncing(true);

      const serialized = await Promise.resolve(
        syncable[name].serialize?.(data) || data
      );
      await api.sync.$post({
        json: { name: name as never, data: [serialized] },
      });

      syncRef.current = false;
      setIsSyncing(false);
    },
    [settings, api]
  );

  useEffect(() => {
    if (!settings.enabled) {
      return;
    }

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
  }, [settings, api, onSync, onUpdate]);

  if (isSyncing) {
    return (
      <div className="fixed top-2 right-2">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  return null;
}
