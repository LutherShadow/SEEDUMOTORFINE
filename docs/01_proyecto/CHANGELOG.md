# Historial de Cambios - SEEDU Motor Fine 2025

## [No Publicado]

### Added
- Vista previa en tiempo real de plantillas de informes
- Soporte para múltiples logos en informes PDF
- Integración con API de Gemini para generación de gráficos
- Sistema de plantillas personalizables para contenido de informes
- Vista de enlaces públicos para padres
- Paginación en lista de niños/estudiantes
- Búsqueda y filtros avanzados en la lista de aprendices
- Soporte para trabajo offline con Service Workers
- Sistema de papelera para la gestión de registros de niños
- Tutorial interactivo de bienvenida
- Integración de cuestionarios TAM (Test de Aprendizaje y Motivación)
- Soporte para modo oscuro en toda la aplicación
- Exportación a Excel para la gestión de niños
- Sugerencias impulsadas por IA en informes
- Exportación a PDF de sugerencias de IA
- Matriz de confusión para el entrenamiento de modelos de IA

### Changed
- Mejora en el manejo de cuotas de la API de Gemini
- Optimización del rendimiento de la interfaz de evaluaciones
- Actualización de la interfaz de usuario con iconos y tooltips
- Mejora en la visualización de resultados con escalas de color unificadas
- Actualización de textos y fechas a 2025
- Traducción completa del tutorial al español
- Mejora en la configuración de informes PDF
- Actualización de la documentación técnica y manuales

### Fixed
- Corrección en el manejo de errores de imágenes en Gemini
- Corrección en el enrutamiento para el modo de desarrollo
- Corrección en la actualización de métricas de rendimiento
- Corrección en la carga de datos de entrenamiento
- Solución de problemas de CORS para cuestionarios
- Corrección en la inicialización de cuestionarios
- Mejora en el manejo de caché de la interfaz de usuario
- Corrección en la asignación de roles de usuario
- Mejora en el cálculo de promedios

### Security
- Mejora en el aislamiento de datos entre usuarios
- Actualización de dependencias de seguridad

## [1.0.0] - 2025-10-20
### Added
- Versión inicial del proyecto
- Configuración básica de la aplicación
- Integración con Supabase
- Sistema de autenticación
- Estructura base de la aplicación

## Formato del Historial

