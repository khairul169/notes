import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getSyncQuery, syncableSchema, syncSchema } from "./schema";
import fs from "fs";
import { z } from "zod";

const dbPath = "./database.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: Record<string, any[]> = fs.existsSync(dbPath)
  ? JSON.parse(fs.readFileSync(dbPath, "utf-8"))
  : { notes: [] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getLastUpdate = (items: any[]) => {
  return items.reduce((acc, item) => {
    const date = new Date(item.updatedAt);
    if (date > acc) {
      return date;
    }
    return acc;
  }, new Date(0));
};

const lastUpdate: Record<string, Date> = Object.keys(db).reduce(
  (acc, name) => ({
    ...acc,
    [name]: getLastUpdate(db[name]),
  }),
  {}
);

const api = new Hono()
  //
  .get("/sync", zValidator("query", getSyncQuery), (c) => {
    const query = c.req.valid("query");
    const name = query.name;

    const data = db[name].filter((i) => {
      if (query.timestamp) {
        return i.updatedAt > query.timestamp;
      }
      return true;
    });

    return c.json({
      name,
      timestamp: lastUpdate[name],
      data,
    });
  })

  //
  .post("/sync", zValidator("json", syncSchema), (c) => {
    const { name, data: items } = c.req.valid("json");

    const table = [...db[name]];

    items.forEach((item) => {
      const { success } = syncableSchema.safeParse(item);
      if (!success) {
        return;
      }
      const data = item as z.infer<typeof syncableSchema>;

      const idx = table.findIndex((i) => i.id === data.id);
      const timestamp = new Date(data.updatedAt);

      if (idx === -1) {
        table.push(data);
      } else if (timestamp > new Date(table[idx].updatedAt)) {
        table[idx] = data;
      }
      if (!lastUpdate[name] || timestamp > lastUpdate[name]) {
        lastUpdate[name] = timestamp;
      }
    });

    db[name] = table;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    return c.json(true);
  });

export type APIType = typeof api;
export default api;
