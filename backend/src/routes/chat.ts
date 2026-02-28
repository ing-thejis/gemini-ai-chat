import { Hono } from "hono";
import { GoogleGenAI } from "@google/genai";
import { stream } from "hono/streaming";

// Tipos para el request body
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  message: string;
  history: ChatMessage[];
}

const chat = new Hono();
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY no está definida en el archivo .env");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

chat.post("/", async (ctx) => {
  // 1. Validar el body
  const body = await ctx.req.json<ChatRequestBody>();

  if (!body.message?.trim()) {
    return ctx.json({ error: "El mensaje no puede estar vacío" }, 400);
  }

  // 2. Convertir historial del frontend al formato de Gemini
  const geminiHistory = body.history.map((msg) => ({
    role: msg.role.toLowerCase() === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  // 3. Iniciar la sesión de chat
  const chatSession = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: "Eres un asistente útil y amigable. Responde siempre en el idioma del usuario.",
    },
    history: geminiHistory,
  });

  // 4. Llamar a Gemini ANTES de abrir el stream para poder retornar HTTP 500 si falla
  let result;
  try {
    result = await chatSession.sendMessageStream({
      message: body.message,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[Gemini Error]:", err);
    return ctx.json({ error: message }, 500);
  }

  // 5. Gemini respondió OK — ahora sí abrimos el stream (headers ya van con 200)
  return stream(ctx, async (s) => {
    for await (const chunk of result) {
      const text = chunk.text;
      if (text) {
        await s.write(text);
      }
    }
  }, async (err) => {
    console.error("[Stream Error]:", err);
  });
});

export default chat;
