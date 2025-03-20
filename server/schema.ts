import { z } from "zod";

export const getSyncQuery = z.object({
  name: z.string(),
  timestamp: z.coerce.date().nullish(),
});

export const syncableSchema = z.object({
  id: z.string(),
  updatedAt: z.coerce.date(),
});

export const syncSchema = z.object({
  name: z.string(),
  data: z.array(z.unknown()),
});

export type SyncSchema = z.infer<typeof syncSchema>;
