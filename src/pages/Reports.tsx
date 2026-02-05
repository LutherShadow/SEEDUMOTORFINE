import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Plus, RefreshCw, Trash2, CheckCircle, Loader2, ArrowLeft, ChevronDown, Download, Sparkles, BrainCircuit, TrendingUp, Lightbulb } from "lucide-react";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { ProgressTracker } from "@/components/reports/ProgressTracker";
import { IntervalComparison } from "@/components/reports/IntervalComparison";
import { ProgressPrediction } from "@/components/reports/ProgressPrediction";
import { PersonalizedActivities } from "@/components/reports/PersonalizedActivities";
import { CompetencyIndex } from "@/components/reports/CompetencyIndex";
import { useTutorial } from "@/components/tutorial/TutorialProvider";
import { reportsTutorial } from "@/components/tutorial/tutorials";
import { TutorialButton } from "@/components/tutorial/TutorialButton";
import { generateLocalPredictions, generateLocalSuggestions } from "@/lib/localAIEngine";
import { motion, Variants } from "framer-motion";

interface Child {
  id: string;
  name: string;
}

interface Evaluation {
  id: string;
  evaluation_date: string;
  test_1_score: number | null;
  test_2_score: number | null;
  test_3_score: number | null;
  test_4_score: number | null;
  test_5_score: number | null;
  test_6_score: number | null;
  test_7_score: number | null;
  test_8_score: number | null;
  observations: string | null;
}

interface Suggestion {
  activity: string;
  type: string;
  description: string;
  benefits: string[];
  expectedProgress: string;
  concreteActivities?: { name: string; duration: string; materials: string[]; steps: string[] }[];
}

interface AISuggestions {
  suggestions: Suggestion[];
  overallRecommendation: string;
  weeklyPlan?: { day: string; activity: string; duration: string }[];
}

const MotionDiv = motion.div;

const STANDARD_ACTIVITY_NAMES = [
  "Juego de Pesca",
  "Pesca con imán",
  "Ensartado",
  "Enroscar botellas",
  "Laberintos con crayón",
  "Laberintos con dáctilo pintura",
  "Juego de lanzamiento con muñecas",
  "Juego del candado"
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};


const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const ACTIVITIES = [
  "Juego de Pesca",
  "Pesca con imán",
  "Ensartado",
  "Enroscar botellas",
  "Laberintos con crayón",
  "Laberintos con dáctilo pintura",
  "Juego de lanzamiento con muñecas",
  "Juego del candado"
];

