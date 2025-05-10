# Sistema de Formularios

Este documento describe la implementación del sistema de formularios actualizado según el diseño de Figma.

## Componente `FormField`

El componente `FormField` es una abstracción que proporciona un campo de formulario con etiqueta, mensajes de error y estados. Está diseñado para ser utilizado con todos los tipos de campos de formulario (text, email, password, select, textarea, etc).

### Propiedades

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| id | string | - | ID único del campo (requerido para la accesibilidad) |
| label | string | - | Etiqueta descriptiva del campo |
| type | string | 'text' | Tipo de input (text, email, password, select, textarea, etc) |
| placeholder | string | '' | Texto de placeholder |
| value | string | '' | Valor actual del campo |
| onChange | function | - | Función a ejecutar cuando cambia el valor |
| onBlur | function | - | Función a ejecutar cuando el campo pierde el foco |
| required | boolean | false | Indica si el campo es obligatorio |
| disabled | boolean | false | Estado deshabilitado del campo |
| error | boolean | false | Indica si hay un error en el campo |
| errorMessage | string | '' | Mensaje de error para mostrar |
| helpText | string | '' | Texto de ayuda adicional |

### Ejemplo de uso

```jsx
import FormField from '../components/common/FormField';

// Campo de texto básico
<FormField
  id="nombre"
  label="Nombre"
  type="text"
  placeholder="Ingrese su nombre"
  value={nombre}
  onChange={(e) => setNombre(e.target.value)}
  required
/>

// Campo con error
<FormField
  id="email"
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={!isValidEmail(email)}
  errorMessage="Por favor, ingrese un email válido"
  required
/>

// Select
<FormField
  id="especialidad"
  label="Especialidad"
  type="select"
  value={especialidad}
  onChange={(e) => setEspecialidad(e.target.value)}
  required
>
  <option value="">Seleccione una especialidad</option>
  <option value="medicina-general">Medicina General</option>
  <option value="pediatria">Pediatría</option>
</FormField>

// Textarea
<FormField
  id="observaciones"
  label="Observaciones"
  type="textarea"
  placeholder="Ingrese sus observaciones"
  value={observaciones}
  onChange={(e) => setObservaciones(e.target.value)}
/>
```

## Clases CSS

El sistema de formularios utiliza las siguientes clases CSS principales:

- `.form-field`: Contenedor principal del campo de formulario
- `.form-field-label`: Etiqueta del campo
- `.form-field-input`: Input, select o textarea
- `.form-field-error`: Mensaje de error
- `.form-field-help`: Texto de ayuda
- `.form-field-required`: Indicador de campo obligatorio (*)
- `.form-field-icon`: Icono dentro del campo (por ejemplo, para limpiar o validar)

### Estados

- `.state-default`: Estado normal del campo
- `.state-disabled`: Estado deshabilitado
- `.state-error`: Estado de error

## Compatibilidad con el sistema anterior

Para mantener la compatibilidad con el sistema anterior, se han conservado y actualizado las siguientes clases:

- `.form-group`: Contenedor de grupo de formulario
- `.form-buttons`: Contenedor para botones de formulario

## Variables de diseño

Este sistema utiliza variables de diseño del archivo `_design-tokens.css` para mantener la consistencia visual con el resto de la aplicación.
