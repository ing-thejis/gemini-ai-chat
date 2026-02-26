/**
 * @fileoverview Definición de tipos TypeScript para el módulo de chat.
 * @module types/chat
 */

/**
 * Roles posibles de un participante en la conversación.
 *
 * - `"USER"` — mensaje enviado por el usuario.
 * - `"ASSISTANT"` — respuesta generada por el modelo de IA.
 */
export type MessageRole = "USER" | "ASSISTANT";

/**
 * Representa un mensaje individual dentro de la conversación.
 *
 * @interface Message
 * @property {string}      id          - Identificador único del mensaje (UUID generado con `crypto.randomUUID()`).
 * @property {MessageRole} role        - Rol del emisor: `"USER"` o `"ASSISTANT"`.
 * @property {string}      content     - Contenido textual del mensaje. Puede contener Markdown.
 * @property {boolean}     [isStreaming] - Indica si el mensaje del asistente aún está siendo transmitido (streaming activo).
 *                                         Cuando es `true`, el contenido se actualiza en tiempo real.
 *                                         Se omite o es `false` cuando el mensaje está completo.
 */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  isStreaming?: boolean;
}
