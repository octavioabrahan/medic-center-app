# Sistema de Diseño - Aplicación Médica

Este documento describe la implementación del sistema de diseño y componentes estilizados según las especificaciones de Figma en la aplicación médica.

## Estructura del Sistema de Diseño

El sistema de diseño implementado está organizado de la siguiente manera:

### 1. Design Tokens

Ubicados en `/frontend/src/styles/base/_design-tokens.css`, estos tokens definen las variables fundamentales del diseño:

- **Espaciado**: Variables para márgenes, padding y posicionamiento
- **Tipografía**: Familia, tamaño, peso y altura de línea
- **Colores**: Paleta de colores corporativa y funcional
- **Radios de borde**: Para uniformidad en elementos redondeados
- **Elevación/Profundidad**: Para sombras y efectos de profundidad

### 2. Componentes Estilizados

Los componentes visuales reutilizables han sido implementados siguiendo el diseño de Figma:

- **Botones**: Sistema completo con variantes (primary, neutral, subtle) y estados
- **Campos de búsqueda**: Componente SearchField con diferentes configuraciones
- **Campos de formulario**: Implementación estandarizada de inputs, selects, textareas
- **Barra de filtros**: Para filtrado y búsqueda en interfaces administrativas

### 3. Documentación

Cada componente principal cuenta con su propia documentación:

- `/frontend/src/styles/components/BUTTONS.md`
- `/frontend/src/styles/components/FORMS.md`
- `/frontend/src/styles/components/ADMIN_FILTER_BAR.md`

## Uso de Componentes

### Botones

```jsx
// Botón primario
<button className="button button--primary">
  Acción principal
</button>

// Botón neutral
<button className="button button--neutral">
  Acción secundaria
</button>

// Botón sutil
<button className="button button--subtle">
  Acción terciaria
</button>

// Botón pequeño
<button className="button button--primary button--small">
  Acción pequeña
</button>
```

### Campo de búsqueda

```jsx
<SearchField
  placeholder="Buscar por nombre"
  value={searchTerm}
  onChange={setSearchTerm}
  onSearch={handleSearch}
  withButton={true}
  buttonText="Buscar"
/>
```

### Campo de formulario

```jsx
<FormField
  id="nombre"
  label="Nombre completo"
  type="text"
  placeholder="Ingrese su nombre completo"
  value={nombre}
  onChange={handleNombreChange}
  required
/>
```

### Barra de filtros de administración

```jsx
<AdminFilterBar
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  searchPlaceholder="Buscar por nombre o ID"
  showArchived={showArchived}
  setShowArchived={setShowArchived}
  sortOrder={sortOrder}
  setSortOrder={setSortOrder}
>
  <div className="admin-actions">
    <button className="button button--primary">
      Agregar nuevo
    </button>
  </div>
</AdminFilterBar>
```

## Pendientes de Implementación

1. **Responsividad**: Revisar y ajustar componentes para diferentes tamaños de pantalla.
2. **Sistema de temas**: Implementar modo claro/oscuro basado en los tokens de diseño.
3. **Extensión a otros componentes**: Actualizar tablas, alertas, tarjetas y otros elementos de interfaz.
4. **Optimización**: Mejorar performance de CSS y unificar estilos duplicados.

## Recomendaciones para Desarrollo

1. Utilizar siempre los componentes proporcionados para mantener la consistencia visual.
2. No modificar directamente las variables de diseño, utilizar las clases y componentes proporcionados.
3. Para nuevos componentes, seguir el patrón establecido de uso de design tokens.
4. Documentar cualquier nuevo componente o variante en el formato establecido.
