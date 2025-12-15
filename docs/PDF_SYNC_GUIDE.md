# Guía de Sincronización y Extensión del Sistema de Reportes PDF

Esta guía documenta la arquitectura del sistema de generación de reportes PDF, cómo se sincronizan con la configuración del editor, y los pasos para registrar nuevos cuestionarios.

## 1. Arquitectura del Sistema

El sistema consta de tres componentes principales que funcionan en conjunto:

### A. Definición de Tipos (`src/lib/reportTypeTemplates.ts`)

Es la **Fuente de Verdad**. Define:

- Los tipos de reporte disponibles (`ReportType`).
- Las secciones personalizadas para cada tipo (`custom_sections`).
- La configuración por defecto (textos, colores, orden).

### B. Editor de Configuración (`src/pages/ReportSettings.tsx`)

- Ruta: `/admin/report-settings`
- Permite a los administradores modificar los textos, colores y visibilidad de secciones.
- Guarda la configuración en la tabla `report_settings` de Supabase.
- **Importante**: La tabla `report_settings` actúa como un "Singleton" (una sola fila) que almacena la configuración global activa.

### C. Generador Unificado (`src/lib/ReportPDFGenerator.ts`)

- Es el motor que genera el PDF final.
- Lee la configuración de `report_settings`.
- Combina la configuración guardada con la estructura definida en `reportTypeTemplates.ts`.
- Genera dinámicamente las páginas según las secciones habilitadas.

---

## 2. Cómo Registrar un Nuevo Cuestionario

Para agregar un nuevo cuestionario y que genere su propio reporte personalizado, sigue estos pasos:

### Paso 1: Definir el Tipo

Edita `src/lib/reportTypeTemplates.ts`:

1. Agrega el ID a `ReportType`:

```typescript
export type ReportType = 'motricidad' | ... | 'nuevo_cuestionario';
```

2. Agrega la configuración al array `reportTypeTemplates`:

```typescript
{
  id: 'nuevo_cuestionario',
  name: 'Nuevo Cuestionario',
  description: 'Descripción del reporte...',
  icon: '📝',
  custom_sections: [
    { id: 'intro', title: 'Introducción' },
    { id: 'analisis', title: 'Análisis de Resultados' },
    { id: 'conclusion', title: 'Conclusiones' }
  ],
  defaultConfig: {
    header_text: 'Reporte Nuevo',
    // ... otros defaults ...
    section_order: ['intro', 'analisis', 'conclusion']
  }
}
```

### Paso 2: Vincular en Resultados

En la página donde se muestra el resultado (ej. `src/pages/QuestionnaireResult.tsx`), asegúrate de mapear el tipo de cuestionario al tipo de reporte:

```typescript
// src/pages/QuestionnaireResult.tsx
const reportTypeMap: Record<string, ReportType> = {
  'tipo_en_db': 'nuevo_cuestionario',
  // ...
};
```

### Paso 3: (Opcional) Gráficos Personalizados

Si el reporte requiere gráficos específicos (distintos a los textos estándar), debes modificar `src/lib/ReportPDFGenerator.ts`:

1. Crea un método privado para tu gráfico, ej. `addNuevoGraficoPage(reportData)`.
2. Llama a este método dentro de `generatePDF`:

```typescript
// src/lib/ReportPDFGenerator.ts
async generatePDF(reportData: ReportData): Promise<void> {
    // ... carga de settings ...
  
    this.addCoverPage(reportData);
  
    // Agrega tu página personalizada si es el tipo correcto
    if (reportData.reportType === 'nuevo_cuestionario') {
        this.addNuevoGraficoPage(reportData);
    }
  
    // ... resto de páginas dinámicas ...
}
```

---

## 3. Funcionamiento del Editor PDF (`ReportSettings`)

El editor (`src/pages/ReportSettings.tsx`) es dinámico. Cuando seleccionas un "Tipo de Reporte" en el dropdown:

1. **Carga la Plantilla**: Usa `getReportTypeTemplate(type)` para saber qué secciones existen.
2. **Combina con DB**: Busca en `report_settings` si ya guardaste textos para esas secciones.
3. **Muestra Campos**: Genera automáticamente los inputs para `content_[id]_text` basados en `custom_sections`.

**¿Qué se mueve?**

- Al cambiar de tipo de reporte, el editor actualiza el estado `reportSections` y `settings`.
- Los textos se guardan en columnas dinámicas o en el campo JSONB `dynamic_content` de la base de datos, permitiendo flexibilidad sin crear columnas nuevas por cada cuestionario.

---

## 4. Rutas y Archivos Clave

| Funcionalidad              | Archivo / Ruta                                  | Descripción                                                                              |
| -------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Definiciones**     | `src/lib/reportTypeTemplates.ts`              | Configuración base de todos los reportes.                                                |
| **Generador PDF**    | `src/lib/ReportPDFGenerator.ts`               | Lógica de generación (jsPDF). Aquí se hacen los cambios de diseño PDF.                |
| **Editor UI**        | `src/pages/ReportSettings.tsx`                | Interfaz administrativa (`/admin/report-settings`).                                     |
| **Vista Resultados** | `src/pages/QuestionnaireResult.tsx`           | Página web que llama al generador PDF.                                                   |
| **Evaluaciones**     | `src/components/evaluations/PDFGenerator.tsx` | *Legacy/Específico*. Generador antiguo para 'Evaluación Motricidad' (ver nota abajo). |

