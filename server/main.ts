import { Hono } from "hono";
import api from "./api";
import { initDb } from "./lib/db";

const app = new Hono()
  //
  .route("/api", api);

initDb();

export type APIType = typeof api;
export default app;
