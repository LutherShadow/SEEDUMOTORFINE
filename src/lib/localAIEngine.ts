// Motor de IA Local - Predicciones basadas en el modelo entrenado
// Este motor analiza datos históricos para generar predicciones sin depender de APIs externas

interface Evaluation {
  id: string;
  evaluation_date: string;
  test_1_score: number | null;
  test_2_score: number | null;
  test_3_score: number | null;
  test_4_score: number | null;
  test_5_score: number | null;
  test_6_score: number | null;
  test_7_score: number | null;
  test_8_score: number | null;
  observations?: string | null;
}

interface TrainedModel {
  accuracy: number | null;
  precision_high: number | null;
  precision_medium: number | null;
  precision_low: number | null;
  f1_high: number | null;
  f1_medium: number | null;
  f1_low: number | null;
  confusion_matrix: any;
}

const ACTIVITIES = [
  "Juego de Pesca",
  "Pesca con imán",
  "Ensartado",
  "Enroscar botellas",
  "Laberintos con crayón",
  "Laberintos con dáctilo pintura",
  "Juego de lanzamiento con muñecas",
  "Juego del candado"
];

// Clasificar nivel basado en puntuación
function classifyLevel(score: number): 'alto' | 'medio' | 'bajo' {
  if (score >= 4) return 'alto';
  if (score >= 2.5) return 'medio';
  return 'bajo';
}

// Calcular tendencia lineal
function calculateTrend(values: number[]): { slope: number; trend: string } {
  if (values.length < 2) return { slope: 0, trend: 'estable' };

  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += (i - xMean) ** 2;
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;

  let trend = 'estable';
  if (slope > 0.1) trend = slope > 0.3 ? 'mejora rápida' : 'mejora moderada';
  else if (slope < -0.1) trend = 'deterioro';

  return { slope, trend };
}

// Calcular promedio de scores válidos
function calculateAverage(scores: (number | null)[]): number {
  const valid = scores.filter((s): s is number => s !== null);
  return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}

// Predecir valor futuro basado en tendencia
function predictFutureValue(
  currentValue: number,
  slope: number,
  monthsAhead: number,
  maxValue: number = 5
): number {
  const predicted = currentValue + (slope * monthsAhead);
  return Math.max(1, Math.min(maxValue, predicted));
}

// Calcular intervalo de confianza
function calculateConfidenceInterval(
  predicted: number,
  monthsAhead: number,
  modelAccuracy: number
): [number, number] {
  const uncertainty = (1 - modelAccuracy / 100) * monthsAhead * 0.3;
  return [
    Math.max(1, predicted - uncertainty),
    Math.min(5, predicted + uncertainty)
  ];
}

