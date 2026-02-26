<script setup lang="ts">
/**
 * @fileoverview Componente de entrada de mensajes del chat.
 *
 * Proporciona un textarea para redactar mensajes y dos botones de acción:
 * enviar el mensaje y limpiar la conversación.
 *
 * @component ChatInput
 *
 * @emits send  - Se emite con el texto del mensaje cuando el usuario lo envía.
 * @emits clear - Se emite cuando el usuario pulsa el botón de limpiar el chat.
 *
 * @example
 * <ChatInput @send="onSend" @clear="onClear" />
 */

import { Send, Trash2 } from "lucide-vue-next";
import { ref } from "vue";

const emit = defineEmits<{ send: [value: string]; clear: [] }>();

/** Texto actualmente escrito en el textarea, enlazado con `v-model`. */
const input = ref("");

/**
 * Valida que el textarea no esté vacío, emite el evento `send` con el texto
 * y limpia el campo de entrada.
 */
const handleSend = () => {
  if (!input.value.trim()) return;
  emit("send", input.value);
  input.value = "";
};

/**
 * Intercepta la tecla `Enter` para enviar el mensaje.
 * `Shift+Enter` se reserva para insertar un salto de línea sin enviar.
 *
 * @param e - Evento de teclado capturado en el textarea.
 */
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
