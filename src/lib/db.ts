import Dexie, { type EntityTable } from "dexie";
import FullTextSearch from "./fts";

export type KeyVal = {
  key: string;
  value: unknown;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

type Tables = {
  data: EntityTable<KeyVal, "key">;
  notes: EntityTable<Note, "id">;
};

const db = new Dexie("db") as Dexie & Tables;

db.version(1).stores({
  data: "key",
  notes: "id, tags, createdAt, updatedAt, deletedAt",
});

const fts = new FullTextSearch<keyof Tables>(db);
fts.setupTable("notes", "id", "content");

export { fts };
export default db;
