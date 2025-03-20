import { hc } from "hono/client";
import type { APIType } from "@server/api";

const api = hc<APIType>("/api");

export default api;