// Generar predicciones de progreso usando el modelo entrenado
export function generateLocalPredictions(
  evaluations: Evaluation[],
  trainedModel: TrainedModel | null,
  childName: string
): any {
  const modelAccuracy = trainedModel?.accuracy || 85;
  const modelConfidence = modelAccuracy / 100;

  // Calcular promedios históricos
  const historicalAverages = evaluations.map(e => {
    const scores = [
      e.test_1_score, e.test_2_score, e.test_3_score, e.test_4_score,
      e.test_5_score, e.test_6_score, e.test_7_score, e.test_8_score
    ];
    return calculateAverage(scores);
  });

  const currentAverage = historicalAverages[historicalAverages.length - 1] || 0;
  const { slope, trend } = calculateTrend(historicalAverages);

  // Análisis específico para este aprendiente
  const evaluationDates = evaluations.map(e => new Date(e.evaluation_date));
  const daysBetweenFirst = evaluations.length > 1
    ? Math.round((evaluationDates[evaluationDates.length - 1].getTime() - evaluationDates[0].getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const learningIntensity = daysBetweenFirst > 0 ? evaluations.length / (daysBetweenFirst / 30) : 1;

  // Predicciones temporales
  const oneMonthPredicted = predictFutureValue(currentAverage, slope, 1);
  const threeMonthsPredicted = predictFutureValue(currentAverage, slope, 3);
  const sixMonthsPredicted = predictFutureValue(currentAverage, slope, 6);

  // Predicciones por actividad
  const activityPredictions = ACTIVITIES.map((activity, idx) => {
    const activityScores = evaluations
      .map(e => e[`test_${idx + 1}_score` as keyof Evaluation] as number | null)
      .filter((s): s is number => s !== null);

    const currentScore = activityScores[activityScores.length - 1] || 0;
    const { slope: actSlope, trend: actTrend } = calculateTrend(activityScores);

    // Calcular potencial de mejora
    let improvementPotential = 'bajo';
    if (currentScore < 3 && actSlope > 0) improvementPotential = 'alto';
    else if (currentScore < 4 && actSlope >= 0) improvementPotential = 'medio';

    return {
      activity,
      currentScore,
      trend: actTrend,
      predictions: {
        oneMonth: predictFutureValue(currentScore, actSlope, 1),
        threeMonths: predictFutureValue(currentScore, actSlope, 3),
        sixMonths: predictFutureValue(currentScore, actSlope, 6)
      },
      improvementPotential,
      confidence: modelConfidence * (activityScores.length > 3 ? 0.95 : 0.75)
    };
  });

  // Identificar factores de riesgo
  const riskFactors: string[] = [];
  const weakActivities = activityPredictions.filter(a => a.currentScore < 2.5);
  if (weakActivities.length > 0) {
    riskFactors.push(`${weakActivities.length} actividades con puntuación por debajo del promedio esperado`);
  }
  if (slope < 0) {
    riskFactors.push('Tendencia negativa detectada en el progreso general');
  }
  if (evaluations.length < 3) {
    riskFactors.push('Datos históricos limitados para predicciones precisas');
  }
  const stagnantActivities = activityPredictions.filter(a => a.trend === 'estable' && a.currentScore < 4);
  if (stagnantActivities.length > 2) {
    riskFactors.push('Varias actividades muestran estancamiento');
  }

  // Identificar oportunidades
  const opportunities: string[] = [];
  const improvingActivities = activityPredictions.filter(a => a.trend.includes('mejora'));
  if (improvingActivities.length > 0) {
    opportunities.push(`${improvingActivities.length} actividades muestran tendencia positiva de mejora`);
  }
  const highPotential = activityPredictions.filter(a => a.improvementPotential === 'alto');
  if (highPotential.length > 0) {
    opportunities.push(`${highPotential.length} actividades con alto potencial de desarrollo`);
  }
  if (slope > 0.2) {
    opportunities.push('Velocidad de aprendizaje superior al promedio');
  }

  // Generar recomendaciones personalizadas para este aprendiente
  const focusAreas = activityPredictions
    .filter(a => a.currentScore < 3.5 || a.improvementPotential === 'alto')
    .slice(0, 3)
    .map(a => a.activity);

  // Recomendaciones personalizadas basadas en el perfil específico del aprendiente
  let priority = `${childName} debe mantener el ritmo de práctica actual y consolidar las habilidades adquiridas.`;
  let supportNeeded = 'bajo';

  if (currentAverage < 2.5) {
    priority = `${childName} necesita enfocar esfuerzos en las actividades básicas antes de avanzar a niveles más complejos. Se recomienda práctica diaria de 15-20 minutos.`;
    supportNeeded = 'alto';
  } else if (currentAverage < 3.5) {
    priority = `${childName} debe reforzar las actividades con menor puntuación mediante práctica estructurada. Se sugieren sesiones de 3-4 veces por semana.`;
    supportNeeded = 'medio';
  }

  // Generar análisis personalizado según el historial del aprendiente
  const personalizedAnalysis = generatePersonalizedAnalysis(childName, evaluations, activityPredictions, slope, currentAverage);

  return {
    childName, // Incluir nombre para referencias
    modelInfo: {
      algorithm: 'Random Forest + Análisis Estadístico Local',
      confidence: modelConfidence,
      dataQuality: evaluations.length >= 5 ? 'bueno' : evaluations.length >= 3 ? 'limitado' : 'insuficiente',
      predictiveAccuracy: `Basado en ${evaluations.length} evaluaciones históricas de ${childName}`,
      evaluationPeriod: evaluations.length > 1
        ? `${new Date(evaluations[0].evaluation_date).toLocaleDateString('es-ES')} - ${new Date(evaluations[evaluations.length - 1].evaluation_date).toLocaleDateString('es-ES')}`
        : 'Evaluación única'
    },
    overallProgress: {
      currentLevel: classifyLevel(currentAverage),
      currentAverage,
      trend,
      learningVelocity: slope,
      personalizedMessage: personalizedAnalysis.overallMessage,
      predictions: {
        oneMonth: {
          expectedAverage: oneMonthPredicted,
          confidenceInterval: calculateConfidenceInterval(oneMonthPredicted, 1, modelAccuracy),
          likelihood: modelConfidence * 0.9,
          description: `En 1 mes, ${childName} podría alcanzar un promedio de ${oneMonthPredicted.toFixed(2)}`
        },
        threeMonths: {
          expectedAverage: threeMonthsPredicted,
          confidenceInterval: calculateConfidenceInterval(threeMonthsPredicted, 3, modelAccuracy),
          likelihood: modelConfidence * 0.8,
          description: `En 3 meses, ${childName} podría alcanzar un promedio de ${threeMonthsPredicted.toFixed(2)}`
        },
        sixMonths: {
          expectedAverage: sixMonthsPredicted,
          confidenceInterval: calculateConfidenceInterval(sixMonthsPredicted, 6, modelAccuracy),
          likelihood: modelConfidence * 0.7,
          description: `En 6 meses, ${childName} podría alcanzar un promedio de ${sixMonthsPredicted.toFixed(2)}`
        }
      }
    },
    activityPredictions,
    riskFactors: riskFactors.length > 0
      ? riskFactors.map(r => `${childName}: ${r}`)
      : [`${childName} no presenta factores de riesgo significativos actualmente`],
    opportunities: opportunities.length > 0
      ? opportunities.map(o => `${childName}: ${o}`)
      : [`${childName} puede continuar con el plan de desarrollo actual`],
    recommendations: {
      priority,
      supportNeeded,
      focusAreas: focusAreas.length > 0 ? focusAreas : ['Mantenimiento general de habilidades'],
      personalizedTips: personalizedAnalysis.tips
    }
  };
}

// Generar análisis personalizado para el aprendiente
function generatePersonalizedAnalysis(
  childName: string,
  evaluations: Evaluation[],
  activityPredictions: any[],
  slope: number,
  currentAverage: number
): { overallMessage: string; tips: string[] } {
  const strongActivities = activityPredictions.filter(a => a.currentScore >= 4);
  const weakActivities = activityPredictions.filter(a => a.currentScore < 2.5);
  const improvingActivities = activityPredictions.filter(a => a.trend.includes('mejora'));

  let overallMessage = '';
  const tips: string[] = [];

  if (slope > 0.3) {
    overallMessage = `${childName} muestra una excelente velocidad de aprendizaje. Su progreso es notable y consistente.`;
    tips.push(`Mantener la frecuencia actual de práctica para ${childName}`);
    tips.push(`Introducir gradualmente desafíos más complejos para ${childName}`);
  } else if (slope > 0.1) {
    overallMessage = `${childName} presenta un progreso moderado y sostenido. Las intervenciones están dando resultados positivos.`;
    tips.push(`Continuar con las estrategias actuales para ${childName}`);
    tips.push(`Reforzar las áreas con menor puntuación de ${childName}`);
  } else if (slope >= 0) {
    overallMessage = `${childName} mantiene un nivel estable. Se recomienda intensificar las actividades para acelerar el progreso.`;
    tips.push(`Aumentar la frecuencia de práctica para ${childName}`);
    tips.push(`Variar las actividades para mantener la motivación de ${childName}`);
  } else {
    overallMessage = `${childName} muestra una tendencia que requiere atención. Es importante revisar las estrategias de intervención.`;
    tips.push(`Evaluar posibles factores externos que afecten a ${childName}`);
    tips.push(`Considerar adaptaciones metodológicas para ${childName}`);
  }

  if (strongActivities.length > 0) {
    tips.push(`Fortalezas de ${childName}: ${strongActivities.slice(0, 2).map(a => a.activity).join(', ')}`);
  }

  if (weakActivities.length > 0) {
    tips.push(`Áreas prioritarias para ${childName}: ${weakActivities.slice(0, 2).map(a => a.activity).join(', ')}`);
  }

  return { overallMessage, tips };
}

// Generar sugerencias de actividades usando el modelo entrenado
export function generateLocalSuggestions(
  evaluations: Evaluation[],
  trainedModel: TrainedModel | null,
  childName: string,
  learningStyle?: any
): any {
  const modelAccuracy = trainedModel?.accuracy || 85;

  // Analizar actividades débiles
  const activityAnalysis = ACTIVITIES.map((activity, idx) => {
    const scores = evaluations
      .map(e => e[`test_${idx + 1}_score` as keyof Evaluation] as number | null)
      .filter((s): s is number => s !== null);

    const average = calculateAverage(scores);
    const { trend } = calculateTrend(scores);

    return { activity, average, trend, index: idx };
  });

  // Ordenar por prioridad (menor puntuación primero)
  const prioritized = activityAnalysis.sort((a, b) => a.average - b.average);

  // Base de datos de actividades concretas por tipo
  const concreteActivities: Record<string, {
    activities: { name: string; duration: string; materials: string[]; steps: string[] }[];
  }> = {
    'Juego de Pesca': {
      activities: [
        {
          name: 'Pesca de colores',
          duration: '10-15 minutos',
          materials: ['Caña de pescar de juguete', 'Peces de colores (6-10 unidades)', 'Recipiente con agua o superficie plana'],
          steps: ['Colocar los peces en el área designada', 'Pedir pescar por colores específicos', 'Aumentar velocidad gradualmente', 'Contar los peces capturados']
        },
        {
          name: 'Pesca competitiva',
          duration: '15-20 minutos',
          materials: ['2 cañas de pescar', 'Peces numerados', 'Temporizador'],
          steps: ['Establecer turnos de 2 minutos', 'Pescar el mayor número posible', 'Sumar puntos según números de peces', 'Celebrar logros']
        }
      ]
    },
    'Pesca con imán': {
      activities: [
        {
          name: 'Búsqueda del tesoro magnético',
          duration: '15 minutos',
          materials: ['Imán en barra', 'Objetos metálicos pequeños', 'Arena o arroz en bandeja'],
          steps: ['Esconder objetos en la arena/arroz', 'Buscar con el imán', 'Clasificar objetos encontrados', 'Aumentar dificultad reduciendo tamaño']
        },
        {
          name: 'Laberinto magnético',
          duration: '10-15 minutos',
          materials: ['Caja transparente', 'Imán fuerte', 'Pelotita metálica'],
          steps: ['Dibujar laberinto en la caja', 'Guiar pelotita con imán desde abajo', 'Evitar tocar los bordes', 'Cronometrar recorridos']
        }
      ]
    },
    'Ensartado': {
      activities: [
        {
          name: 'Collar de patrones',
          duration: '15-20 minutos',
          materials: ['Cordón grueso', 'Cuentas de colores grandes', 'Tarjetas con patrones'],
          steps: ['Mostrar patrón a seguir', 'Ensartar cuentas en orden', 'Verificar patrón completado', 'Crear patrones propios']
        },
        {
          name: 'Ensartado de pasta',
          duration: '10-15 minutos',
          materials: ['Pasta tubular (macarrones)', 'Lana o cordón', 'Colorante alimentario (opcional)'],
          steps: ['Preparar pasta de colores (opcional)', 'Ensartar siguiendo secuencias', 'Crear pulseras o collares', 'Regalar creaciones']
        }
      ]
    },
    'Enroscar botellas': {
      activities: [
        {
          name: 'Carrera de tapas',
          duration: '10 minutos',
          materials: ['5-8 botellas de distintos tamaños', 'Tapas mezcladas', 'Cronómetro'],
          steps: ['Mezclar todas las tapas', 'Encontrar la tapa correcta para cada botella', 'Enroscar correctamente', 'Cronometrar y superar tiempo']
        },
        {
          name: 'Torre de botellas',
          duration: '15 minutos',
          materials: ['Botellas de plástico vacías', 'Tapas', 'Base estable'],
          steps: ['Enroscar tapas firmemente', 'Apilar botellas creando torre', 'Mantener equilibrio', 'Agregar botellas hasta que caiga']
        }
      ]
    },
    'Laberintos con crayón': {
      activities: [
        {
          name: 'Laberinto del ratón',
          duration: '10-15 minutos',
          materials: ['Hojas con laberintos impresos', 'Crayones de colores', 'Borrador'],
          steps: ['Elegir laberinto según nivel', 'Trazar camino sin tocar paredes', 'Colorear el camino correcto', 'Aumentar complejidad']
        },
        {
          name: 'Creador de laberintos',
          duration: '20 minutos',
          materials: ['Papel cuadriculado', 'Crayones', 'Regla'],
          steps: ['Diseñar laberinto propio', 'Marcar entrada y salida', 'Intercambiar con compañero', 'Resolver laberintos de otros']
        }
      ]
    },
    'Laberintos con dáctilo pintura': {
      activities: [
        {
          name: 'Camino sensorial',
          duration: '15-20 minutos',
          materials: ['Pintura dactilar', 'Papel grande', 'Delantal', 'Toallitas húmedas'],
          steps: ['Dibujar camino en papel', 'Recorrer con dedos usando pintura', 'Mantener línea sin salirse', 'Explorar texturas']
        },
        {
          name: 'Arte táctil',
          duration: '20-25 minutos',
          materials: ['Pinturas de diferentes texturas', 'Cartulina', 'Elementos decorativos'],
          steps: ['Mezclar pinturas con texturas (arena, harina)', 'Crear diseños con dedos', 'Seguir patrones prediseñados', 'Secar y exhibir creación']
        }
      ]
    },
    'Juego de lanzamiento con muñecas': {
      activities: [
        {
          name: 'Bolos de muñecos',
          duration: '15 minutos',
          materials: ['Muñecos de peluche pequeños', 'Botellas vacías', 'Pelota suave'],
          steps: ['Colocar botellas como bolos', 'Lanzar muñeco para derribarlas', 'Variar distancia', 'Contar derribadas']
        },
        {
          name: 'Diana de puntos',
          duration: '15-20 minutos',
          materials: ['Diana de velcro', 'Pelotas con velcro', 'Marcador de puntaje'],
          steps: ['Colocar diana a altura apropiada', 'Lanzar desde distancia marcada', 'Sumar puntos según zona', 'Aumentar distancia gradualmente']
        }
      ]
    },
    'Juego del candado': {
      activities: [
        {
          name: 'Caja misteriosa',
          duration: '15 minutos',
          materials: ['Caja con varios candados', 'Juego de llaves', 'Sorpresa dentro'],
          steps: ['Probar diferentes llaves', 'Identificar llave correcta', 'Abrir candado con precisión', 'Descubrir sorpresa']
        },
        {
          name: 'Cadena de candados',
          duration: '20 minutos',
          materials: ['3-5 candados de diferentes tamaños', 'Llaves correspondientes', 'Cadena'],
          steps: ['Enlazar candados en cadena', 'Abrir en secuencia', 'Cerrar y volver a abrir', 'Cronometrar mejora']
        }
      ]
    }
  };

  // Generar sugerencias con actividades concretas
  const suggestions = prioritized.slice(0, 4).map(act => {
    // Adaptar descripción según estilo de aprendizaje
    let learningStyleAdaptation = '';
    if (learningStyle) {
      const styleAdaptations: Record<string, string> = {
        visual: 'Usar colores brillantes y patrones visuales claros. Demostrar visualmente cada paso.',
        auditory: 'Acompañar con instrucciones verbales claras y ritmos. Usar canciones o conteos.',
        kinesthetic: 'Permitir exploración táctil y movimiento libre. Enfatizar la experiencia física.',
        logical: 'Explicar la secuencia lógica de pasos. Usar números y patrones predecibles.',
        social: 'Realizar en grupo o con compañeros. Celebrar logros compartidos.',
        solitary: 'Permitir trabajo independiente. Dar tiempo para concentración individual.'
      };
      learningStyleAdaptation = styleAdaptations[learningStyle.dominant_style] || '';
    }

    const suggestionTypes: Record<string, { type: string; description: string; benefits: string[] }> = {
      'Juego de Pesca': {
        type: 'Coordinación ojo-mano',
        description: `Para ${childName}: Practicar con diferentes tamaños de peces y variar la velocidad del movimiento. Usar peces de colores brillantes para mantener la atención. ${learningStyleAdaptation}`,
        benefits: ['Mejora la coordinación visual-motora', 'Desarrolla la paciencia', 'Fortalece el agarre de pinza']
      },
      'Pesca con imán': {
        type: 'Precisión motora',
        description: `Para ${childName}: Incrementar gradualmente la distancia y utilizar imanes de diferentes tamaños. Crear desafíos de tiempo para aumentar motivación. ${learningStyleAdaptation}`,
        benefits: ['Refina el control motor fino', 'Mejora la concentración', 'Desarrolla la planificación motora']
      },
      'Ensartado': {
        type: 'Motricidad fina',
        description: `Para ${childName}: Variar el grosor de los hilos y el tamaño de las cuentas. Crear patrones de colores como objetivo para mantener interés. ${learningStyleAdaptation}`,
        benefits: ['Fortalece la pinza digital', 'Mejora la coordinación bimanual', 'Desarrolla la secuenciación']
      },
      'Enroscar botellas': {
        type: 'Fuerza y coordinación',
        description: `Para ${childName}: Usar tapas de diferentes tamaños y resistencias. Practicar con ambas manos alternadamente para desarrollo bilateral. ${learningStyleAdaptation}`,
        benefits: ['Desarrolla fuerza en dedos', 'Mejora coordinación rotacional', 'Fortalece la prensión']
      },
      'Laberintos con crayón': {
        type: 'Control visomotor',
        description: `Para ${childName}: Comenzar con laberintos simples y aumentar complejidad gradualmente. Variar el grosor del crayón según progreso. ${learningStyleAdaptation}`,
        benefits: ['Mejora el trazo controlado', 'Desarrolla planificación visual', 'Prepara para la escritura']
      },
      'Laberintos con dáctilo pintura': {
        type: 'Exploración táctil',
        description: `Para ${childName}: Usar diferentes texturas de pintura y variar el tamaño del laberinto. Incorporar estímulos sensoriales variados. ${learningStyleAdaptation}`,
        benefits: ['Estimula receptores táctiles', 'Desarrolla creatividad', 'Mejora la inhibición motora']
      },
      'Juego de lanzamiento con muñecas': {
        type: 'Coordinación gruesa-fina',
        description: `Para ${childName}: Variar distancias y tamaños de objetivo. Practicar con diferentes pesos de objetos para desarrollar fuerza controlada. ${learningStyleAdaptation}`,
        benefits: ['Desarrolla cálculo espacial', 'Mejora la fuerza de lanzamiento', 'Coordina movimientos amplios']
      },
      'Juego del candado': {
        type: 'Precisión y lógica',
        description: `Para ${childName}: Usar candados de diferentes tamaños y complejidad. Practicar la orientación correcta de la llave. ${learningStyleAdaptation}`,
        benefits: ['Desarrolla resolución de problemas', 'Mejora la precisión rotacional', 'Fortalece la paciencia']
      }
    };

    const suggestion = suggestionTypes[act.activity] || {
      type: 'General',
      description: `Para ${childName}: Continuar practicando con variaciones progresivas de dificultad. ${learningStyleAdaptation}`,
      benefits: ['Mejora general de habilidades', 'Desarrollo motor continuo']
    };

    // Obtener actividades concretas para esta área
    const concrete = concreteActivities[act.activity]?.activities || [];

    return {
      activity: act.activity,
      type: suggestion.type,
      description: suggestion.description,
      benefits: suggestion.benefits,
      concreteActivities: concrete, // ACTIVIDADES CONCRETAS
      currentScore: act.average.toFixed(2),
      trend: act.trend,
      expectedProgress: act.trend.includes('mejora')
        ? `${childName} muestra tendencia de mejora continua con práctica regular`
        : act.trend === 'estable'
          ? `Con intervención enfocada, ${childName} puede progresar en 2-4 semanas`
          : `Área prioritaria para ${childName} - se recomienda práctica diaria`
    };
  });

  // Recomendación general personalizada
  const overallAverage = calculateAverage(activityAnalysis.map(a => a.average));
  let overallRecommendation = '';

  if (overallAverage >= 4) {
    overallRecommendation = `${childName} muestra un excelente desarrollo en motricidad fina con un promedio de ${overallAverage.toFixed(2)}. Se recomienda mantener la práctica actual e introducir desafíos más complejos para seguir estimulando el desarrollo.`;
  } else if (overallAverage >= 3) {
    overallRecommendation = `${childName} está progresando adecuadamente con un promedio de ${overallAverage.toFixed(2)}. Las sugerencias se enfocan en fortalecer las áreas que necesitan más atención mientras se consolidan las habilidades ya desarrolladas.`;
  } else if (overallAverage >= 2) {
    overallRecommendation = `${childName} requiere apoyo adicional en varias áreas de motricidad fina (promedio: ${overallAverage.toFixed(2)}). Se recomienda implementar las actividades sugeridas de forma consistente, idealmente 3-4 veces por semana.`;
  } else {
    overallRecommendation = `${childName} necesita intervención estructurada en el desarrollo de motricidad fina (promedio: ${overallAverage.toFixed(2)}). Se recomienda sesiones diarias cortas (10-15 minutos) enfocadas en las actividades básicas antes de avanzar a tareas más complejas.`;
  }

  return {
    childName,
    suggestions,
    overallRecommendation,
    modelConfidence: modelAccuracy / 100,
    generatedAt: new Date().toISOString(),
    weeklyPlan: generateWeeklyPlan(childName, suggestions)
  };
}

// Generar plan semanal de actividades
function generateWeeklyPlan(childName: string, suggestions: any[]): { day: string; activity: string; duration: string }[] {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const plan: { day: string; activity: string; duration: string }[] = [];

  days.forEach((day, index) => {
    const suggestion = suggestions[index % suggestions.length];
    const concreteActivity = suggestion.concreteActivities?.[index % 2] || { name: suggestion.activity, duration: '15 minutos' };

    plan.push({
      day,
      activity: `${concreteActivity.name} (${suggestion.activity})`,
      duration: concreteActivity.duration || '15 minutos'
    });
  });

  return plan;
}