import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Debug log entry
  console.log(`Request received: ${req.method}`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Request body parsed");
    const { evaluations, childName, childId } = body;

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Generating progress predictions for:', childName);

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY no está configurado');
    }

    // Obtener datos de cuestionarios (Igual que antes)
    const { data: learningStyle } = await supabase
      .from('learning_style_assessments')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: questionnaires } = await supabase
      .from('questionnaires')
      .select('id, name, type')
      .in('type', ['cornell', 'chaea', 'tam'])
      .eq('is_active', true);

    let cornellData = null;
    let chaeaData = null;
    let tamData = null;

    if (questionnaires && questionnaires.length > 0) {
      for (const questionnaire of questionnaires) {
        const { data: response } = await supabase
          .from('questionnaire_responses')
          .select('*')
          .eq('child_id', childId)
          .eq('questionnaire_id', questionnaire.id)
          .order('response_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (response) {
          if (questionnaire.type === 'cornell') cornellData = response;
          if (questionnaire.type === 'chaea') chaeaData = response;
          if (questionnaire.type === 'tam') tamData = response;
        }
      }
    }

    // Preparar contexto de estilos de aprendizaje
    let learningContext = '';
    if (learningStyle || tamData) {
      learningContext = `
TAM (learning_style_assessments) - ${learningStyle ? `Estilo dominante: ${learningStyle.dominant_style}` : 'No disponible'}
TAM (questionnaire_responses) - ${tamData ? `Modalidad dominante: ${tamData.dominant_dimension}` : 'No disponible'}
CHAEA - ${chaeaData ? `Estilo dominante: ${chaeaData.dominant_dimension}` : 'No disponible'}
Cornell - ${cornellData ? `Habilidades: ${cornellData.dominant_dimension}` : 'No disponible'}
      `.trim();
    }

    // Análisis de tendencias históricas
    const activitiesData = [
      "Juego de Pesca",
      "Pesca con imán",
      "Ensartado",
      "Enroscar botellas",
      "Laberintos con crayón",
      "Laberintos con dáctilo pintura",
      "Juego de lanzamiento con muñecas",
      "Juego del candado"
    ];

    const historicalData = evaluations.map((evaluation: any, idx: number) => {
      const scores = [
        evaluation.test_1_score,
        evaluation.test_2_score,
        evaluation.test_3_score,
        evaluation.test_4_score,
        evaluation.test_5_score,
        evaluation.test_6_score,
        evaluation.test_7_score,
        evaluation.test_8_score
      ];
      return {
        date: evaluation.evaluation_date,
        scores,
        average: scores.filter((s: any) => s !== null).reduce((a: number, b: number) => a + b, 0) / scores.filter((s: any) => s !== null).length
      };
    });

    const systemPrompt = `Eres un sistema predictivo de IA especializado en desarrollo infantil que usa modelos de series temporales y machine learning para generar predicciones de progreso futuro.

TU MODELO PREDICTIVO:
1. Análisis de series temporales para identificar tendencias y patrones
2. Regresión polinomial para proyectar trayectorias de desarrollo
3. Análisis de velocidad de aprendizaje (rate of change)
4. Consideración de factores de estilo de aprendizaje como moduladores

DATOS CONTEXTUALES DEL APRENDIENTE:
${learningContext || 'No hay datos de estilos de aprendizaje disponibles'}

ACTIVIDADES EVALUADAS:
${activitiesData.map((act, i) => `${i + 1}. ${act}`).join('\n')}

Escala: 1 (No alcanza) - 5 (Sobresaliente)

CRITERIOS PARA PREDICCIONES:
- Identifica la velocidad de progreso actual (rápido/moderado/lento)
- Detecta patrones de mejora o estancamiento
- Considera la variabilidad entre actividades
- Proyecta desarrollo esperado en 1, 3 y 6 meses
- Identifica actividades con mayor potencial de mejora
- Señala posibles riesgos de estancamiento o retroceso

Responde en formato JSON (SIN Markdown):
{
  "modelInfo": {
    "algorithm": "Time Series + Polynomial Regression (Gemini)",
    "confidence": 0.75-0.95,
    "dataQuality": "excelente/bueno/limitado",
    "predictiveAccuracy": "Estimado basado en datos históricos"
  },
  "overallProgress": {
    "currentLevel": "bajo/medio/alto",
    "currentAverage": número actual,
    "trend": "mejora rápida/mejora moderada/estable/deterioro",
    "learningVelocity": número (unidades por mes),
    "predictions": {
      "oneMonth": {
        "expectedAverage": número predicho,
        "confidenceInterval": [mínimo, máximo],
        "likelihood": 0.70-0.95
      },
      "threeMonths": {
        "expectedAverage": número predicho,
        "confidenceInterval": [mínimo, máximo],
        "likelihood": 0.60-0.90
      },
      "sixMonths": {
        "expectedAverage": número predicho,
        "confidenceInterval": [mínimo, máximo],
        "likelihood": 0.50-0.85
      }
    }
  },
  "activityPredictions": [
    {
      "activity": "nombre",
      "currentScore": número actual,
      "trend": "mejora/estable/deterioro",
      "predictions": {
        "oneMonth": número,
        "threeMonths": número,
        "sixMonths": número
      },
      "improvementPotential": "alto/medio/bajo",
      "confidence": 0.70-0.95
    }
  ],
  "riskFactors": [
    "Factor de riesgo 1",
    "Factor de riesgo 2"
  ],
  "opportunities": [
    "Oportunidad de mejora 1",
    "Oportunidad de mejora 2"
  ],
  "recommendations": {
    "priority": "Recomendación prioritaria para maximizar progreso",
    "supportNeeded": "Nivel de apoyo requerido: bajo/medio/alto",
    "focusAreas": ["Área 1", "Área 2", "Área 3"]
  }
}`;

    const userPrompt = `Genera predicciones de progreso futuro para ${childName} basándote en los siguientes datos históricos:

EVALUACIONES HISTÓRICAS (${evaluations.length} evaluaciones):
${historicalData.map((h: any, i: number) =>
      `${i + 1}. Fecha: ${h.date}, Promedio: ${h.average.toFixed(2)}/5
   Puntuaciones: ${h.scores.map((s: number | null, idx: number) => `${activitiesData[idx]}: ${s || 'N/A'}`).join(', ')}`
    ).join('\n\n')}

ANÁLISIS REQUERIDO:
1. Determina la velocidad de aprendizaje actual
2. Identifica patrones de mejora por actividad
3. Proyecta progreso esperado en 1, 3 y 6 meses
4. Calcula intervalos de confianza para cada predicción
5. Identifica oportunidades y riesgos
`;

    console.log('Calling Gemini for predictions...');

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error:", errText);
      throw new Error(`Gemini API returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("Gemini returned empty response");
    }

    // Clean Markdown
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const predictions = JSON.parse(responseText);

    return new Response(JSON.stringify(predictions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in predict-progress:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error al generar predicciones' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

