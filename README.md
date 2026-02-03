# uMB - unify Management Bot

Sistema de gestión unificada desarrollado con React y Vite.

## Características

- ✅ Login simulado (acepta cualquier usuario/contraseña)
- ✅ Dashboard con sidebar de navegación
- ✅ Estadísticas visuales
- ✅ Actividad reciente y tareas pendientes
- ✅ Diseño responsive
- ✅ Autenticación básica con localStorage

## Tecnologías

- React 18
- Vite
- React Router DOM
- CSS moderno

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

El proyecto se ejecutará en http://localhost:5173

## Uso

1. Ingresa cualquier usuario y contraseña en el login
2. Serás redirigido al dashboard
3. Explora las diferentes secciones del sidebar
4. Usa el botón "Cerrar Sesión" para volver al login

## Estructura del Proyecto

```
uMB/
├── src/
│   ├── pages/
│   │   ├── Login.jsx          # Página de login
│   │   └── Dashboard.jsx      # Dashboard principal
│   ├── styles/
│   │   ├── Login.css          # Estilos del login
│   │   └── Dashboard.css      # Estilos del dashboard
│   ├── App.jsx                # Configuración de rutas
│   ├── main.jsx               # Punto de entrada
│   └── index.css              # Estilos globales
├── package.json
└── vite.config.js
```

## Próximas Implementaciones

- Integración con API backend
- Sistema de autenticación real
- Gestión de usuarios
- Reportes y analytics
- Notificaciones en tiempo real
- Configuraciones personalizables

## Versión

1.0.0 - Sistema simulado

