import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  maxAge: 600,
}));

const BASE = "/make-server-cfa8cb9e";

function makeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s.slice(0, 2) + "-" + s.slice(2);
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// Health
app.get(`${BASE}/health`, (c) => c.json({ status: "ok" }));

// POST /room/create
app.post(`${BASE}/room/create`, async (c) => {
  try {
    const { name, avatar, colorIndex } = await c.req.json();
    const code = makeCode();
    const playerId = makeId();
    const room = {
      code,
      hostId: playerId,
      gameState: null,
      actions: [],
      createdAt: Date.now(),
    };
    await kv.set(`room:${code}`, room);
    return c.json({ code, playerId });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// POST /room/:code/join
app.post(`${BASE}/room/:code/join`, async (c) => {
  try {
    const code = c.req.param("code");
    const { name, avatar, colorIndex } = await c.req.json();
    const room = await kv.get(`room:${code}`);
    if (!room) return c.json({ error: "اتاق پیدا نشد" }, 404);
    const playerId = makeId();
    const joinAction = {
      type: "ADD_PLAYER",
      name,
      avatar,
      colorIndex,
      _pid: playerId,
      _ts: Date.now(),
    };
    const updated = { ...room, actions: [...(room.actions || []), joinAction] };
    await kv.set(`room:${code}`, updated);
    return c.json({ playerId, roomState: room.gameState });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// GET /room/:code
app.get(`${BASE}/room/:code`, async (c) => {
  try {
    const code = c.req.param("code");
    const room = await kv.get(`room:${code}`);
    if (!room) return c.json({ error: "اتاق پیدا نشد" }, 404);
    return c.json(room.gameState ?? null);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// PUT /room/:code/state  (host pushes game state)
app.put(`${BASE}/room/:code/state`, async (c) => {
  try {
    const code = c.req.param("code");
    const { state } = await c.req.json();
    const room = await kv.get(`room:${code}`);
    if (!room) return c.json({ error: "اتاق پیدا نشد" }, 404);
    await kv.set(`room:${code}`, { ...room, gameState: state });
    return c.json({ ok: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// POST /room/:code/action  (non-host queues action)
app.post(`${BASE}/room/:code/action`, async (c) => {
  try {
    const code = c.req.param("code");
    const { action } = await c.req.json();
    const room = await kv.get(`room:${code}`);
    if (!room) return c.json({ error: "اتاق پیدا نشد" }, 404);
    const actions = [...(room.actions || []), { ...action, _ts: Date.now() }];
    await kv.set(`room:${code}`, { ...room, actions });
    return c.json({ ok: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// GET /room/:code/actions  (host drains action queue)
app.get(`${BASE}/room/:code/actions`, async (c) => {
  try {
    const code = c.req.param("code");
    const room = await kv.get(`room:${code}`);
    if (!room) return c.json({ actions: [] });
    const actions = room.actions || [];
    if (actions.length > 0) {
      await kv.set(`room:${code}`, { ...room, actions: [] });
    }
    return c.json({ actions });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// POST /room/:code/ready  (toggle ready — queues TOGGLE_READY action)
app.post(`${BASE}/room/:code/ready`, async (c) => {
  try {
    const code = c.req.param("code");
    const { playerId } = await c.req.json();
    const room = await kv.get(`room:${code}`);
    if (!room) return c.json({ error: "اتاق پیدا نشد" }, 404);
    const action = { type: "TOGGLE_READY", id: playerId, _ts: Date.now() };
    await kv.set(`room:${code}`, { ...room, actions: [...(room.actions || []), action] });
    return c.json({ ok: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// DELETE /room/:code
app.delete(`${BASE}/room/:code`, async (c) => {
  try {
    const code = c.req.param("code");
    await kv.del(`room:${code}`);
    return c.json({ ok: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

Deno.serve(app.fetch);
