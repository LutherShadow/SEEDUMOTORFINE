// Plantillas predefinidas de contenido para reportes

export interface ContentTemplate {
  id: 'formal' | 'educativa' | 'tecnica';
  name: string;
  description: string;
  content: {
    report_date: string;
    introduction_text: string;
    conclusion_text: string;
    recommendations_text: string;
    company_name: string;
    responsible_agent: string;
  };
}

export const contentTemplates: ContentTemplate[] = [
  {
    id: 'formal',
    name: 'Formal',
    description: 'Lenguaje profesional y corporativo',
    content: {
      report_date: 'Fecha del Informe',
      introduction_text: 'El presente informe tiene como objetivo presentar de manera detallada y sistemática los resultados obtenidos durante el periodo de evaluación. Este documento ha sido elaborado siguiendo los estándares profesionales establecidos por nuestra institución, garantizando la máxima precisión y objetividad en el análisis de los datos recopilados.\n\nLa metodología empleada para la recolección y análisis de la información se fundamenta en criterios técnicos validados, asegurando la confiabilidad y validez de los resultados presentados. Este informe constituye un instrumento fundamental para la toma de decisiones estratégicas y la implementación de planes de acción orientados a la mejora continua.',
      conclusion_text: 'Tras el análisis exhaustivo de los datos presentados en este informe, se concluye que los objetivos planteados al inicio del periodo evaluativo han sido alcanzados de manera satisfactoria. Los indicadores analizados muestran tendencias positivas que reflejan el impacto de las estrategias implementadas.\n\nLa información recabada constituye una base sólida para la planificación de futuras intervenciones y la optimización de procesos. Se recomienda mantener un seguimiento continuo de los indicadores clave y realizar evaluaciones periódicas que permitan medir el progreso y ajustar las estrategias según sea necesario.',
      recommendations_text: 'Con base en los hallazgos del presente informe, se recomienda:\n\n• Implementar un sistema de monitoreo continuo que permita evaluar el progreso de manera sistemática y oportuna.\n\n• Establecer protocolos de intervención temprana para abordar áreas que requieran atención prioritaria.\n\n• Fortalecer los canales de comunicación entre todos los actores involucrados para asegurar una coordinación efectiva.\n\n• Documentar todas las intervenciones y sus resultados para crear una base de datos institucional que facilite el análisis comparativo.\n\n• Programar sesiones de revisión periódica con el equipo profesional para evaluar la efectividad de las estrategias implementadas.',
      company_name: 'Institución Educativa',
      responsible_agent: 'Departamento de Evaluación y Calidad'
    }
  },
  {
    id: 'educativa',
    name: 'Educativa',
    description: 'Enfocado en el desarrollo del aprendiente',
    content: {
      report_date: 'Fecha del Reporte',
      introduction_text: '¡Bienvenidos a este reporte de progreso! Este documento ha sido creado con mucho cariño para compartir contigo los avances, logros y oportunidades de crecimiento de nuestro aprendiente.\n\nCada niño y niña es único, con su propio ritmo de aprendizaje y desarrollo. A través de este reporte, queremos celebrar los logros alcanzados y también identificar juntos las áreas donde podemos brindar mayor apoyo. Creemos firmemente que el aprendizaje es un viaje emocionante donde cada paso cuenta, y estamos comprometidos a acompañar a cada aprendiente en su camino hacia el éxito.',
      conclusion_text: '¡Qué maravilloso ha sido observar el progreso de nuestro aprendiente durante este periodo! Cada avance, por pequeño que parezca, representa un paso importante en su desarrollo integral.\n\nHemos visto cómo ha crecido no solo en sus habilidades, sino también en su confianza y entusiasmo por aprender. Como educadores, nos sentimos orgullosos de ser parte de este proceso y estamos emocionados por continuar apoyando su crecimiento. Juntos, familia y escuela, podemos crear las mejores condiciones para que cada aprendiente alcance su máximo potencial.',
      recommendations_text: 'Para seguir apoyando el desarrollo del aprendiente, sugerimos:\n\n🌟 Celebrar cada logro, por pequeño que sea, para fortalecer la confianza y motivación.\n\n🌟 Crear momentos de práctica divertida en casa que refuercen las habilidades trabajadas en clase.\n\n🌟 Mantener una comunicación constante entre familia y escuela para compartir observaciones y estrategias.\n\n🌟 Respetar el ritmo individual de aprendizaje, evitando comparaciones con otros niños.\n\n🌟 Proporcionar un ambiente de aprendizaje positivo, lleno de estímulos apropiados para su edad.\n\n🌟 Fomentar la autonomía y la toma de decisiones en actividades cotidianas.\n\nRecuerden: ¡Cada aprendiente es una estrella brillante con su propia luz especial! 💫',
      company_name: 'Centro Educativo',
      responsible_agent: 'Equipo Pedagógico'
    }
  },
  {
    id: 'tecnica',
    name: 'Técnica',
    description: 'Análisis detallado con terminología especializada',
    content: {
      report_date: 'Fecha de Emisión',
      introduction_text: 'El presente informe técnico documenta los resultados del proceso evaluativo realizado mediante instrumentos estandarizados y validados científicamente. El análisis se fundamenta en la aplicación de metodologías psicopedagógicas que permiten una valoración objetiva y cuantificable del desarrollo de competencias.\n\nLa batería de evaluación aplicada incluye pruebas normalizadas que miden diferentes dimensiones del desarrollo: habilidades motoras finas, coordinación visomotora, procesamiento cognitivo, y capacidades de aprendizaje. Los datos obtenidos han sido procesados mediante análisis estadísticos descriptivos e inferenciales, proporcionando indicadores confiables sobre el nivel de desempeño actual y la proyección de desarrollo a corto y mediano plazo.',
      conclusion_text: 'El análisis técnico de los datos recopilados permite establecer un perfil de competencias que sitúa al evaluado dentro de parámetros específicos de desarrollo. Los indicadores cuantitativos y cualitativos analizados muestran correlaciones significativas entre diferentes áreas evaluadas, evidenciando patrones de desarrollo coherentes con los estándares esperados para el grupo etario correspondiente.\n\nLos resultados obtenidos constituyen una línea base sólida para el diseño de intervenciones personalizadas basadas en evidencia. La trazabilidad de los datos y la rigurosidad metodológica empleada garantizan la validez científica de las conclusiones presentadas en este documento técnico.',
      recommendations_text: 'Basándose en el análisis técnico realizado, se recomiendan las siguientes intervenciones especializadas:\n\n▸ INTERVENCIÓN PSICOPEDAGÓGICA: Implementar programas de estimulación específica orientados a fortalecer las áreas identificadas con menor índice de desarrollo, utilizando metodologías basadas en evidencia científica.\n\n▸ MONITOREO SISTEMÁTICO: Establecer un protocolo de evaluación continua con intervalos de 30-45 días, empleando instrumentos estandarizados para medir la eficacia de las intervenciones.\n\n▸ ADAPTACIONES METODOLÓGICAS: Diseñar estrategias didácticas diferenciadas que consideren el perfil de aprendizaje identificado, incorporando recursos multisensoriales y tecnológicos apropiados.\n\n▸ ANÁLISIS LONGITUDINAL: Mantener un registro sistemático de variables de desarrollo para realizar estudios comparativos que permitan identificar tendencias y patrones evolutivos.\n\n▸ COORDINACIÓN INTERDISCIPLINARIA: Establecer protocolos de colaboración entre especialistas (psicólogo, terapeuta ocupacional, pedagogo) para abordar de manera integral las necesidades detectadas.',
      company_name: 'Centro de Evaluación Psicopedagógica',
      responsible_agent: 'Especialista en Evaluación y Diagnóstico'
    }
  }
];

export const getContentTemplate = (templateId: 'formal' | 'educativa' | 'tecnica'): ContentTemplate | undefined => {
  return contentTemplates.find(t => t.id === templateId);
};
