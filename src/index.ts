import {Hono} from 'hono';
import {bearerAuth} from 'hono/bearer-auth';
import {OpenAI} from './openai';

type Bindings = {
  TOKEN: string;
  OPENAI_API_KEY: string;
};

const app = new Hono<{Bindings: Bindings}>();
const ai = new OpenAI();

// health check
app.get('/health', c => c.text('OK'));

app.post('/ai/*', async (c, next) => {
  const token = c.env.TOKEN;
  const bearer = bearerAuth({token});

  return bearer(c, next);
});
app.post('/ai/query', async c => {
  const API_KEY = c.env.OPENAI_API_KEY;
  const body = await c.req.text();
  ai.setupAPIKey(API_KEY);

  const message = await ai.ask(body);

  return c.json({message: message});
});

export default app;