Este documento sigue el formato [Keep a Changelog](https://keepachangelog.com/es/1.0.0/) y el proyecto adhiere al [Versionado Semántico](https://semver.org/lang/es/).

Tipos de cambios:
- **Added** (Agregado): Para nuevas funcionalidades
- **Changed** (Cambiado): Para cambios en funcionalidades existentes
- **Deprecated** (Obsoleto): Para funcionalidades que serán removidas
- **Removed** (Removido): Para funcionalidades removidas
- **Fixed** (Corregido): Para corrección de errores
- **Security** (Seguridad): Para vulnerabilidades de seguridad

## [2.1.1] - 2025-12-10

### Changed
- **Reporte TAM personalizado**: El contenido del apartado “Contenido del Reporte” del PDF ahora se adapta dinámicamente al aprendiente, incorporando nombre, resultados y recomendaciones específicas. El diseño fue mejorado para mayor claridad visual, con secciones bien definidas, títulos destacados y listas de recomendaciones.
- **Mejoras visuales**: Se optimizó la presentación y el formateo de los textos para reflejar mejor la información relevante del aprendiente y facilitar la lectura del documento generado.

### Fixed
- **Consistencia de contenido y diseño** en el PDF del test TAM, eliminando textos genéricos y asegurando que toda la información refleje los datos individuales del evaluado.

---

## [2.1.0] - 2025-12-08

### Added
- **Actividades Personalizadas**
  - Integración de sistema de actividades personalizadas basadas en IA
  - Nueva opción de actividades en el menú
- **Mejoras de Marca y UI**
  - Inclusión de logo en el encabezado del Dashboard
  - Actualización de logo en página de inicio

### Changed
- **Optimización de UI/UX**
  - Refinamiento de la interfaz de actividades de IA
  - Mejoras en la generación de PDF y sugerencias
  - Unificación de instancias de React y caché para mejor rendimiento

### Fixed
- **Correcciones Técnicas**
  - Solución a crash de contexto en `next-themes`
  - Corrección de barras de progreso en módulo TAM
  - Actualización de chequeo de `report_type`

---

## [2.0.0] - 2025-11-15

### Added
- **Sistema de Cuestionarios Especializados**
  - Implementación completa del módulo de cuestionarios
  - Cuestionario Cornell de Habilidades de Estudio (44 preguntas)
  - Cuestionario CHAEA de Estilos de Aprendizaje (80 preguntas)
  - Test de Análisis de Modalidades - TAM (84 preguntas, vinculado con sistema existente)
  - Sistema de dimensiones y categorías por cuestionario
  - Cálculo automático de puntuaciones por dimensión
  - Identificación de dimensión dominante y secundaria
  - Gestión de respuestas con validación

- **Sistema de Tours Interactivos**
  - Tour de bienvenida automático para nuevos usuarios
  - Tutoriales paso a paso para Dashboard y Gestión de Alumnos
  - Botón flotante de ayuda en cada sección
  - Sistema de marcado de tours completados
  - Opción para reiniciar tours desde el perfil

- **Edge Function: initialize-questionnaires**
  - Función para inicialización automática de cuestionarios predefinidos
  - Manejo de cuestionarios existentes
  - Creación inteligente solo de cuestionarios faltantes
  - Soporte para CORS
  - Mensajes descriptivos de operaciones realizadas

- **Mejoras de UI/UX**
  - Página de gestión de cuestionarios (`/questionnaires`)
  - Página de gestión administrativa de cuestionarios (`/questionnaires/manage`)
  - Páginas de edición de cuestionarios personalizados
  - Página de aplicación de cuestionarios
  - Página de visualización de resultados
  - Indicadores de cuestionarios activos/inactivos

- **Base de Datos**
  - Tabla `questionnaires`: Cuestionarios principales
  - Tabla `questionnaire_dimensions`: Dimensiones de evaluación
  - Tabla `questionnaire_questions`: Preguntas individuales
  - Tabla `questionnaire_responses`: Respuestas y resultados
  - Enum `questionnaire_type`: cornell, chaea, tam, custom
  - Políticas RLS para seguridad de datos

### Changed
- **Actualización del Objeto de Estudio**
  - Ampliación del alcance de "evaluación motriz" a "evaluación educativa integral"
  - Inclusión de evaluación de habilidades de estudio (Cornell)
  - Inclusión de evaluación de estilos de aprendizaje (CHAEA)
  - Integración del TAM al sistema de cuestionarios
  - Actualización de documentación técnica y de usuario

- **Arquitectura del Sistema**
  - Migración de TutorialProvider dentro de BrowserRouter
  - Mejora en la estructura de componentes de tutorial
  - Optimización de navegación entre páginas

- **Página Index**
  - Actualización de descripción: "Sistema de Evaluación Educativa"
  - Agregado de tarjeta de cuestionarios en features
  - Mejora en diseño responsive (4 columnas en pantallas grandes)
  - Integración del tour de bienvenida

### Fixed
- Error de `useLocation()` fuera del contexto de Router
- Validación de fechas en formularios de registro de niños
- Mejoras en manejo de errores en edge functions
- Corrección de políticas CORS en funciones serverless

---

## [1.2.0] - 2025-10-20

### Added
- **Sistema de Papelera de Reciclaje**
  - Tabla `deleted_children` para almacenar registros eliminados
  - Función de mover a papelera en lugar de eliminación directa
  - Capacidad de restaurar registros eliminados
  - Eliminación permanente desde papelera
  - Vista de gestión de papelera con detalles completos

- **Evaluación de Estilos de Aprendizaje (TAM)**
  - Página completa de evaluación con 84 preguntas
  - 6 dimensiones: Visual, Auditivo, Kinestésico, Lógico, Social, Solitary
  - Cálculo automático de estilos dominante y secundario
  - Almacenamiento en tabla `learning_style_assessments`
  - Generación de reportes con recomendaciones

- **Sistema de Temas (Dark/Light Mode)**
  - Componente ThemeToggle con persistencia
  - Soporte para tema del sistema
  - Variables CSS para ambos temas
  - Integración con Shadcn/ui

### Changed
- Mejora en la interfaz de gestión de niños
- Optimización de consultas a base de datos
- Actualización de iconografía con Lucide React

### Fixed
- Corrección de validaciones en formularios
- Mejoras en manejo de estados de carga
- Optimización de renders innecesarios

---

## [1.1.0] - 2025-09-25

### Added
- **Módulo de Entrenamiento de IA (Admin)**
  - Página `/admin/training` para administradores
  - Carga de datos de entrenamiento en formato Excel
  - Interfaz de entrenamiento del modelo
  - Visualización de métricas de rendimiento
  - Tabla `ai_training_models` para historial
  - Edge Function `train-ai-model` para procesamiento

- **Exportación de Datos**
  - Exportación a Excel de lista de niños
  - Exportación masiva de evaluaciones
  - Generación de reportes en lote

- **Sistema de Roles**
  - Tabla `user_roles` con enum `app_role`
  - Roles: admin y evaluator
  - Función de base de datos `has_role()`
  - Control de acceso basado en roles (RBAC)

### Changed
- Mejoras en generación de PDFs
- Optimización de gráficos con Recharts
- Actualización de dependencias

---

## [1.0.0] - 2025-08-18

### Added
- **Funcionalidades Core**
  - Autenticación de usuarios con Supabase Auth
  - Gestión completa de perfiles de niños (CRUD)
  - Sistema de evaluaciones con 8 pruebas
  - Generación de reportes PDF con jsPDF
  - Dashboard con visualización de datos
  - Página de reportes con filtros y búsqueda

- **Base de Datos**
  - Tabla `profiles` para usuarios
  - Tabla `children` para niños evaluados
  - Tabla `evaluations` para evaluaciones
  - Tabla `ai_results` para resultados de IA
  - Políticas RLS para seguridad

- **Edge Functions**
  - `generate-suggestions` para análisis con IA
  - Integración con OpenAI GPT-3.5

- **UI/UX**
  - Diseño responsive con TailwindCSS
  - Componentes Shadcn/ui personalizados
  - Sistema de notificaciones con toast
  - Formularios con validación Zod

### Technical
- React 18.3.1 con TypeScript
- Vite como bundler
- React Router DOM para navegación
- React Query para manejo de estado servidor
- Supabase como BaaS

---

## [0.2.0] - 2025-08-10 (Beta)

### Added
- Prototipo funcional de evaluaciones
- Sistema básico de autenticación
- Diseño inicial de interfaz

### Changed
- Migración de JSON local a Supabase
- Refactorización de componentes

---

## [0.1.0] - 2025-08-01 (Alpha)

### Added
- Concepto inicial del proyecto
- Estructura básica de React
- Diseño mockup de interfaz
- Planificación de base de datos

---

## Roadmap Futuro

### [2.1.0] - Planificado
- Comparación histórica de evaluaciones
- Gráficos de evolución temporal
- Exportación de cuestionarios personalizados
- Notificaciones push

### [2.2.0] - Planificado
- Sistema de permisos granulares
- Módulo de instituciones
- Dashboard administrativo
- Integración con sistemas escolares

### [3.0.0] - Planificado
- App móvil nativa
- Modo offline
- Sincronización automática
- Reconocimiento de voz para observaciones

---

## Notas de Migración

### De 1.x a 2.0
1. Ejecutar migraciones de base de datos para tablas de cuestionarios
2. Inicializar cuestionarios predefinidos usando edge function
3. Actualizar tipos de TypeScript (`npm run types`)
4. Revisar políticas RLS en Supabase
5. Actualizar documentación de usuario

### Compatibilidad
- **Node.js**: ≥ 18.0.0
- **React**: 18.3.1
- **Supabase**: Compatible con PostgreSQL 15+
- **Navegadores**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## Contribuidores

- **Equipo de Desarrollo**: Sistema completo
- **Equipo QA**: Pruebas y validación
- **Psicopedagogos**: Validación de instrumentos de evaluación

---

## Licencia

Este proyecto es propiedad de [Institución] y su uso está restringido según los términos del contrato de licencia.

Para más información, consulte los manuales técnico y de usuario en la carpeta `/docs`.
