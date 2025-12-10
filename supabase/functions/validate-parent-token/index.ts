import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch token with related data
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('parent_access_tokens')
      .select(`
        *,
        child:children(*),
        questionnaire:questionnaires(*)
      `)
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: 'Token has expired' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token has already been used
    if (tokenData.used_at) {
      return new Response(
        JSON.stringify({ error: 'Token has already been used' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch questionnaire questions and dimensions
    const [questionsData, dimensionsData] = await Promise.all([
      supabaseClient
        .from('questionnaire_questions')
        .select('*')
        .eq('questionnaire_id', tokenData.questionnaire_id)
        .order('question_number'),
      supabaseClient
        .from('questionnaire_dimensions')
        .select('*')
        .eq('questionnaire_id', tokenData.questionnaire_id)
        .order('order_index')
    ]);

    if (questionsData.error) throw questionsData.error;
    if (dimensionsData.error) throw dimensionsData.error;

    return new Response(
      JSON.stringify({
        valid: true,
        child: tokenData.child,
        questionnaire: tokenData.questionnaire,
        questions: questionsData.data || [],
        dimensions: dimensionsData.data || [],
        tokenId: tokenData.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
