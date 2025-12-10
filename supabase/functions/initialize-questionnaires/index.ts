import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify user is admin
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Only admins can initialize questionnaires' }), { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if questionnaires already exist
    const { data: existing } = await supabaseClient
      .from('questionnaires')
      .select('type')
      .in('type', ['cornell', 'chaea', 'tam'])

    const existingTypes = existing ? existing.map(e => e.type) : []
    const toCreate = ['cornell', 'chaea', 'tam'].filter(type => !existingTypes.includes(type))
    
    if (toCreate.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'Todos los cuestionarios ya están inicializados.',
          existing: existingTypes
        }), 
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const created = []

    // Initialize Cornell Questionnaire (44 questions)
    if (toCreate.includes('cornell')) {
      const { data: cornell } = await supabaseClient
        .from('questionnaires')
        .insert({
          name: 'Inventario Cornell de Habilidades de Estudio',
          description: 'Evalúa las habilidades y estrategias de estudio del estudiante en diferentes áreas clave.',
          type: 'cornell',
          created_by: user.id,
          is_active: true
        })
        .select()
        .single()

    const cornellDimensions = [
      { name: 'Actitudes hacia el estudio', code: 'ATT', description: 'Motivación y actitudes generales hacia el aprendizaje' },
      { name: 'Administración del tiempo', code: 'TM', description: 'Planificación y organización del tiempo de estudio' },
      { name: 'Técnicas de lectura', code: 'RT', description: 'Estrategias de lectura y comprensión' },
      { name: 'Toma de apuntes', code: 'NT', description: 'Habilidades para tomar notas efectivas' },
      { name: 'Concentración', code: 'CON', description: 'Capacidad para mantener la atención y evitar distracciones' },
      { name: 'Procesamiento de información', code: 'IP', description: 'Organización y procesamiento de la información' },
      { name: 'Estrategias para exámenes', code: 'TE', description: 'Preparación y técnicas para presentar exámenes' }
    ]

    for (let i = 0; i < cornellDimensions.length; i++) {
      const { data: dimension } = await supabaseClient
        .from('questionnaire_dimensions')
        .insert({
          questionnaire_id: cornell.id,
          ...cornellDimensions[i],
          order_index: i
        })
        .select()
        .single()

      // Add questions for each dimension (distributed among 44 total)
      const questionsPerDimension = [6, 7, 6, 6, 7, 6, 6] // Total: 44
      const cornellQuestionTemplates = [
        // Actitudes (6)
        ['Me siento motivado para aprender y estudiar', 'Disfruto aprender cosas nuevas', 'Tengo metas claras para mis estudios', 'Creo que puedo tener éxito académico', 'Me esfuerzo por mejorar mis calificaciones', 'Veo el valor de lo que estoy aprendiendo'],
        // Tiempo (7)
        ['Planifico mi tiempo de estudio con anticipación', 'Cumplo con los horarios que establezco', 'Distribuyo mi tiempo efectivamente entre tareas', 'Evito procrastinar', 'Estudio regularmente en lugar de hacerlo todo de último momento', 'Tengo un lugar fijo para estudiar', 'Mantengo un equilibrio entre estudio y otras actividades'],
        // Lectura (6)
        ['Leo con propósito y concentración', 'Identifico las ideas principales al leer', 'Relaciono lo nuevo con lo que ya sé', 'Reviso el material antes de leer en detalle', 'Ajusto mi velocidad de lectura según la dificultad', 'Comprendo la mayoría de lo que leo'],
        // Apuntes (6)
        ['Tomo apuntes organizados', 'Registro las ideas principales en clase', 'Reviso y organizo mis apuntes después de clase', 'Uso abreviaturas y símbolos efectivamente', 'Puedo leer y entender mis apuntes después', 'Completo mis apuntes con lecturas'],
        // Concentración (7)
        ['Puedo concentrarme por períodos prolongados', 'Evito distracciones mientras estudio', 'Mantengo mi mente en lo que estoy haciendo', 'Estudio en un ambiente apropiado', 'No me distraigo fácilmente con pensamientos irrelevantes', 'Puedo concentrarme incluso cuando el material es difícil', 'Tomo descansos apropiados durante el estudio'],
        // Procesamiento (6)
        ['Organizo la información de manera lógica', 'Uso esquemas y diagramas para comprender', 'Relaciono conceptos entre sí', 'Resumo información con mis propias palabras', 'Identifico patrones en la información', 'Aplico lo aprendido a nuevas situaciones'],
        // Exámenes (6)
        ['Me preparo adecuadamente para los exámenes', 'Repaso material regularmente antes del examen', 'Leo todas las instrucciones cuidadosamente', 'Organizo mi tiempo durante el examen', 'Reviso mis respuestas antes de entregar', 'Manejo bien la ansiedad durante exámenes']
      ]

      const questions = cornellQuestionTemplates[i].slice(0, questionsPerDimension[i])
      for (let j = 0; j < questions.length; j++) {
        await supabaseClient
          .from('questionnaire_questions')
          .insert({
            questionnaire_id: cornell.id,
            dimension_id: dimension.id,
            question_number: cornellDimensions.slice(0, i).reduce((sum, _, idx) => sum + questionsPerDimension[idx], 0) + j + 1,
            question_text: questions[j],
            score_weight: 1.0,
            is_reverse_scored: false
          })
      }
    }
    
    created.push({ name: 'Cornell', questions: 44 })
  }

    // Initialize CHAEA Questionnaire (80 questions)
    if (toCreate.includes('chaea')) {
      const { data: chaea } = await supabaseClient
        .from('questionnaires')
        .insert({
        name: 'Cuestionario CHAEA de Estilos de Aprendizaje',
        description: 'Basado en el modelo de Honey-Alonso, identifica tu estilo de aprendizaje predominante: Activo, Reflexivo, Teórico o Pragmático.',
        type: 'chaea',
        created_by: user.id,
        is_active: true
      })
      .select()
      .single()

    const chaeaDimensions = [
      { name: 'Activo', code: 'ACT', description: 'Aprende mejor experimentando, tomando riesgos y siendo el centro de atención' },
      { name: 'Reflexivo', code: 'REF', description: 'Aprende mejor observando, pensando antes de actuar y escuchando' },
      { name: 'Teórico', code: 'TEO', description: 'Aprende mejor con modelos, teorías, sistemas y conceptos' },
      { name: 'Pragmático', code: 'PRA', description: 'Aprende mejor con actividades prácticas y aplicaciones reales' }
    ]

    const chaeaQuestions = [
      // 20 por estilo, distribuidas entre las 80
      { dim: 0, q: 'Tengo fama de decir lo que pienso claramente y sin rodeos' },
      { dim: 1, q: 'Estoy seguro de lo que es bueno y lo que es malo, lo que está bien y lo que está mal' },
      { dim: 2, q: 'Muchas veces actúo sin mirar las consecuencias' },
      { dim: 3, q: 'Normalmente trato de resolver los problemas metódicamente y paso a paso' },
      { dim: 0, q: 'Creo que los formalismos coartan y limitan la actuación libre de las personas' },
      { dim: 1, q: 'Me interesa saber cuáles son los sistemas de valores de los demás y con qué criterios actúan' },
      { dim: 2, q: 'Pienso que el actuar intuitivamente puede ser siempre tan válido como actuar reflexivamente' },
      { dim: 3, q: 'Creo que lo más importante es que las cosas funcionen' },
      { dim: 0, q: 'Procuro estar al tanto de lo que ocurre aquí y ahora' },
      { dim: 1, q: 'Disfruto cuando tengo tiempo para preparar mi trabajo y realizarlo a conciencia' },
      { dim: 2, q: 'Estoy a gusto siguiendo un orden en las comidas, en el estudio, haciendo ejercicio regularmente' },
      { dim: 3, q: 'Cuando escucho una nueva idea enseguida comienzo a pensar cómo ponerla en práctica' },
      { dim: 0, q: 'Prefiero las ideas originales y novedosas aunque no sean prácticas' },
      { dim: 1, q: 'Admito y me ajusto a las normas solo si me sirven para lograr mis objetivos' },
      { dim: 2, q: 'Normalmente encajo bien con personas reflexivas, y me cuesta sintonizar con personas demasiado espontáneas' },
      { dim: 3, q: 'Escucho con más frecuencia que hablo' },
      { dim: 0, q: 'Prefiero las cosas estructuradas a las desordenadas' },
      { dim: 1, q: 'Cuando poseo cualquier información, trato de interpretarla bien antes de manifestar alguna conclusión' },
      { dim: 2, q: 'Antes de hacer algo estudio con cuidado sus ventajas e inconvenientes' },
      { dim: 3, q: 'Me crezco con el reto de hacer algo nuevo y diferente' },
      { dim: 0, q: 'Casi siempre procuro ser coherente con mis criterios y sistemas de valores' },
      { dim: 1, q: 'Cuando hay una discusión no me gusta ir con rodeos' },
      { dim: 2, q: 'Me disgusta implicarme afectivamente en mi ambiente de trabajo' },
      { dim: 3, q: 'Me gustan más las personas realistas y concretas que las teóricas' },
      { dim: 0, q: 'Me cuesta ser creativo, romper estructuras' },
      { dim: 1, q: 'Me siento a gusto con personas espontáneas y divertidas' },
      { dim: 2, q: 'La mayoría de las veces expreso abiertamente cómo me siento' },
      { dim: 3, q: 'Me gusta analizar y dar vueltas a las cosas' },
      { dim: 0, q: 'Me molesta que la gente no se tome en serio las cosas' },
      { dim: 1, q: 'Me atrae experimentar y practicar las últimas técnicas y novedades' },
      { dim: 2, q: 'Soy cauteloso a la hora de sacar conclusiones' },
      { dim: 3, q: 'Prefiero contar con el mayor número de fuentes de información' },
      { dim: 0, q: 'Tiendo a ser perfeccionista' },
      { dim: 1, q: 'Prefiero oír las opiniones de los demás antes de exponer la mía' },
      { dim: 2, q: 'Me gusta afrontar la vida espontáneamente y no tener que planificar todo previamente' },
      { dim: 3, q: 'En las discusiones me gusta observar cómo actúan los demás participantes' },
      { dim: 0, q: 'Me siento incómodo con las personas calladas y demasiado analíticas' },
      { dim: 1, q: 'Juzgo con frecuencia las ideas de los demás por su valor práctico' },
      { dim: 2, q: 'Me agobio si me obligan a acelerar mucho el trabajo para cumplir un plazo' },
      { dim: 3, q: 'En las reuniones apoyo las ideas prácticas y realistas' },
      { dim: 0, q: 'Es mejor gozar del momento presente que deleitarse pensando en el pasado o en el futuro' },
      { dim: 1, q: 'Me molestan las personas que siempre desean apresurar las cosas' },
      { dim: 2, q: 'Aporto ideas nuevas y espontáneas en los grupos de discusión' },
      { dim: 3, q: 'Pienso que son más consistentes las decisiones fundamentadas en un análisis que las basadas en la intuición' },
      { dim: 0, q: 'Detecto frecuentemente la inconsistencia y puntos débiles en las argumentaciones de los demás' },
      { dim: 1, q: 'Creo que es preciso saltarse las normas muchas más veces que cumplirlas' },
      { dim: 2, q: 'A menudo caigo en la cuenta de otras formas mejores y más prácticas de hacer las cosas' },
      { dim: 3, q: 'En conjunto hablo más que escucho' },
      { dim: 0, q: 'Prefiero distanciarme de los hechos y observarlos desde otras perspectivas' },
      { dim: 1, q: 'Estoy convencido que debe imponerse la lógica y el razonamiento' },
      { dim: 2, q: 'Me gusta buscar nuevas experiencias' },
      { dim: 3, q: 'Me gusta experimentar y aplicar las cosas' },
      { dim: 0, q: 'Pienso que debemos llegar pronto al grano, al meollo de los temas' },
      { dim: 1, q: 'Siempre trato de conseguir conclusiones e ideas claras' },
      { dim: 2, q: 'Prefiero discutir cuestiones concretas y no perder el tiempo con charlas vacías' },
      { dim: 3, q: 'Me impaciento cuando me dan explicaciones irrelevantes e incoherentes' },
      { dim: 0, q: 'Compruebo antes si las cosas funcionan realmente' },
      { dim: 1, q: 'Hago varios borradores antes de la redacción definitiva de un trabajo' },
      { dim: 2, q: 'Soy consciente de que en las discusiones ayudo a mantener a los demás centrados en el tema' },
      { dim: 3, q: 'Observo que con frecuencia soy uno de los más objetivos y desapasionados en las discusiones' },
      { dim: 0, q: 'Cuando algo va mal le quito importancia y trato de hacerlo mejor' },
      { dim: 1, q: 'Rechazo ideas originales y espontáneas si no las veo prácticas' },
      { dim: 2, q: 'Me gusta sopesar diversas alternativas antes de tomar una decisión' },
      { dim: 3, q: 'Con frecuencia miro hacia adelante para prever el futuro' },
      { dim: 0, q: 'En los debates y discusiones prefiero desempeñar un papel secundario antes que ser el líder' },
      { dim: 1, q: 'Me molestan las personas que no actúan con lógica' },
      { dim: 2, q: 'Me resulta incómodo tener que planificar y prever las cosas' },
      { dim: 3, q: 'Creo que el fin justifica los medios en muchos casos' },
      { dim: 0, q: 'Suelo reflexionar sobre los asuntos y problemas' },
      { dim: 1, q: 'El trabajar a conciencia me llena de satisfacción y orgullo' },
      { dim: 2, q: 'Ante los acontecimientos trato de descubrir los principios y teorías en que se basan' },
      { dim: 3, q: 'Con tal de conseguir el objetivo que pretendo soy capaz de herir sentimientos ajenos' },
      { dim: 0, q: 'No me importa hacer todo lo necesario para que sea efectivo mi trabajo' },
      { dim: 1, q: 'Con frecuencia soy una de las personas que más anima las fiestas' },
      { dim: 2, q: 'Me aburro enseguida con el trabajo metódico y minucioso' },
      { dim: 3, q: 'La gente con frecuencia cree que soy poco sensible a sus sentimientos' },
      { dim: 0, q: 'Suelo dejarme llevar por mis intuiciones' },
      { dim: 1, q: 'Si trabajo en grupo procuro que se siga un método y un orden' },
      { dim: 2, q: 'Con frecuencia me interesa averiguar lo que piensa la gente' },
      { dim: 3, q: 'Esquivo los temas subjetivos, ambiguos y poco claros' }
    ]

    for (let i = 0; i < chaeaDimensions.length; i++) {
      const { data: dimension } = await supabaseClient
        .from('questionnaire_dimensions')
        .insert({
          questionnaire_id: chaea.id,
          ...chaeaDimensions[i],
          order_index: i
        })
        .select()
        .single()

      // Insert questions for this dimension
      const dimensionQuestions = chaeaQuestions.filter(q => q.dim === i)
      for (let j = 0; j < dimensionQuestions.length; j++) {
        await supabaseClient
          .from('questionnaire_questions')
          .insert({
            questionnaire_id: chaea.id,
            dimension_id: dimension.id,
            question_number: chaeaQuestions.findIndex(q => q === dimensionQuestions[j]) + 1,
            question_text: dimensionQuestions[j].q,
            score_weight: 1.0,
            is_reverse_scored: false
          })
      }
    }
    
    created.push({ name: 'CHAEA', questions: 80 })
  }

    // Initialize TAM Questionnaire (84 questions - Full TAM from learning_style_assessments)
    if (toCreate.includes('tam')) {
      const { data: tam } = await supabaseClient
        .from('questionnaires')
        .insert({
          name: 'Test de Análisis de Modalidades (TAM)',
        description: 'Cuestionario de Estilos de Aprendizaje - 84 preguntas que evalúan las preferencias de aprendizaje visual, auditivo, kinestésico, lógico, social e individual.',
        type: 'tam',
        created_by: user.id,
        is_active: true
      })
      .select()
      .single()

    const tamDimensions = [
      { name: 'Visual', code: 'VIS', description: 'Aprende mejor a través de imágenes, diagramas y representaciones visuales' },
      { name: 'Auditivo', code: 'AUD', description: 'Aprende mejor escuchando explicaciones y discusiones verbales' },
      { name: 'Kinestésico', code: 'KIN', description: 'Aprende mejor a través de la experiencia física y la práctica directa' },
      { name: 'Lógico-Matemático', code: 'LOG', description: 'Aprende mejor a través del razonamiento y los patrones lógicos' },
      { name: 'Social', code: 'SOC', description: 'Aprende mejor en situaciones de colaboración y trabajo en grupo' },
      { name: 'Individual', code: 'SOL', description: 'Aprende mejor de forma independiente y autónoma' }
    ]

    const tamQuestionsTemplate = [
      // Visual (14 questions)
      [
        'Prefiero observar demostraciones visuales antes de realizar una actividad manual',
        'Recuerdo mejor los trazos y líneas cuando los veo en imágenes o diagramas',
        'Me ayuda ver videos o fotos de cómo enhebrar correctamente',
        'Identifico mejor los colores y formas cuando están organizados visualmente',
        'Aprendo mejor a recortar cuando veo líneas y patrones marcados',
        'Me gusta ver dibujos de cómo doblar el papel paso a paso',
        'Prefiero ver mapas o gráficos de cómo usar las pinzas correctamente',
        'Entiendo mejor el punzado cuando veo patrones y diseños visuales',
        'Me ayudan los esquemas visuales para entender cómo modelar con plastilina',
        'Necesito ver ejemplos terminados antes de empezar mi trabajo',
        'Prefiero instrucciones escritas o con imágenes',
        'Me distraigo menos cuando tengo referencias visuales claras',
        'Recuerdo mejor las actividades que he visto hacer a otros',
        'Me gusta organizar mi trabajo visualmente antes de empezar'
      ],
      // Auditivo (14 questions)
      [
        'Aprendo mejor cuando alguien me explica verbalmente cómo hacer algo',
        'Me ayuda escuchar instrucciones sobre cómo realizar los trazos',
        'Entiendo mejor cuando me explican con palabras cómo enhebrar',
        'Prefiero que me digan los nombres de los colores mientras trabajo',
        'Me concentro mejor cuando escucho instrucciones paso a paso para recortar',
        'Aprendo mejor a doblar papel cuando me lo explican verbalmente',
        'Me gusta escuchar cómo usar las pinzas mientras practico',
        'Entiendo mejor el punzado cuando me explican el ritmo y técnica',
        'Me ayuda escuchar instrucciones mientras modelo con plastilina',
        'Prefiero discutir las actividades antes de realizarlas',
        'Me gusta repetir en voz alta lo que debo hacer',
        'Aprendo mejor en ambientes donde puedo hacer preguntas',
        'Recuerdo mejor cuando escucho música o sonidos relacionados',
        'Me concentro mejor cuando hay explicaciones verbales claras'
      ],
      // Kinestésico (14 questions)
      [
        'Necesito practicar físicamente para aprender nuevas habilidades',
        'Me gusta experimentar y hacer las cosas yo mismo',
        'Aprendo mejor a enhebrar practicando directamente',
        'Me gusta tocar y manipular los colores y formas',
        'Aprendo mejor a recortar practicando con diferentes materiales',
        'Necesito doblar el papel yo mismo para entender la técnica',
        'Aprendo mejor usando las pinzas repetidamente',
        'Necesito practicar el punzado para desarrollar la técnica',
        'Aprendo mejor modelando con plastilina directamente',
        'Me gusta moverme mientras aprendo',
        'Prefiero actividades donde puedo usar todo mi cuerpo',
        'Aprendo mejor cuando puedo experimentar físicamente',
        'Me concentro mejor cuando estoy activo',
        'Necesito manipular objetos para entender conceptos'
      ],
      // Lógico-Matemático (14 questions)
      [
        'Me gusta entender la razón y lógica detrás de cada actividad',
        'Analizo los patrones y secuencias en los trazos',
        'Me gusta entender la secuencia lógica del enhebrado',
        'Prefiero clasificar y organizar colores según criterios específicos',
        'Me gusta seguir pasos ordenados al recortar',
        'Analizo la geometría y simetría al doblar papel',
        'Me gusta entender la mecánica de cómo funcionan las pinzas',
        'Prefiero seguir patrones matemáticos en el punzado',
        'Me gusta planificar las formas antes de modelar con plastilina',
        'Necesito entender el "por qué" antes de hacer algo',
        'Me gusta resolver problemas de manera sistemática',
        'Prefiero actividades que requieren razonamiento',
        'Me concentro mejor cuando veo relaciones causa-efecto',
        'Me gusta organizar mi trabajo en pasos lógicos'
      ],
      // Social (14 questions)
      [
        'Aprendo mejor trabajando en grupo',
        'Me gusta practicar trazos junto con otros compañeros',
        'Prefiero aprender a enhebrar observando a mis compañeros',
        'Me gusta compartir y comparar colores con otros',
        'Aprendo mejor a recortar cuando trabajo con otros',
        'Me gusta doblar papel en actividades grupales',
        'Prefiero usar pinzas en juegos con compañeros',
        'Me gusta hacer punzado en proyectos grupales',
        'Disfruto modelar con plastilina junto a otros niños',
        'Me motivo más cuando trabajo con otros',
        'Me gusta compartir mis ideas y escuchar las de otros',
        'Aprendo mejor en ambientes colaborativos',
        'Prefiero actividades donde puedo ayudar a otros',
        'Me concentro mejor cuando hay interacción social'
      ],
      // Individual (14 questions)
      [
        'Prefiero trabajar solo en mis actividades',
        'Me concentro mejor practicando trazos en silencio',
        'Aprendo mejor a enhebrar cuando trabajo solo',
        'Prefiero explorar colores de forma independiente',
        'Me gusta recortar a mi propio ritmo sin distracciones',
        'Prefiero doblar papel en un espacio tranquilo',
        'Me concentro mejor usando pinzas cuando estoy solo',
        'Aprendo mejor el punzado trabajando individualmente',
        'Prefiero modelar con plastilina en mi propio espacio',
        'Necesito tiempo a solas para procesar lo aprendido',
        'Me gusta reflexionar sobre mi trabajo de forma independiente',
        'Aprendo mejor cuando puedo establecer mi propio ritmo',
        'Prefiero ambientes tranquilos para concentrarme',
        'Me siento más cómodo trabajando de manera autónoma'
      ]
    ]

    for (let i = 0; i < tamDimensions.length; i++) {
      const { data: dimension } = await supabaseClient
        .from('questionnaire_dimensions')
        .insert({
          questionnaire_id: tam.id,
          ...tamDimensions[i],
          order_index: i
        })
        .select()
        .single()

      const questions = tamQuestionsTemplate[i]
      for (let j = 0; j < questions.length; j++) {
        await supabaseClient
          .from('questionnaire_questions')
          .insert({
            questionnaire_id: tam.id,
            dimension_id: dimension.id,
            question_number: (i * 14) + j + 1, // 14 questions per dimension
            question_text: questions[j],
            score_weight: 1.0,
            is_reverse_scored: false
          })
      }
    }
    
    created.push({ name: 'TAM', questions: 84 })
  }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: created.length > 0 
          ? `Cuestionarios creados: ${created.map(c => c.name).join(', ')}`
          : 'Todos los cuestionarios ya están inicializados',
        created: created,
        skipped: existingTypes
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
