import { z } from "zod";

export const noteSchema = z.object({
  id: z.string().min(3),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()).default([]),
  created: z.number(),
  updated: z.number(),
  deleted: z.number().nullish(),
});

export type Note = z.infer<typeof noteSchema>;
