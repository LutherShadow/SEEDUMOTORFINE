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

    const { token, responses, dimensionScores, dominantDimension, secondaryDimension, notes } = await req.json();

    if (!token || !responses) {
      return new Response(
        JSON.stringify({ error: 'Token and responses are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate token first
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('parent_access_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: 'Token has expired' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already used
    if (tokenData.used_at) {
      return new Response(
        JSON.stringify({ error: 'Token has already been used' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert questionnaire response
    const { data: responseData, error: responseError } = await supabaseClient
      .from('questionnaire_responses')
      .insert({
        questionnaire_id: tokenData.questionnaire_id,
        child_id: tokenData.child_id,
        evaluator_id: tokenData.created_by,
        responses,
        dimension_scores: dimensionScores || null,
        dominant_dimension: dominantDimension || null,
        secondary_dimension: secondaryDimension || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (responseError) {
      console.error('Error creating response:', responseError);
      return new Response(
        JSON.stringify({ error: 'Failed to save response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark token as used
    const { error: updateError } = await supabaseClient
      .from('parent_access_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    if (updateError) {
      console.error('Error updating token:', updateError);
    }

    return new Response(
      JSON.stringify({ success: true, responseId: responseData.id }),
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
