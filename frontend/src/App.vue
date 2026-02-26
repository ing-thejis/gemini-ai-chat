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
      <h1>✨ AI Chat</h1>
    </header>

    <main class="chat-window">
      <div v-if="messages.length === 0" class="empty-state">
        <p>👋 ¡Hola! Soy Kora, un agente de IA que usa modelos de Google Gemini. ¿En qué puedo ayudarte?</p>
      </div>

      <ChatMessage
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
      />

      <div v-if="error" class="error">{{ error }}</div>
      <div ref="chatEnd" />
    </main>

    <ChatInput @send="sendMessage" @clear="clearChat" :disabled="isLoading" />
  </div>
</template>

<style scoped>
header {
  text-align: center;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.app {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.chat-window {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
  box-shadow: 10px 10px 10px 10px rgba(50, 50, 50, 0.1);
}

.empty-state {
  text-align: center;
  margin-top: 2rem;
}

.error {
  color: red;
  text-align: center;
  margin-top: 1rem;
}
</style>
