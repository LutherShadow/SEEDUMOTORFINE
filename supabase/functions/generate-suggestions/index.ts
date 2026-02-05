import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configurations (URL/Key)');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { evaluations, childName, childId, existingActivities } = body;

    console.log(`Generating creative suggestions for ${childName} (ID: ${childId})`);

    // 1. Fetch ALL Active AI Configurations
    const { data: configs } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('is_active', true);

    if (!configs || configs.length === 0) {
      console.error('AI Configuration missing.');
      const legacyKey = Deno.env.get('OPENROUTER_API_KEY');
      if (!legacyKey) throw new Error('No AI provider found.');
      // Fallback logic for legacy handled inside providers loop if needed
    }

    // 2. Fetch RAG Context (Trained Model)
    const { data: trainedModel } = await supabase
      .from('ai_training_models')
      .select('model_context, accuracy')
      .order('trained_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const ragContext = trainedModel?.model_context || "Enfoque en desarrollo motriz general.";

    // 3. Prepare ADVANCED Prompt
    const previousActivities = (existingActivities || []).join(', ');

    const systemPrompt = `Actúa como un equipo multidisciplinario de expertos en desarrollo infantil, terapia ocupacional y pedagogía.
        CONTEXTO CLÍNICO (RAG): "${ragContext}"
        OBJETIVO: Diseñar intervenciones motrices ALTAMENTE PERSONALIZADAS e INNOVADORAS para ${childName}.
        REGLAS: 1. NO REPETIR: [${previousActivities}]. 2. BÚSQUEDA DE NOVEDAD. 3. JUSTIFICACIÓN CLÍNICA. 4. JSON PURO.
        FORMATO JSON: { "personalizedActivities": [ { "activityName": "...", "activityType": "...", "description": "...", "difficultyLevel": "...", "targetSkills": [...], "materialsNeeded": [...], "durationMinutes": 15, "repetitionsRecommended": 3, "successCriteria": "...", "progressionNotes": "...", "aiConfidence": 0.95 } ] }`;

    const recentEvals = (evaluations && Array.isArray(evaluations)) ? evaluations.slice(-2) : [];
    const userPrompt = `Perfil del niño: ${childName}. Evaluaciones recientes (JSON): ${JSON.stringify(recentEvals)}. Genera 3 actividades DISRUPTIVAS e INNOVADORAS.`;

    // 4. Call AI with Tiered Logic
    let jsonResponse = null;
    let lastError = null;

    // --- Tier 1: OpenRouter (Primary for volume/diversity) ---
    const orConfig = configs?.find(c => c.provider === 'openrouter');
    if (orConfig || Deno.env.get('OPENROUTER_API_KEY')) {
      try {
        console.log("Attempting OpenRouter (Tier 1)...");
        const apiKey = orConfig?.api_key || Deno.env.get('OPENROUTER_API_KEY');
        let models = orConfig?.models || [];
        if (orConfig?.model) models = [orConfig.model, ...models];
        const fallbacks = ["google/gemma-3-27b-it:free", "google/gemini-2.0-flash-lite-preview-02-05:free"];
        models = [...new Set([...models, ...fallbacks])];

        for (const m of models) {
          try {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://seedumotor.com", "X-Title": "SEEDUMOTOR" },
              body: JSON.stringify({ model: m, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] })
            });
            if (res.ok) {
              const data = await res.json();
              const responseText = data.choices[0]?.message?.content;
              jsonResponse = parseJsonFromText(responseText);
              if (jsonResponse) break;
            }
          } catch (e) { console.warn(`OR model ${m} failed:`, e.message); }
        }
        if (jsonResponse) return successResponse(jsonResponse);
      } catch (e) { console.warn("OpenRouter Tier failed:", e.message); }
    }

    // --- Tier 2: Gemini (Backup) ---
    const geminiConfig = configs?.find(c => c.provider === 'gemini');
    if (geminiConfig) {
      try {
        console.log("Attempting Gemini (Tier 2)...");
        const models = ["gemini-1.5-flash", "gemini-2.0-flash-exp"];
        for (const m of models) {
          for (const version of ["v1", "v1beta"]) {
            try {
              const url = `https://generativelanguage.googleapis.com/${version}/models/${m}:generateContent?key=${geminiConfig.api_key.trim()}`;
              const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }] })
              });
              if (res.ok) {
                const data = await res.json();
                const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                jsonResponse = parseJsonFromText(responseText);
                if (jsonResponse) break;
              }
            } catch (e) { }
          }
          if (jsonResponse) break;
        }
        if (jsonResponse) return successResponse(jsonResponse);
      } catch (e) { console.warn("Gemini Tier failed:", e.message); }
    }

    // --- Tier 3: OpenAI ---
    const openaiConfig = configs?.find(c => c.provider === 'openai');
    if (openaiConfig) {
      try {
        console.log("Attempting OpenAI (Tier 3)...");
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${openaiConfig.api_key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: openaiConfig.model || "gpt-4o-mini",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }]
          })
        });
        if (res.ok) {
          const data = await res.json();
          jsonResponse = parseJsonFromText(data.choices[0]?.message?.content);
        }
        if (jsonResponse) return successResponse(jsonResponse);
      } catch (e) { }
    }

    function parseJsonFromText(responseText: string) {
      if (!responseText) return null;
      const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        try { return JSON.parse(cleanText.substring(firstBrace, lastBrace + 1)); } catch (e) { return null; }
      }
      return null;
    }

    function successResponse(data: any) {
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // If AI failed completely
    if (!jsonResponse) {
      throw new Error(`No se pudo generar contenido. Detalle: ${lastError?.message || 'Rate limits or API errors'}`);
    }

    // 5. Clean up and return - Auto-save removed as per user request

    return new Response(JSON.stringify(jsonResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[FATAL ERROR]:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, // Return 500 so frontend catches it
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
