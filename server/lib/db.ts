import { Database } from "bun:sqlite";

const db = new Database("./database.db");

const schema = `
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    created INT NOT NULL,
    updated INT NOT NULL,
    deleted INT,
    timestamp INT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    noteId TEXT NOT NULL,
    type TEXT NOT NULL,
    data TEXT NOT NULL,
    created INT NOT NULL,
    updated INT NOT NULL,
    deleted INT,
    timestamp INT NOT NULL
  );
`;

export function initDb() {
  db.run(schema);
}

export function inArray(arr: string[]) {
  return `IN (${arr.map(() => "?").join(", ")})`;
}

export function upsert(
  table: string,
  item: Record<string, unknown>,
  uniqueKeys: string | string[] = "id"
) {
  const keys = Object.keys(item);
  const values = keys.reduce((obj, key) => {
    let value = item[key];

    if (typeof value === "object") {
      value = JSON.stringify(value);
    }
    if (value instanceof Date) {
      value = value.toISOString();
    }

    return { ...obj, ["$" + key]: value };
  }, {});
  const binds = keys.map((key) => "$" + key).join(", ");
  const conflictKeys = Array.isArray(uniqueKeys)
    ? uniqueKeys.join(", ")
    : uniqueKeys;
  const updateBinds = keys
    .filter((key) => {
      return Array.isArray(uniqueKeys)
        ? !uniqueKeys.includes(key)
        : key !== uniqueKeys;
    })
    .map((key) => key + " = $" + key)
    .join(", ");

  return db
    .query(
      `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${binds})
       ON CONFLICT(${conflictKeys}) DO UPDATE SET ${updateBinds}`
    )
    .run(values as never);
}

const isJsonRegex = /^(\{|\[).*(\}|\])$/;

export function parse(data: unknown) {
  const keys = Object.keys(data as never);
  return keys.reduce((obj, key) => {
    let value = (data as never)[key] as unknown;

    if (value instanceof Date) {
      value = value.toISOString();
    }
    if (typeof value === "string" && isJsonRegex.test(value)) {
      value = JSON.parse(value);
    }
    if (value === "null") {
      value = null;
    }

    return { ...obj, [key]: value };
  }, {});
}

export default Object.assign(db, { upsert, parse });
