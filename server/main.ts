import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import api from "./api";
import { initDb } from "./lib/db";
import path from "path";

const app = new Hono()
  //
  .route("/api", api);

initDb();

if (import.meta.env.NODE_ENV === "production") {
  // serve frontend
  app.use("*", serveStatic({ root: path.resolve(process.cwd(), "dist") }));
}

export type APIType = typeof api;

export default {
  port: Number(process.env.PORT || 3000),
  hostname: process.env.HOST || "127.0.0.1",
  fetch: app.fetch,
};
