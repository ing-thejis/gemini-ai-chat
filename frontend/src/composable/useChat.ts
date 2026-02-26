import { ref } from "vue";
import { marked } from "marked";
import type { Message } from "../types/chat";

export function useChat() {
  const messages = ref<Message[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Construye el historial excluyendo el mensaje en streaming actual
  const buildHistory = () =>
    messages.value
      .filter((m) => !m.isStreaming)
      .map((m) => ({ role: m.role, content: m.content }));

  const sendMessage = async (userInput: string) => {
    if (!userInput.trim() || isLoading.value) return;

    error.value = null;

    // Construye el historial ANTES de agregar el mensaje actual
    const history = buildHistory();

    // Agrega mensaje del usuario
    messages.value.push({
      id: crypto.randomUUID(),
      role: "USER",
      content: userInput,
    });

    // Placeholder del asistente con streaming
    const assistantId = crypto.randomUUID();
    messages.value.push({
      id: assistantId,
      role: "ASSISTANT",
      content: "",
      isStreaming: true,
    });

    isLoading.value = true;

    try {
      // Llama a tu backend, no a Gemini directamente
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userInput,
          history,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      if (!response.body) throw new Error("No response body");


      // Leer el stream chunk a chunk
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const assistantMsg = messages.value.find((m) => m.id === assistantId)!;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantMsg.content += decoder.decode(value, { stream: true });
      }

      assistantMsg.isStreaming = false;
    } catch (e) {
      error.value = "Error to connect to the server.";
      messages.value = messages.value.filter((m) => m.id !== assistantId);
    } finally {
      isLoading.value = false;
    }
  };

  const clearChat = () => {
    messages.value = [];
  };

  // Renderiza markdown de forma segura
  const renderMarkdown = (content: string) =>
    marked(content) as string;

  return { messages, isLoading, error, sendMessage, clearChat, renderMarkdown };
}