import { hc } from "hono/client";
import type { APIType } from "@server/main";

const api = hc<APIType>("/api");

export default api;
