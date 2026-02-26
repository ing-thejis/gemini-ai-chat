<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{ send: [value: string] }>();
const input = ref("");

const handleSend = () => {
  if (!input.value.trim()) return;
  emit("send", input.value);
  input.value = "";
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};
</script>

<template>
  <div class="input-area">
    <textarea
      v-model="input"
      placeholder="Escribe un mensaje... (Enter para enviar, Shift+Enter para nueva línea)"
      rows="1"
      @keydown="handleKeydown"
    />
    <button @click="handleSend">Enviar</button>
  </div>
</template>