import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import db from "../lib/db";

export const getSyncQuery = z.object({
  n: z.enum(["notes"]),
  t: z.coerce.number().nullish(),
});

export const syncableSchema = z.object({
  id: z.string(),
  updatedAt: z.coerce.date(),
});

export type Syncable = z.infer<typeof syncableSchema>;

export const syncSchema = z.object({
  name: z.enum(["notes"]),
  data: z.array(z.unknown()),
});

const sync = new Hono()
  //
  .get("/", zValidator("query", getSyncQuery), (c) => {
    const query = c.req.valid("query");
    const name = query.n;

    const timestamp = new Date(query.t || 0).toISOString();
    const data = db
      .query(`SELECT * FROM ${name} WHERE updatedAt > $timestamp`)
      .all({ $timestamp: timestamp })
      .map(db.parse) as Syncable[];
    const last = db
      .query(`SELECT updatedAt FROM ${name} ORDER BY updatedAt DESC LIMIT 1`)
      .get() as Syncable;

    return c.json({
      name,
      timestamp: new Date(last?.updatedAt),
      data,
    });
  })

  //
  .post("/", zValidator("json", syncSchema), (c) => {
    const body = c.req.valid("json");
    const items = body.data as Syncable[];

    items.forEach((item) => {
      const { success } = syncableSchema.safeParse(item);
      if (!success) {
        return;
      }
      const data = item as z.infer<typeof syncableSchema>;
      db.upsert(body.name, data);
    });

    return c.json(true);
  });

export default sync;
