// Sistema de ayuda contextual para tooltips
// Extrae información clave de los manuales para proporcionar ayuda en la interfaz

export const helpContent = {
  // Dashboard
  dashboard: {
    title: "Panel de Control",
    description: "Centro de navegación del sistema. Accede a todas las funcionalidades principales desde aquí.",
    children: "Gestiona los perfiles de los aprendientes: registro, edición y eliminación de datos.",
    evaluations: "Aplica las 8 pruebas psicopedagógicas estandarizadas y obtén análisis automático con IA.",
    reports: "Visualiza y exporta reportes de evaluaciones en formato PDF o Excel.",
    aiTraining: "Entrena el modelo de IA para mejorar la precisión de las clasificaciones (solo administradores).",
    learningStyle: "Evalúa los estilos de aprendizaje mediante cuestionario de 30 preguntas con 7 dimensiones."
  },

  // Children Module
  children: {
    title: "Gestión de Aprendientes",
    description: "Administra los perfiles de los aprendientes evaluados en el sistema.",
    addChild: "Registra un nuevo aprendiente con información básica: nombre, fecha de nacimiento, género, grado y escuela.",
    birthDate: "La fecha de nacimiento no puede ser posterior a la actual. Se usa para calcular la edad del aprendiente.",
    gender: "Selecciona el género del aprendiente. Este dato es opcional pero ayuda en el análisis estadístico.",
    grade: "Indica el grado escolar actual del aprendiente para facilitar el seguimiento académico.",
    school: "Nombre de la institución educativa donde estudia el aprendiente.",
    export: "Exporta la lista de aprendientes a formato Excel para análisis externo.",
    import: "Importa múltiples aprendientes desde un archivo Excel con el formato correcto.",
    filter: "Filtra la lista de aprendientes por grado escolar para facilitar la búsqueda."
  },

  // Evaluations Module
  evaluations: {
    title: "Evaluaciones de Motricidad Fina",
    description: "Sistema de evaluación con 8 pruebas estandarizadas para medir el desarrollo motor fino.",
    newEvaluation: "Crea una nueva evaluación seleccionando el aprendiente y aplicando las 8 pruebas.",
    tests: "Las 8 pruebas evalúan diferentes aspectos: coordinación óculo-manual, precisión, control de presión, destreza digital, coordinación bimanual, velocidad, precisión en recorte y coordinación grafomotora.",
    scoring: "Cada prueba se califica de 0 a 10. El sistema analizará automáticamente los resultados al finalizar.",
    observations: "Registra observaciones específicas por cada prueba y observaciones generales de la sesión.",
    aiAnalysis: "El sistema de IA clasifica automáticamente el nivel de desarrollo (Alto, Medio, Bajo) y genera recomendaciones personalizadas.",
    export: "Genera reportes en PDF (profesional completo) o Excel (datos tabulares).",
    filters: "Filtra evaluaciones por mes, grado escolar o aprendiente específico.",
    viewDetails: "Visualiza los resultados detallados con gráficos de barras y radar comparativo."
  },

  // AI Training Module
  aiTraining: {
    title: "Entrenamiento del Modelo de IA",
    description: "Sistema de machine learning para clasificar automáticamente el nivel de desarrollo motor fino.",
    training: "Entrena el modelo con las evaluaciones existentes. Se recomienda tener al menos 50 evaluaciones para resultados óptimos.",
    samples: "Define la cantidad de muestras totales y su distribución en entrenamiento (80%), validación (10%) y prueba (10%).",
    metrics: "El sistema calcula automáticamente: Precisión (Accuracy), F1-Score por clase, y Precision por clase.",
    confusionMatrix: "Visualiza la matriz de confusión para entender cómo el modelo clasifica cada nivel.",
    history: "Revisa el historial de entrenamientos anteriores y compara el rendimiento del modelo.",
    trainingTime: "El tiempo de entrenamiento depende de la cantidad de muestras. Típicamente toma 1-3 minutos.",
    recommendations: "Un modelo bien entrenado debe tener un F1-Score superior a 0.70 en cada clase."
  },

  // Learning Style Assessment
  learningStyle: {
    title: "Evaluación de Estilos de Aprendizaje",
    description: "Cuestionario de 30 preguntas que evalúa 7 dimensiones del aprendizaje.",
    dimensions: "Evalúa: Visual, Auditivo, Kinestésico, Lógico, Social, Solitario y Verbal.",
    questionnaire: "Responde las 30 preguntas usando una escala de 1 (Nunca) a 5 (Siempre).",
    results: "El sistema identifica automáticamente el estilo dominante y secundario.",
    report: "Genera un reporte con recomendaciones pedagógicas específicas para cada estilo."
  },

  // Reports Module
  reports: {
    title: "Reportes y Visualización",
    description: "Visualiza y exporta reportes de evaluaciones con gráficos y análisis.",
    individualPDF: "Genera un PDF profesional con análisis completo, gráficos y recomendaciones de IA.",
    groupPDF: "Crea un reporte consolidado de múltiples evaluaciones para análisis grupal.",
    excelExport: "Exporta datos tabulares para análisis estadístico en Excel.",
    charts: "Visualiza gráficos de barras (puntajes por prueba) y radar (comparativo general).",
    historicalComparison: "Compara evaluaciones del mismo aprendiente a lo largo del tiempo."
  },

  // Security
  security: {
    title: "Seguridad y Privacidad",
    description: "El sistema implementa Row Level Security (RLS) para proteger los datos.",
    rls: "Solo puedes ver y gestionar tus propios datos. Aislamiento total entre evaluadores.",
    authentication: "Autenticación segura con Supabase Auth. Las sesiones se mantienen de forma segura.",
    dataProtection: "Todos los datos personales y clínicos están protegidos y encriptados.",
    privacy: "Cumplimiento con normativas de protección de datos personales de menores."
  },

  // Profile
  profile: {
    title: "Perfil de Usuario",
    description: "Gestiona tu información personal y configuración de cuenta.",
    fullName: "Tu nombre completo como evaluador o administrador del sistema.",
    institution: "Institución educativa o centro donde trabajas.",
    role: "Tu rol en el sistema: Evaluador (realiza evaluaciones) o Admin (entrena IA).",
    updateProfile: "Actualiza tu información personal en cualquier momento."
  },

  // General System
  system: {
    navigation: "Usa el menú de navegación para acceder a los diferentes módulos del sistema.",
    logout: "Cierra tu sesión de forma segura cuando termines de usar el sistema.",
    support: "Para ayuda adicional, consulta los manuales en la carpeta /docs del proyecto.",
    version: "Sistema SEEDU Motor Fine v1.0.0 - Noviembre 2024"
  }
};

// Helper para obtener contenido de ayuda de forma segura
export const getHelpContent = (module: string, key: string): string => {
  const content = helpContent[module as keyof typeof helpContent];
  if (!content) return "";
  return content[key as keyof typeof content] || "";
};
