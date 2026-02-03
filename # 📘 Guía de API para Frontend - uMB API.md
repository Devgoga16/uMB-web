# 📘 Guía de API para Frontend - uMB API

Documentación completa para la integración del frontend con la API uMB.

## 🌐 URL Base

```
Desarrollo: http://localhost:3000
Producción: https://api.umb.com (actualizar según despliegue)
```

## 🔐 Autenticación

La API utiliza **JWT (JSON Web Tokens)** para autenticación. Después del login/registro, recibirás un token que deberás incluir en todas las peticiones protegidas.

### Header de Autenticación
```
Authorization: Bearer {tu_token_jwt}
```

---

## 📋 Endpoints Disponibles

### 1️⃣ AUTENTICACIÓN

#### 🔹 Registro de Usuario

**Endpoint:** `POST /api/auth/registro`  
**Autenticación:** No requerida  
**Descripción:** Registra un nuevo usuario en el sistema

**Request Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "123456",
  "rol": "usuario"
}
```

**Response (201):**
```json
{
  "success": true,
  "mensaje": "Usuario registrado exitosamente",
  "data": {
    "id": "65f8a2b3c4d5e6f7g8h9i0j1",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "usuario",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Ejemplo con Fetch:**
```javascript
const registro = async (nombre, email, password) => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/registro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre, email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Guardar token en localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      return data;
    }
  } catch (error) {
    console.error('Error en registro:', error);
  }
};
```

**Ejemplo con Axios:**
```javascript
const registro = async (nombre, email, password) => {
  try {
    const { data } = await axios.post('http://localhost:3000/api/auth/registro', {
      nombre,
      email,
      password
    });
    
    // Guardar token
    localStorage.setItem('token', data.data.token);
    return data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

---

#### 🔹 Login

**Endpoint:** `POST /api/auth/login`  
**Autenticación:** No requerida  
**Descripción:** Inicia sesión con email y contraseña

**Request Body:**
```json
{
  "email": "juan@example.com",
  "password": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "mensaje": "Login exitoso",
  "data": {
    "id": "65f8a2b3c4d5e6f7g8h9i0j1",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "usuario",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Ejemplo con Fetch:**
```javascript
const login = async (email, password) => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      return data;
    }
  } catch (error) {
    console.error('Error en login:', error);
  }
};
```

**Ejemplo con Axios:**
```javascript
const login = async (email, password) => {
  try {
    const { data } = await axios.post('http://localhost:3000/api/auth/login', {
      email,
      password
    });
    
    localStorage.setItem('token', data.data.token);
    return data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

---

#### 🔹 Obtener Usuario Actual

**Endpoint:** `GET /api/auth/me`  
**Autenticación:** ✅ Requerida  
**Descripción:** Obtiene la información del usuario autenticado

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65f8a2b3c4d5e6f7g8h9i0j1",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "usuario",
    "activo": true,
    "createdAt": "2026-02-01T10:30:00.000Z"
  }
}
```

**Ejemplo con Fetch:**
```javascript
const obtenerPerfil = async () => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

**Ejemplo con Axios:**
```javascript
const obtenerPerfil = async () => {
  const token = localStorage.getItem('token');
  
  try {
    const { data } = await axios.get('http://localhost:3000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

---

### 2️⃣ GESTIÓN DE USUARIOS (Solo Administradores)

> ⚠️ **Importante:** Todos estos endpoints requieren autenticación y rol de **admin**

#### 🔹 Obtener Todos los Usuarios

**Endpoint:** `GET /api/users`  
**Autenticación:** ✅ Requerida (Admin)  
**Descripción:** Obtiene la lista completa de usuarios

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "cantidad": 2,
  "data": [
    {
      "_id": "65f8a2b3c4d5e6f7g8h9i0j1",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "rol": "usuario",
      "activo": true,
      "createdAt": "2026-02-01T10:30:00.000Z"
    },
    {
      "_id": "65f8a2b3c4d5e6f7g8h9i0j2",
      "nombre": "María García",
      "email": "maria@example.com",
      "rol": "admin",
      "activo": true,
      "createdAt": "2026-02-02T11:30:00.000Z"
    }
  ]
}
```

**Ejemplo con Fetch:**
```javascript
const obtenerUsuarios = async () => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

#### 🔹 Obtener Usuario por ID

**Endpoint:** `GET /api/users/:id`  
**Autenticación:** ✅ Requerida (Admin)  
**Descripción:** Obtiene un usuario específico por su ID

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65f8a2b3c4d5e6f7g8h9i0j1",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "usuario",
    "activo": true,
    "createdAt": "2026-02-01T10:30:00.000Z"
  }
}
```

**Ejemplo con Fetch:**
```javascript
const obtenerUsuarioPorId = async (userId) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

#### 🔹 Crear Usuario

**Endpoint:** `POST /api/users`  
**Autenticación:** ✅ Requerida (Admin)  
**Descripción:** Crea un nuevo usuario

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "nombre": "Pedro López",
  "email": "pedro@example.com",
  "password": "123456",
  "rol": "usuario"
}
```

**Response (201):**
```json
{
  "success": true,
  "mensaje": "Usuario creado exitosamente",
  "data": {
    "_id": "65f8a2b3c4d5e6f7g8h9i0j3",
    "nombre": "Pedro López",
    "email": "pedro@example.com",
    "rol": "usuario",
    "activo": true,
    "createdAt": "2026-02-02T15:30:00.000Z"
  }
}
```

**Ejemplo con Fetch:**
```javascript
const crearUsuario = async (nombre, email, password, rol = 'usuario') => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre, email, password, rol })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

#### 🔹 Actualizar Usuario

**Endpoint:** `PUT /api/users/:id`  
**Autenticación:** ✅ Requerida (Admin)  
**Descripción:** Actualiza la información de un usuario

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "nombre": "Juan Pérez Actualizado",
  "email": "juan.nuevo@example.com",
  "rol": "admin",
  "activo": true
}
```

**Response (200):**
```json
{
  "success": true,
  "mensaje": "Usuario actualizado exitosamente",
  "data": {
    "_id": "65f8a2b3c4d5e6f7g8h9i0j1",
    "nombre": "Juan Pérez Actualizado",
    "email": "juan.nuevo@example.com",
    "rol": "admin",
    "activo": true,
    "createdAt": "2026-02-01T10:30:00.000Z"
  }
}
```

**Ejemplo con Fetch:**
```javascript
const actualizarUsuario = async (userId, datosActualizados) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosActualizados)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

