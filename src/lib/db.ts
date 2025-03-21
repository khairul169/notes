import Dexie, { type EntityTable } from "dexie";
import FullTextSearch from "./fts";
import { Note } from "@shared/schema";

export type KeyVal = {
  key: string;
  value: unknown;
};

export type TableMeta = {
  name: string;
  lastSync: number;
};

export type Attachment = {
  id: string;
  noteId: string;
  type: string;
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

const fts = new FullTextSearch<keyof Tables>(db);
fts.addTable("notes", "id", "content");

export { fts };
export default db;
