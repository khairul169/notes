import Dexie, { type EntityTable } from "dexie";
import FullTextSearch from "./fts";

export type KeyVal = {
  key: string;
  value: unknown;
};

export type TableMeta = {
  name: string;
  lastSync: number;
};

export type Note = {
  id: string;
  title: string;
  content: unknown;
  summary: string;
  tags: string[];
  created: number;
  updated: number;
  deleted?: number | null;
};

export type Attachment = {
  id: string;
  noteId: string;
  name: string;
  type: string;
  size: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  created: number;
  updated: number;
  deleted?: number | null;
};

export type Tables = {
  _data: EntityTable<KeyVal, "key">;
  _meta: EntityTable<TableMeta, "name">;

  notes: EntityTable<Note, "id">;
  attachments: EntityTable<Attachment, "id">;
};

const db = new Dexie("db") as Dexie & Tables;

db.version(1).stores({
  _data: "key",
  _meta: "name",

  notes: "id, tags, created, updated, deleted",
  attachments: "id, noteId, type, created, updated, deleted",
});

const fts = new FullTextSearch<Tables>(db);

fts.addTable("notes", "id", (i) => {
  return [i.title, i.summary, ...i.tags.map((t: string) => `#${t}`)].join(" ");
});

export { fts };
export default db;
