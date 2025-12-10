import { Step } from 'react-joyride';

export const dashboardTutorial: Step[] = [
  {
    target: 'body',
    content: 'Paso 1 de 8: ¡Bienvenido a la plataforma de evaluación educativa! Te guiaremos paso a paso para que aprendas a usar todas las funciones.',
    placement: 'center',
  },
  {
    target: '[data-tutorial="dashboard-title"]',
    content: 'Paso 2 de 8: Este es tu Panel de Control. Desde aquí puedes acceder a todas las funcionalidades del sistema.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="children-card"]',
    content: 'Paso 3 de 8: Gestión de Aprendientes - Aquí puedes agregar, editar y consultar información de los alumnos que evaluarás.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="evaluations-card"]',
    content: 'Paso 4 de 8: Evaluaciones Motrices - Realiza evaluaciones de motricidad fina con 8 pruebas estandarizadas.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="reports-card"]',
    content: 'Paso 5 de 8: Reportes y Análisis - Consulta resultados, genera PDFs y visualiza el progreso de los alumnos.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="questionnaires-card"]',
    content: 'Paso 6 de 8: Cuestionarios Especializados - Aplica cuestionarios Cornell (habilidades de estudio), CHAEA (estilos de aprendizaje) y TAM (modalidades sensoriales).',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="profile-btn"]',
    content: 'Paso 7 de 8: Perfil de Usuario - Actualiza tu información personal y configuración de cuenta.',
    placement: 'left',
  },
  {
    target: '[data-tutorial="logout-btn"]',
    content: 'Paso 8 de 8: Cierra tu sesión de forma segura cuando termines de usar el sistema.',
    placement: 'left',
  },
];

export const childrenTutorial: Step[] = [
  {
    target: 'body',
    content: 'Paso 1 de 5: Esta es la sección de Gestión de Aprendientes. Aquí podrás administrar toda la información de los estudiantes.',
    placement: 'center',
  },
  {
    target: '[data-tutorial="add-child-btn"]',
    content: 'Paso 2 de 5: Haz clic aquí para agregar un nuevo aprendiente. Necesitarás ingresar información básica como nombre, fecha de nacimiento y grado.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="search-filter"]',
    content: 'Paso 3 de 5: Usa estos filtros para buscar aprendientes por nombre, grado o escuela rápidamente.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="children-table"]',
    content: 'Paso 4 de 5: Aquí verás la lista completa de aprendientes. Puedes ver sus datos, evaluaciones y editar su información.',
    placement: 'top',
  },
  {
    target: '[data-tutorial="child-actions"]',
    content: 'Paso 5 de 5: Cada aprendiente tiene acciones disponibles: ver detalle, editar información o realizar una evaluación.',
    placement: 'left',
  },
];

export const evaluationsTutorial: Step[] = [
  {
    target: 'body',
    content: 'Paso 1 de 7: Bienvenido a la sección de Evaluaciones de Motricidad Fina. Aquí realizarás las evaluaciones estandarizadas de los aprendientes.',
    placement: 'center',
  },
  {
    target: '[data-tutorial="new-evaluation-btn"]',
    content: 'Paso 2 de 7: Haz clic aquí para crear una nueva evaluación. Se abrirá un formulario con los 8 tests estandarizados.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="evaluation-filters"]',
    content: 'Paso 3 de 7: Utiliza estos filtros para buscar evaluaciones por mes, grado o aprendiente específico.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="export-buttons"]',
    content: 'Paso 4 de 7: Exporta las evaluaciones a Excel o genera un PDF grupal con los resultados de todas las evaluaciones filtradas.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="evaluations-table"]',
    content: 'Paso 5 de 7: La tabla muestra todas las evaluaciones realizadas con sus puntuaciones promedio y fecha.',
    placement: 'top',
  },
  {
    target: '[data-tutorial="view-evaluation-btn"]',
    content: 'Paso 6 de 7: Haz clic en "Ver" para consultar los detalles completos de una evaluación.',
    placement: 'left',
  },
  {
    target: '[data-tutorial="download-pdf-btn"]',
    content: 'Paso 7 de 7: Descarga el reporte individual de cada evaluación en formato PDF.',
    placement: 'left',
  },
];

export const reportsTutorial: Step[] = [
  {
    target: 'body',
    content: 'Paso 1 de 8: Bienvenido a la sección de Análisis y Reportes. Aquí encontrarás herramientas avanzadas para analizar el progreso de los aprendientes.',
    placement: 'center',
  },
  {
    target: '[data-tutorial="select-child"]',
    content: 'Paso 2 de 8: Primero, selecciona el aprendiente que deseas analizar. Esto cargará todas sus evaluaciones.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="competency-index"]',
    content: 'Paso 3 de 8: El Índice de Competencia muestra una evaluación global del aprendiente en diferentes áreas: visual-motor, precisión, coordinación y fuerza.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="progress-tracker"]',
    content: 'Paso 4 de 8: El seguimiento de progreso muestra la evolución del aprendiente a través del tiempo con gráficos comparativos.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="ai-suggestions-btn"]',
    content: 'Paso 5 de 8: Genera sugerencias personalizadas con IA basadas en las evaluaciones del aprendiente.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="ai-predictions-btn"]',
    content: 'Paso 6 de 8: Obtén predicciones de progreso a 1, 3 y 6 meses utilizando inteligencia artificial.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="personalized-activities"]',
    content: 'Paso 7 de 8: Las actividades personalizadas son recomendaciones específicas generadas por IA para mejorar las áreas de oportunidad.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="export-report-btn"]',
    content: 'Paso 8 de 8: Exporta el reporte completo a PDF con todas las sugerencias y análisis generados.',
    placement: 'left',
  },
];

