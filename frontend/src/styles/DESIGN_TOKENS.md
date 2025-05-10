# Sistema de Design Tokens - Medic Center App

Este documento detalla la implementación del sistema de design tokens importados desde Figma a la aplicación Medic Center. Los design tokens son variables que definen los elementos visuales fundamentales de la interfaz, garantizando consistencia en todo el producto.

## Contenido
1. [Introducción](#introducción)
2. [Estructura del Sistema](#estructura-del-sistema)
3. [Tokens Disponibles](#tokens-disponibles)
4. [Cómo Usar los Tokens](#cómo-usar-los-tokens)
5. [Ejemplos de Uso](#ejemplos-de-uso)

## Introducción

Los design tokens son variables que almacenan valores de diseño como colores, tipografía, espaciados, etc. Estos tokens han sido exportados desde Figma y adaptados para su uso en CSS. El uso de tokens asegura:

- **Consistencia visual** en toda la aplicación
- **Cambios más eficientes** - un cambio en el token se refleja en todos los lugares donde se usa
- **Mejor mantenimiento** del código
- **Adaptabilidad** para diferentes temas o modos (claro/oscuro)

## Estructura del Sistema

El sistema de design tokens está organizado en los siguientes archivos:

- `_design-tokens.css` - Contiene todos los tokens de diseño
- `_typography.css` - Implementa los tokens de tipografía
- `_variables.css` - Variables de color y otras específicas de la aplicación

Los tokens se cargan en este orden en `main.css` para garantizar que estén disponibles en todo el sistema.

## Tokens Disponibles

### Espaciados (Size Tokens)

```css
--sds-size-space-0: 0;
--sds-size-space-050: 2px;
--sds-size-space-100: 4px;
--sds-size-space-150: 6px;
--sds-size-space-200: 8px;
--sds-size-space-300: 12px;
--sds-size-space-400: 16px;
--sds-size-space-600: 24px;
--sds-size-space-800: 32px;
--sds-size-space-1200: 48px;
--sds-size-space-1600: 64px;
--sds-size-space-2400: 96px;
--sds-size-space-4000: 160px;
```

### Radios de Borde

```css
--sds-size-radius-100: 4px;
--sds-size-radius-200: 8px;
--sds-size-radius-400: 16px;
--sds-size-radius-full: 9999px;
```

### Tipografía

#### Familias de Fuentes
```css
--sds-typography-family-sans: 'Inter', sans-serif;
--sds-typography-family-serif: 'Noto Serif', serif;
--sds-typography-family-mono: 'Roboto Mono', monospace;
```

#### Pesos de Fuentes
```css
--sds-typography-weight-thin: 100;
--sds-typography-weight-regular: 400;
--sds-typography-weight-medium: 500;
--sds-typography-weight-semibold: 600;
--sds-typography-weight-bold: 700;
```

#### Escalas de Tamaño
```css
--sds-typography-scale-01: 12px;  /* Extra pequeño */
--sds-typography-scale-02: 14px;  /* Pequeño */
--sds-typography-scale-03: 16px;  /* Base */
--sds-typography-scale-04: 20px;  /* Medio */
--sds-typography-scale-05: 24px;  /* Grande */
--sds-typography-scale-06: 32px;  /* Extra grande */
--sds-typography-scale-07: 40px;  /* 2XL */
--sds-typography-scale-08: 48px;  /* 3XL */
--sds-typography-scale-09: 64px;  /* 4XL */
--sds-typography-scale-10: 72px;  /* 5XL */
```

### Responsividad
```css
--sds-responsive-device-width-desktop: 1200px;
--sds-responsive-device-width-tablet: 768px;
--sds-responsive-device-width-mobile: 375px;
```

## Cómo Usar los Tokens

Para utilizar los design tokens en tus componentes CSS:

```css
.mi-componente {
  padding: var(--sds-size-space-400);
  border-radius: var(--sds-size-radius-200);
  font-family: var(--sds-typography-family-sans);
  font-size: var(--sds-typography-scale-03);
  font-weight: var(--sds-typography-weight-medium);
}
```

Para tipografía, se han creado clases de utilidad que puedes usar directamente en HTML:

```html
<h1 class="title-hero">Título Principal</h1>
<p class="body-text">Este es un párrafo con texto normal.</p>
<p class="body-text-strong">Este es texto en negrita.</p>
```

## Ejemplos de Uso

### Tarjeta de Cita Médica

```css
.appointment-card {
  padding: var(--sds-size-space-400);
  border-radius: var(--sds-size-radius-200);
  background-color: white;
  box-shadow: 0 var(--sds-size-depth-100) var(--sds-size-depth-200) rgba(0, 0, 0, 0.1);
}

.appointment-card__title {
  font-family: var(--sds-typography-heading-font-family);
  font-size: var(--sds-typography-heading-size-base);
  font-weight: var(--sds-typography-weight-bold);
  margin-bottom: var(--sds-size-space-200);
}

.appointment-card__datetime {
  font-family: var(--sds-typography-body-font-family);
  font-size: var(--sds-typography-body-size-medium);
  color: var(--color-gray-700);
  margin-bottom: var(--sds-size-space-300);
}

.appointment-card__doctor {
  font-family: var(--sds-typography-body-font-family);
  font-size: var(--sds-typography-body-size-medium);
  font-weight: var(--sds-typography-weight-medium);
}
```

### Formulario de Registro

```css
.form-group {
  margin-bottom: var(--sds-size-space-400);
}

.form-label {
  display: block;
  font-family: var(--sds-typography-body-font-family);
  font-size: var(--sds-typography-body-size-medium);
  font-weight: var(--sds-typography-weight-medium);
  margin-bottom: var(--sds-size-space-100);
}

.form-input {
  width: 100%;
  padding: var(--sds-size-space-300);
  border: var(--sds-size-stroke-border) solid var(--color-gray-300);
  border-radius: var(--sds-size-radius-100);
  font-family: var(--sds-typography-body-font-family);
  font-size: var(--sds-typography-body-size-medium);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 var(--sds-size-stroke-focus-ring) rgba(97, 218, 251, 0.25);
}
```

---

Este sistema de design tokens está diseñado para crecer con la aplicación. Si necesitas añadir nuevos tokens o modificar los existentes, deberías hacerlo en el archivo `_design-tokens.css`.