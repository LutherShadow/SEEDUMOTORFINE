export type ReportType = 'motricidad' | 'cornell' | 'chaea' | 'tam' | 'competencias' | 'prediccion';

export interface ReportSection {
  id: string;
  title: string;
  description?: string;
}

export interface ReportTypeTemplate {
  id: ReportType;
  name: string;
  description: string;
  icon: string;
  custom_sections: ReportSection[];
  defaultConfig: {
    header_text: string;
    footer_text: string;
    content_introduction_text: string;
    content_recommendations_text: string;
    content_conclusion_text: string;
    content_company_name: string;
    content_responsible_agent: string;
    primary_color: string;
    template: 'classic' | 'modern' | 'minimal';
    section_order: string[];
    [key: string]: any; // Allow dynamic content fields like content_estado_actual_text
  };
}

export const reportTypeTemplates: ReportTypeTemplate[] = [
  {
    id: 'motricidad',
    name: 'Evaluación de Motricidad Fina',
    description: 'Reporte completo de evaluación de habilidades motrices finas',
    icon: '✋',
    custom_sections: [
      { id: 'introduction', title: 'Introducción', description: 'Contexto y objetivos de la evaluación' },
      { id: 'resultados', title: 'Resultados de Evaluación', description: 'Análisis detallado de habilidades motrices' },
      { id: 'recommendations', title: 'Recomendaciones', description: 'Estrategias de intervención sugeridas' },
      { id: 'conclusion', title: 'Conclusiones', description: 'Síntesis y próximos pasos' }
    ],
    defaultConfig: {
      header_text: 'Reporte de Evaluación de Motricidad Fina',
      footer_text: 'Evaluación Psicopedagógica de Desarrollo Motor',
      content_introduction_text: 'El presente reporte de evaluación psicomotriz presenta un análisis exhaustivo del desarrollo de habilidades motrices finas del aprendiente. Este documento consolida los resultados de evaluaciones especializadas realizadas mediante el test de motricidad fina, identificando fortalezas específicas y áreas de oportunidad para el desarrollo motor continuo. Las evaluaciones se centraron en precisión, coordinación ojo-mano, fuerza manual y control visual-motor.',
      content_resultados_text: `Los resultados de las evaluaciones de motricidad fina revelan el siguiente perfil de desarrollo:

**Coordinación Ojo-Mano: 85/100 - Nivel Avanzado**
El aprendiente demuestra excelente capacidad para coordinar movimientos visuales y manuales. Completa exitosamente tareas de enhebrado, trazado de líneas curvas y recorte de figuras complejas con precisión notable.

**Precisión Manual: 78/100 - Nivel Intermedio-Avanzado**
Muestra control adecuado en actividades que requieren movimientos finos. Logra manipular objetos pequeños con pinza digital, aunque ocasionalmente requiere mayor concentración en tareas de alta precisión.

**Fuerza de Agarre: 72/100 - Nivel Intermedio**
La fuerza manual es funcional para actividades cotidianas. Se observa oportunidad de mejora en ejercicios que demandan presión sostenida o manipulación de materiales resistentes.

**Control Visual-Motor: 88/100 - Nivel Avanzado**
Destaca en actividades de seguimiento visual y reproducción de patrones. Excelente desempeño en tareas de copia de figuras geométricas y laberintos complejos.`,
      content_recommendations_text: `• Implementar actividades de precisión manual mediante ejercicios de pinza digital y manipulación de objetos pequeños
• Reforzar la coordinación ojo-mano a través de ejercicios de trazado, recortado y ensamblaje
• Desarrollar la fuerza manual mediante ejercicios de presión controlada y manipulación de plastilina
• Practicar ejercicios de control visual-motor con actividades de seguimiento de líneas y patrones
• Establecer rutinas diarias de ejercicios motrices de 15-20 minutos
• Utilizar materiales adaptados al nivel de desarrollo actual del aprendiente`,
      content_conclusion_text: 'El aprendiente ha demostrado un desarrollo progresivo en las áreas de motricidad fina evaluadas. Los resultados indican que el proceso de estimulación motriz está siendo efectivo, mostrando mejoras significativas en coordinación y precisión. Se recomienda continuar con el plan de intervención psicomotriz establecido, enfatizando las áreas de oportunidad identificadas y consolidando las fortalezas observadas. El seguimiento periódico permitirá ajustar las estrategias de intervención según el progreso del aprendiente.',
      content_company_name: 'Centro de Evaluación Psicopedagógica',
      content_responsible_agent: 'Especialista en Psicomotricidad',
      primary_color: '#8EB8B5',
      template: 'modern',
      section_order: ['introduction', 'resultados', 'recommendations', 'conclusion']
    }
  },
  {
    id: 'cornell',
    name: 'Cuestionario Cornell',
    description: 'Análisis de hábitos y estrategias de estudio',
    icon: '📚',
    custom_sections: [
      { id: 'introduction', title: 'Introducción', description: 'Presentación del cuestionario' },
      { id: 'analisis_habitos', title: 'Análisis de Hábitos', description: 'Evaluación de técnicas de estudio' },
      { id: 'recommendations', title: 'Recomendaciones', description: 'Estrategias de mejora' },
      { id: 'conclusion', title: 'Conclusiones', description: 'Síntesis del perfil de estudio' }
    ],
    defaultConfig: {
      header_text: 'Reporte de Análisis Cornell - Hábitos de Estudio',
      footer_text: 'Evaluación de Estrategias de Aprendizaje Cornell',
      content_introduction_text: 'Este reporte presenta los resultados del Cuestionario Cornell sobre hábitos y estrategias de estudio del aprendiente. El instrumento evalúa técnicas de organización, gestión del tiempo, métodos de toma de notas, preparación para exámenes y estrategias de comprensión lectora.',
      content_analisis_habitos_text: `El análisis de hábitos de estudio revela el siguiente perfil:

**Organización y Planificación: 75/100**
El aprendiente muestra capacidad moderada para organizar materiales y planificar sesiones de estudio. Utiliza agenda ocasionalmente pero requiere mayor consistencia.

**Técnicas de Toma de Notas: 68/100**
Emplea métodos básicos de registro de información. Se recomienda implementar el sistema Cornell para estructurar mejor los apuntes.

**Gestión del Tiempo: 72/100**
Demuestra conciencia sobre la importancia de distribuir el tiempo, aunque presenta dificultades para mantener rutinas de estudio regulares.

**Preparación para Evaluaciones: 80/100**
Muestra estrategias efectivas de repaso previo a exámenes, incluyendo resúmenes y práctica de ejercicios.`,
      content_recommendations_text: `• Implementar el método Cornell para la toma de notas estructuradas
• Establecer horario fijo de estudio con bloques de 45-50 minutos
• Crear espacio de estudio organizado y libre de distracciones
• Practicar lectura activa con subrayado y mapas conceptuales
• Revisar apuntes diariamente durante 15-20 minutos`,
      content_conclusion_text: 'Los resultados revelan un perfil de hábitos de estudio con fortalezas en preparación para evaluaciones y áreas de mejora en organización sistemática. La implementación de las recomendaciones fortalecerá las competencias de estudio autónomo.',
      content_company_name: 'Departamento de Orientación Educativa',
      content_responsible_agent: 'Psicopedagogo/a',
      primary_color: '#6B8E23',
      template: 'classic',
      section_order: ['introduction', 'analisis_habitos', 'recommendations', 'conclusion']
    }
  },
  {
    id: 'chaea',
    name: 'Cuestionario CHAEA',
    description: 'Identificación de estilos de aprendizaje Honey-Alonso',
    icon: '🎯',
    custom_sections: [
      { id: 'introduction', title: 'Introducción', description: 'Marco teórico CHAEA' },
      { id: 'perfil_estilos', title: 'Perfil de Estilos', description: 'Análisis de preferencias de aprendizaje' },
      { id: 'recommendations', title: 'Recomendaciones', description: 'Estrategias pedagógicas adaptadas' },
      { id: 'conclusion', title: 'Conclusiones', description: 'Síntesis del perfil' }
    ],
    defaultConfig: {
      header_text: 'Reporte CHAEA - Estilos de Aprendizaje',
      footer_text: 'Evaluación de Estilos de Aprendizaje Honey-Alonso',
      content_introduction_text: 'El presente reporte analiza los estilos de aprendizaje del aprendiente mediante el Cuestionario Honey-Alonso de Estilos de Aprendizaje (CHAEA). Este instrumento identifica las preferencias del aprendiente en cuatro estilos fundamentales: Activo (experiencia directa), Reflexivo (observación reflexiva), Teórico (conceptualización abstracta) y Pragmático (experimentación activa). Comprender el perfil de estilos predominantes permite adaptar estrategias pedagógicas que optimicen el proceso de aprendizaje individual.',
      content_recommendations_text: `• Diseñar actividades que integren el estilo de aprendizaje dominante identificado
• Para estilos Activos: implementar dinámicas grupales, role-playing y proyectos prácticos
• Para estilos Reflexivos: proporcionar tiempo para análisis, lectura profunda y observación
• Para estilos Teóricos: ofrecer marcos conceptuales, teorías estructuradas y modelos lógicos
• Para estilos Pragmáticos: conectar teoría con aplicaciones prácticas y casos reales
• Fortalecer estilos secundarios mediante actividades complementarias variadas`,
      content_conclusion_text: 'El análisis CHAEA revela el perfil único de estilos de aprendizaje del aprendiente, destacando preferencias metodológicas que influyen significativamente en su proceso de adquisición de conocimientos. La adaptación pedagógica basada en estos resultados potenciará la efectividad del aprendizaje, respetando las características individuales y fomentando el desarrollo de estilos complementarios. Se sugiere compartir estos resultados con el equipo docente para implementar estrategias diferenciadas en el aula.',
      content_company_name: 'Centro de Evaluación Psicopedagógica',
      content_responsible_agent: 'Especialista en Estilos de Aprendizaje',
      primary_color: '#FF6B6B',
      template: 'modern',
      section_order: ['introduction', 'recommendations', 'conclusion']
    }
  },
  {
    id: 'tam',
    name: 'Test TAM',
    description: 'Evaluación de modalidades sensoriales de aprendizaje',
    icon: '👁️',
    custom_sections: [
      { id: 'introduction', title: 'Introducción', description: 'Fundamentos del Test TAM' },
      { id: 'modalidades', title: 'Modalidades Sensoriales', description: 'Análisis Visual-Auditivo-Kinestésico' },
      { id: 'recommendations', title: 'Recomendaciones', description: 'Adaptaciones didácticas' },
      { id: 'conclusion', title: 'Conclusiones', description: 'Perfil sensorial' }
    ],
    defaultConfig: {
      header_text: 'Reporte TAM - Modalidades Sensoriales',
      footer_text: 'Evaluación de Canales Perceptuales de Aprendizaje',
      content_introduction_text: 'Este reporte presenta los resultados del Test de Modalidades Sensoriales de Aprendizaje (TAM), que evalúa las preferencias perceptuales del aprendiente en tres canales principales: Visual (aprendizaje mediante imágenes y lectura), Auditivo (aprendizaje mediante escucha y verbalización) y Kinestésico (aprendizaje mediante movimiento y manipulación). Identificar el canal sensorial predominante permite optimizar las estrategias de enseñanza y los materiales didácticos para maximizar la comprensión y retención de información.',
      content_modalidades_text: `El análisis de las modalidades sensoriales revela el siguiente perfil de preferencias perceptuales:

**Dimensión Visual:**
El aprendiente muestra preferencia por el procesamiento de información mediante imágenes, diagramas, gráficos y material visual. Retiene mejor la información cuando se presenta de forma gráfica o mediante representaciones visuales.

**Dimensión Auditiva:**
La capacidad de procesar información mediante el canal auditivo se evalúa considerando la preferencia por explicaciones verbales, discusiones, música y sonidos. El aprendiente puede beneficiarse de estrategias que involucren el sentido del oído.

**Dimensión Kinestésica:**
La modalidad kinestésica evalúa la preferencia por el aprendizaje mediante movimiento, manipulación de objetos y experiencias táctiles. El aprendiente puede requerir actividades prácticas y experiencias directas para optimizar su aprendizaje.

**Perfil de Modalidades:**
El análisis identifica la modalidad sensorial predominante y las modalidades secundarias, permitiendo diseñar estrategias pedagógicas adaptadas a las preferencias perceptuales del aprendiente.`,
      content_recommendations_text: `• Para aprendientes Visuales: utilizar diagramas, mapas conceptuales, videos y material gráfico
• Para aprendientes Auditivos: implementar explicaciones verbales, discusiones, podcasts y lectura en voz alta
• Para aprendientes Kinestésicos: integrar experimentos, manipulativos, dramatizaciones y movimiento
• Crear materiales didácticos multisensoriales que integren los tres canales
• Enseñar al aprendiente estrategias específicas para su modalidad predominante
• Fortalecer canales secundarios mediante actividades complementarias graduales`,
      content_conclusion_text: 'Los resultados del Test TAM identifican las modalidades sensoriales predominantes del aprendiente, proporcionando información valiosa para la personalización del proceso educativo. La implementación de estrategias alineadas con las preferencias perceptuales identificadas facilitará significativamente la comprensión y el procesamiento de información. Se recomienda comunicar estos resultados a padres y docentes para asegurar un enfoque pedagógico coherente y adaptado en todos los contextos de aprendizaje.',
      content_company_name: 'Departamento de Evaluación Educativa',
      content_responsible_agent: 'Psicopedagogo/a Evaluador/a',
      primary_color: '#9B59B6',
      template: 'minimal',
      section_order: ['introduction', 'modalidades', 'recommendations', 'conclusion']
    }
  },
  {
    id: 'competencias',
    name: 'Índice de Competencias',
    description: 'Análisis integral de competencias y velocidad de aprendizaje',
    icon: '📊',
    custom_sections: [
      { id: 'introduction', title: 'Introducción', description: 'Marco del índice de competencias' },
      { id: 'analisis_integral', title: 'Análisis Integral', description: 'Evaluación multidimensional' },
      { id: 'velocidad_aprendizaje', title: 'Velocidad de Aprendizaje', description: 'Patrones de evolución' },
      { id: 'recommendations', title: 'Recomendaciones', description: 'Plan de desarrollo personalizado' },
      { id: 'conclusion', title: 'Conclusiones', description: 'Síntesis competencial' }
    ],
    defaultConfig: {
      header_text: 'Reporte de Índice de Competencias Integral',
      footer_text: 'Análisis de Desarrollo de Competencias Educativas',
      content_introduction_text: 'El presente reporte consolida el Índice de Competencias del aprendiente, integrando resultados de evaluaciones de motricidad fina, cuestionarios de estilos de aprendizaje (CHAEA), hábitos de estudio (Cornell) y modalidades sensoriales (TAM). Este análisis multidimensional proporciona una visión holística del perfil competencial, identificando fortalezas transversales, áreas de desarrollo prioritario, velocidad de aprendizaje y patrones de evolución a lo largo del tiempo.',
      content_recommendations_text: `• Implementar un plan de desarrollo personalizado basado en el perfil competencial identificado
• Priorizar actividades que fortalezcan las competencias con índices más bajos
• Consolidar competencias fuertes mediante desafíos progresivamente más complejos
• Integrar estrategias multisensoriales adaptadas a los estilos de aprendizaje dominantes
• Monitorear la velocidad de aprendizaje mediante evaluaciones periódicas trimestrales
• Ajustar el ritmo de enseñanza según la curva de aprendizaje observada`,
      content_conclusion_text: 'El Índice de Competencias revela un perfil de desarrollo integral que orienta decisiones pedagógicas fundamentadas en evidencia cuantitativa y cualitativa. La evolución observada en las diferentes dimensiones evaluadas indica tendencias positivas que deben ser consolidadas mediante intervenciones específicas en las áreas identificadas. Se recomienda realizar seguimientos semestrales para monitorear el impacto de las estrategias implementadas y realizar ajustes adaptativos según la evolución del aprendiente.',
      content_company_name: 'Centro de Evaluación Psicopedagógica Integral',
      content_responsible_agent: 'Coordinador/a de Evaluación',
      primary_color: '#3498DB',
      template: 'modern',
      section_order: ['introduction', 'recommendations', 'conclusion']
    }
  },
  {
    id: 'prediccion',
    name: 'Predicción de Progreso IA',
    description: 'Análisis predictivo de desarrollo futuro con IA',
    icon: '🔮',
    custom_sections: [
      { id: 'estado_actual', title: 'Estado Actual del Aprendiente', description: 'Análisis del nivel actual de desarrollo' },
      { id: 'proyecciones', title: 'Proyecciones Temporales', description: 'Predicciones a 1, 3 y 6 meses' },
      { id: 'areas_enfoque', title: 'Áreas de Enfoque', description: 'Competencias prioritarias para desarrollo' },
      { id: 'factores_riesgo', title: 'Factores de Riesgo', description: 'Elementos que podrían afectar el progreso' },
      { id: 'recomendaciones', title: 'Recomendaciones IA', description: 'Estrategias sugeridas por el modelo' }
    ],
    defaultConfig: {
      header_text: 'Reporte de Predicción de Progreso - Modelo IA',
      footer_text: 'Predicción Generada por Inteligencia Artificial',
      content_estado_actual_text: `El aprendiente presenta un nivel de desarrollo actual caracterizado por un desempeño promedio del 78% en las evaluaciones de motricidad fina realizadas durante el último trimestre. Se observa una velocidad de aprendizaje moderada-alta, con mejoras consistentes del 12% mensual en coordinación ojo-mano y precisión manual.

**Competencias Actuales:**
• Coordinación Ojo-Mano: 82% - Nivel avanzado
• Precisión Manual: 75% - Nivel intermedio-avanzado  
• Fuerza de Agarre: 71% - Nivel intermedio
• Control Visual-Motor: 84% - Nivel avanzado

El perfil de aprendizaje muestra predominancia visual-kinestésica, con mejor retención en actividades que combinan observación y manipulación directa. La curva de aprendizaje indica una fase de consolidación de habilidades básicas con potencial para avanzar a ejercicios de mayor complejidad.`,

      content_proyecciones_text: `Basándose en el análisis de series temporales y patrones históricos de desarrollo, el modelo proyecta las siguientes trayectorias de progreso:

**Proyección a 1 mes (Intervalo de confianza: 95%):**
• Coordinación Ojo-Mano: 85-88% (mejora esperada: +4%)
• Precisión Manual: 78-82% (mejora esperada: +5%)
• Fuerza de Agarre: 74-77% (mejora esperada: +4%)
• Desempeño Global Proyectado: 81-83%

**Proyección a 3 meses (Intervalo de confianza: 90%):**
• Coordinación Ojo-Mano: 89-93% (mejora acumulada: +9%)
• Precisión Manual: 83-88% (mejora acumulada: +10%)
• Fuerza de Agarre: 79-84% (mejora acumulada: +10%)
• Desempeño Global Proyectado: 85-89%

**Proyección a 6 meses (Intervalo de confianza: 85%):**
• Coordinación Ojo-Mano: 92-96% (mejora acumulada: +12%)
• Precisión Manual: 88-94% (mejora acumulada: +15%)
• Fuerza de Agarre: 85-91% (mejora acumulada: +16%)
• Desempeño Global Proyectado: 89-94%

Estas proyecciones asumen continuidad en el plan de intervención actual y condiciones de aprendizaje estables.`,

      content_areas_enfoque_text: `El análisis predictivo identifica las siguientes áreas prioritarias para maximizar el desarrollo del aprendiente:

**1. Precisión Manual (Prioridad Alta)**
Esta competencia presenta el mayor potencial de mejora según el modelo. Se recomienda intensificar actividades de manipulación fina, trazado preciso y ejercicios de pinza digital. La proyección indica que con intervención focalizada, esta área podría alcanzar el 94% en 6 meses.

**2. Fuerza de Agarre (Prioridad Alta)**
Actualmente es el área con menor puntuación relativa. El modelo sugiere implementar ejercicios graduales de fortalecimiento manual mediante plastilina, pelotas anti-estrés y actividades de presión controlada. Potencial de mejora: +20% en 6 meses.

**3. Integración Visual-Motora Compleja (Prioridad Media)**
Aunque las competencias básicas están consolidadas, el modelo identifica oportunidad para desarrollar habilidades de integración más complejas como escritura cursiva, dibujo detallado y construcciones tridimensionales.

**4. Velocidad de Ejecución (Prioridad Media)**
Mantener la precisión actual mientras se incrementa gradualmente la velocidad de ejecución en tareas motrices. Esto preparará al aprendiente para demandas académicas más exigentes.`,

      content_factores_riesgo_text: `El modelo identifica los siguientes factores que podrían afectar negativamente las proyecciones de progreso:

**Factores de Riesgo Moderado:**
• **Fatiga Motriz:** Sesiones de práctica excesivamente prolongadas podrían generar fatiga y reducir la efectividad del aprendizaje. Riesgo de estancamiento si no se respetan períodos de descanso.

• **Falta de Variabilidad:** La repetición exclusiva de los mismos ejercicios podría generar meseta de aprendizaje. El modelo recomienda introducir nuevos desafíos cada 2-3 semanas.

• **Ausencia de Seguimiento:** Sin evaluaciones periódicas de validación, no será posible ajustar el plan de intervención. Riesgo de desviación de las proyecciones esperadas.

**Factores de Riesgo Bajo:**
• **Cambios en Rutina:** Interrupciones prolongadas (vacaciones, enfermedad) podrían generar retrocesos temporales del 5-8% en habilidades menos consolidadas.

• **Motivación Fluctuante:** La disminución del interés en actividades motrices podría reducir la frecuencia de práctica y afectar la velocidad de progreso proyectada.

**Estrategias de Mitigación:**
El modelo recomienda monitoreo quincenal de estos factores y ajuste proactivo del plan de intervención ante señales tempranas de riesgo.`,

      content_recomendaciones_text: `Basándose en el análisis predictivo, el modelo de IA sugiere las siguientes estrategias de intervención:

**Recomendaciones de Alta Prioridad:**
• Implementar sesiones diarias de 20-25 minutos de práctica motriz fina, divididas en bloques de 10 minutos con descansos intermedios
• Priorizar ejercicios de fortalecimiento de agarre: plastilina, pelotas de diferentes resistencias, pinzas de ropa
• Introducir actividades de precisión progresiva: enhebrado, recorte de figuras complejas, trazado de laberintos
• Realizar evaluaciones de seguimiento cada 3 semanas para validar proyecciones y ajustar estrategias

**Recomendaciones de Prioridad Media:**
• Integrar actividades lúdicas que combinen precisión y velocidad (juegos de construcción, rompecabezas cronometrados)
• Fomentar actividades de escritura y dibujo libre para consolidar control visual-motor
• Implementar sistema de registro de progreso visible para el aprendiente (gráficas, stickers de logros)

**Recomendaciones de Apoyo:**
• Mantener comunicación constante entre evaluadores, docentes y familia para asegurar coherencia en la intervención
• Documentar observaciones cualitativas que complementen las métricas cuantitativas del modelo
• Celebrar logros intermedios para mantener motivación y compromiso del aprendiente

**Próxima Evaluación Recomendada:** En 30 días para validar la proyección a 1 mes y recalibrar el modelo predictivo según progreso real observado.`,

      content_introduction_text: '',
      content_conclusion_text: '',
      content_recommendations_text: '',
      content_company_name: 'Sistema de Predicción Inteligente',
      content_responsible_agent: 'Modelo IA de Desarrollo',
      primary_color: '#8B5CF6',
      template: 'modern',
      section_order: ['estado_actual', 'proyecciones', 'areas_enfoque', 'factores_riesgo', 'recomendaciones']
    }
  }
];

export function getReportTypeTemplate(type: ReportType): ReportTypeTemplate | undefined {
  return reportTypeTemplates.find(t => t.id === type);
}
