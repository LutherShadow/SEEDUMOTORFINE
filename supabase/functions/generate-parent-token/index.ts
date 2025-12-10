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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { childId, questionnaireId, expiresInDays, parentName, parentEmail } = await req.json();

    if (!childId || !questionnaireId) {
      return new Response(
        JSON.stringify({ error: 'childId and questionnaireId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate short verification code (6 characters: letters and numbers)
    const generateCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    
    let token = generateCode();
    
    // Ensure token is unique
    let attempts = 0;
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    while (attempts < 10) {
      const { data: existing } = await serviceClient
        .from('parent_access_tokens')
        .select('id')
        .eq('token', token)
        .single();
      
      if (!existing) break;
      token = generateCode();
      attempts++;
    }
    
    if (attempts >= 10) {
      return new Response(
        JSON.stringify({ error: 'Could not generate unique code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Calculate expiration date (default 30 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 30));

    // Insert token into database
    const { data, error } = await supabaseClient
      .from('parent_access_tokens')
      .insert({
        child_id: childId,
        questionnaire_id: questionnaireId,
        token,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
        parent_name: parentName || null,
        parent_email: parentEmail || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating token:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ token: data.token, expiresAt: data.expires_at }),
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
