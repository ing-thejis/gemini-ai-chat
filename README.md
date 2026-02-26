# Gemini AI Chat

Aplicación de chat en tiempo real que utiliza streaming de respuestas desde la API de Google Gemini. El frontend consume un backend propio (no llama a Gemini directamente), lo que permite centralizar la API key y la lógica del modelo.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Vue 3 + TypeScript + Vite |
| Backend | Hono + Node.js + TypeScript |
| Modelo de IA | Google Gemini 2.5 Flash |
| Gestor de paquetes | pnpm |

---

## Arquitectura

```
Usuario
  │
  ▼
ChatInput.vue  ──emit("send")──▶  App.vue  ──useChat.sendMessage()──▶  useChat.ts
                                                                             │
                                                                    POST /api/chat
                                                                             │
                                                                             ▼
                                                                    backend/src/routes/chat.ts
                                                                             │
                                                               Google Gemini 2.5 Flash (streaming)
                                                                             │
                                                                    ReadableStream (chunks)
                                                                             │
                                                                             ▼
                                                                    ChatMessage.vue (actualización en tiempo real)
```

El backend recibe el mensaje y el historial, inicia una sesión de chat con Gemini y retransmite la respuesta como stream. El frontend la consume chunk a chunk con la Web Streams API (`ReadableStream` + `TextDecoder`).

---

## Estructura del proyecto

```
gemini-ai-chat/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Servidor Hono, CORS y registro de rutas
│   │   └── routes/
│   │       └── chat.ts       # POST /api/chat — streaming con Gemini
│   ├── .env                  # Variables de entorno del backend
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── main.ts           # Punto de entrada — monta la app Vue
    │   ├── App.vue           # Layout principal y auto-scroll
    │   ├── style.css         # Estilos globales
    │   ├── types/
    │   │   └── chat.ts       # Interfaces Message y MessageRole
    │   ├── composable/
    │   │   └── useChat.ts    # Lógica del chat (estado, fetch, markdown)
    │   └── components/
    │       ├── ChatMessage.vue  # Renderiza un mensaje individual
    │       └── ChatInput.vue    # Textarea y botones de acción
    ├── .env                  # Variables de entorno del frontend
    ├── .env.example
    └── package.json
```

---

## Requisitos previos

- **Node.js** >= 18
- **pnpm** >= 8 — `npm install -g pnpm`
- Una **API key de Google Gemini** — obtenla en [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## Instalación y puesta en marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/ing-thejis/gemini-ai-chat.git
cd gemini-ai-chat
```

### 2. Configurar el backend

```bash
cd backend
cp .env.example .env
```

Edita `.env` y agrega tu API key:

```env
GEMINI_API_KEY=tu_api_key_aqui
PORT=4000
```

Instala las dependencias e inicia el servidor:

```bash
pnpm install
pnpm run dev
```

El backend quedará disponible en `http://localhost:4000`.

### 3. Configurar el frontend

Abre una nueva terminal desde la raíz del proyecto:

```bash
cd frontend
cp .env.example .env
```

El archivo `.env` ya apunta al backend por defecto:

```env
VITE_API_URL=http://localhost:4000
```

Instala las dependencias e inicia el servidor de desarrollo:

```bash
pnpm install
pnpm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Scripts disponibles

### Backend (`/backend`)

| Script | Comando | Descripción |
|---|---|---|
| Desarrollo | `pnpm run dev` | Inicia el servidor con `tsx watch` (hot reload automático) |
| Compilar | `pnpm run build` | Compila TypeScript a JavaScript en `/dist` |
| Producción | `pnpm run start` | Ejecuta el build compilado con Node.js |

### Frontend (`/frontend`)

| Script | Comando | Descripción |
|---|---|---|
| Desarrollo | `pnpm run dev` | Inicia el servidor de desarrollo de Vite |
| Compilar | `pnpm run build` | Verifica tipos con `vue-tsc` y genera el bundle de producción |
| Preview | `pnpm run preview` | Sirve el build de producción localmente para revisión |

---

## Variables de entorno

### Backend — `backend/.env`

| Variable | Requerida | Descripción |
|---|---|---|
| `GEMINI_API_KEY` | Sí | API key de Google Gemini |
| `PORT` | No | Puerto del servidor (por defecto: `4000`) |

### Frontend — `frontend/.env`

| Variable | Requerida | Descripción |
|---|---|---|
| `VITE_API_URL` | Sí | URL base del backend (por defecto: `http://localhost:4000`) |

---

## Librerías utilizadas

### Backend

| Librería | Versión | Uso |
|---|---|---|
| [hono](https://hono.dev) | ^4.12.2 | Framework web ultraligero para Node.js |
| [@hono/node-server](https://github.com/honojs/node-server) | ^1.19.9 | Adaptador de Hono para el runtime de Node.js |
| [@google/generative-ai](https://ai.google.dev) | ^0.24.1 | SDK oficial de Google Gemini |
| [dotenv](https://github.com/motdotla/dotenv) | ^17.3.1 | Carga variables de entorno desde `.env` |
| [tsx](https://github.com/privatenumber/tsx) | ^4.21.0 | Ejecuta TypeScript directamente (dev) |

### Frontend

| Librería | Versión | Uso |
|---|---|---|
| [vue](https://vuejs.org) | ^3.5.25 | Framework progresivo para interfaces de usuario |
| [marked](https://marked.js.org) | ^17.0.3 | Parser de Markdown a HTML |
| [lucide-vue-next](https://lucide.dev) | — | Iconos SVG (Send, Trash2, User, Sparkles) |
| [vite](https://vitejs.dev) | ^7.3.1 | Build tool y servidor de desarrollo |
| [vue-tsc](https://github.com/vuejs/language-tools) | ^3.1.5 | Verificación de tipos TypeScript en archivos `.vue` |

---

## Endpoints de la API

### `POST /api/chat`

Envía un mensaje y recibe la respuesta del modelo en streaming.

**Body (JSON):**
```json
{
  "message": "¿Cuál es la capital de Francia?",
  "history": [
    { "role": "USER", "content": "Hola" },
    { "role": "ASSISTANT", "content": "¡Hola! ¿En qué puedo ayudarte?" }
  ]
}
```

**Respuesta:** `text/plain` en streaming (chunks de texto plano).

---

### `GET /health`

Verifica que el servidor está en ejecución.

**Respuesta:** `{ "status": "ok" }`