const Reports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startTutorial } = useTutorial();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [progressPredictions, setProgressPredictions] = useState<any>(null);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [personalizedActivities, setPersonalizedActivities] = useState<any[]>([]);
  const [competencyIndex, setCompetencyIndex] = useState<any>(null);
  const [missingQuestionnaires, setMissingQuestionnaires] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [schools, setSchools] = useState<string[]>([]);
  const [schoolFilter, setSchoolFilter] = useState<string>("all");
  const [isRefiningSummary, setIsRefiningSummary] = useState(false);
  const [isRefiningPrediction, setIsRefiningPrediction] = useState(false);
  const [useAICharts, setUseAICharts] = useState(false);

  useEffect(() => {
    const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
    if (!completedTutorials.includes('/reports') && user) {
      startTutorial(reportsTutorial);
    }
  }, [user, startTutorial]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      checkAdminRole();
      fetchSchools();
      fetchChildren();
      fetchReportSettings();
    }
  }, [user]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchChildren();
    }
  }, [schoolFilter]);

  useEffect(() => {
    if (selectedChild) {
      fetchEvaluations();
      fetchPersonalizedActivities();
      fetchCompetencyIndex();
    }
  }, [selectedChild]);

  const checkAdminRole = async () => {
    if (!user) return;

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    setIsAdmin(!!roleData);
  };

  const fetchReportSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('report_settings')
        .select('use_gemini_charts')
        .single();

      if (!error && data) {
        setUseAICharts(data.use_gemini_charts ?? false);
      }
    } catch (err) {
      console.error('Error fetching report settings:', err);
    }
  };

  const generateChartWithAI = async (prompt: string, chartData: any): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-chart-image', {
        body: { prompt, chartData }
      });

      if (error) {
        console.error('Error generating chart with AI:', error);
        return null;
      }

      if (data?.imageBase64) {
        return `data:${data.mimeType || 'image/png'};base64,${data.imageBase64}`;
      }

      return null;
    } catch (error) {
      console.error('Error calling AI chart API:', error);
      return null;
    }
  };

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from("children")
        .select("school")
        .not("school", "is", null);

      if (error) throw error;

      const uniqueSchools = Array.from(new Set(data?.map(item => item.school).filter(Boolean))) as string[];
      setSchools(uniqueSchools.sort());
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const fetchChildren = async () => {
    try {
      let query = supabase
        .from("children")
        .select("id, name");

      // Filter by school if admin has selected a specific school
      if (isAdmin && schoolFilter && schoolFilter !== 'all') {
        query = query.eq('school', schoolFilter);
      }

      const { data, error } = await query.order("name");

      if (error) throw error;
      setChildren(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los aprendientes",
        variant: "destructive"
      });
    }
  };

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("evaluations")
        .select("*")
        .eq("child_id", selectedChild)
        .order("evaluation_date");

      if (error) throw error;
      setEvaluations(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las evaluaciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalizedActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("personalized_activities")
        .select("*")
        .eq("child_id", selectedChild)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPersonalizedActivities(data || []);
    } catch (error: any) {
      console.error('Error fetching personalized activities:', error);
    }
  };

  const fetchCompetencyIndex = async () => {
    try {
      const { data, error } = await supabase
        .from("competency_indices")
        .select("*")
        .eq("child_id", selectedChild)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setCompetencyIndex({
          overall: data.overall_index,
          visualMotor: data.visual_motor_index,
          precision: data.precision_index,
          coordination: data.coordination_index,
          strength: data.strength_index,
          learningVelocity: data.learning_velocity,
          trend: data.trend,
          level: data.overall_index >= 80 ? 'experto' : data.overall_index >= 60 ? 'alto' : data.overall_index >= 40 ? 'medio' : 'bajo'
        });
      }
    } catch (error: any) {
      console.error('Error fetching competency index:', error);
    }
  };

  const calculateStats = () => {
    if (evaluations.length === 0) return null;

    const stats = ACTIVITIES.map((activity, index) => {
      const scores = evaluations
        .map(e => e[`test_${index + 1}_score` as keyof Evaluation] as number | null)
        .filter(s => s !== null) as number[];

      if (scores.length === 0) return { activity, avg: 0, min: 0, max: 0, count: 0 };

      return {
        activity,
        avg: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
        min: Math.min(...scores),
        max: Math.max(...scores),
        count: scores.length
      };
    });

    const allScores = evaluations.flatMap(e =>
      [e.test_1_score, e.test_2_score, e.test_3_score, e.test_4_score,
      e.test_5_score, e.test_6_score, e.test_7_score, e.test_8_score]
        .filter(s => s !== null) as number[]
    );

    const overallAvg = allScores.length > 0
      ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2)
      : "0";

    return { stats, overallAvg };
  };



  const generateAISuggestions = async () => {
    if (evaluations.length === 0) return;

    let missingQuestionnairesList: string[] = [];
    try {
      const { data: questionnaires } = await supabase
        .from('questionnaires')
        .select('id, type')
        .in('type', ['cornell', 'chaea'])
        .eq('is_active', true);

      if (questionnaires && questionnaires.length > 0) {
        let hasCornell = false;
        let hasChaea = false;

        for (const questionnaire of questionnaires) {
          const { data: response } = await supabase
            .from('questionnaire_responses')
            .select('id')
            .eq('child_id', selectedChild)
            .eq('questionnaire_id', questionnaire.id)
            .limit(1)
            .maybeSingle();

          if (response) {
            if (questionnaire.type === 'cornell') hasCornell = true;
            if (questionnaire.type === 'chaea') hasChaea = true;
          }
        }

        if (!hasCornell) missingQuestionnairesList.push('Cornell');
        if (!hasChaea) missingQuestionnairesList.push('CHAEA');

        if (missingQuestionnairesList.length > 0) {
          setMissingQuestionnaires(missingQuestionnairesList);
        } else {
          setMissingQuestionnaires([]);
        }
      }
    } catch (error) {
      console.error('Error checking questionnaires:', error);
    }

    setLoadingSuggestions(true);
    setAiSuggestions(null);

    const childName = children.find(c => c.id === selectedChild)?.name || "Aprendiente";

    // LÓGICA ORIGINAL RESTAURADA + ENRIQUECIMIENTO HÍBRIDO
    const useLocalEngine = async () => {
      console.log('Generando sugerencias con Motor Local (Prioridad)...');

      // 1. Obtener contexto entrenado (RAG)
      const { data: trainedModel } = await supabase
        .from('ai_training_models')
        .select('*')
        .order('trained_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: learningStyle } = await supabase
        .from('learning_style_assessments')
        .select('*')
        .eq('child_id', selectedChild)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // 2. Generar sugerencias base (Rapidez y robustez)
      const localSuggestions = generateLocalSuggestions(
        evaluations,
        trainedModel,
        childName,
        learningStyle
      );
      setAiSuggestions(localSuggestions);

      await fetchPersonalizedActivities();
      await fetchCompetencyIndex();

      toast({
        title: "Sugerencias Generadas",
        description: "Basadas en tu Modelo Local Entrenado (RAG)."
      });
    };

    try {
      await useLocalEngine();
    } catch (localError: any) {
      console.error("Error en motor local:", localError);
      toast({
        title: "Error",
        description: "No se pudieron generar sugerencias.",
        variant: "destructive"
      });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleCreateAIActivity = async () => {
    setLoadingSuggestions(true);
    try {
      const childName = children.find(c => c.id === selectedChild)?.name || "Aprendiente";
      const existingActivityNames = personalizedActivities.map(a => a.activity_name);

      console.log("Solicitando N nuevas actividades creativas a la IA...");
      const { data, error } = await supabase.functions.invoke('generate-suggestions', {
        body: {
          evaluations: evaluations,
          childName: childName,
          childId: selectedChild,
          existingActivities: existingActivityNames
        }
      });

      if (error) throw error;

      if (data && data.personalizedActivities) {
        // Transformar para que el UI de previsualización lo entienda
        const transformedSuggestions: Suggestion[] = data.personalizedActivities.map((pa: any) => ({
          activity: pa.activityName,
          type: pa.activityType,
          description: pa.description,
          benefits: pa.targetSkills || [],
          expectedProgress: pa.successCriteria || pa.progressionNotes,
          concreteActivities: [{
            name: pa.activityName,
            duration: `${pa.durationMinutes} min`,
            materials: pa.materialsNeeded || [],
            steps: pa.progressionNotes ? pa.progressionNotes.split('. ') : [pa.description]
          }]
        }));

        setAiSuggestions({
          suggestions: transformedSuggestions,
          overallRecommendation: "Sugerencias creativas generadas por IA avanzada (Edge Function).",
          weeklyPlan: []
        });

        toast({
          title: "¡Actividades Creativas Generadas!",
          description: `Se han diseñado ${data.personalizedActivities.length} nuevas propuestas. Revísalas abajo.`
        });
      }

    } catch (e: any) {
      console.error(e);
      toast({ title: "Error conectando con IA", description: e.message, variant: "destructive" });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleRefineSummary = async () => {
    if (!aiSuggestions?.overallRecommendation || aiSuggestions.overallRecommendation.trim().length < 10) {
      toast({
        title: "Contenido insuficiente",
        description: "Primero genera sugerencias para poder refinarlas.",
        variant: "destructive"
      });
      return;
    }

    setIsRefiningSummary(true);
    try {
      const { data, error } = await supabase.functions.invoke('refine-report-text', {
        body: {
          text: aiSuggestions.overallRecommendation,
          sectionTitle: 'Resumen General',
          reportType: 'prediccion'
        }
      });

      if (error) throw error;

      if (data?.refinedText) {
        setAiSuggestions((prev: any) => prev ? ({
          ...prev,
          overallRecommendation: data.refinedText
        }) : null);
        toast({
          title: "Resumen Optimizado",
          description: "La IA ha refinado la recomendación general.",
        });
      }
    } catch (error: any) {
      console.error('Error refining summary:', error);
      toast({
        title: "Error al optimizar",
        description: error.message || "No se pudo conectar con el servicio de IA.",
        variant: "destructive"
      });
    } finally {
      setIsRefiningSummary(false);
    }
  };

  const handleRefinePrediction = async () => {
    if (!progressPredictions?.recommendations?.priority || progressPredictions.recommendations.priority.trim().length < 10) {
      toast({
        title: "Contenido insuficiente",
        description: "Primero genera predicciones para poder refinarlas.",
        variant: "destructive"
      });
      return;
    }

    const child = children.find(c => c.id === selectedChild);
    const childName = child?.name || "Aprendiente";

    const predictionContext = `
      Aprendiente: ${childName}
      Promedio Actual: ${progressPredictions.overallProgress.currentAverage.toFixed(2)}
      Tendencia: ${progressPredictions.overallProgress.trend}
      
      Factores de Riesgo:
      ${progressPredictions.riskFactors.join('\n')}
      
      Oportunidades de Mejora:
      ${progressPredictions.opportunities.join('\n')}
      
      Actividades Personalizadas Activas:
      ${progressPredictions.contextForAI?.activeCustomActivities?.join(', ') || 'Ninguna'}
      
      Recomendación Base:
      ${progressPredictions.recommendations.priority}
    `;

    setIsRefiningPrediction(true);
    try {
      const { data, error } = await supabase.functions.invoke('refine-report-text', {
        body: {
          text: predictionContext,
          sectionTitle: 'Análisis Estratégico de Progreso',
          reportType: 'prediccion_avanzada'
        }
      });

      if (error) throw error;

      if (data?.refinedText) {
        setProgressPredictions(prev => prev ? ({
          ...prev,
          recommendations: {
            ...prev.recommendations,
            priority: data.refinedText
          }
        }) : null);
        toast({
          title: "Predicciones Optimizadas",
          description: "La IA ha refinado las recomendaciones estratégicas.",
        });
      }
    } catch (error: any) {
      console.error('Error refining prediction:', error);
      toast({
        title: "Error al optimizar",
        description: error.message || "No se pudo conectar con el servicio de IA.",
        variant: "destructive"
      });
    } finally {
      setIsRefiningPrediction(false);
    }
  };

  const generateProgressPredictions = async () => {
    if (evaluations.length < 2) {
      toast({
        title: "Datos insuficientes",
        description: "Se necesitan al menos 2 evaluaciones para generar predicciones",
        variant: "destructive"
      });
      return;
    }

    let missingQuestionnairesList: string[] = [];
    try {
      const { data: questionnaires } = await supabase
        .from('questionnaires')
        .select('id, type')
        .in('type', ['cornell', 'chaea'])
        .eq('is_active', true);

      if (questionnaires && questionnaires.length > 0) {
        let hasCornell = false;
        let hasChaea = false;

        for (const questionnaire of questionnaires) {
          const { data: response } = await supabase
            .from('questionnaire_responses')
            .select('id')
            .eq('child_id', selectedChild)
            .eq('questionnaire_id', questionnaire.id)
            .limit(1)
            .maybeSingle();

          if (response) {
            if (questionnaire.type === 'cornell') hasCornell = true;
            if (questionnaire.type === 'chaea') hasChaea = true;
          }
        }

        if (!hasCornell) missingQuestionnairesList.push('Cornell');
        if (!hasChaea) missingQuestionnairesList.push('CHAEA');

        if (missingQuestionnairesList.length > 0) {
          setMissingQuestionnaires(missingQuestionnairesList);
        } else {
          setMissingQuestionnaires([]);
        }
      }
    } catch (error) {
      console.error('Error checking questionnaires:', error);
    }

    setLoadingPredictions(true);
    setProgressPredictions(null);

    const childName = children.find(c => c.id === selectedChild)?.name || "Aprendiente";

    const useLocalEngine = async () => {
      const { data: trainedModel } = await supabase
        .from('ai_training_models')
        .select('*')
        .order('trained_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const predictions = generateLocalPredictions(
        evaluations,
        trainedModel,
        childName,
        personalizedActivities // Pasamos las actividades personalizadas
      );
      setProgressPredictions(predictions);

      toast({
        title: "Predicciones Locales",
        description: "Predicciones generadas con el modelo entrenado localmente"
      });
    };

    try {
      await useLocalEngine();
    } catch (localError) {
      toast({
        title: "Error",
        description: "No se pudieron generar predicciones",
        variant: "destructive"
      });
    } finally {
      setLoadingPredictions(false);
    }
  };

  const saveActivityFromSuggestion = async (suggestion: Suggestion, activityIndex: number, replaceOption: number | null = null) => {
    if (!selectedChild) return;

    try {
      const childName = children.find(c => c.id === selectedChild)?.name || "Aprendiente";
      const concreteActivity = suggestion.concreteActivities?.[activityIndex] || suggestion.concreteActivities?.[0];

      const activityData = {
        child_id: selectedChild,
        activity_name: concreteActivity?.name || suggestion.activity,
        activity_type: suggestion.type,
        description: suggestion.description,
        difficulty_level: 'intermediate',
        target_skills: suggestion.benefits || [],
        materials_needed: concreteActivity?.materials || [],
        duration_minutes: concreteActivity?.duration ? parseInt(concreteActivity.duration) || 15 : 15,
        success_criteria: suggestion.expectedProgress,
        progression_notes: concreteActivity?.steps?.join('. ') || '',
        replaces_activity_id: replaceOption,
        ai_confidence: 0.85,
        is_active: false
      };

      const { error } = await supabase
        .from('personalized_activities')
        .insert(activityData);

      if (error) throw error;

      const actionText = replaceOption === null
        ? "se agregó como nueva actividad"
        : `reemplazará "${STANDARD_ACTIVITY_NAMES[replaceOption - 1]}"`;

      toast({
        title: "Actividad guardada",
        description: `"${activityData.activity_name}" ${actionText} para ${childName}. Actívala en "Actividades Personalizadas".`
      });

      fetchPersonalizedActivities();

    } catch (error: any) {
      console.error('Error saving activity:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la actividad",
        variant: "destructive"
      });
    }
  };

  const exportSuggestionsToPDF = async () => {
    if (!aiSuggestions) return;

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const childName = children.find(c => c.id === selectedChild)?.name || "Aprendiente";

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = 20;

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Sugerencias de IA para Motricidad Fina', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Alumno: ${childName}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, margin, yPosition);
      yPosition += 15;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Sugerencias Personalizadas:', margin, yPosition);
      yPosition += 10;

      aiSuggestions.suggestions.forEach((suggestion, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const title = `${index + 1}. ${suggestion.activity} (${suggestion.type})`;
        doc.text(title, margin, yPosition);
        yPosition += 7;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const descLines = doc.splitTextToSize(suggestion.description, maxWidth);
        doc.text(descLines, margin, yPosition);
        yPosition += (descLines.length * 5) + 5;

        doc.setFont('helvetica', 'bold');
        doc.text('Beneficios:', margin, yPosition);
        yPosition += 5;
        doc.setFont('helvetica', 'normal');

        suggestion.benefits.forEach((benefit) => {
          const benefitLines = doc.splitTextToSize(`• ${benefit}`, maxWidth - 5);
          doc.text(benefitLines, margin + 5, yPosition);
          yPosition += (benefitLines.length * 5);
        });
        yPosition += 3;

        doc.setFont('helvetica', 'bold');
        doc.text('Progreso Esperado:', margin, yPosition);
        yPosition += 5;
        doc.setFont('helvetica', 'normal');
        const progressLines = doc.splitTextToSize(suggestion.expectedProgress, maxWidth);
        doc.text(progressLines, margin, yPosition);
        yPosition += (progressLines.length * 5) + 10;
      });

      if (aiSuggestions.overallRecommendation) {
        if (yPosition > 230) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Recomendación General:', margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const recLines = doc.splitTextToSize(aiSuggestions.overallRecommendation, maxWidth);
        doc.text(recLines, margin, yPosition);
      }

      const fileName = `sugerencias_ia_${childName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF Exportado",
        description: "Las sugerencias han sido descargadas correctamente"
      });
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo exportar el PDF",
        variant: "destructive"
      });
    }
  };

  const exportPredictionsToPDF = async () => {
    if (!progressPredictions || !selectedChild) return;

    try {
      const childName = children.find(c => c.id === selectedChild)?.name || "Aprendiente";
      const { generateReportPDF } = await import('@/lib/ReportPDFGenerator');

      await generateReportPDF({
        childName,
        reportType: 'prediccion',
        evaluationDate: new Date().toISOString(),
        predictions: progressPredictions,
        evaluations
      });

      toast({
        title: "PDF Generado",
        description: "El reporte de predicción ha sido descargado correctamente"
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive"
      });
    }
  };



  const exportToCSV = () => {
    if (evaluations.length === 0) return;

    const childName = children.find(c => c.id === selectedChild)?.name || "Aprendiente";

    let csv = "Fecha," + ACTIVITIES.join(",") + ",Promedio,Observaciones\n";

    evaluations.forEach(evaluation => {
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

      const validScores = scores.filter(s => s !== null) as number[];
      const avg = validScores.length > 0
        ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)
        : "N/A";

      const row = [
        new Date(evaluation.evaluation_date).toLocaleDateString(),
        ...scores.map(s => s || "N/A"),
        avg,
        `"${evaluation.observations || ""}"`
      ].join(",");

      csv += row + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_${childName.replace(/\s+/g, "_")}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Éxito",
      description: "Reporte exportado correctamente"
    });
  };

  const stats = calculateStats();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b bg-card shadow-soft sticky top-0 z-30">
        <MotionDiv
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="container mx-auto px-4 py-4 flex items-center justify-between"
        >
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="bg-white/10 hover:bg-white/20 hover:text-primary transition-all gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver al Panel</span>
          </Button>
        </MotionDiv>
      </header>

      <main className="container mx-auto px-4 py-8">
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Reportes y Análisis</h1>
          <p className="text-muted-foreground">
            Visualiza el progreso y estadísticas de las evaluaciones
          </p>
        </MotionDiv>

        <Card className="mb-6" data-tutorial="select-child">
          <CardHeader>
            <CardTitle>Seleccionar Aprendiente</CardTitle>
            <CardDescription>Elija un aprendiente para ver su reporte de progreso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              {isAdmin && schools.length > 0 && (
                <div className="flex-1">
                  <Label>Escuela</Label>
                  <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las escuelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las escuelas</SelectItem>
                      {schools.map((school) => (
                        <SelectItem key={school} value={school}>
                          {school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex-1">
                <Label>Aprendiente</Label>
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar aprendiente" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-[300px] overflow-y-auto">
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedChild && evaluations.length > 0 && (
                <div className="flex gap-2">
                  <Button onClick={generateAISuggestions} disabled={loadingSuggestions} data-tutorial="ai-suggestions-btn">
                    <Sparkles className="mr-2 h-4 w-4" />
                    {loadingSuggestions ? "Generando..." : "Generar Sugerencias IA"}
                  </Button>
                  <Button onClick={generateProgressPredictions} disabled={loadingPredictions} variant="secondary" data-tutorial="ai-predictions-btn">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    {loadingPredictions ? "Prediciendo..." : "Predecir Progreso"}
                  </Button>
                  <Button onClick={exportToCSV} variant="outline" data-tutorial="export-report-btn">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Cargando...</p>
          </Card>
        ) : !selectedChild ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              Seleccione un aprendiente para ver su reporte
            </p>
          </Card>
        ) : evaluations.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              No hay evaluaciones registradas para este aprendiente
            </p>
          </Card>
        ) : stats && (
          <MotionDiv
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Motor de Sugerencias IA - Sección Consolidada */}
            {(competencyIndex || personalizedActivities.length > 0) && (
              <MotionDiv variants={itemVariants}>
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">Motor de Sugerencias IA</CardTitle>
                          <CardDescription>
                            Sistema inteligente de análisis y modificación automática de actividades personalizadas
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    {/* Aviso de cuestionarios faltantes */}
                    {missingQuestionnaires.length > 0 && (
                      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30">
                            Incompleto
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            Las sugerencias y predicciones están incompletas. Para obtener resultados más precisos, se recomienda completar los siguientes cuestionarios: <span className="font-semibold">{missingQuestionnaires.join(', ')}</span>.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Índice de Competencia */}
                    {competencyIndex && (
                      <div className="border rounded-lg p-4 bg-background/50" data-tutorial="competency-index">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          Índice de Competencia
                        </h3>
                        <CompetencyIndex
                          competencyIndex={competencyIndex}
                          childName={children.find(c => c.id === selectedChild)?.name || "Aprendiente"}
                        />
                      </div>
                    )}

                    {/* Actividades Personalizadas - Sección Única */}
                    {personalizedActivities.length > 0 && (
                      <div className="border rounded-lg p-4 bg-background/50" data-tutorial="personalized-activities">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-primary" />
                          Actividades Personalizadas Generadas por IA
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Actividades generadas por IA listas para aplicar con un clic. El sistema ajusta automáticamente la dificultad según el índice de competencia, estilos de aprendizaje (TAM, Cornell, CHAEA) y el progreso del aprendiente.
                        </p>
                        <PersonalizedActivities
                          activities={personalizedActivities}
                          childId={selectedChild}
                          childName={children.find(c => c.id === selectedChild)?.name || "Aprendiente"}
                          onActivitiesUpdated={() => {
                            fetchPersonalizedActivities();
                          }}
                        />
                      </div>
                    )}

                    {/* Sugerencias de IA con Actividades Concretas */}
                    {aiSuggestions?.suggestions && aiSuggestions.suggestions.length > 0 && (
                      <div className="border rounded-lg p-4 bg-background/50">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Sugerencias Personalizadas de IA
                        </h3>

                        <div className="space-y-4">
                          {aiSuggestions.suggestions.map((suggestion: any, index: number) => (
                            <div key={index} className="border rounded-lg p-4 bg-card">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-base">{suggestion.activity}</h4>
                                  <Badge variant="outline">{suggestion.type}</Badge>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>

                              {/* Beneficios */}
                              <div className="mb-3">
                                <p className="text-sm font-medium mb-1">Beneficios:</p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                  {suggestion.benefits?.map((benefit: string, i: number) => (
                                    <li key={i}>{benefit}</li>
                                  ))}
                                </ul>
                              </div>

                              {/* Actividades Concretas */}
                              {suggestion.concreteActivities && suggestion.concreteActivities.length > 0 && (
                                <div className="border-t pt-3 mt-3">
                                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                                    Actividades Concretas:
                                  </p>
                                  <div className="space-y-3">
                                    {suggestion.concreteActivities.map((activity: any, actIdx: number) => (
                                      <div key={actIdx} className="bg-muted/50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="font-medium text-sm">{activity.name}</span>
                                          <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">{activity.duration}</Badge>
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="gap-1 h-7">
                                                  <Plus className="h-3 w-3" />
                                                  Guardar
                                                  <ChevronDown className="h-3 w-3" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end" className="w-56">
                                                <DropdownMenuLabel>Guardar actividad</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => saveActivityFromSuggestion(suggestion, actIdx, null)}>
                                                  <Plus className="h-4 w-4 mr-2" />
                                                  Agregar como nueva
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuLabel className="text-xs text-muted-foreground">Reemplazar actividad:</DropdownMenuLabel>
                                                {STANDARD_ACTIVITY_NAMES.map((name, stdIdx) => (
                                                  <DropdownMenuItem
                                                    key={stdIdx}
                                                    onClick={() => saveActivityFromSuggestion(suggestion, actIdx, stdIdx + 1)}
                                                  >
                                                    {stdIdx + 1}. {name}
                                                  </DropdownMenuItem>
                                                ))}
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </div>

                                        {/* Materiales */}
                                        <div className="mb-2">
                                          <p className="text-xs font-medium text-muted-foreground">Materiales:</p>
                                          <p className="text-xs">{activity.materials?.join(', ')}</p>
                                        </div>

                                        {/* Pasos */}
                                        <div>
                                          <p className="text-xs font-medium text-muted-foreground">Pasos:</p>
                                          <ol className="list-decimal list-inside text-xs space-y-1">
                                            {activity.steps?.map((step: string, stepIdx: number) => (
                                              <li key={stepIdx}>{step}</li>
                                            ))}
                                          </ol>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Progreso Esperado */}
                              <div className="mt-3 text-xs text-muted-foreground bg-green-500/10 p-2 rounded">
                                <strong>Progreso esperado:</strong> {suggestion.expectedProgress}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Plan Semanal */}
                        {aiSuggestions.weeklyPlan && aiSuggestions.weeklyPlan.length > 0 && (
                          <div className="mt-4 border-t pt-4">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              📅 Plan Semanal Sugerido
                            </h4>
                            <div className="grid grid-cols-5 gap-2">
                              {aiSuggestions.weeklyPlan.map((day: any, idx: number) => (
                                <div key={idx} className="bg-muted/50 rounded p-2 text-center">
                                  <p className="font-medium text-xs">{day.day}</p>
                                  <p className="text-xs text-muted-foreground">{day.activity}</p>
                                  <p className="text-xs text-primary">{day.duration}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Recomendación General de IA */}
                    {aiSuggestions?.overallRecommendation && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <p className="font-semibold mb-2">Recomendación General del Sistema:</p>
                        <p className="text-sm">{aiSuggestions.overallRecommendation}</p>
                        <div className="mt-2 flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs gap-1.5 hover:text-primary hover:bg-primary/10 transition-all border border-primary/20"
                            disabled={isRefiningSummary}
                            onClick={handleRefineSummary}
                          >
                            {isRefiningSummary ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Wand2 className="h-3 w-3" />
                            )}
                            Refinar con IA
                          </Button>
                          <Button onClick={exportSuggestionsToPDF} variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Descargar PDF Sugerencias
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </MotionDiv>
            )}

            {progressPredictions && (
              <MotionDiv variants={itemVariants} className="space-y-4">
                {missingQuestionnaires.length > 0 && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30">
                        Incompleto
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Las predicciones están incompletas. Para obtener resultados más precisos, se recomienda completar los siguientes cuestionarios: <span className="font-semibold">{missingQuestionnaires.join(', ')}</span>.
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button onClick={exportPredictionsToPDF} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF Predicciones
                  </Button>
                </div>
                <ProgressPrediction
                  predictions={progressPredictions}
                  onRefine={handleRefinePrediction}
                  isRefining={isRefiningPrediction}
                />
              </MotionDiv>
            )}

            <MotionDiv variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Resumen General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Evaluaciones</p>
                      <p className="text-3xl font-bold">{evaluations.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Promedio General</p>
                      <p className="text-3xl font-bold">{stats.overallAvg}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Primera Evaluación</p>
                      <p className="text-lg font-semibold">
                        {new Date(evaluations[0].evaluation_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Última Evaluación</p>
                      <p className="text-lg font-semibold">
                        {new Date(evaluations[evaluations.length - 1].evaluation_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </MotionDiv>

            <MotionDiv variants={itemVariants} data-tutorial="progress-tracker">
              <ProgressTracker evaluations={evaluations} activities={ACTIVITIES} />
            </MotionDiv>

            <MotionDiv variants={itemVariants}>
              <IntervalComparison evaluations={evaluations} activities={ACTIVITIES} />
            </MotionDiv>

            <MotionDiv variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas por Actividad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.stats.map((stat, index) => (
                      <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                        <h4 className="font-medium mb-2">{stat.activity}</h4>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Promedio</p>
                            <p className="font-semibold">{stat.avg}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Mínimo</p>
                            <p className="font-semibold">{stat.min || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Máximo</p>
                            <p className="font-semibold">{stat.max || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Evaluaciones</p>
                            <p className="font-semibold">{stat.count}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </MotionDiv>

            <MotionDiv variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Evaluaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {evaluations.map((evaluation) => {
                      const scores = [
                        evaluation.test_1_score,
                        evaluation.test_2_score,
                        evaluation.test_3_score,
                        evaluation.test_4_score,
                        evaluation.test_5_score,
                        evaluation.test_6_score,
                        evaluation.test_7_score,
                        evaluation.test_8_score
                      ].filter(s => s !== null) as number[];

                      const avg = scores.length > 0
                        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
                        : "N/A";

                      return (
                        <div key={evaluation.id} className="flex items-center justify-between border p-3 rounded">
                          <div>
                            <p className="font-medium">
                              {new Date(evaluation.evaluation_date).toLocaleDateString()}
                            </p>
                            {evaluation.observations && (
                              <p className="text-sm text-muted-foreground">{evaluation.observations}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Promedio</p>
                            <p className="text-2xl font-bold">{avg}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </MotionDiv>
          </MotionDiv>
        )}
      </main>

      <TutorialButton onClick={() => startTutorial(reportsTutorial)} />
    </div>
  );
};

export default Reports;
