import { hc } from "hono/client";
import type { APIType } from "@server/main";

const api = hc<APIType>(import.meta.env.VITE_API_URL || "/api");

export default api;
