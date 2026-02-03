# 🚀 Guía de Uso - Servicios API de uMB

Esta guía explica cómo usar los servicios implementados en tu aplicación.

## 📁 Estructura de Archivos Creados

```
src/
├── config/
│   └── api.config.js          # Configuración centralizada de la API
├── services/
│   ├── api.js                 # Cliente axios con interceptores
│   ├── authService.js         # Servicio de autenticación
│   └── userService.js         # Servicio de gestión de usuarios
.env                            # Variables de entorno (API_URL)
.env.example                    # Ejemplo de variables de entorno
```

## ⚙️ Configuración

### 1. Variables de Entorno (.env)

La URL de la API está centralizada en el archivo `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

**Para cambiar la URL (producción):**
- Edita el archivo `.env`
- Cambia `http://localhost:3000/api` por tu URL de producción
- Ejemplo: `VITE_API_URL=https://api.umb.com/api`

**Importante:** Debes reiniciar el servidor de desarrollo después de cambiar variables de entorno.

---

## 📝 Ejemplos de Uso

### 🔐 AuthService - Autenticación

#### Registro de Usuario

```javascript
import authService from './services/authService';

// En tu componente de registro
const handleRegistro = async (e) => {
  e.preventDefault();
  
  try {
    const response = await authService.registro(
      nombre,
      email,
      password,
      'usuario' // rol opcional
    );
    
    console.log('Usuario registrado:', response);
    // El token y datos se guardan automáticamente en localStorage
    
    // Redirigir al dashboard
    navigate('/dashboard');
  } catch (error) {
    console.error('Error en registro:', error);
    alert(error.mensaje || 'Error al registrar usuario');
  }
};
```

#### Login

```javascript
import authService from './services/authService';

const handleLogin = async (e) => {
  e.preventDefault();
  
  try {
    const response = await authService.login(email, password);
    
    console.log('Login exitoso:', response);
    // El token se guarda automáticamente
    
    navigate('/dashboard');
  } catch (error) {
    console.error('Error en login:', error);
    alert(error.mensaje || 'Credenciales inválidas');
  }
};
```

#### Obtener Perfil del Usuario

```javascript
import authService from './services/authService';
import { useState, useEffect } from 'react';

function Perfil() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const response = await authService.obtenerPerfil();
      setUsuario(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>Perfil</h1>
      {usuario && (
        <div>
          <p>Nombre: {usuario.nombre}</p>
          <p>Email: {usuario.email}</p>
          <p>Rol: {usuario.rol}</p>
        </div>
      )}
    </div>
  );
}
```

#### Logout

```javascript
import authService from './services/authService';

const handleLogout = () => {
  authService.logout();
  // Automáticamente limpia localStorage y redirige a /login
};
```

#### Verificar Autenticación

```javascript
import authService from './services/authService';

// Verificar si está autenticado
if (!authService.estaAutenticado()) {
  navigate('/login');
}

// Verificar si es admin
if (authService.esAdmin()) {
  console.log('Usuario es administrador');
}

// Obtener datos del usuario actual
const usuario = authService.obtenerUsuario();
console.log('Usuario actual:', usuario);
```

---

### 👥 UserService - Gestión de Usuarios (Solo Admin)

#### Listar Todos los Usuarios

```javascript
import userService from './services/userService';
import { useState, useEffect } from 'react';

function ListaUsuarios() {
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
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Usuarios ({usuarios.length})</h1>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(user => (
            <tr key={user._id}>
              <td>{user.nombre}</td>
              <td>{user.email}</td>
              <td>{user.rol}</td>
              <td>{user.activo ? 'Activo' : 'Inactivo'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### Crear Usuario

```javascript
import userService from './services/userService';

const handleCrearUsuario = async (e) => {
  e.preventDefault();
  
  try {
    const nuevoUsuario = {
      nombre: 'Pedro López',
      email: 'pedro@example.com',
      password: '123456',
      rol: 'usuario'
    };
    
    const response = await userService.crear(nuevoUsuario);
    
    console.log('Usuario creado:', response);
    alert('Usuario creado exitosamente');
    
    // Recargar lista de usuarios
    cargarUsuarios();
  } catch (error) {
    console.error('Error:', error);
    alert(error.mensaje || 'Error al crear usuario');
  }
};
```

#### Actualizar Usuario

```javascript
import userService from './services/userService';

