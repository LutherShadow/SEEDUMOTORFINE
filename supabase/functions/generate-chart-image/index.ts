import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to generate with OpenAI
async function tryOpenAI(imagePrompt: string, OPENAI_API_KEY: string) {
  console.log('Generando imagen con OpenAI gpt-image-1...');
  
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: imagePrompt,
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

  console.log('Imagen generada con OpenAI');
  return {
    imageBase64,
    mimeType: 'image/png'
  };
}

// Helper function to try generating with Gemini API directly as fallback
async function tryGeminiDirect(imagePrompt: string, GOOGLE_API_KEY: string) {
  console.log('Intentando con Google Gemini API directa...');
  
  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: imagePrompt
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      })
    }
  );

  if (!geminiResponse.ok) {
    throw new Error(`Gemini API error: ${geminiResponse.status}`);
  }

  const geminiData = await geminiResponse.json();
  
  // Extract image from Gemini response
  const inlineData = geminiData.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  
  if (inlineData?.data) {
    console.log('Imagen generada con Gemini API directa');
    return {
      imageBase64: inlineData.data,
      mimeType: inlineData.mimeType || 'image/png'
    };
  }
  
  throw new Error('No se pudo extraer imagen de Gemini API');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, chartData } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');

    // Construir prompt claro y directo para generar la imagen
    const imagePrompt = `Create a professional chart image with these specifications:
${prompt}

Chart data: ${JSON.stringify(chartData)}

Requirements:
- Professional and clean design
- White background
- Clear readable labels
- Modern minimal style
- High quality output

Generate ONLY the chart image, no text explanation needed.`;

    let result = null;
    let lastError = null;

    // Try OpenAI first
    if (OPENAI_API_KEY) {
      try {
        result = await tryOpenAI(imagePrompt, OPENAI_API_KEY);
      } catch (error) {
        console.error('OpenAI falló:', error);
        lastError = error;
      }
    }

    // If OpenAI failed and we have Google API key, try Gemini directly
    if (!result && GOOGLE_API_KEY) {
      try {
        result = await tryGeminiDirect(imagePrompt, GOOGLE_API_KEY);
      } catch (error) {
        console.error('Gemini API directa falló:', error);
        lastError = error;
      }
    }

    // If both failed, return error
    if (!result) {
      console.error('Ambas APIs fallaron');
      return new Response(
        JSON.stringify({ 
          error: 'No se pudo generar la imagen con ninguna API disponible',
          details: lastError instanceof Error ? lastError.message : 'Error desconocido'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Success! Return the image
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
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
