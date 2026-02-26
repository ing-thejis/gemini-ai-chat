<script setup lang="ts">
import { Send, Trash2 } from "lucide-vue-next";
import { ref } from "vue";

const emit = defineEmits<{ send: [value: string]; clear: [] }>();
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
  <footer class="input-area">
    <textarea
      id="input-chat"
      v-model="input"
      placeholder="Escribe un mensaje... (Enter para enviar, Shift+Enter para nueva línea)"
      rows="4"
      @keydown="handleKeydown"
    />
    <div class="buttons-action">
      <button @click="handleSend" :disabled="input.length === 0"><Send /></button>
      <button @click="emit('clear')"><Trash2 /></button>
    </div>
  </footer>
</template>

<style scoped>
.input-area {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 1rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
}

textarea {
  flex: 1;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: none;
  font-family: inherit;
  font-size: 1rem;
  resize: none;
}

.buttons-action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  background-color: #3c3c3c;
  color: white;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:disabled:hover {
  background-color: #ccc;
}

button:hover {
  background-color: #4f4f4f;
}
</style>
