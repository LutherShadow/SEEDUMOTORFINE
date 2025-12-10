# SEEDU Motor Fine - Documentación del Proyecto

**Versión:** 2.1.0  
**Última actualización:** Diciembre 2025  
**Estado del Proyecto:** En Producción

## 📋 Tabla de Contenidos
1. [Descripción General](#-descripción-general)
2. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
3. [Estructura del Proyecto](#-estructura-del-proyecto)
4. [Esquema de Base de Datos](#-esquema-de-base-de-datos)
5. [API y Endpoints](#-api-y-endpoints)
6. [Guía de Despliegue](#-guía-de-despliegue)
7. [Guía de Contribución](#-guía-de-contribución)
8. [Preguntas Frecuentes](#-preguntas-frecuentes)
9. [Soporte y Contacto](#-soporte-y-contacto)
10. [Licencia](#-licencia)

## 📋 Descripción General

SEEDU Motor Fine es una plataforma web integral de evaluación educativa diseñada para profesionales de la psicopedagogía y educación. El sistema permite evaluar múltiples aspectos del desarrollo infantil:

- **Desarrollo Motor Fino**: 8 pruebas psicopedagógicas estandarizadas con análisis mediante IA
- **Estilos de Aprendizaje**: Cuestionarios especializados (Cornell, CHAEA, TAM)
- **Habilidades de Estudio**: Evaluación mediante el Inventario Cornell
- **Generación de Reportes**: Documentos profesionales con recomendaciones personalizadas

### Objeto de Estudio Ampliado

El sistema ha evolucionado de una herramienta específica de evaluación motriz a una **plataforma integral de evaluación educativa** que abarca:

1. **Evaluación Motriz**: Desarrollo motor fino basado en la Prueba Ozeretski-Guilmain
2. **Evaluación de Estilos de Aprendizaje**:
   - **Test TAM** (84 preguntas): Visual, Auditivo, Kinestésico, Lógico, Social, Solitario
   - **Cuestionario CHAEA** (80 preguntas): Activo, Reflexivo, Teórico, Pragmático
3. **Evaluación de Habilidades de Estudio**:
   - **Inventario Cornell** (44 preguntas): Actitudes, Lectura, Técnicas de estudio, más

## 🛠️ Tecnologías Utilizadas

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | ^18.3.1 | Biblioteca principal para construir interfaces de usuario |
| TypeScript | ^5.3.2 | Tipado estático para mayor robustez del código |
| Vite | ^5.0.0 | Herramienta de construcción y desarrollo rápido |
| TailwindCSS | ^3.4.0 | Framework de utilidades CSS |
| Shadcn/ui | ^0.8.0 | Componentes UI accesibles y personalizables |
| React Router DOM | ^6.22.0 | Enrutamiento y navegación |
| React Hook Form | ^7.50.0 | Gestión de formularios |
| Zod | ^3.22.4 | Validación de esquemas |
| Lucide React | ^0.370.0 | Biblioteca de iconos |
| Recharts | ^2.10.4 | Visualización de datos |
| Framer Motion | ^11.0.5 | Animaciones y transiciones |

### Backend (Supabase)
| Servicio | Uso |
|----------|-----|
| **Supabase** | Plataforma BaaS (Backend as a Service) |
| PostgreSQL | 15.2 | Base de datos relacional |
| Row Level Security | Control de acceso a nivel de fila |
| Edge Functions | Funciones serverless (Deno) |
| Auth | Autenticación y autorización |
| Storage | Almacenamiento de archivos |
| Realtime | Suscripciones en tiempo real |

### Generación de Documentos
| Herramienta | Uso |
|-------------|-----|
| **jsPDF** | Generación de informes PDF |
| **XLSX** | Exportación de datos a Excel |
| **html2canvas** | Captura de pantalla de componentes para PDF |

### Herramientas de Desarrollo
| Herramienta | Uso |
|-------------|-----|
| Node.js | ^20.0.0 | Entorno de ejecución |
| npm | ^10.0.0 | Gestor de paquetes |
| ESLint | ^8.56.0 | Linter |
| Prettier | ^3.2.0 | Formateo de código |
| Husky | ^9.0.0 | Git hooks |
| Jest | ^29.7.0 | Pruebas unitarias |
| Testing Library | ^14.1.0 | Pruebas de componentes |

### Infraestructura
| Servicio | Uso |
|----------|-----|
| **Netlify** | Despliegue del frontend |
| **Supabase** | Backend y base de datos |
| **GitHub Actions** | CI/CD |
| **Sentry** | Monitoreo de errores |
| **Vercel Analytics** | Análisis de uso |

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── evaluations/
│   │   ├── EvaluationForm.tsx    # Formulario de evaluaciones motrices
│   │   └── PDFGenerator.tsx      # Generador de reportes PDF
│   ├── tutorial/
│   │   ├── TutorialProvider.tsx  # Proveedor de tours interactivos
│   │   ├── TutorialButton.tsx    # Botón flotante de ayuda
│   │   ├── WelcomeTour.tsx       # Tour de bienvenida
│   │   ├── tutorials.ts          # Definiciones de tutoriales
│   │   └── ResetTourButton.tsx   # Botón para reiniciar tours
│   └── ui/                        # Componentes UI reutilizables
│       ├── button.tsx
│       ├── card.tsx
│       ├── form.tsx
│       └── ... (otros componentes shadcn)
├── pages/
│   ├── Auth.tsx                   # Autenticación de usuarios
│   ├── Dashboard.tsx              # Panel principal
│   ├── Children.tsx               # Gestión de niños
│   ├── Evaluations.tsx            # Gestión de evaluaciones motrices
│   ├── Reports.tsx                # Visualización de reportes
│   ├── Profile.tsx                # Perfil de usuario
│   ├── AITraining.tsx             # Entrenamiento del modelo IA
│   ├── LearningStyleAssessment.tsx # Evaluación TAM (84 preguntas)
│   ├── Questionnaires.tsx         # Listado de cuestionarios
│   ├── QuestionnaireManage.tsx    # Gestión de cuestionarios (admin)
│   ├── QuestionnaireEdit.tsx      # Editor de cuestionarios personalizados
│   ├── QuestionnaireTake.tsx      # Aplicación de cuestionarios
│   ├── QuestionnaireResult.tsx    # Resultados de cuestionarios
│   └── NotFound.tsx               # Página 404
├── integrations/
│   └── supabase/
│       ├── client.ts              # Cliente de Supabase
│       └── types.ts               # Tipos generados automáticamente
├── hooks/
│   └── use-toast.ts               # Hook para notificaciones
├── lib/
│   ├── utils.ts                   # Funciones utilitarias
│   └── helpContent.ts             # Contenido de ayuda contextual
├── App.tsx                        # Componente raíz con rutas
├── main.tsx                       # Punto de entrada
└── index.css                      # Estilos globales y tokens de diseño

supabase/
├── functions/
│   ├── generate-suggestions/      # Edge function para sugerencias IA
│   │   └── index.ts
│   └── initialize-questionnaires/ # Edge function para inicializar cuestionarios
│       └── index.ts
└── migrations/                    # Migraciones de base de datos
```

## 🗄️ Esquema de Base de Datos

### Tabla: `profiles`
Almacena información de los usuarios evaluadores.

**Columnas:**
- `id` (uuid, PK): ID del usuario vinculado a auth.users
- `full_name` (text): Nombre completo
- `role` (text): Rol del usuario (por defecto: "evaluator")
- `institution` (text): Institución educativa
- `created_at` (timestamp): Fecha de creación
- `updated_at` (timestamp): Fecha de actualización

**RLS Policies:**
- Los usuarios pueden ver, insertar y actualizar solo su propio perfil

### Tabla: `children`
Almacena información de los niños evaluados.

**Columnas:**
- `id` (uuid, PK): Identificador único
- `evaluator_id` (uuid, FK): ID del evaluador responsable
- `name` (text): Nombre del niño
- `birth_date` (date): Fecha de nacimiento
- `gender` (text): Género
- `grade` (text): Grado escolar
- `school` (text): Escuela
- `created_at` (timestamp): Fecha de creación
- `updated_at` (timestamp): Fecha de actualización

**RLS Policies:**
- Los evaluadores pueden ver, insertar, actualizar y eliminar solo sus propios registros
- Los administradores pueden ver todos los registros

### Tabla: `evaluations`
Almacena las evaluaciones realizadas a los niños.

**Columnas:**
- `id` (uuid, PK): Identificador único
- `child_id` (uuid, FK): ID del niño evaluado
- `evaluator_id` (uuid, FK): ID del evaluador
- `evaluation_date` (date): Fecha de evaluación
- `test_1_score` a `test_8_score` (integer): Puntuaciones de cada test
- `test_1_observations` a `test_8_observations` (text): Observaciones por test
- `observations` (text): Observaciones generales
- `created_at` (timestamp): Fecha de creación
- `updated_at` (timestamp): Fecha de actualización

**Tests Incluidos:**
1. Test de Coordinación Visomotora
2. Test de Discriminación Figura-Fondo
3. Test de Constancia de Forma
4. Test de Posición en el Espacio
5. Test de Relaciones Espaciales
6. Test de Cierre Visual
7. Test de Velocidad Visomotora
8. Test de Integración Visomotora

**RLS Policies:**
- Los evaluadores pueden gestionar solo sus propias evaluaciones
- Los administradores pueden ver todas las evaluaciones

### Tabla: `ai_results`
Almacena resultados del análisis de IA.

**Columnas:**
- `id` (uuid, PK): Identificador único
- `evaluation_id` (uuid, FK): ID de la evaluación
- `classification` (text): Clasificación (Alto/Medio/Bajo)
- `confidence_score` (numeric): Nivel de confianza (0-1)
- `recommendations` (text): Recomendaciones generadas
- `created_at` (timestamp): Fecha de creación

**RLS Policies:**
- Los usuarios pueden ver resultados de sus propias evaluaciones
- Los administradores pueden ver todos los resultados
- El sistema puede insertar resultados

### Tabla: `ai_training_models`
Almacena información sobre modelos de IA entrenados.

**Columnas:**
- `id` (uuid, PK): Identificador único
- `model_name` (text): Nombre del modelo
- `trained_at` (timestamp): Fecha de entrenamiento
- `training_samples` (integer): Número de muestras de entrenamiento
- `validation_samples` (integer): Número de muestras de validación
- `test_samples` (integer): Número de muestras de prueba
- `accuracy` (numeric): Precisión general
- `precision_high`, `precision_medium`, `precision_low` (numeric): Precisión por clase
- `f1_high`, `f1_medium`, `f1_low` (numeric): Puntuación F1 por clase
- `confusion_matrix` (jsonb): Matriz de confusión
- `training_time_seconds` (numeric): Tiempo de entrenamiento
- `created_by` (uuid, FK): ID del creador
- `created_at` (timestamp): Fecha de creación

**RLS Policies:**
- Solo los administradores pueden ver e insertar modelos

### Tabla: `learning_style_assessments`
Almacena evaluaciones de estilos de aprendizaje (TAM - 84 preguntas).

**Columnas:**
- `id` (uuid, PK): Identificador único
- `child_id` (uuid, FK): ID del niño
- `evaluator_id` (uuid, FK): ID del evaluador
- `assessment_date` (date): Fecha de evaluación
- `responses` (jsonb): Respuestas del cuestionario
- `visual_score`, `auditory_score`, `kinesthetic_score` (numeric): Puntuaciones por estilo
- `logical_score`, `social_score`, `solitary_score` (numeric): Puntuaciones adicionales
- `dominant_style` (text): Estilo dominante
- `secondary_style` (text): Estilo secundario
- `analysis_notes` (text): Notas de análisis
- `created_at` (timestamp): Fecha de creación
- `updated_at` (timestamp): Fecha de actualización

**RLS Policies:**
- Los evaluadores pueden gestionar solo sus propias evaluaciones
- Los administradores pueden ver todas las evaluaciones

### Tabla: `questionnaires`
Almacena los cuestionarios disponibles en el sistema.

**Columnas:**
- `id` (uuid, PK): Identificador único
- `name` (text): Nombre del cuestionario
- `description` (text): Descripción
- `type` (enum): Tipo (cornell, chaea, tam, custom)
- `is_active` (boolean): Estado activo/inactivo
- `created_by` (uuid, FK): ID del creador
- `created_at` (timestamp): Fecha de creación
- `updated_at` (timestamp): Fecha de actualización

**Tipos de Cuestionarios:**
- **cornell**: Inventario Cornell de Habilidades de Estudio (44 preguntas)
- **chaea**: Cuestionario CHAEA de Estilos de Aprendizaje (80 preguntas)
- **tam**: Test de Análisis de Modalidades (84 preguntas)
- **custom**: Cuestionarios personalizados

**RLS Policies:**
- Todos pueden ver cuestionarios activos
- Solo administradores pueden crear/editar

### Tabla: `questionnaire_dimensions`
Dimensiones de evaluación de cada cuestionario.

**Columnas:**
- `id` (uuid, PK): Identificador único
- `questionnaire_id` (uuid, FK): ID del cuestionario
- `code` (text): Código (ej: ATT, ACTIVO, VISUAL)
- `name` (text): Nombre de la dimensión
- `description` (text): Descripción
- `order_index` (integer): Orden de presentación
- `created_at` (timestamp): Fecha de creación

### Tabla: `questionnaire_questions`
Preguntas de cada cuestionario.

**Columnas:**
- `id` (uuid, PK): Identificador único
- `questionnaire_id` (uuid, FK): ID del cuestionario
- `dimension_id` (uuid, FK): ID de la dimensión
- `question_number` (integer): Número de pregunta
- `question_text` (text): Texto de la pregunta
- `is_reverse_scored` (boolean): Puntuación inversa
- `score_weight` (numeric): Peso en puntuación
- `created_at` (timestamp): Fecha de creación

### Tabla: `questionnaire_responses`
Respuestas y resultados de cuestionarios aplicados.

**Columnas:**
- `id` (uuid, PK): Identificador único
- `questionnaire_id` (uuid, FK): ID del cuestionario
- `child_id` (uuid, FK): ID del niño evaluado
- `evaluator_id` (uuid, FK): ID del evaluador
- `response_date` (date): Fecha de aplicación
- `responses` (jsonb): Respuestas completas
- `dimension_scores` (jsonb): Puntuaciones por dimensión
- `dominant_dimension` (text): Dimensión dominante
- `secondary_dimension` (text): Dimensión secundaria
- `notes` (text): Notas del evaluador
- `created_at` (timestamp): Fecha de creación
- `updated_at` (timestamp): Fecha de actualización

**RLS Policies:**
- Los evaluadores pueden gestionar sus propias aplicaciones
- Los administradores pueden ver todas las respuestas

### Tabla: `user_roles`
Roles de usuarios del sistema.

**Columnas:**
- `id` (uuid, PK): Identificador único
- `user_id` (uuid, FK): ID del usuario
- `role` (enum): Rol (admin, evaluator)
- `created_at` (timestamp): Fecha de creación

## 🔐 Autenticación y Roles

### Sistema de Autenticación
- Implementado con **Supabase Auth**
- Soporte para registro con email y contraseña
- Verificación de email opcional
- Gestión de sesiones persistentes

### Roles de Usuario
- **Evaluator** (por defecto): Puede gestionar niños y evaluaciones propias
- **Admin**: Acceso completo, incluyendo entrenamiento de IA y visualización de todos los datos

### Row Level Security (RLS)
Todas las tablas implementan políticas RLS para garantizar:
- Los usuarios solo acceden a sus propios datos
- Los administradores tienen acceso completo
- Aislamiento de datos entre evaluadores

## 🧠 Sistema de Inteligencia Artificial

### Arquitectmo del Modelo
El sistema utiliza un modelo de clasificación supervisado que:
1. Analiza las 8 puntuaciones de los tests de evaluación
2. Clasifica el nivel de desarrollo motor fino en tres categorías:
   - **Alto**: Desarrollo motor fino avanzado
   - **Medio**: Desarrollo motor fino normal
   - **Bajo**: Necesita intervención o apoyo

### Edge Function: `generate-suggestions`
Ubicación: `supabase/functions/generate-suggestions/index.ts`

**Funcionalidad:**
- Recibe un `evaluation_id` como parámetro
- Obtiene las puntuaciones de la evaluación
- Ejecuta el modelo de clasificación
- Genera recomendaciones personalizadas basadas en la clasificación
- Almacena resultados en la tabla `ai_results`

**Endpoint:**
```
POST /functions/v1/generate-suggestions
Body: { "evaluationId": "uuid" }
```

### Entrenamiento del Modelo
La página **AITraining** (`/admin/training`) permite a los administradores:
- Generar datos sintéticos de entrenamiento
- Entrenar nuevos modelos
- Visualizar métricas de rendimiento:
  - Accuracy (Precisión general)
  - Precision por clase
  - F1-Score por clase
  - Matriz de confusión
- Guardar modelos en la base de datos

## 📊 Funcionalidades Principales

### 1. Gestión de Niños (`/children`)
- Crear perfiles de niños con información demográfica
- Editar información existente
- Eliminar registros
- Visualización en tabla con búsqueda y filtros

### 2. Evaluaciones (`/evaluations`)
- Formulario completo con 8 tests
- Puntuaciones de 0-10 por test
- Campo de observaciones por test
- Generación automática de análisis IA
- Visualización de resultados históricos

### 3. Reportes (`/reports`)
- Visualización de análisis IA
- Gráficos de evolución temporal
- Exportación a PDF con formato profesional
- Exportación a Excel para análisis externo
- Comparación de puntuaciones entre tests

### 4. Perfil de Usuario (`/profile`)
- Edición de información personal
- Visualización de datos de cuenta
- Actualización de institución educativa

### 5. Evaluación de Estilos de Aprendizaje (`/learning-style-assessment`)
- Cuestionario de 30 preguntas
- Análisis de estilos:
  - Visual, Auditivo, Kinestésico
  - Lógico, Social, Solitario
- Identificación de estilos dominantes
- Generación de recomendaciones pedagógicas

### 6. Dashboard (`/dashboard`)
- Resumen estadístico de evaluaciones
- Gráficos de desempeño
- Acceso rápido a funcionalidades principales
- Alertas y notificaciones

## 🎨 Sistema de Diseño

### Tokens de Diseño
Definidos en `src/index.css`:

```css
:root {
  --primary: HSL para color primario
  --secondary: HSL para color secundario
  --accent: HSL para acentos
  --muted: HSL para elementos atenuados
  --background: HSL para fondo
  --foreground: HSL para texto
  /* ... más tokens */
}
```

### Componentes UI
Basados en **Shadcn/ui** con personalización:
- Button: Variantes (default, destructive, outline, ghost, link)
- Card: Contenedores para información
- Form: Gestión de formularios con validación
- Dialog: Modales para acciones importantes
- Toast: Notificaciones temporales
- Table: Visualización de datos tabulares

### Modo Oscuro
Soporte completo para tema oscuro con:
- Cambio automático según preferencias del sistema
- Toggle manual (si se implementa)
- Tokens CSS adaptables

## 🚀 Configuración y Despliegue

### Variables de Entorno
No requiere archivo `.env` personalizado. Las credenciales de Supabase están en:
```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = "https://tctypxdamgmqrlswmxqg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "..." // Clave pública
```

### Instalación Local
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

### Despliegue en Netlify
La aplicación está desplegada en: **https://seedumotorfine.netlify.app/**

**Configuración requerida:**
1. Archivo `public/_redirects`:
   ```
   /*    /index.html   200
   ```
   Este archivo garantiza que React Router funcione correctamente en producción.

2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Edge Functions (Supabase)
Para desplegar funciones edge:
```bash
supabase functions deploy generate-suggestions
```

## 📖 Guía de Uso

### Para Evaluadores

#### 1. Registro e Inicio de Sesión
1. Acceder a `/auth`
2. Registrarse con email y contraseña
3. Completar perfil en `/profile`

#### 2. Agregar un Niño
1. Ir a `/children`
2. Click en "Agregar Niño"
3. Completar formulario con datos personales
4. Guardar

#### 3. Realizar una Evaluación
1. Ir a `/evaluations`
2. Click en "Nueva Evaluación"
3. Seleccionar niño del dropdown
4. Completar los 8 tests con puntuaciones y observaciones
5. Guardar evaluación
6. Esperar generación automática de análisis IA

#### 4. Ver Reportes
1. Ir a `/reports`
2. Seleccionar niño
3. Visualizar análisis IA y gráficos
4. Exportar a PDF o Excel según necesidad

#### 5. Evaluar Estilo de Aprendizaje
1. Ir a `/learning-style-assessment`
2. Seleccionar niño
3. Completar cuestionario de 30 preguntas
4. Revisar análisis de estilos dominantes
5. Obtener recomendaciones pedagógicas

### Para Administradores

#### Entrenamiento del Modelo IA
1. Acceder a `/admin/training`
2. Configurar parámetros de entrenamiento
3. Generar datos sintéticos (si es necesario)
4. Iniciar entrenamiento
5. Revisar métricas de rendimiento
6. Guardar modelo si los resultados son satisfactorios

## 🔧 Mantenimiento y Extensión

### Agregar un Nuevo Test
1. Actualizar schema de `evaluations` en Supabase
2. Modificar `EvaluationForm.tsx` para incluir el nuevo campo
3. Actualizar lógica de análisis IA en edge function
4. Modificar `PDFGenerator.tsx` para incluir en reportes

### Personalizar Recomendaciones IA
Editar la lógica en:
```typescript
// supabase/functions/generate-suggestions/index.ts
function generateRecommendations(classification: string, scores: number[]): string {
  // Personalizar lógica aquí
}
```

### Agregar Nuevos Roles
1. Crear enum en Supabase para nuevos roles
2. Actualizar políticas RLS
3. Modificar componentes de UI para mostrar/ocultar según rol
4. Implementar lógica de permisos en frontend

## 🐛 Solución de Problemas

### Error 404 en recarga de página
**Problema:** Al recargar cualquier ruta diferente a `/`, aparece error 404.
**Solución:** Verificar que existe el archivo `public/_redirects` con el contenido correcto.

### Datos no se muestran en tablas
**Problema:** Las tablas aparecen vacías aunque hay datos en Supabase.
**Solución:** Verificar políticas RLS y que el usuario tenga permisos correctos.

### Error en generación de análisis IA
**Problema:** El análisis IA no se genera después de guardar evaluación.
**Solución:** 
1. Verificar que la edge function esté desplegada
2. Revisar logs de Supabase Functions
3. Confirmar que hay un modelo entrenado activo

### Estilos no se aplican correctamente
**Problema:** Los componentes no muestran los estilos esperados.
**Solución:** 
1. Verificar que `tailwind.config.ts` está correctamente configurado
2. Revisar tokens CSS en `src/index.css`
3. Asegurar que TailwindCSS está procesando correctamente

## 📝 Licencia y Contacto

**Proyecto:** SEEDU Motor Fine  
**Versión:** 1.0.0  
**Última actualización:** 2025

---

## 🎯 Próximas Mejoras Sugeridas

1. **Notificaciones en tiempo real** cuando se completa un análisis IA
2. **Sistema de roles más granular** con permisos personalizables
3. **Exportación de reportes en más formatos** (Word, PowerPoint)
4. **Dashboard con métricas avanzadas** y visualizaciones interactivas
5. **Sistema de comentarios** en evaluaciones para colaboración
6. **Historial de cambios** en perfiles de niños
7. **Integración con sistemas escolares** externos
8. **App móvil** para evaluaciones en campo
9. **Modo offline** con sincronización posterior
10. **Análisis comparativo** entre diferentes grupos de niños
