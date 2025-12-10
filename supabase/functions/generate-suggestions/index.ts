import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const body = await req.json();
    const { evaluations, childName, childId } = body;

    if (!childId || !childName) {
      throw new Error('Missing childId or childName');
    }

    // Simplified prompt - NO database queries before Gemini
    const systemPrompt = `You are a pediatric development expert. Generate JSON suggestions.

Required JSON format (NO MARKDOWN):
{
    "competencyIndex": { "overall": 50, "level": "medio", "visualMotor": 50, "precision": 50, "coordination": 50, "strength": 50, "learningVelocity": 50, "trend": "estable" },
    "suggestions": [ { "activity": "Name", "type": "Type", "description": "Desc", "benefits": ["B1"], "expectedProgress": "Progress" } ],
    "personalizedActivities": [ { "activityName": "Name", "activityType": "Fine/Gross Motor", "description": "Instructions", "difficultyLevel": "medio", "targetSkills": ["Skill"], "materialsNeeded": ["Material"], "durationMinutes": 15, "repetitionsRecommended": 3, "successCriteria": "Criteria", "progressionNotes": "Notes", "replacesActivityId": null, "aiConfidence": 0.9 } ],
    "overallRecommendation": "Summary",
    "developmentLevel": "medio"
}`;

    const recentEvals = (evaluations && Array.isArray(evaluations)) ? evaluations.slice(-3) : [];
    const userPrompt = `Analyze ${childName}. Recent evaluations: ${JSON.stringify(recentEvals)}. Generate 3 suggestions and 3 personalized activities.`;

    // Call Gemini
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`Gemini Error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("Empty AI response");
    }

    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const suggestions = JSON.parse(cleanText);

    // Save to DB
    if (evaluations && evaluations.length > 0) {
      const latestEval = evaluations[evaluations.length - 1];

      if (suggestions.competencyIndex) {
        await supabase.from('competency_indices').insert({
          child_id: childId,
          evaluation_id: latestEval.id,
          overall_index: suggestions.competencyIndex.overall || 0,
          visual_motor_index: suggestions.competencyIndex.visualMotor || 0,
          precision_index: suggestions.competencyIndex.precision || 0,
          coordination_index: suggestions.competencyIndex.coordination || 0,
          strength_index: suggestions.competencyIndex.strength || 0,
          learning_velocity: suggestions.competencyIndex.learningVelocity || 0,
          trend: suggestions.competencyIndex.trend || 'stable',
          notes: `Gemini`
        }).then(() => console.log('Competency saved')).catch(() => { });
      }

      if (suggestions.personalizedActivities && Array.isArray(suggestions.personalizedActivities)) {
        const acts = suggestions.personalizedActivities.map((a: any) => ({
          child_id: childId,
          activity_name: a.activityName || 'Activity',
          activity_type: a.activityType || 'General',
          description: a.description || '',
          difficulty_level: a.difficultyLevel || 'medio',
          target_skills: a.targetSkills || [],
          materials_needed: a.materialsNeeded || [],
          duration_minutes: a.durationMinutes || 15,
          repetitions_recommended: a.repetitionsRecommended || 3,
          success_criteria: a.successCriteria || '',
          progression_notes: a.progressionNotes || '',
          ai_confidence: a.aiConfidence || 0.9,
          is_active: true
        }));
        if (acts.length > 0) {
          await supabase.from('personalized_activities').insert(acts).then(() => console.log('Activities saved')).catch(() => { });
        }
      }

      await supabase.from('ai_results').insert({
        evaluation_id: latestEval.id,
        recommendations: suggestions.overallRecommendation || "Suggestions",
        confidence_score: 0.95,
        classification: suggestions.developmentLevel || 'medio'
      }).then(() => console.log('Results saved')).catch(() => { });
    }

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[FATAL]:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
