<script setup lang="ts">
/**
 * @fileoverview Componente que renderiza un mensaje individual del chat.
 *
 * Muestra el avatar del emisor, el contenido en Markdown y un cursor
 * parpadeante mientras el mensaje del asistente está en streaming.
 *
 * @component ChatMessage
 *
 * @prop {Message} message - El objeto mensaje a renderizar.
 *
 * @example
 * <ChatMessage :message="{ id: '1', role: 'USER', content: 'Hola' }" />
 */

import { User, Sparkles } from "lucide-vue-next";
import { useChat } from "../composable/useChat";
import type { Message } from "../types/chat";

const { renderMarkdown } = useChat();

defineProps<{ message: Message }>();
</script>

<template>
  <div :class="['message', message.role]">
    <div class="avatar">
      <!-- Icono de usuario para mensajes del usuario, ícono Sparkles para el asistente -->
      <span v-if="message.role === 'USER'"><User /></span>
      <span v-else><Sparkles /></span>
    </div>
    <div :class="['bubble', message.role]">
      <!-- Texto "Thinking..." mientras el asistente no ha generado contenido aún -->
      <span class="thinking" v-if="message.isStreaming && !message.content">Thinking...</span>
      <div
        v-else
        class="markdown-body"
        v-html="renderMarkdown(message.content)"
      />
      <!-- Cursor parpadeante visible durante el streaming -->
      <span v-if="message.isStreaming" class="cursor">▋</span>
      <div class="timestamp">{{ new Date().toLocaleString().split(",")[1] }}</div class="timestamp">
    </div>
  </div>
</template>

<style scoped>
.message {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.message.USER {
  flex-direction: row-reverse;
}

.avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #3c3c3c;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.bubble {
  max-width: 80%;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
}

.bubble.USER {
  text-align: right;
}

.bubble.ASSISTANT {
  text-align: left;
}

.cursor {
  animation: blink 1s infinite;
}

.timestamp {
  font-size: 0.8rem;
  color: #888;
  text-align: right;
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
