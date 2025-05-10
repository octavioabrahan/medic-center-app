# Guía de Estilos para Botones - Medic Center App

Este documento describe cómo utilizar los componentes de botón en la aplicación Medic Center, incluyendo el nuevo sistema de botones basado en los design tokens importados desde Figma.

## Dos sistemas de botones

Actualmente, la aplicación cuenta con dos sistemas de botones:

1. **Sistema original** (clase `.btn-*`)
2. **Nuevo sistema** (clase `.button`) basado en los nuevos design tokens de Figma

Para nuevos desarrollos, recomendamos usar el **nuevo sistema**, que está completamente alineado con los design tokens y ofrece mayor consistencia visual.

## Nuevo Sistema de Botones (`.button`)

### Estructura básica

```html
<!-- Botón básico -->
<button class="button variant-primary">
  <span class="button-text">Agendar cita</span>
</button>

<!-- Botón con icono -->
<button class="button variant-primary">
  <svg class="heroicons-micro-plus" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 5v14m-7-7h14"/>
  </svg>
  <span class="button-text">Agregar paciente</span>
</button>
```

### Variantes

El sistema incluye tres variantes principales:

```html
<!-- Variante primaria (azul) -->
<button class="button variant-primary">
  <span class="button-text">Botón primario</span>
</button>

<!-- Variante neutral (gris) -->
<button class="button variant-neutral">
  <span class="button-text">Botón neutral</span>
</button>

<!-- Variante subtle (transparente) -->
<button class="button variant-subtle">
  <span class="button-text">Botón subtle</span>
</button>
```

### Estados

Los botones pueden tener diferentes estados:

```html
<!-- Estado por defecto (no requiere clase adicional) -->
<button class="button variant-primary">
  <span class="button-text">Botón normal</span>
</button>

<!-- Estado hover (para demostración) -->
<button class="button variant-primary state-hover">
  <span class="button-text">Botón hover</span>
</button>

<!-- Estado deshabilitado -->
<button class="button variant-primary state-disabled">
  <span class="button-text">Botón deshabilitado</span>
</button>

<!-- Estado de carga -->
<button class="button variant-primary state-loading">
  <span class="button-text">Cargando...</span>
</button>
```

### Tamaños

El sistema ofrece dos tamaños:

```html
<!-- Tamaño normal (por defecto) -->
<button class="button variant-primary">
  <span class="button-text">Botón normal</span>
</button>

<!-- Tamaño pequeño -->
<button class="button variant-primary size-small">
  <span class="button-text">Botón pequeño</span>
</button>
```

### Botón de ancho completo

```html
<button class="button variant-primary width-full">
  <span class="button-text">Botón de ancho completo</span>
</button>
```

### Enlaces como botones

También puedes usar enlaces con estilo de botón:

```html
<a href="/nueva-cita" class="button variant-primary">
  <span class="button-text">Ir a nueva cita</span>
</a>
```

## Sistema original de botones (`.btn-*`)

El sistema original sigue siendo compatible y cuenta con:

```html
<!-- Botón primario -->
<button class="btn btn-primary btn-medium">Botón primario</button>

<!-- Botón neutral -->
<button class="btn btn-neutral btn-medium">Botón neutral</button>

<!-- Botón subtle -->
<button class="btn btn-subtle btn-medium">Botón subtle</button>

<!-- Botón de peligro/eliminación -->
<button class="btn btn-danger btn-medium">Eliminar</button>

<!-- Botón pequeño -->
<button class="btn btn-primary btn-small">Pequeño</button>

<!-- Botón con icono -->
<button class="btn btn-primary btn-medium btn-icon-text">
  <i class="fas fa-plus"></i> Agregar
</button>

<!-- Botón solo con icono -->
<button class="btn btn-primary btn-icon">
  <i class="fas fa-plus"></i>
</button>

<!-- Botón con estado de carga -->
<button class="btn btn-primary btn-medium btn-loading">Cargando</button>
```

### Grupos de botones

```html
<div class="btn-group">
  <button class="btn btn-neutral btn-medium">Anterior</button>
  <button class="btn btn-neutral btn-medium">Siguiente</button>
</div>
```

## Migración del sistema antiguo al nuevo

Para migrar un botón del sistema antiguo al nuevo:

```html
<!-- Botón antiguo -->
<button class="btn btn-primary btn-medium">Texto del botón</button>

<!-- Se convierte en -->
<button class="button variant-primary">
  <span class="button-text">Texto del botón</span>
</button>
```

## Correspondencias entre sistemas

| Sistema antiguo | Sistema nuevo |
|----------------|---------------|
| `.btn-primary` | `.button.variant-primary` |
| `.btn-neutral` | `.button.variant-neutral` |
| `.btn-subtle` | `.button.variant-subtle` |
| `.btn-danger` | (No implementado aún) |
| `.btn-medium` | `.button` (por defecto) |
| `.btn-small` | `.button.size-small` |
| `.btn-block` | `.button.width-full` |
| `.btn-loading` | `.button.state-loading` |
| `.disabled` | `.state-disabled` |

---

**Nota**: Para nuevos desarrollos en la aplicación, utiliza siempre el nuevo sistema de botones (`.button`) que está alineado con los design tokens exportados desde Figma.