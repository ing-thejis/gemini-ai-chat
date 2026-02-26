import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import chat from "./routes/chat";

const app = new Hono();

// CORS: permite peticiones desde el frontend en desarrollo
app.use(
  "*",
  cors({
    origin: "http://localhost:5173", // Puerto por defecto de Vite
    allowMethods: ["POST", "GET", "OPTIONS"],
  })
);

// Ruta de salud para verificar que el server corre
app.get("/health", (c) => c.json({ status: "ok" }));

// Rutas del chat
app.route("/api/chat", chat);

const port = Number(process.env.PORT) || 4000;

serve({ fetch: app.fetch, port }, () => {
  console.log(`🔥 Server corriendo en http://localhost:${port}`);
});