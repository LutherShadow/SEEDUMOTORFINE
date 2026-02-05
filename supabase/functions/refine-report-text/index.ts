import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { text, sectionTitle, reportType } = body;

        if (!text) {
            return new Response(JSON.stringify({ error: 'El campo "text" es requerido.' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Initialize Supabase Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Fetch ALL Active AI Settings
        const { data: configs, error: configError } = await supabase
            .from('ai_settings')
            .select('*')
            .eq('is_active', true);

        if (configError || !configs || configs.length === 0) {
            console.error('Error fetching AI settings:', configError);
            const legacyKey = Deno.env.get('OPENROUTER_API_KEY');
            if (legacyKey) {
                return handleOpenRouter(text, sectionTitle, reportType, legacyKey, ["google/gemma-3-27b-it:free"]);
            }
            return new Response(JSON.stringify({ error: 'AI Configuration missing.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Try Gemini first (Tier 1 for Reports)
        const geminiConfig = configs.find(c => c.provider === 'gemini');
        if (geminiConfig) {
            try {
                console.log("Attempting Gemini (Tier 1)...");
                const resp = await handleGemini(text, sectionTitle, reportType, geminiConfig.api_key, geminiConfig.model || "gemini-1.5-flash");
                if (resp.ok) return resp;
                console.warn("Gemini failed, checking fallbacks...");
            } catch (e) {
                console.warn("Gemini execution error:", e.message);
            }
        }

        // Try OpenRouter (Tier 2 / Backup)
        const orConfig = configs.find(c => c.provider === 'openrouter');
        if (orConfig) {
            console.log("Attempting OpenRouter (Tier 2)...");
            let modelsToTry = orConfig.models || [];
            if (orConfig.model) modelsToTry = [orConfig.model, ...modelsToTry];
            const fallbacks = ["google/gemma-3-27b-it:free", "google/gemini-2.0-flash-lite-preview-02-05:free"];
            modelsToTry = [...new Set([...modelsToTry, ...fallbacks])];

            return handleOpenRouter(text, sectionTitle, reportType, orConfig.api_key, modelsToTry);
        }

        // Try OpenAI (Tier 3)
        const openaiConfig = configs.find(c => c.provider === 'openai');
        if (openaiConfig) {
            return handleOpenAI(text, sectionTitle, reportType, openaiConfig.api_key, openaiConfig.model || "gpt-4o-mini");
        }

        return new Response(JSON.stringify({ error: 'No working AI provider found.' }), {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Fatal edge function error:', error.message);
        return new Response(JSON.stringify({
            error: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});

async function handleOpenRouter(text: string, sectionTitle: string, reportType: string, apiKey: string, models: string[]) {
    const prompt = createPrompt(text, sectionTitle, reportType);

    // Filter duplicates and empty strings
    const uniqueModels = [...new Set(models)].filter(Boolean);

    let lastError = null;

    for (const m of uniqueModels) {
        try {
            console.log(`Trying OpenRouter model: ${m}`);
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://seedumotor.com",
                    "X-Title": "SEEDUMOTOR"
                },
                body: JSON.stringify({
                    "model": m,
                    "messages": [{ "role": "user", "content": prompt }]
                })
            });

            if (response.status === 429) {
                console.warn(`OpenRouter 429 (Rate Limit) for ${m}. Trying next model...`);
                lastError = "Rate limit (429)";
                continue;
            }

            if (!response.ok) {
                const err = await response.text();
                console.error(`OpenRouter error (${m}):`, response.status, err);
                lastError = `Status ${response.status}: ${err}`;
                continue;
            }

            const data = await response.json();
            let refinedText = data.choices?.[0]?.message?.content || text;

            // Limpieza básica de caracteres especiales y formato
            refinedText = refinedText.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, ""); // Control chars
            refinedText = refinedText.trim();

            return new Response(JSON.stringify({ refinedText }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        } catch (err: any) {
            console.error(`Network or Parsing error (${m}):`, err);
            lastError = err.message;
        }
    }

    return new Response(JSON.stringify({
        error: "All OpenRouter models failed or were rate-limited.",
        details: lastError,
        originalText: text
    }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function handleOpenAI(text: string, sectionTitle: string, reportType: string, apiKey: string, model: string) {
    const prompt = createPrompt(text, sectionTitle, reportType);
    try {
        console.log(`Using OpenAI model: ${model}`);
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": model,
                "messages": [{ "role": "user", "content": prompt }]
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`OpenAI Error: ${err}`);
        }

        const data = await response.json();
        const refinedText = data.choices[0]?.message?.content || text;
        return new Response(JSON.stringify({ refinedText }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

async function handleGemini(text: string, sectionTitle: string, reportType: string, apiKey: string, model: string) {
    const prompt = createPrompt(text, sectionTitle, reportType);
    const cleanKey = apiKey.trim();
    // Putting priority model first
    const modelsToTry = [...new Set([model, "gemini-3-flash-preview", "gemini-2.0-flash-exp", "gemini-1.5-flash"])].filter(Boolean);
    let lastError = null;

    for (const m of modelsToTry) {
        // Try v1 and v1beta
        for (const version of ["v1", "v1beta"]) {
            try {
                console.log(`Trying Gemini model: ${m} (Version: ${version})`);
                const url = `https://generativelanguage.googleapis.com/${version}/models/${m}:generateContent?key=${cleanKey}`;

                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });

                if (response.status === 429) {
                    console.warn(`Gemini 429 (Rate Limit) for ${m}. Trying next model...`);
                    lastError = "Rate limit (429)";
                    continue;
                }

                if (!response.ok) {
                    const errTxt = await response.text();
                    console.warn(`Gemini error (${m} ${version}): ${response.status} ${errTxt}`);
                    lastError = `Status ${response.status}: ${errTxt}`;
                    continue;
                }

                const data = await response.json();
                const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (responseText) {
                    return new Response(JSON.stringify({ refinedText: responseText }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    });
                }
            } catch (err: any) {
                console.error(`Gemini call failed (${m} ${version}):`, err);
                lastError = err.message;
            }
        }
    }

    return new Response(JSON.stringify({ error: `Gemini failed after trying multiple models. Last error: ${lastError}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

function createPrompt(text: string, sectionTitle: string, reportType: string) {
    if (reportType === 'prediccion_avanzada') {
        return `Eres un estratega senior en neurodesarrollo motor y consultor pedagógico. 
        Analiza el siguiente CONTEXTO DE PROGRESO para generar un REPORTE ESTRATÉGICO INTEGRAL dirigido a un docente o terapeuta.
        
        INDICADORES Y MÉTRICAS RECIBIDAS:
        ${text}
        
        TU OBJETIVO ES GENERAR UN TEXTO CLAVE QUE INCLUYA:
        1. ANÁLISIS DE RIESGOS: Por qué los factores detectados podrían frenar el desarrollo.
        2. POTENCIAL DE OPORTUNIDADES: Cómo aprovechar fortalezas para compensar debilidades.
        3. INTEGRACIÓN DE IA: Impacto de actividades personalizadas en las próximas semanas.
        4. RECOMENDACIÓN PEDAGÓGICA: Acciones específicas con lenguaje profesional.
        
        REGLAS DE FORMATO CRUCIALES:
        - Divide la respuesta en 3 bloques de párrafos bien diferenciados.
        - Usa exactamente DOS SALTOS DE LÍNEA entre párrafos para que se vea limpio en la App.
        - Usa negritas solo para los títulos de cada bloque (ej: **ANÁLISIS DE PROGRESO Y RIESGOS**).
        - El lenguaje debe ser específico (coordinación bimanual, control visomotor).
        - Extensión: 200-300 palabras.
        
        RESPONDE SOLO CON EL CUERPO DEL REPORTE EN ESPAÑOL. SIN SALUDOS NI COMENTARIOS ADICIONALES.`;
    }

    return `Eres un experto en desarrollo infantil y motricidad fina. 
    Optimiza el siguiente texto para la sección "${sectionTitle || 'General'}" de un reporte de tipo "${reportType || 'reporte'}".
    El texto debe ser profesional, empático y constructivo. Mantén el significado original pero mejora la redacción.
    
    TEXTO ORIGINAL:
    "${text}"
    
    RESPONDE SOLO CON EL TEXTO OPTIMIZADO EN ESPAÑOL. SIN COMENTARIOS ADICIONALES.`;
}
