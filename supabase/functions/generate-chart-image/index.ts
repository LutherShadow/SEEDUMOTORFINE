import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const prompt = body.prompt;
    const chartData = body.chartData || body.data; // Handle both names safely

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
        return handleOpenRouter(prompt, legacyKey, ["google/gemini-2.0-flash-exp:free"]);
      }
      return new Response(JSON.stringify({ error: 'AI Configuration missing.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Try Gemini first (Tier 1 for Charts)
    const geminiConfig = configs.find(c => c.provider === 'gemini');
    if (geminiConfig) {
      try {
        console.log(`Attempting Gemini (Tier 1) with model: ${geminiConfig.model || 'default'}...`);
        const resp = await handleGemini(prompt, geminiConfig.api_key, geminiConfig.model);
        if (resp.status === 200) return resp;
        console.warn("Gemini Tier 1 failed, trying fallback...");
      } catch (err) {
        console.error("Gemini Tier 1 error:", err);
      }
    }

    // Try OpenRouter (Tier 2 / Backup)
    const orConfig = configs.find(c => c.provider === 'openrouter');
    if (orConfig) {
      console.log("Attempting OpenRouter (Tier 2)...");
      let modelsToTry = orConfig.models || [];
      if (orConfig.model) modelsToTry = [orConfig.model, ...modelsToTry];
      const fallbacks = ["google/gemini-2.0-flash-exp:free", "google/gemma-3-27b-it:free"];
      modelsToTry = [...new Set([...modelsToTry, ...fallbacks])];

      return handleOpenRouter(prompt, orConfig.api_key, modelsToTry);
    }

    // Try OpenAI (Tier 3)
    const openaiConfig = configs.find(c => c.provider === 'openai');
    if (openaiConfig) {
      return handleOpenAI(prompt, openaiConfig.api_key);
    }

    return new Response(JSON.stringify({ error: 'No working AI provider found for charts.' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error en generate-chart-image:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Error desconocido'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleOpenRouter(prompt: string, apiKey: string, models: string[]) {
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
      const textContent = data.choices?.[0]?.message?.content || '';

      console.log(`Chart context generated with OpenRouter model: ${m}`);
      return new Response(JSON.stringify({
        image: null, // Unified name
        imageBase64: null,
        textContext: textContent,
        mimeType: 'text/plain',
        provider: 'openrouter',
        model: m
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      console.error(`Network or Parsing error (${m}):`, err);
      lastError = err.message;
    }
  }

  return new Response(JSON.stringify({
    error: "All OpenRouter models failed or were rate-limited.",
    details: lastError
  }), {
    status: 502,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleOpenAI(prompt: string, apiKey: string) {
  try {
    console.log('Generating with OpenAI DALL-E 3...');

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const imageBase64 = data.data?.[0]?.b64_json;

    if (!imageBase64) {
      throw new Error('No image data in OpenAI response');
    }

    console.log('Chart image generated with OpenAI DALL-E');
    return new Response(JSON.stringify({
      image: imageBase64, // Unified name
      imageBase64,
      mimeType: 'image/png',
      provider: 'openai'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('OpenAI image generation failed:', err.message);
    return new Response(JSON.stringify({
      error: err.message,
      provider: 'openai'
    }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleGemini(prompt: string, apiKey: string, preferredModel?: string) {
  const cleanKey = apiKey.trim();
  const geminiModels = [...new Set([preferredModel, "gemini-3-flash-preview", "gemini-2.0-flash", "gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-1.5-pro"])].filter(Boolean);
  let lastError = null;

  for (const gm of geminiModels) {
    for (const version of ["v1", "v1beta"]) {
      try {
        console.log(`Trying Gemini model for chart: ${gm} (${version})`);
        const url = `https://generativelanguage.googleapis.com/${version}/models/${gm}:generateContent?key=${cleanKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              topK: 32,
              topP: 1,
              maxOutputTokens: 4096,
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`Gemini API error (${gm} ${version}): ${response.status}`, errorText);
          lastError = `Status ${response.status}: ${errorText}`;
          continue;
        }
        const data = await response.json();

        if (data.error) {
          console.warn(`Gemini API error body (${gm} ${version}):`, data.error);
          lastError = data.error.message || JSON.stringify(data.error);
          continue;
        }

        const candidate = data.candidates?.[0];
        if (!candidate) {
          console.warn(`Gemini API returned no candidates (${gm} ${version}). Check safety filters.`);
          lastError = "No candidates returned (likely safety filter)";
          continue;
        }

        const part = candidate.content?.parts?.[0];
        const inlineData = part?.inlineData;
        if (inlineData?.data) {
          console.log(`Chart image generated with Gemini ${gm} (${version})`);
          return new Response(JSON.stringify({
            image: inlineData.data,
            imageBase64: inlineData.data,
            mimeType: inlineData.mimeType || 'image/png',
            provider: 'gemini',
            model: gm
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Fallback to text context if no image
        const textContent = part?.text || '';
        if (textContent) {
          console.log(`Chart context generated with Gemini ${gm} (${version}) (text fallback)`);
          return new Response(JSON.stringify({
            image: null,
            imageBase64: null,
            textContext: textContent,
            mimeType: 'text/plain',
            provider: 'gemini',
            model: gm
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (err: any) {
        console.error(`Gemini chart call failed (${gm} ${version}):`, err);
        lastError = err.message;
      }
    }
  }

  return new Response(JSON.stringify({
    error: `Gemini failed after trying multiple models. Last error: ${lastError}`,
    provider: 'gemini'
  }), {
    status: 502,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