const handleActualizar = async (userId) => {
  try {
    const datosActualizados = {
      nombre: 'Juan Pérez Actualizado',
      email: 'juan.nuevo@example.com',
      rol: 'admin',
      activo: true
    };
    
    const response = await userService.actualizar(userId, datosActualizados);
    
    console.log('Usuario actualizado:', response);
    alert('Usuario actualizado exitosamente');
  } catch (error) {
    console.error('Error:', error);
    alert('Error al actualizar usuario');
  }
};
```

#### Eliminar Usuario

```javascript
import userService from './services/userService';

const handleEliminar = async (userId) => {
  if (!window.confirm('¿Estás seguro de eliminar este usuario?')) {
    return;
  }
  
  try {
    await userService.eliminar(userId);
    alert('Usuario eliminado exitosamente');
    
    // Recargar lista
    cargarUsuarios();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al eliminar usuario');
  }
};
```

#### Cambiar Estado de Usuario

```javascript
import userService from './services/userService';

const toggleEstado = async (userId, estadoActual) => {
  try {
    await userService.cambiarEstado(userId, !estadoActual);
    alert('Estado actualizado');
    cargarUsuarios();
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 🛡️ Protección de Rutas

### Ejemplo de ProtectedRoute Component

```javascript
import { Navigate } from 'react-router-dom';
import authService from './services/authService';

function ProtectedRoute({ children, requireAdmin = false }) {
  // Verificar autenticación
  if (!authService.estaAutenticado()) {
    return <Navigate to="/login" replace />;
  }
  
  // Verificar rol de admin si es necesario
  if (requireAdmin && !authService.esAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

export default ProtectedRoute;
```

### Uso en el Router

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Ruta protegida normal */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta solo para admin */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🔧 Características Implementadas

### ✅ Cliente Axios con Interceptores

El cliente axios (`src/services/api.js`) incluye:

1. **Configuración automática del token:** Se añade automáticamente a cada petición
2. **Manejo de errores 401:** Redirige al login si el token expira
3. **Manejo de errores 403:** Muestra mensaje de acceso denegado
4. **URL base centralizada:** Usa la variable de entorno

### ✅ AuthService

Métodos disponibles:
- `registro(nombre, email, password, rol)` - Registrar usuario
- `login(email, password)` - Iniciar sesión
- `obtenerPerfil()` - Obtener datos del usuario actual
- `logout()` - Cerrar sesión
- `obtenerToken()` - Obtener token JWT
- `obtenerUsuario()` - Obtener datos del usuario
- `estaAutenticado()` - Verificar si está autenticado
- `esAdmin()` - Verificar si es admin
- `tieneRol(rol)` - Verificar rol específico

### ✅ UserService

Métodos disponibles:
- `obtenerTodos()` - Listar usuarios
- `obtenerPorId(id)` - Obtener usuario por ID
- `crear(userData)` - Crear usuario
- `actualizar(id, userData)` - Actualizar usuario
- `eliminar(id)` - Eliminar usuario
- `cambiarEstado(id, activo)` - Cambiar estado activo
- `cambiarRol(id, rol)` - Cambiar rol

---

## 🚨 Manejo de Errores

Todos los servicios lanzan errores que puedes capturar con try/catch:

```javascript
try {
  const response = await authService.login(email, password);
  // Éxito
} catch (error) {
  // error contiene el objeto de error del backend
  console.error('Error:', error);
  
  // Mostrar mensaje al usuario
  if (error.mensaje) {
    alert(error.mensaje);
  } else {
    alert('Error de conexión');
  }
}
```

---

## 📦 Dependencias Instaladas

- ✅ **axios** - Cliente HTTP para peticiones

---

## 🔄 Próximos Pasos

1. **Implementar componente Login:** Usa `authService.login()`
2. **Implementar componente Dashboard:** Usa `authService.obtenerPerfil()`
3. **Implementar panel de admin:** Usa `userService` para gestión de usuarios
4. **Crear ProtectedRoute:** Para proteger rutas privadas
5. **Añadir loading states:** Mejorar experiencia de usuario
6. **Implementar notificaciones:** Toast o alerts para mensajes

---

## 💡 Tips

1. **Siempre usa try/catch** al llamar servicios
2. **Implementa loading states** para mejor UX
3. **Valida datos antes de enviar** al backend
4. **Maneja errores de forma amigable** para el usuario
5. **Reinicia el servidor** después de cambiar `.env`

---

## 🆘 Soporte

Si necesitas ayuda:
- Revisa la consola del navegador para errores
- Verifica que el backend esté corriendo
- Revisa que la URL en `.env` sea correcta
- Asegúrate de tener el token válido para rutas protegidas

---

**¡Todo listo para empezar a usar la API! 🎉**
