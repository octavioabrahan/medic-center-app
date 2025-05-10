# Componente SearchField

Este documento describe la implementación del componente de búsqueda (SearchField) actualizado según el diseño de Figma.

## Descripción

El componente `SearchField` es un campo de búsqueda reutilizable que incluye:

1. Icono de lupa
2. Campo de entrada de texto
3. Botón de limpiar (aparece cuando hay texto)
4. Opción de botón de búsqueda

## Propiedades

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| placeholder | string | 'Buscar' | Texto de placeholder para el campo |
| value | string | '' | Valor actual del campo |
| onChange | function | () => {} | Función a ejecutar cuando cambia el valor |
| onSearch | function | () => {} | Función a ejecutar al presionar enter o hacer clic en el botón |
| disabled | boolean | false | Estado deshabilitado del campo |
| small | boolean | false | Si es true, se usa el tamaño pequeño |
| withButton | boolean | false | Si es true, se muestra un botón de búsqueda |
| buttonText | string | 'Buscar' | Texto para el botón (si withButton es true) |

## Ejemplo de uso

```jsx
import SearchField from '../../components/common/SearchField';

// Búsqueda básica
<SearchField
  placeholder="Buscar por nombre"
  value={searchTerm}
  onChange={(value) => setSearchTerm(value)}
/>

// Con botón de búsqueda
<SearchField
  placeholder="Buscar por nombre"
  value={searchTerm}
  onChange={(value) => setSearchTerm(value)}
  onSearch={handleSearch}
  withButton={true}
  buttonText="Buscar"
/>

// Tamaño pequeño y deshabilitado
<SearchField
  placeholder="Buscar"
  value={searchTerm}
  onChange={(value) => setSearchTerm(value)}
  small={true}
  disabled={true}
/>
```

## Estados y variantes

### Estados
- `state-default`: Estado normal del campo
- `state-disabled`: Estado deshabilitado
- `value-type-placeholder`: Cuando no hay texto (muestra el placeholder)
- `value-type-text`: Cuando hay texto ingresado

### Tamaños
- `size-default`: Tamaño normal (altura de 44px)
- `size-small`: Tamaño pequeño (altura de 36px)

### Variantes
- Estándar: Solo campo de búsqueda con icono
- Con botón: Campo de búsqueda + botón de acción

## Estructura HTML

```html
<div class="search-container">
  <div class="search state-default size-default value-type-placeholder">
    <div class="search-icon-container">
      <svg class="heroicons-micro-magnifying-glass">...</svg>
    </div>
    <input type="text" class="value" placeholder="Buscar" />
    <div class="clear-icon-container">
      <svg class="heroicons-micro-x-mark">...</svg>
    </div>
  </div>
  <!-- Si withButton es true -->
  <button class="button button--primary">Buscar</button>
</div>
```

## Estilos CSS

El componente utiliza las siguientes clases CSS principales:

- `.search-container`: Contenedor principal
- `.search`: Campo de búsqueda
- `.search-icon-container`: Contenedor del icono de lupa
- `.clear-icon-container`: Contenedor del icono de limpiar
- `.value`: Input de texto
- `.search-with-button`: Contenedor cuando hay botón de búsqueda

Todos los estilos utilizan variables del sistema de diseño definidas en `_design-tokens.css`.
