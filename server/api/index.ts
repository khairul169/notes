import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import sync from "./sync";

const { API_SECRET_KEY } = process.env;

const api = new Hono()
  // Middlewares
  .use(cors())
  .use((c, next) => {
    try {
      const authorization = c.req.header("Authorization");
      const bearerToken = authorization?.split(" ")[1] || "";

      if (
        API_SECRET_KEY &&
        Buffer.from(bearerToken, "base64").toString() !== API_SECRET_KEY
      ) {
        throw new Error('Invalid "Authorization" header');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    return next();
  })

  // Routes
  .get("/", (c) => c.text("OK"))
  .route("/sync", sync);

export default api;
