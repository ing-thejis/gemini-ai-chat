<script setup lang="ts">
import { ref, nextTick, watch } from "vue";
import ChatMessage from "./components/ChatMessage.vue";
import ChatInput from "./components/ChatInput.vue";
import { useChat } from "./composable/useChat";

const { messages, isLoading, error, sendMessage, clearChat } = useChat();
const isDark = ref(false);
const chatEnd = ref<HTMLElement | null>(null);

// Auto-scroll al último mensaje
watch(messages, async () => {
  await nextTick();
  chatEnd.value?.scrollIntoView({ behavior: "smooth" });
}, { deep: true });
</script>

<template>
  <div :class="['app', { dark: isDark }]">
    <header>
      <h1>✨ Gemini Chat</h1>
      <div class="actions">
        <button @click="isDark = !isDark">{{ isDark ? "☀️" : "🌙" }}</button>
        <button @click="clearChat">🗑️ Limpiar</button>
      </div>
    </header>

    <main class="chat-window">
      <div v-if="messages.length === 0" class="empty-state">
        <p>👋 ¡Hola! Soy Gemini. ¿En qué puedo ayudarte?</p>
      </div>

      <ChatMessage
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
      />

      <div v-if="error" class="error">{{ error }}</div>
      <div ref="chatEnd" />
    </main>

    <ChatInput @send="sendMessage" :disabled="isLoading" />
  </div>
</template>