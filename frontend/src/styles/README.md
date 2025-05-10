# Reorganización de Estilos CSS

## Estructura de la nueva arquitectura CSS

Se ha reorganizado la estructura de los archivos CSS del proyecto siguiendo una arquitectura modular que facilita el mantenimiento y la escalabilidad. La nueva estructura es la siguiente:

```
src/styles/
  ├── base/               # Estilos básicos y fundamentales
  │   ├── _reset.css      # Reset de estilos y normalización
  │   ├── _typography.css # Definiciones de tipografía
  │   └── _variables.css  # Variables CSS globales (colores, espaciados, etc.)
  │
  ├── components/         # Estilos de componentes reutilizables
  │   ├── _buttons.css    # Estilos para botones
  │   ├── _calendar.css   # Estilos para el componente de calendario
  │   ├── _forms.css      # Estilos para formularios
  │   └── _modal.css      # Estilos para modales
  │
  ├── layout/             # Componentes estructurales
  │   ├── _admin.css      # Layout de administración
  │   └── _sidebar.css    # Barra lateral
  │
  ├── pages/              # Estilos específicos por página
  │   └── _admin.css      # Estilos para las páginas de administración
  │
  ├── themes/             # Temas y variaciones (no implementado aún)
  │
  ├── utils/              # Utilidades
  │   └── _helpers.css    # Clases utilitarias (márgenes, padding, flex, etc.)
  │
  └── main.css            # Archivo principal que importa todos los estilos
```

## Cambios realizados

1. Se han creado módulos CSS separados y organizados por responsabilidad
2. Se ha implementado un sistema de variables CSS para mantener consistencia en colores, tipografía y espaciados
3. Se han extraído componentes comunes (botones, formularios, modales) a archivos separados
4. Las clases utilitarias se han agrupado en un único archivo para facilitar su uso
5. El archivo `main.css` centraliza todas las importaciones

## Próximos pasos a completar

Para finalizar la migración de manera segura, se deben completar los siguientes pasos:

1. **Eliminar las importaciones redundantes de CSS**: Varios componentes React están importando archivos CSS directamente. Estas importaciones ya no son necesarias, ya que todos los estilos se importan desde `index.js` a través de `main.css`.

   Ejemplos de importaciones que deben ser eliminadas:
   - `import "./Calendar.css"` en `components/common/Calendar.js`
   - `import './AdminLayout.css'` en `components/admin/AdminLayout.js`
   - Etc.

2. **Probar exhaustivamente la aplicación**: Después de eliminar las importaciones redundantes, verificar que todos los estilos se aplican correctamente en todas las páginas.

3. **Eliminar los archivos CSS antiguos**: Una vez que se confirme que todo funciona correctamente, se pueden eliminar los archivos CSS originales que ya no son necesarios.

4. **Actualizar las importaciones en componentes nuevos**: Asegurarse de que cualquier nuevo componente no importe archivos CSS individuales, sino que añada sus estilos a la estructura modular.

## Beneficios de la nueva estructura

- **Mantenibilidad**: Facilita encontrar y modificar estilos específicos
- **Reutilización**: Promueve la reutilización de componentes y estilos
- **Consistencia**: Las variables CSS garantizan un aspecto coherente en toda la aplicación
- **Escalabilidad**: Facilita la adición de nuevos componentes y estilos
- **Rendimiento**: Optimiza la carga de estilos al evitar duplicaciones

## Convenciones de nomenclatura

- **Nombres de archivos**: Los archivos parciales comienzan con guion bajo (_)
- **Clases de componentes**: Usar nombres descriptivos que reflejen la función (ej: `.btn`, `.modal`, `.form-group`)
- **Clases utilitarias**: Nombres cortos y precisos que indican su función (ej: `.mt-2`, `.d-flex`, `.text-center`)