export const questionnairesTutorial: Step[] = [
  {
    target: 'body',
    content: 'Paso 1 de 6: Bienvenido a la sección de Cuestionarios. Aquí encontrarás herramientas especializadas para evaluar estilos de aprendizaje y habilidades de estudio.',
    placement: 'center',
  },
  {
    target: '[data-tutorial="questionnaires-tabs"]',
    content: 'Paso 2 de 6: Navega entre "Cuestionarios Disponibles" para aplicar nuevos cuestionarios y "Mis Respuestas" para ver resultados anteriores.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="questionnaire-list"]',
    content: 'Paso 3 de 6: Aquí encontrarás tres tipos de cuestionarios: Cornell (habilidades de estudio), CHAEA (estilos de aprendizaje) y TAM (modalidades sensoriales).',
    placement: 'top',
  },
  {
    target: '[data-tutorial="apply-questionnaire-btn"]',
    content: 'Paso 4 de 6: Haz clic en "Aplicar Cuestionario" para iniciar la evaluación con un aprendiente.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="generate-link-btn"]',
    content: 'Paso 5 de 6: Genera un enlace para que los padres puedan completar cuestionarios desde su dispositivo sin necesidad de cuenta.',
    placement: 'left',
  },
  {
    target: '[data-tutorial="manage-links-btn"]',
    content: 'Paso 6 de 6: Gestiona los enlaces generados para padres, consulta su estado y vencimiento.',
    placement: 'left',
  },
];

export const aiTrainingTutorial: Step[] = [
  {
    target: 'body',
    content: 'Paso 1 de 7: Bienvenido al módulo de Entrenamiento de IA. Aquí puedes entrenar y optimizar el modelo de inteligencia artificial del sistema.',
    placement: 'center',
  },
  {
    target: '[data-tutorial="dataset-config"]',
    content: 'Paso 2 de 7: Configura el dataset de entrenamiento. Define cuántas muestras usar para entrenamiento, validación y prueba.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="train-btn"]',
    content: 'Paso 3 de 7: Inicia el entrenamiento del modelo. El proceso utiliza un algoritmo Random Forest combinado con una Red Neuronal.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="performance-metrics"]',
    content: 'Paso 4 de 7: Las métricas de rendimiento muestran la precisión, F1-Score y otras métricas por clase (Alto, Medio, Bajo).',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="confusion-matrix"]',
    content: 'Paso 5 de 7: La matriz de confusión visualiza cómo el modelo clasifica cada categoría. Los valores en la diagonal son predicciones correctas.',
    placement: 'top',
  },
  {
    target: '[data-tutorial="training-history"]',
    content: 'Paso 6 de 7: El historial muestra todos los entrenamientos anteriores para comparar el rendimiento entre versiones.',
    placement: 'top',
  },
  {
    target: '[data-tutorial="download-metrics-btn"]',
    content: 'Paso 7 de 7: Descarga las métricas del modelo en formato JSON para análisis externo o documentación.',
    placement: 'left',
  },
];

export const reportSettingsTutorial: Step[] = [
  {
    target: 'body',
    content: 'Paso 1 de 9: Bienvenido al Editor de Reportes PDF. Aquí personalizarás la apariencia y contenido de todos los reportes del sistema.',
    placement: 'center',
  },
  {
    target: '[data-tutorial="report-type-selector"]',
    content: 'Paso 2 de 9: Selecciona el tipo de reporte a configurar: Motricidad, Cornell, CHAEA, TAM o Competencias. Cada uno tiene una plantilla predefinida.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="template-selector"]',
    content: 'Paso 3 de 9: Elige una plantilla de diseño: Clásica (formal), Moderna (colorida) o Minimalista (limpia).',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="color-picker"]',
    content: 'Paso 4 de 9: Personaliza el color principal del reporte. Este color se aplicará en títulos, bordes y elementos decorativos.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="logo-upload"]',
    content: 'Paso 5 de 9: Sube los logos institucionales para la portada del reporte. Puedes agregar múltiples logos.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="footer-logo-upload"]',
    content: 'Paso 6 de 9: Agrega logos para el pie de página de las páginas internas del reporte.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="section-editor"]',
    content: 'Paso 7 de 9: Arrastra las secciones para cambiar el orden y activa/desactiva cada una según tus necesidades.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="content-fields"]',
    content: 'Paso 8 de 9: Personaliza los textos de introducción, recomendaciones y conclusiones. También puedes usar plantillas predefinidas.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="save-btn"]',
    content: 'Paso 9 de 9: Guarda todos los cambios. La vista previa a la derecha mostrará cómo quedará el reporte final.',
    placement: 'left',
  },
];
