import { Hono } from "hono";
import { randomUUID } from "node:crypto";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  message?: string;
  history?: unknown;
}

const chat = new Hono();

// --- Mismos límites y contrato que supabase/functions/chat/index.ts ---
const MAX_HISTORY = 20;
const MAX_MESSAGE_CHARS = 8_000;
const MAX_TOKENS = 1_500;

const API_KEY = process.env.OPENCODE_API_KEY;
const MODEL = process.env.OPENCODE_AI_MODEL ?? "deepseek-v4.1-flash";
// Console/PAYG -> https://opencode.ai/inference/openai/v1
// Go          -> https://opencode.ai/inference/go/openai/v1
const BASE_URL =
  process.env.OPENCODE_BASE_URL ?? "https://opencode.ai/inference/openai/v1";
const CHAT_URL = `${BASE_URL}/chat/completions`;
const IS_GO = CHAT_URL.includes("/go/");

const SYSTEM_PROMPT = `
Eres un asistente útil y amigable. Responde siempre en el idioma del usuario.
Responde SIEMPRE en formato Markdown.

Reglas:
  - Usa títulos (##, ###) para secciones
  - Usa listas para enumeraciones
  - Usa negritas para destacar conceptos
  - Usa separadores --- para dividir bloques
  - NO devuelvas texto plano sin formato`;

if (!API_KEY) {
  console.error("❌ OPENCODE_API_KEY no está definida en el archivo .env");
}

/**
 * Normaliza y valida el historial. Acepta roles en mayúsculas ("USER")
 * por compatibilidad con clientes antiguos que no normalizaban.
 */
function normalizeHistory(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item): ChatMessage | null => {
      if (!item || typeof item !== "object") return null;

      const { role, content } = item as { role?: unknown; content?: unknown };
      if (typeof content !== "string" || !content.trim()) return null;

      const normalized = String(role ?? "").toLowerCase();
      if (normalized === "user") return { role: "user", content: content.trim() };
      if (normalized === "assistant" || normalized === "model") {
        return { role: "assistant", content: content.trim() };
      }
      return null; // descarta "system" y cualquier rol inyectado
    })
    .filter((m): m is ChatMessage => m !== null)
    .slice(-MAX_HISTORY);
}

chat.post("/", async (ctx) => {
  if (!API_KEY) {
    return ctx.json({ error: "Configuración del servidor incompleta" }, 500);
  }

  // 1. Validar el body (req.json() lanza si el JSON es inválido)
  let body: ChatRequestBody;
  try {
    body = await ctx.req.json<ChatRequestBody>();
  } catch {
    return ctx.json({ error: "Body JSON inválido" }, 400);
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return ctx.json({ error: "El mensaje no puede estar vacío" }, 400);
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return ctx.json({ error: "El mensaje es demasiado largo" }, 413);
  }

  // 2. Historial: el frontend ya lo manda sin el turno actual.
  //    El pop evita duplicarlo si un cliente lo incluye de más.
  const history = normalizeHistory(body.history);
  const last = history.at(-1);
  if (last?.role === "user" && last.content === message) history.pop();

  // 3. Payload OpenAI-compatible (idéntico al de la edge function)
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: message },
  ];

  // 4. Llamar al upstream ANTES del stream para poder devolver errores reales
  let upstream: Response;
  try {
    upstream = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "User-Agent": "sipein-api/1.0",
        ...(IS_GO ? { "x-opencode-session": randomUUID() } : {}),
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: true,
        stream_options: { include_usage: true },
        max_tokens: MAX_TOKENS,
      }),
      // Si el cliente cierra la conexión, se aborta el upstream (no pagas de más)
      signal: ctx.req.raw.signal,
    });
  } catch (err) {
    console.error("[OpenCode] fallo de red:", err);
    return ctx.json({ error: "No se pudo conectar con el modelo" }, 502);
  }

  if (!upstream.ok) {
    const detail = await upstream.text();
    console.error(`[OpenCode] ${upstream.status} en ${CHAT_URL}:`, detail);

    if (upstream.status === 429) {
      ctx.header("Retry-After", upstream.headers.get("retry-after") ?? "5");
      return ctx.json(
        { error: "Demasiadas solicitudes, intenta de nuevo en unos segundos" },
        429
      );
    }
    return ctx.json({ error: "El modelo no está disponible" }, 502);
  }

  if (!upstream.body) {
    return ctx.json({ error: "Respuesta vacía del modelo" }, 502);
  }

  // 5. Passthrough del SSE tal cual lo emite OpenCode
  return ctx.body(upstream.body, 200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "X-Accel-Buffering": "no", // evita buffering de nginx
  });
});

export default chat;
