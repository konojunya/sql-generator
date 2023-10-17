import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { OpenAI } from "./openai";

const app = new Hono();
const ai = new OpenAI();

// health check
app.get("/health", (c) => c.text("OK"));

app.post("/ai/*", async (c, next) => {
  // TODO: want to add a type to Hono's c.env.
  const bearer = bearerAuth({ token: c.env!["TOKEN"] as string });
  return bearer(c, next);
});
app.post("/ai/query", async (c) => {
  // TODO: want to add a type to Hono's c.env.
  const apiKey = c.env!["OPENAI_API_KEY"] as string;
  const body = await c.req.text();
  const message = await ai.createCompletion(apiKey, body);

  return c.json({ message: message });
});

export default app;
