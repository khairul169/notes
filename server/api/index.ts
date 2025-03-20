import { Hono } from "hono";
import sync from "./sync";

const api = new Hono()
  //
  .route("/sync", sync);

export default api;
