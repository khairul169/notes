import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import db, { inArray } from "../lib/db";

const syncable = ["notes", "attachments"] as const;

const getSyncQuery = z.object({
  n: z.enum(syncable), // name
  t: z.coerce.number().nullish(), // timestamp
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
  .get("/", zValidator("query", getSyncQuery), (c) => {
    const params = c.req.valid("query");
    const { n: name, t: timestamp = 0 } = params;

    const sql = `
      SELECT * FROM ${name}
      WHERE "timestamp" > $timestamp
      ${!timestamp ? " AND deleted IS NULL" : ""}
    `;

    const data = db
      .query(sql)
      .all({ $timestamp: timestamp })
      .map(db.parse) as Syncable[];

    return c.json({ name, data, timestamp: Date.now() });
  })

  /**
   * Sync data
   */
  .post("/", zValidator("json", syncSchema), (c) => {
    const body = c.req.valid("json");
    const items = body.data as Syncable[];
    const { name } = body;

    // Validate items
    syncableSchema.array().parse(items);

    // Fetch existing items
    const itemIds = items.map((i) => i.id);
    const exists = db
      .query(`SELECT id, updated FROM ${name} WHERE id ${inArray(itemIds)}`)
      .all(...itemIds) as Syncable[];
    const now = Date.now();

    items.forEach((item) => {
      // Skip if timestamp is in the future
      if (item.updated > now) {
        return;
      }

      // Skip if the item is older than the one in the database
      const exist = exists.find((i) => i.id === item.id);
      if (exist && exist.updated > item.updated) {
        return;
      }

      // Insert or update item
      db.upsert(body.name, { ...item, timestamp: now });
    });

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
