# 🐇 Rabbit

**Rabbit** es una extensión de Google Chrome que integra Inteligencia Artificial directamente en tu navegador, permitiéndote interactuar con el contenido de cualquier página web de forma rápida, precisa y personalizada.

## 🚀 Objetivo

Facilitar una navegación moderna e inteligente por Internet eliminando el contenido irrelevante y accediendo directamente a la información útil mediante IA.

## ✨ Características principales

- Extensión de Chrome que lee el contenido de la web activa.
- Comunicación con modelo Gemini 1.5 Flash de Google.
- Procesamiento en tiempo real con respuestas en streaming.
- Backend Node.js + Express con autenticación JWT.
- Base de datos MySQL para usuarios e historial de navegación.
- Interfaz minimalista y accesible.

## 🛠️ Tecnologías usadas

### Frontend

- Vanilla JavaScript
- HTML + CSS
- API de extensiones de Chrome

### Backend

- Node.js + Express
- Gemini API (Google)
- MySQL con `mysql2`
- Autenticación con `bcrypt` y `jsonwebtoken`
- Envío de correos con `nodemailer`

## 📁 Estructura del repositorio
/extension
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── content.js
└── styles.css

/server
├── index.js
├── routes/
├── db/
└── .env


## 🧪 Pruebas

- Postman para pruebas de endpoints (`/`, `/login`, `/webContent`)
- Validación JWT y flujo de datos en tiempo real

## 🔐 Seguridad

- Contraseñas hasheadas con `bcrypt`
- Tokens JWT con expiración y firma segura
- Variables de entorno para credenciales

## 🧭 Futuro del proyecto

- Despliegue en hosting cloud con base de datos remota
- Publicación en Chrome Web Store
- Mejora del modelo Gemini a versiones más potentes
- Control de costos por uso de tokens

## 📄 Documentación

La documentación técnica se encuentra en este repositorio. También existe una página web de soporte orientada a usuarios no técnicos, accesible desde la propia extensión.

## 👨‍💻 Autor

**David González García** – Trabajo Fin de Grado

---

> “No es solo una extensión. Es una nueva forma de interactuar con la web.”


