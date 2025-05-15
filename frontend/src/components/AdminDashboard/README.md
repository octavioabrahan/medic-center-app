# AdminDashboard Component

Este componente proporciona el menú lateral y el layout para todas las páginas de administración de la aplicación del centro médico.

## Componentes disponibles

### AdminSidebar

Menú lateral que muestra las opciones de navegación para el panel de administración.

**Props:**
- `username` (string): Nombre del usuario logueado
- `role` (string): Rol del usuario logueado
- `activePage` (string): Ruta activa actual para resaltar la opción del menú

### AdminLayout

Layout principal que envuelve cualquier página de administración, incluye el menú lateral.

**Props:**
- `children` (ReactNode): Contenido principal de la página
- `username` (string): Nombre del usuario logueado
- `role` (string): Rol del usuario logueado
- `activePage` (string): Ruta activa actual para resaltar la opción del menú

## Uso

```jsx
import { AdminLayout } from "../../components/AdminDashboard";

function MiPaginaAdmin() {
  return (
    <AdminLayout 
      activePage="/admin/mi-ruta" 
      username="Nombre Usuario" 
      role="Rol Usuario"
    >
      {/* Contenido de tu página aquí */}
      <h1>Título de la página</h1>
      <p>Contenido...</p>
    </AdminLayout>
  );
}
```

## Rutas disponibles en el menú

- `/admin/dashboard` - Resumen general
- `/admin/citas` - Citas agendadas
- `/admin/horarios` - Horarios de atención
- `/admin/especialidades` - Especialidades y profesionales
- `/admin/servicios` - Servicios
- `/admin/convenios` - Convenios
- `/admin/cotizaciones` - Cotizaciones enviadas
- `/admin/examenes` - Exámenes y servicios
- `/admin/usuarios` - Usuarios y roles
