# Guía para Sincronizar PDFs con Configuración de Plantillas

## Problema Actual
Los PDFs generados desde la página de Reportes no reflejan la configuración guardada en el Editor de Reportes. Específicamente:

1. **Secciones genéricas**: El PDF muestra "Introducción", "Recomendaciones", "Conclusión" en lugar de las secciones personalizadas del tipo de reporte
2. **Contenido no sincronizado**: El contenido guardado en `report_settings` no aparece en el PDF
3. **Falta de gráficos/tablas**: Los PDFs no incluyen visualizaciones según el tipo de reporte

## Solución Implementada Parcialmente

### ✅ Lo que YA funciona:
- **Editor de Reportes (`ReportSettings.tsx`)**: 
  - Secciones dinámicas por tipo de reporte ✓
  - Campos de contenido personalizados ✓
  - Vista previa correcta ✓
  - Guardado en base de datos ✓

### ❌ Lo que FALTA:
- **Generación de PDF**: Necesita leer de `report_settings` y usar secciones personalizadas

## Pasos para Completar la Implementación

### 1. Identificar dónde se genera el PDF
El PDF mostrado en las imágenes se genera probablemente en:
- `src/components/evaluations/PDFGenerator.tsx` (para evaluaciones)
- O un componente similar en `src/components/reports/`

### 2. Modificar la generación de PDF para:

```typescript
// Paso 1: Cargar configuración guardada
const { data: settings } = await supabase
  .from('report_settings')
  .select('*')
  .single();

// Paso 2: Obtener secciones personalizadas del tipo de reporte
const template = getReportTypeTemplate(settings.report_type);
const customSections = template?.custom_sections || [];

// Paso 3: Generar páginas del PDF usando las secciones personalizadas
customSections.forEach(section => {
  const content = settings[`content_${section.id}_text`];
  if (content) {
    // Agregar página con el contenido de esta sección
    doc.addPage();
    doc.text(section.title, x, y);
    doc.text(content, x, y + 10);
  }
});
```

### 3. Agregar Gráficos y Tablas

Para reportes de predicción, agregar:
- **Gráfico de barras**: "Resultados por Dimensión" (como en la imagen)
- **Tabla de proyecciones**: Con datos a 1, 3 y 6 meses
- **Gráfico de líneas**: Evolución temporal

Usar bibliotecas como:
- `chart.js` para generar gráficos
- `html2canvas` para convertir a imagen
- `jsPDF.addImage()` para incluir en el PDF

## Archivos a Modificar

1. **`src/components/evaluations/PDFGenerator.tsx`** (o el archivo correcto de generación de PDF)
   - Agregar lectura de `report_settings`
   - Usar secciones personalizadas
   - Incluir gráficos según tipo de reporte

2. **`src/lib/reportTypeTemplates.ts`** ✅ (Ya actualizado)
   - Define las secciones personalizadas
   - Contiene el contenido predeterminado

3. **`src/pages/ReportSettings.tsx`** ✅ (Ya actualizado)
   - Guarda la configuración correctamente

## Ejemplo de Código para Gráficos

```typescript
import { Chart } from 'chart.js';

// Crear gráfico de barras
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Social', 'Individual', 'Lógico-Matemático', 'Kinestésico', 'Visual', 'Auditivo'],
    datasets: [{
      label: 'Puntuación',
      data: [42, 62, 49, 55, 54, 50],
      backgroundColor: '#8B5CF6'
    }]
  }
});

// Convertir a imagen y agregar al PDF
const chartImage = canvas.toDataURL('image/png');
doc.addImage(chartImage, 'PNG', x, y, width, height);
```

## Estado Actual

- ✅ Configuración de plantillas funcional
- ✅ Secciones personalizadas definidas
- ✅ Contenido de prueba agregado
- ❌ **PENDIENTE**: Sincronizar generación de PDF con configuración guardada
- ❌ **PENDIENTE**: Agregar gráficos y tablas a los PDFs

## Próximos Pasos Recomendados

1. Localizar el archivo exacto donde se genera el PDF de predicción
2. Modificar ese archivo para leer de `report_settings`
3. Implementar renderizado de secciones dinámicas
4. Agregar generación de gráficos y tablas
5. Probar con cada tipo de reporte

---

**Nota**: La implementación completa de la generación de PDFs con gráficos es un cambio significativo que requiere modificar el código de generación de PDFs existente. El sistema de plantillas y secciones personalizadas ya está completamente funcional en el Editor de Reportes.