#### 🔹 Eliminar Usuario

**Endpoint:** `DELETE /api/users/:id`  
**Autenticación:** ✅ Requerida (Admin)  
**Descripción:** Elimina un usuario del sistema

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "mensaje": "Usuario eliminado exitosamente"
}
```

**Ejemplo con Fetch:**
```javascript
const eliminarUsuario = async (userId) => {
  const token = localStorage.getItem('token');
  
  if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
  
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 🛠️ Utilidades y Helpers

### Configuración de Axios con Interceptores

```javascript
import axios from 'axios';

// Crear instancia de axios
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Servicio de Autenticación Completo

```javascript
// authService.js
import api from './api';

class AuthService {
  async registro(nombre, email, password) {
    try {
      const { data } = await api.post('/auth/registro', { nombre, email, password });
      if (data.success) {
        this.guardarSesion(data.data);
      }
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async login(email, password) {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        this.guardarSesion(data.data);
      }
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async obtenerPerfil() {
    try {
      const { data } = await api.get('/auth/me');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  guardarSesion(userData) {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  obtenerToken() {
    return localStorage.getItem('token');
  }

  obtenerUsuario() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  estaAutenticado() {
    return !!this.obtenerToken();
  }

  esAdmin() {
    const user = this.obtenerUsuario();
    return user?.rol === 'admin';
  }
}

export default new AuthService();
```

### Servicio de Usuarios

```javascript
// userService.js
import api from './api';

class UserService {
  async obtenerTodos() {
    try {
      const { data } = await api.get('/users');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async obtenerPorId(id) {
    try {
      const { data } = await api.get(`/users/${id}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async crear(userData) {
    try {
      const { data } = await api.post('/users', userData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async actualizar(id, userData) {
    try {
      const { data } = await api.put(`/users/${id}`, userData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async eliminar(id) {
    try {
      const { data } = await api.delete(`/users/${id}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export default new UserService();
```

---

## 📊 Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | ✅ Operación exitosa |
| 201 | ✅ Recurso creado exitosamente |
| 400 | ❌ Datos inválidos o email duplicado |
| 401 | ❌ No autorizado (token inválido/expirado) |
| 403 | ❌ Acceso denegado (sin permisos) |
| 404 | ❌ Recurso no encontrado |
| 500 | ❌ Error del servidor |

---

## ⚠️ Manejo de Errores

Todas las respuestas de error tienen la siguiente estructura:

```json
{
  "success": false,
  "mensaje": "Descripción del error",
  "error": "Detalles técnicos (opcional)"
}
```

**Ejemplo de manejo:**
```javascript
try {
  const data = await login(email, password);
  console.log('Login exitoso:', data);
} catch (error) {
  if (error.response) {
    // Error de la API
    const { mensaje } = error.response.data;
    alert(mensaje);
  } else {
    // Error de red u otro
    alert('Error de conexión');
  }
}
```

---

## 🔒 Consideraciones de Seguridad

1. **Nunca expongas el token en la URL**
2. **Limpia el localStorage al cerrar sesión**
3. **Verifica la expiración del token** (7 días por defecto)
4. **Usa HTTPS en producción**
5. **Implementa refresh del token si el usuario sigue activo**

---

## 📱 Ejemplo de Componente React

```javascript
import { useState, useEffect } from 'react';
import authService from './services/authService';
import userService from './services/userService';

function Dashboard() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await userService.obtenerTodos();
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm('¿Eliminar usuario?')) return;
    
    try {
      await userService.eliminar(id);
      cargarUsuarios(); // Recargar lista
    } catch (error) {
      alert('Error al eliminar usuario');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Usuarios</h1>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(user => (
            <tr key={user._id}>
              <td>{user.nombre}</td>
              <td>{user.email}</td>
              <td>{user.rol}</td>
              <td>
                <button onClick={() => eliminarUsuario(user._id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
```

---

## 📚 Recursos Adicionales

- **Swagger UI:** http://localhost:3000/api-docs
- **Postman Collection:** (Solicitar al equipo backend)
- **Variables de entorno:** Configurar `REACT_APP_API_URL` en tu proyecto

---

## 💡 Tips de Desarrollo

1. **Usa variables de entorno** para la URL de la API
2. **Implementa un loading state** en todas las peticiones
3. **Maneja errores de red** apropiadamente
4. **Valida datos antes de enviarlos** al servidor
5. **Implementa retry logic** para peticiones fallidas
6. **Usa debounce** en búsquedas y filtros

---

## 🆘 Soporte

Si encuentras problemas o tienes dudas sobre la integración:
- Revisa Swagger: http://localhost:3000/api-docs
- Contacta al equipo de backend
- Revisa los logs del servidor para más detalles

---

**Última actualización:** 2 de Febrero, 2026
