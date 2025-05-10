# Componente AdminFilterBar

Este documento describe la implementación del componente AdminFilterBar actualizado según el diseño de Figma.

## Descripción

El componente `AdminFilterBar` es una barra de filtros reutilizable para las páginas de administración que incluye:

1. Campo de búsqueda
2. Filtro dropdown personalizable
3. Botones de ordenamiento A-Z y Z-A
4. Checkbox para mostrar/ocultar elementos archivados
5. Área para botones de acción (agregar, importar, etc.)

## Propiedades

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| searchTerm | string | '' | El término de búsqueda actual |
| setSearchTerm | function | - | Función para actualizar el término de búsqueda |
| searchPlaceholder | string | 'Buscar por nombre' | Texto placeholder para el campo de búsqueda |
| filterOptions | array | [] | Opciones para el filtro dropdown principal |
| filterValue | string | '' | Valor seleccionado actualmente en el filtro dropdown |
| setFilterValue | function | - | Función para actualizar el valor del filtro |
| filterLabel | string | 'Todos' | Label para el primer option del dropdown |
| showArchived | boolean | false | Estado para mostrar ítems archivados |
| setShowArchived | function | - | Función para actualizar el estado de mostrar archivados |
| sortOrder | string | 'az' | Orden de clasificación actual ("az" o "za") |
| setSortOrder | function | - | Función para actualizar el orden de clasificación |
| children | ReactNode | - | Elementos hijos (botones de acción) que se mostrarán en la barra de filtros |
| isExcepciones | boolean | false | Indica si es el caso de excepciones |

## Ejemplo de uso

```jsx
import AdminFilterBar from '../../components/admin/AdminFilterBar';

// Estado para los filtros
const [searchTerm, setSearchTerm] = useState('');
const [especialidad, setEspecialidad] = useState('');
const [showArchived, setShowArchived] = useState(false);
const [sortOrder, setSortOrder] = useState('az');

// Opciones para el filtro
const filterOptions = [
  { value: 'medicina-general', label: 'Medicina General' },
  { value: 'pediatria', label: 'Pediatría' },
  { value: 'traumatologia', label: 'Traumatología' }
];

// Usar el componente en la página
<AdminFilterBar
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  searchPlaceholder="Buscar por nombre o especialidad"
  filterOptions={filterOptions}
  filterValue={especialidad}
  setFilterValue={setEspecialidad}
  filterLabel="Todas las especialidades"
  showArchived={showArchived}
  setShowArchived={setShowArchived}
  sortOrder={sortOrder}
  setSortOrder={setSortOrder}
>
  {/* Botones de acción */}
  <div className="admin-actions">
    <button className="button button--primary">
      Agregar profesional
    </button>
    <button className="button button--neutral">
      Importar
    </button>
  </div>
</AdminFilterBar>
```

## Estilos

El componente utiliza las siguientes clases CSS principales:

- `.admin-filter-bar`: Contenedor principal
- `.filter-section`: Sección izquierda con filtros
- `.admin-search`: Contenedor del campo de búsqueda
- `.admin-dropdown`: Contenedor del dropdown de filtro
- `.admin-sort-buttons`: Contenedor de botones A-Z y Z-A
- `.sort-btn`: Botones individuales de ordenamiento
- `.show-archived`: Checkbox para mostrar/ocultar archivados
- `.admin-actions`: Contenedor de botones de acción

Todos los estilos utilizan variables del sistema de diseño definidas en `_design-tokens.css`.
