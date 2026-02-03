# 👥 Componentes de Gestión de Usuarios - Guía de Uso

Esta guía explica cómo usar los componentes del CRUD de usuarios que se han implementado.

## 📁 Estructura de Archivos

```
src/
├── components/
│   ├── Modal.jsx                    # Modal reutilizable
│   └── usuarios/
│       ├── ListaUsuarios.jsx        # Tabla de usuarios
│       └── FormularioUsuario.jsx    # Formulario crear/editar
├── pages/
│   └── GestionUsuarios.jsx          # Página principal
└── styles/
    ├── Modal.css
    ├── ListaUsuarios.css
    ├── FormularioUsuario.css
    └── GestionUsuarios.css
```

## 🚀 Implementación en tu App

### 1. Agregar la Ruta en App.jsx

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GestionUsuarios from './pages/GestionUsuarios';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta de gestión de usuarios (solo admin) */}
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <GestionUsuarios />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 2. Agregar Link en tu Menú/Navbar

```javascript
import { Link } from 'react-router-dom';
import authService from './services/authService';

function Navbar() {
  const esAdmin = authService.esAdmin();
  
  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      
      {/* Mostrar solo si es admin */}
      {esAdmin && (
        <Link to="/usuarios">👥 Usuarios</Link>
      )}
      
      <button onClick={() => authService.logout()}>
        Cerrar Sesión
      </button>
    </nav>
  );
}
```

## 📦 Componentes Incluidos

### 1. GestionUsuarios (Página Principal)

**Ruta:** `/usuarios`  
**Requiere:** Rol de administrador

Esta es la página principal que integra todos los componentes. Incluye:
- Header con título y botón "Nuevo Usuario"
- Información del usuario actual
- Lista de usuarios en tabla
- Modal para crear/editar usuarios

**Características:**
- ✅ Creación de usuarios
- ✅ Edición de usuarios
- ✅ Eliminación de usuarios
- ✅ Activar/Desactivar usuarios
- ✅ Actualización automática de la lista
- ✅ Confirmaciones antes de eliminar

### 2. ListaUsuarios (Tabla)

Muestra todos los usuarios del sistema en una tabla con:
- Nombre
- Email
- Rol (badge con color)
- Estado (Activo/Inactivo)
- Fecha de registro
- Acciones (Editar, Activar/Desactivar, Eliminar)

**Características:**
- ✅ Loading state con spinner
- ✅ Manejo de errores
- ✅ Empty state cuando no hay usuarios
- ✅ Hover effects
- ✅ Responsive design

### 3. FormularioUsuario

Formulario para crear o editar usuarios con validación.

**Campos:**
- Nombre completo (requerido)
- Email (requerido, con validación)
- Contraseña (requerida solo en creación, mínimo 6 caracteres)
- Rol (Usuario/Administrador)
- Estado activo (checkbox)

**Características:**
- ✅ Validación de campos
- ✅ Mostrar/ocultar contraseña
- ✅ Modo creación y edición
- ✅ Mensajes de error claros
- ✅ Loading state en botón de submit

### 4. Modal (Reutilizable)

Modal genérico que puedes usar para otros propósitos.

**Características:**
- ✅ Cerrar con ESC
- ✅ Cerrar al hacer click fuera
- ✅ Bloqueo del scroll del body
- ✅ Animaciones suaves
- ✅ Tamaños configurables (small, medium, large)

## 💡 Ejemplos de Uso

### Usar el Modal en otro componente

```javascript
import { useState } from 'react';
import Modal from './components/Modal';

function MiComponente() {
  const [mostrarModal, setMostrarModal] = useState(false);

  return (
    <>
      <button onClick={() => setMostrarModal(true)}>
        Abrir Modal
      </button>

      <Modal
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        title="Mi Modal"
        size="medium"
      >
        <div style={{ padding: '1.5rem' }}>
          <p>Contenido del modal</p>
        </div>
      </Modal>
    </>
  );
}
```

### Usar ListaUsuarios independientemente

```javascript
import ListaUsuarios from './components/usuarios/ListaUsuarios';

function MiPagina() {
  const handleEditar = (usuario) => {
    console.log('Editar:', usuario);
    // Tu lógica aquí
  };

  return (
    <div>
      <h1>Usuarios</h1>
      <ListaUsuarios onEdit={handleEditar} />
    </div>
  );
}
```

### Usar FormularioUsuario en otro contexto

```javascript
import FormularioUsuario from './components/usuarios/FormularioUsuario';

function CrearUsuario() {
  const handleSuccess = () => {
    console.log('Usuario guardado');
    // Redirigir o mostrar mensaje
  };

  return (
    <div className="container">
      <FormularioUsuario 
        onSuccess={handleSuccess}
      />
    </div>
  );
}
```

## 🎨 Personalización de Estilos

### Cambiar colores del tema

Edita los archivos CSS para cambiar los colores:

