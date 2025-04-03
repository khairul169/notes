import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAPI } from "@/hooks/useAPI";
import { useQuery } from "@/hooks/useQuery";
import { useStorageSize } from "@/hooks/useStorageSize";
import db from "@/lib/db";
import { bytesToReadable } from "@/lib/utils";
import settingsStore from "@/stores/settings.store";
import { exportDB, importDB } from "dexie-export-import";
import { useLiveQuery } from "dexie-react-hooks";
import { AlertCircle, CheckIcon, Loader2 } from "lucide-react";
import { useStore } from "zustand";

export default function SettingsPage() {
  const storage = useStorageSize();
  const settings = useStore(settingsStore);
  const api = useAPI();
  const attachmentUsage = useLiveQuery(() =>
    db.attachments.toArray().then((i) => i.reduce((a, b) => a + b.size, 0))
  );

  const onClearData = async () => {
    if (!window.confirm("Are you sure you want to clear all data?")) {
      return;
    }
    for (const table of db.tables) {
      await table.clear();
    }
    if (settings.sync.enabled) {
      await api.sync.clear.$post();
    }
  };

  const onBackup = async () => {
    const blob = await exportDB(db);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "notes-backup.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const onRestore = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }
      await importDB(file);
    };
    input.click();
  };

  const onCleanupAttachment = async () => {
    const attachments = await db.attachments.toArray();
    for (const item of attachments) {
      if (item.deleted) {
        await db.attachments.delete(item.id);
        continue;
      }

      const note = await db.notes.get(item.noteId);
      if (
        !note ||
        note.deleted ||
        !note.content.includes(`attachment://${item.id}`)
      ) {
        await db.attachments.put({ ...item, deleted: Date.now() });
        await db.attachments.delete(item.id);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-4 pb-20 md:p-8">
      <h2 className="text-2xl">Settings</h2>

      <p className="text-primary mt-4 text-sm">Storage</p>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p>Estimated data usage</p>
          <span className="text-xs">{`${bytesToReadable(storage.usage)} / ${bytesToReadable(storage.quota)}`}</span>
        </div>
        <Button variant="outlined" onClick={onClearData}>
          Clear Data
        </Button>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p>Attachments</p>
          <span className="text-xs">{`${bytesToReadable(attachmentUsage)}`}</span>
        </div>
        <Button variant="outlined" onClick={onCleanupAttachment}>
          Cleanup
        </Button>
      </div>
      <div className="grid grid-cols-2">
        <Button
          variant="outlined"
          className="rounded-r-none"
          onClick={onBackup}
        >
          Backup Data
        </Button>
        <Button
          variant="outlined"
          className="-ml-px rounded-l-none"
          onClick={onRestore}
        >
          Restore Data
        </Button>
      </div>

      <p className="text-primary mt-4 text-sm">Data Sync</p>
      <Label className="hover:bg-surface-container-high flex h-12 w-full cursor-pointer items-center justify-between transition-colors">
        Enable data sync
        <Switch
          checked={settings.sync.enabled}
          onCheckedChange={(enabled) => {
            settingsStore.set((state) => {
              state.sync.enabled = enabled;
            });
          }}
        />
      </Label>

      <Input
        label="Server URL"
        defaultValue={settings.sync.url}
        onBlur={(e) => {
          settingsStore.set((state) => {
            state.sync.url = e.target.value;
          });
        }}
      />
      <Input
        label="Secret Key"
        type="password"
        defaultValue={settings.sync.token}
        onBlur={(e) => {
          settingsStore.set((state) => {
            state.sync.token = e.target.value;
          });
        }}
      />
      <APIServerStatus />
    </div>
  );
}

const APIServerStatus = () => {
  const api = useAPI();
  const sync = useStore(settingsStore, (i) => i.sync);

  const status = useQuery(
    async () => {
      const res = await api.index.$get();
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.text();
    },
    [api],
    { enabled: sync.enabled }
  );

  if (!sync.enabled) {
    return null;
  }

  if (status.loading) {
    return (
      <p className="text-outline flex items-center gap-2 text-xs">
        <Loader2 className="size-4 animate-spin" />
        Checking connection...
      </p>
    );
  }

  if (status.error || status.data !== "OK") {
    return (
      <p className="text-error flex items-center gap-2 text-xs">
        <AlertCircle className="size-4" /> Error:{" "}
        {status.error?.message || "Unknown error"}
      </p>
    );
  }

  return (
    <p className="flex items-center gap-2 text-xs text-green-200">
      <CheckIcon className="size-4" /> Connected
    </p>
  );
};