> **Nota:** Existe un generador específico `src/components/evaluations/PDFGenerator.tsx` que parece ser usado solo para la sección de Evaluaciones manuales/físicas. Para los **Cuestionarios**, se debe usar siempre el **Generador Unificado** (`src/lib/ReportPDFGenerator.ts`).

---

## 5. Diferencia entre Tipos de PDF

Actualmente existen tres mecanismos distintos de generación de PDF en el sistema. Es crucial distinguir cuál se está modificando:

| Tipo                        | Archivo Generador                               | Uso / Contexto                                      | Características                                                                                                               |
| --------------------------- | ----------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **1. Cuestionarios**  | `src/lib/ReportPDFGenerator.ts`               | TAM, Cornell, CHAEA y Cuestionarios en la web.      | **Sistema Unificado**. Respeta la configuración de `ReportSettings`. Es el "estándar" moderno del proyecto.          |
| **2. Evaluaciones**   | `src/components/evaluations/PDFGenerator.tsx` | Evaluaciones físicas (Juego de Pesca, Laberintos). | **Legacy**. Generador específico para la tabla de puntuaciones motrices. No usa completamente el sistema de plantillas. |
| **3. Sugerencias IA** | `src/pages/Reports.tsx` (código inline)      | Botón "Generar Sugerencias IA" en `/reports`.    | **Ad-hoc**. El código PDF está hardcodeado dentro del componente React. No tiene plantilla.                            |

> **Para unificar el sistema:** El objetivo a largo plazo debería ser migrar (2) y (3) para que usen `ReportPDFGenerator.ts`, creando nuevos `ReportTypes` para ellos.

---

## 6. Cuestionarios Dinámicos (Creados en UI)

El sistema permite crear cuestionarios desde la interfaz (`/questionnaires/manage`).

### ¿Cómo se genera su PDF?

Por defecto, los cuestionarios creados manualmente **no tienen un tipo de reporte propio**.

- El sistema los trata internamente con un fallback (actualmente usa el estilo 'tam' o genérico).
- **Problema**: Si creas un cuestionario "Mi Encuesta", el PDF usará la plantilla predeterminada (TAM).

### ¿Cómo asignarles una plantilla propia?

Si necesitas que un cuestionario dinámico tenga su propio diseño PDF:

1. Crea el cuestionario en la UI.
2. Nota su "Tipo" o ID interno.
3. Edita el código (`src/pages/QuestionnaireResult.tsx`) para asignar ese tipo dinámico a un `ReportType` real en el mapa:
   ```typescript
   const reportTypeMap = {
     'custom': 'nuevo_tipo_personalizado', // Mapea el tipo 'custom' a tu plantilla
     // ...
   };
   ```
4. Define `'nuevo_tipo_personalizado'` en `reportTypeTemplates.ts` como se explicó en la sección 2.

---

## 7. Generador de Enlaces para Padres

El sistema permite generar enlaces o códigos para que los padres respondan cuestionarios sin crear cuenta.

### Funcionamiento

1. **Administrador**: Va a `/parent-links`.
2. **Generación**: Usa `GenerateParentLinkDialog` para seleccionar:
   - Aprendiente (Hijo).
   - Cuestionario.
3. **Token**: Se crea un registro en la tabla `parent_access_tokens` con un UUID único (`token`).

### Códigos de Acceso

El "código" que se comparte es este UUID.

- **Ruta Pública**: Los padres entran a `/questionnaires/parents` (o una ruta similar definida en `App.tsx`).
- **Validación**: El sistema busca el token en la base de datos. Si es válido y no ha expirado, carga el cuestionario asociado al aprendiente.

### Ubicación del Código

- **Gestión (Admin)**: `src/pages/ParentLinks.tsx` y `GenerateParentLinkDialog.tsx`.
- **Vista Pública (Padre)**: `src/pages/ParentQuestionnairePublic.tsx`. Aquí es donde se valida el código y se muestra el formulario.

---

## 8. Extensión Futura y Mantenimiento

### Agregar Nuevos Gráficos

Actualmente, los gráficos se dibujan manualmente con primitivas de `jsPDF` (rectángulos, líneas) en métodos como `addChartPage`.
Para gráficos complejos, se recomienda:

1. Usar una librería de gráficos en el cliente (como Chart.js).
2. Convertir el gráfico a imagen (base64).
3. Pasar la imagen al generador PDF.

### Sincronización de Estilos

Los estilos (colores, fuentes) se leen de `this.settings`. Si agregas una nueva página "codeada a mano" en `ReportPDFGenerator.ts`, asegúrate de usar:

```typescript
const brandColor = this.hexToRgb(this.settings.primary_color);
this.doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
```

Esto garantiza que si el usuario cambia el color en el Editor, tu nueva página también respete el cambio.