```css
/* En cualquier archivo CSS */

/* Color primario */
.btn-primary {
  background: #1976d2; /* Cambia este color */
}

/* Badges de roles */
.badge-admin {
  background: #fce4ec;
  color: #c2185b;
}

.badge-usuario {
  background: #e3f2fd;
  color: #1976d2;
}
```

### Añadir más columnas a la tabla

En [ListaUsuarios.jsx](src/components/usuarios/ListaUsuarios.jsx):

```javascript
<thead>
  <tr>
    <th>Nombre</th>
    <th>Email</th>
    <th>Rol</th>
    <th>Estado</th>
    <th>Teléfono</th> {/* Nueva columna */}
    <th>Acciones</th>
  </tr>
</thead>
<tbody>
  {usuarios.map((usuario) => (
    <tr key={usuario._id}>
      <td>{usuario.nombre}</td>
      <td>{usuario.email}</td>
      <td>...</td>
      <td>...</td>
      <td>{usuario.telefono}</td> {/* Nueva columna */}
      <td>...</td>
    </tr>
  ))}
</tbody>
```

## 🔐 Seguridad

### Verificación de Permisos

Los componentes asumen que estás usando `ProtectedRoute` con `requireAdmin={true}`:

```javascript
<Route 
  path="/usuarios" 
  element={
    <ProtectedRoute requireAdmin={true}>
      <GestionUsuarios />
    </ProtectedRoute>
  } 
/>
```

### Validaciones del Backend

Los componentes manejan errores del backend:
- Email duplicado
- Contraseña muy corta
- Token expirado (redirige a login automáticamente)
- Sin permisos (403)

## 📱 Responsive Design

Todos los componentes son totalmente responsive:

- **Desktop:** Tabla completa con todas las columnas
- **Tablet:** Tabla con scroll horizontal si es necesario
- **Mobile:** 
  - Modal ocupa pantalla completa
  - Botones de ancho completo
  - Formulario en una columna
  - Tabla con scroll horizontal

## ⚡ Características Avanzadas

### 1. Auto-refresh después de operaciones

La lista se actualiza automáticamente después de:
- Crear usuario
- Editar usuario
- Eliminar usuario
- Cambiar estado

### 2. Confirmaciones

Se pide confirmación antes de:
- Eliminar usuario
- Cambiar estado (opcional, puedes activarlo)

### 3. Loading States

Todos los componentes muestran estados de carga:
- Spinner al cargar usuarios
- Botón deshabilitado con texto "Guardando..."
- Inputs deshabilitados durante operaciones

### 4. Manejo de Errores

Errores manejados:
- Error de conexión
- Error 401 (token expirado)
- Error 403 (sin permisos)
- Error 400 (datos inválidos)
- Error 500 (error del servidor)

## 🐛 Troubleshooting

### La lista no se actualiza después de crear/editar

Verifica que estás usando `onSuccess` en el formulario:

```javascript
<FormularioUsuario
  onSuccess={handleSuccess} // Debe estar presente
/>
```

### Modal no se cierra

Verifica que estás pasando `onClose`:

```javascript
<Modal
  isOpen={mostrarModal}
  onClose={() => setMostrarModal(false)} // Importante
/>
```

### No puedo acceder a /usuarios

Verifica que:
1. Tu usuario tiene rol "admin"
2. Estás usando `ProtectedRoute` con `requireAdmin={true}`
3. El token es válido

```javascript
// Verificar en consola
import authService from './services/authService';
console.log('Es admin?', authService.esAdmin());
```

## 🚀 Próximos Pasos

Mejoras que puedes implementar:

1. **Búsqueda y filtros:** Agregar búsqueda por nombre/email
2. **Paginación:** Para manejar muchos usuarios
3. **Ordenamiento:** Ordenar columnas al hacer click
4. **Exportar a CSV/Excel:** Descargar lista de usuarios
5. **Bulk actions:** Eliminar/activar múltiples usuarios
6. **Avatar/Foto de perfil:** Subida de imágenes
7. **Toast notifications:** Notificaciones más elegantes
8. **Historial de cambios:** Auditoría de modificaciones

## 📊 Estadísticas

Puedes agregar un dashboard con estadísticas:

```javascript
function EstadisticasUsuarios() {
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    admins: 0
  });

  useEffect(() => {
    const calcularStats = async () => {
      const response = await userService.obtenerTodos();
      const usuarios = response.data;
      
      setStats({
        total: usuarios.length,
        activos: usuarios.filter(u => u.activo).length,
        admins: usuarios.filter(u => u.rol === 'admin').length
      });
    };
    
    calcularStats();
  }, []);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>{stats.total}</h3>
        <p>Total Usuarios</p>
      </div>
      <div className="stat-card">
        <h3>{stats.activos}</h3>
        <p>Activos</p>
      </div>
      <div className="stat-card">
        <h3>{stats.admins}</h3>
        <p>Administradores</p>
      </div>
    </div>
  );
}
```

---

**¡Todo listo para gestionar usuarios! 🎉**
