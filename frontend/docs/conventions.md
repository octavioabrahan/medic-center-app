# Convenciones para el Frontend del Medic-Center-App

## Estructura de Directorios

```
frontend/
  ├── src/
      ├── assets/            # Recursos estáticos (imágenes, iconos, etc.)
      ├── components/        # Componentes reutilizables
      │   ├── ui/            # Componentes de UI básicos (botones, inputs, etc.)
      │   ├── layouts/       # Layouts para diferentes secciones
      │   └── shared/        # Componentes compartidos entre múltiples funcionalidades
      ├── features/          # Módulos de características del sistema
      │   ├── admin/
      │   ├── auth/
      │   ├── agendamiento/
      │   ├── cotizaciones/
      │   └── pacientes/
      ├── hooks/             # Custom hooks
      ├── pages/             # Pages que integran componentes y features
      ├── services/          # Servicios para API, autenticación, etc.
      ├── store/             # Estado global de la aplicación
      ├── styles/            # Estilos globales y temas
      │   ├── base/          # Estilos base (reset, variables, mixins)
      │   ├── themes/        # Temas de la aplicación
      │   └── global.css     # Estilos globales
      ├── utils/             # Utilidades y helpers
      └── App.js             # Componente raíz
```

## Convenciones de Nombrado

### Archivos y Carpetas
- **Componentes**: PascalCase (`Button.js`, `AdminSidebar.js`)
- **Páginas**: PascalCase (`LoginPage.js`, `DashboardPage.js`)
- **Utilidades/Servicios**: camelCase (`apiService.js`, `dateUtils.js`)
- **Archivos CSS**: Mismo nombre que el componente usando módulos CSS (`Button.module.css`)

### Estructura de Componentes
Cada componente debe tener su propia carpeta con la siguiente estructura:

```
Button/
  ├── Button.js
  ├── Button.module.css
  ├── Button.test.js
  └── index.js  # Para exportar el componente
```

## Estilos (CSS)
- Utilizaremos **CSS Modules** para evitar colisiones de estilos
- Nombrado de clases con metodología BEM (Block Element Modifier):
  ```css
  .button {}
  .button--primary {}
  .button__icon {}
  ```
- Variables CSS globales en `styles/base/variables.css` para colores, tipografía, espaciado, etc.

## Componentes UI Comunes
Todos los componentes UI reutilizables deberán ubicarse en `components/ui/` siguiendo la estructura de componentes definida anteriormente. Entre estos componentes se incluyen:
- Button
- Modal
- Card
- Input
- Select
- Table
- Pagination
- Alert

## Importaciones
- Importar siempre desde el archivo índice del componente, no directamente el archivo del componente
- Ejemplo: `import { Button } from 'components/ui/Button'` en lugar de `import Button from 'components/ui/Button/Button'`

## Tipado
- Utilizar PropTypes para documentar las props de cada componente
- Documentar interfaces y tipos en caso de utilizar TypeScript

## Buenas Prácticas
- Un componente por archivo
- Mantener componentes pequeños y con una única responsabilidad
- No anidar demasiados componentes (max 3 niveles)
- Extraer lógica de componentes a hooks personalizados
- Evitar lógica compleja dentro de los componentes