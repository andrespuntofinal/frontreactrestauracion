
# ⛪ ComunidadPro - Frontend (v4.0)

Sistema integral de gestión para comunidades religiosas y sociales. Este proyecto permite administrar miembros, ministerios, finanzas y contenido público, integrando analítica avanzada con inteligencia artificial (Google Gemini).

---

## ✨ Características Principales

- **🌐 Landing Page Dinámica**: Portal público gestionado desde un módulo administrativo (CMS).
- **🔐 Autenticación Híbrida**: Inicio de sesión con Google (Firebase Auth) y validación de permisos local.
- **👥 Gestión de Personas**: Expediente digital completo con fotos, datos demográficos y estados de membresía.
- **💰 Control Financiero**: Registro de ingresos y egresos categorizados por medio de pago (Efectivo/Transferencia).
- **📊 Reportes Avanzados**: Filtros cruzados y visualización de datos en tiempo real.
- **🤖 Inteligencia Artificial**:
  - **Análisis de Datos**: Generación de resúmenes financieros automáticos.
  - **Asistente Chat**: Consulta de base de datos mediante lenguaje natural.

---

## 🛠️ Stack Tecnológico

- **Framework**: React 19 (ESM)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS (Diseño Responsivo y Moderno)
- **Iconografía**: Lucide React
- **IA**: Google Generative AI SDK (@google/genai)
- **Bundler**: Vite (Recomendado para ejecución local)

---

## 🚀 Guía de Configuración Local

Sigue estos pasos para poner a correr el proyecto en tu entorno de desarrollo:

### 1. Requisitos Previos
- Tener instalado [Node.js](https://nodejs.org/) (Versión 20 o superior).
- Tener un Backend funcional (basado en la guía técnica de ComunidadPro).

### 2. Instalación
Abre una terminal en la carpeta raíz del proyecto y ejecuta:

```bash
# Inicializar el proyecto si no lo has hecho
npm init -y

# Instalar las dependencias necesarias para desarrollo
npm install vite @vitejs/plugin-react typescript -D
npm install react react-dom lucide-react @google/genai
```

### 3. Configuración de Variables de Entorno
Crea un archivo llamado `.env` en la raíz del proyecto para habilitar las funciones de IA:

```env
# Reemplaza con tu llave de Google AI Studio
VITE_GEMINI_API_KEY=TU_API_KEY_AQUI
```

### 4. Configuración de Vite
Crea un archivo llamado `vite.config.ts` en la raíz:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
```

### 5. Conexión con el Backend
Edita el archivo `services/storage.ts` para que la constante `API_URL` apunte a la dirección de tu servidor backend:

```typescript
const API_URL = 'http://localhost:3001/api';
```

---

## 🖥️ Ejecución

Para iniciar el servidor de desarrollo, ejecuta:

```bash
npx vite
```

La aplicación estará disponible en `http://localhost:3000`.

---

## ⚠️ Notas Importantes

### Configuración de CORS
Para que el frontend pueda comunicarse con tu backend, asegúrate de que el backend tenga habilitado el middleware de CORS:
```javascript
// En tu Backend (Express)
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000' }));
```

### Integración con Firebase
El sistema está diseñado para enviar el `IdToken` de Firebase en el encabezado `Authorization: Bearer <token>`. Asegúrate de que el flujo de autenticación en `App.tsx` capture el token del SDK de Firebase Client antes de realizar peticiones a la API.

---
*Desarrollado con enfoque en UI/UX moderna y optimización de datos para comunidades.*
