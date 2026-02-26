<script setup lang="ts">
import { useChat } from "../composable/useChat";
import type { Message } from "../types/chat";

const { renderMarkdown } = useChat();

defineProps<{ message: Message }>();
</script>

<template>
  <div :class="['message', message.role]">
    <div class="avatar">{{ message.role === "USER" ? "🧑" : "✨" }}</div>
    <div class="bubble">
      <!-- Cursor parpadeante mientras hace streaming -->
      <span v-if="message.isStreaming && !message.content">Pensando...</span>
      <div
        v-else
        class="markdown-body"
        v-html="renderMarkdown(message.content)"
      />
      <span v-if="message.isStreaming" class="cursor">▋</span>
    </div>
  </div>
</template>