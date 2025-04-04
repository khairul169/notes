/* eslint-disable @typescript-eslint/no-explicit-any */
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import db, { inArray } from "../lib/db";
import Storage from "../lib/storage";

const syncable = ["notes", "attachments"] as const;

const getSyncQuery = z.object({
  name: z.enum(syncable), // name
  t: z.coerce.number().optional(), // timestamp
  limit: z.coerce.number().optional(), // limit
  page: z.coerce.number().optional(), // page
});

const syncableSchema = z.object({
  id: z.string(),
  updated: z.number(),
});

type Syncable = z.infer<typeof syncableSchema>;

const syncSchema = z.object({
  name: z.enum(syncable),
  data: z.array(z.unknown()),
});

const sync = new Hono()
  /**
   * Get items
   */
  .get("/", zValidator("query", getSyncQuery), async (c) => {
    const params = c.req.valid("query");
    const { name: table, t: timestamp = 0, limit = 5, page = 1 } = params;
    const offset = Math.max(page - 1, 0) * limit;

    const { count } = db
      .query(
        `SELECT COUNT(*) as count FROM ${table}
         WHERE timestamp > $timestamp`
      )
      .get({ $timestamp: timestamp }) as { count: number };
    const next = count > offset + limit ? page + 1 : null;

    // Empty
    if (!count) {
      return c.json({
        name: table,
        count,
        data: [],
        timestamp: Date.now(),
        next: null,
      });
    }

    const data = db
      .query(
        `SELECT * FROM ${table}
         WHERE timestamp > $timestamp
         ORDER BY timestamp ASC
         LIMIT $limit OFFSET $offset`
      )
      .all({ $timestamp: timestamp, $limit: limit, $offset: offset })
      .map(db.parse) as { id: string; timestamp: number }[];

    // Retrieve attachments data
    if (table === "attachments") {
      const storage = new Storage();

      for (const idx in data) {
        const blob = await storage.get(data[idx].id);
        (data[idx] as any).data = Buffer.from(blob).toString("base64");
      }
    }

    return c.json({ name: table, count, data, timestamp: Date.now(), next });
  })

  /**
   * Sync data
   */
  .post("/", zValidator("json", syncSchema), async (c) => {
    const body = c.req.valid("json");
    const items = body.data as Syncable[];
    const { name: table } = body;

    // Validate items
    syncableSchema.array().parse(items);

    // Fetch existing items
    const itemIds = items.map((i) => i.id);
    const exists = db
      .query(`SELECT id, updated FROM ${table} WHERE id ${inArray(itemIds)}`)
      .all(...itemIds) as Syncable[];
    const now = Date.now();
    const storage = new Storage();

    for (const item of items) {
      // Skip if timestamp is in the future
      if (item.updated > now) {
        return;
      }

      // Skip if the item is older than the one in the database
      const exist = exists.find((i) => i.id === item.id);
      if (exist && exist.updated > item.updated) {
        return;
      }

      // Store file to storage
      if (table === "attachments" && "data" in item) {
        try {
          const buffer = Buffer.from(item.data as string, "base64");
          await storage.put(item.id, buffer);
          delete item.data;
        } catch (err) {
          console.error(err);
          throw new Error("Failed to store attachment.");
        }
      }

      // Insert or update item
      db.upsert(table, { ...item, timestamp: now });
    }

    return c.json(true);
  })

  /**
   * Clear all data
   */
  .post("/clear", async (c) => {
    for (const table of syncable) {
      db.exec(`DELETE FROM ${table}`);
    }
    return c.json(true);
  });

export default sync;
