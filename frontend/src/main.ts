/**
 * @fileoverview Punto de entrada de la aplicación Vue.
 * Crea la instancia de la app y la monta en el elemento `#app` del DOM.
 * @module main
 */

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
