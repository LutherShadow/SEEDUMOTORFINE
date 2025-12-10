import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Sparkles, Lightbulb, TrendingUp, Plus, ChevronDown } from "lucide-react";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProgressTracker } from "@/components/reports/ProgressTracker";
import { IntervalComparison } from "@/components/reports/IntervalComparison";
import { ProgressPrediction } from "@/components/reports/ProgressPrediction";
import { PersonalizedActivities } from "@/components/reports/PersonalizedActivities";
import { CompetencyIndex } from "@/components/reports/CompetencyIndex";
import { useTutorial } from "@/components/tutorial/TutorialProvider";
import { reportsTutorial } from "@/components/tutorial/tutorials";
import { TutorialButton } from "@/components/tutorial/TutorialButton";
import { generateLocalPredictions, generateLocalSuggestions } from "@/lib/localAIEngine";

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
      fetchChildren();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      fetchEvaluations();
      fetchPersonalizedActivities();
      fetchCompetencyIndex();
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from("children")
        .select("id, name")
        .order("name");

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

    // Validar que existan cuestionarios Cornell y/o CHAEA
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

    // Función helper para usar motor local
    const useLocalEngine = async () => {
      console.log('Usando motor de IA local para sugerencias...');

      // Fetch trained model
      const { data: trainedModel } = await supabase
        .from('ai_training_models')
        .select('*')
        .order('trained_at', { ascending: false })
        .limit(1)
        .single();

      // Fetch learning style assessment for this child
      const { data: learningStyle } = await supabase
        .from('learning_style_assessments')
        .select('*')
        .eq('child_id', selectedChild)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const localSuggestions = generateLocalSuggestions(
        evaluations,
        trainedModel,
        childName,
        learningStyle
      );
      setAiSuggestions(localSuggestions);

      // Save to database (same as Edge Function does)
      if (evaluations && evaluations.length > 0) {
        const latestEval = evaluations[evaluations.length - 1];

        // Save personalized activities from local suggestions
        if (localSuggestions.suggestions && Array.isArray(localSuggestions.suggestions)) {
          const activitiesToSave = localSuggestions.suggestions.flatMap((suggestion: any) => {
            // Each suggestion can have multiple concrete activities
            if (suggestion.concreteActivities && Array.isArray(suggestion.concreteActivities)) {
              return suggestion.concreteActivities.map((concrete: any) => {
                const durationMatch = concrete.duration?.match(/\d+/);
                const durationMinutes = durationMatch ? parseInt(durationMatch[0]) : 15;

                return {
                  child_id: selectedChild,
                  activity_name: concrete.name || suggestion.activity || 'Actividad',
                  activity_type: suggestion.type || 'General',
                  description: (concrete.steps && Array.isArray(concrete.steps))
                    ? concrete.steps.join('. ')
                    : (suggestion.description || 'Actividad personalizada'),
                  difficulty_level: 'intermediate',
                  materials_needed: (concrete.materials && Array.isArray(concrete.materials))
                    ? concrete.materials
                    : [],
                  duration_minutes: durationMinutes,
                  repetitions_recommended: 3,
                  success_criteria: suggestion.expectedProgress || 'Completar actividad',
                  progression_notes: `Generado localmente para ${childName}`,
                  ai_confidence: localSuggestions.modelConfidence || 0.85,
                  is_active: true
                };
              });
            }
            return [];
          });

          if (activitiesToSave.length > 0) {
            const { error: insertError } = await supabase
              .from('personalized_activities')
              .insert(activitiesToSave);

            if (insertError) {
              console.error('Error saving activities:', insertError);
            } else {
              console.log('Local activities saved to DB:', activitiesToSave.length);
            }
          }
        }

        // Save AI results summary
        await supabase.from('ai_results').insert({
          evaluation_id: latestEval.id,
          recommendations: localSuggestions.overallRecommendation || "Sugerencias generadas localmente",
          confidence_score: localSuggestions.modelConfidence || 0.85,
          classification: 'medio'
        });
      }

      // Refresh DB-stored data (same as Edge Function success path)
      await fetchPersonalizedActivities();
      await fetchCompetencyIndex();

      toast({
        title: "Motor de Sugerencias Local",
        description: "Sugerencias generadas con el modelo entrenado localmente"
      });
    };

    // Use Local AI Engine directly (Edge Function has persistent issues)
    try {
      await useLocalEngine();
      toast({
        title: "Sugerencias Generadas",
        description: "Actividades personalizadas creadas con el modelo entrenado"
      });
    } catch (localError) {
      toast({
        title: "Error",
        description: "No se pudieron generar sugerencias",
        variant: "destructive"
      });
    } finally {
      setLoadingSuggestions(false);
    }

    /* EDGE FUNCTION DISABLED DUE TO PERSISTENT 500 ERRORS
    // Use Real AI (Edge Function V22) with Local Fallback
    try {
      console.log('Calling Real AI (generate-suggestions)...');
      const { data, error } = await supabase.functions.invoke('generate-suggestions', {
        body: {
          childId: selectedChild,
          childName: childName,
          evaluations: evaluations
        }
      });

      if (error) throw error;

      if (data && data.suggestions) {
        setAiSuggestions(data);
        // Refresh DB-stored data populated by the Edge Function
        await fetchPersonalizedActivities();
        await fetchCompetencyIndex();

        toast({
          title: "IA Generativa Activada",
          description: "Sugerencias creadas con modelo Híbrido V22.",
        });
      } else {
        throw new Error("Formato inválido de Edge Function");
      }

    } catch (edgeError) {
      console.warn('Edge Function failed, using local fallback:', edgeError);

      try {
        await useLocalEngine();
        toast({
          title: "Modo Offline",
          description: "Usando motor local (Conexión a IA falló)",
          variant: "default"
        });
      } catch (localError) {
        toast({
          title: "Error Total",
          description: "No se pudieron generar sugerencias (ni Cloud ni Local)",
          variant: "destructive"
        });
      }
    } finally {
      setLoadingSuggestions(false);
    }
    */
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

    // Validar que existan cuestionarios Cornell y/o CHAEA
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

    // Función helper para usar motor local
    const useLocalEngine = async () => {
      console.log('Usando motor de predicción local...');
      const { data: trainedModel } = await supabase
        .from('ai_training_models')
        .select('*')
        .order('trained_at', { ascending: false })
        .limit(1)
        .single();

      const localPredictions = generateLocalPredictions(evaluations, trainedModel, childName);
      setProgressPredictions(localPredictions);

      toast({
        title: "Predicciones Locales",
        description: "Predicciones generadas con el modelo entrenado localmente"
      });
    };

    // Use Local Prediction Engine directly (Edge Function has persistent issues)
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

    /* EDGE FUNCTION DISABLED DUE TO PERSISTENT 500 ERRORS
    // Use Real AI (Edge Function V22) with Local Fallback
    try {
      console.log('Calling Real AI (predict-progress)...');
      const { data, error } = await supabase.functions.invoke('predict-progress', {
        body: {
          child_id: selectedChild,
          child_name: childName
        }
      });

      if (error) throw error;

      if (data) {
        setProgressPredictions(data);
        toast({
          title: "Predicción IA",
          description: "Análisis proyectivo completado por Gemini.",
          className: "bg-blue-50 border-blue-200" // Light blue toast
        });
      } else {
        throw new Error("Formato inválido de predicción");
      }

    } catch (edgeError) {
      console.warn('Prediction Edge Function failed, using local fallback:', edgeError);

      try {
        await useLocalEngine();
      } catch (localError) {
        toast({
          title: "Error",
          description: "No se pudieron generar predicciones",
          variant: "destructive"
        });
      }
    } finally {
      setLoadingPredictions(false);
    }
    */
  };

  // Guardar una sugerencia de IA como actividad personalizada
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
        replaces_activity_id: replaceOption, // null = agregar como nueva, 1-8 = reemplazar actividad específica
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

      // Título
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

      // Sugerencias
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Sugerencias Personalizadas:', margin, yPosition);
      yPosition += 10;

      aiSuggestions.suggestions.forEach((suggestion, index) => {
        // Verificar si necesitamos nueva página
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

        // Descripción
        const descLines = doc.splitTextToSize(suggestion.description, maxWidth);
        doc.text(descLines, margin, yPosition);
        yPosition += (descLines.length * 5) + 5;

        // Beneficios
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

        // Progreso esperado
        doc.setFont('helvetica', 'bold');
        doc.text('Progreso Esperado:', margin, yPosition);
        yPosition += 5;
        doc.setFont('helvetica', 'normal');
        const progressLines = doc.splitTextToSize(suggestion.expectedProgress, maxWidth);
        doc.text(progressLines, margin, yPosition);
        yPosition += (progressLines.length * 5) + 10;
      });

      // Recomendación general
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

      // Guardar PDF
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

      // Use the new PDF generator
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
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Panel
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reportes y Análisis</h1>
          <p className="text-muted-foreground">
            Visualiza el progreso y estadísticas de las evaluaciones
          </p>
        </div>

        <Card className="mb-6" data-tutorial="select-child">
          <CardHeader>
            <CardTitle>Seleccionar Aprendiente</CardTitle>
            <CardDescription>Elija un aprendiente para ver su reporte de progreso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>Aprendiente</Label>
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar aprendiente" />
                  </SelectTrigger>
                  <SelectContent>
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
          <div className="space-y-6">
            {/* Motor de Sugerencias IA - Sección Consolidada */}
            {(competencyIndex || personalizedActivities.length > 0) && (
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
                      <div className="mt-2 flex justify-end">
                        <Button onClick={exportSuggestionsToPDF} variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Descargar PDF Sugerencias
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {progressPredictions && (
              <div className="space-y-4">
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
                <ProgressPrediction predictions={progressPredictions} />
              </div>
            )}

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

            <div data-tutorial="progress-tracker">
              <ProgressTracker evaluations={evaluations} activities={ACTIVITIES} />
            </div>

            <IntervalComparison evaluations={evaluations} activities={ACTIVITIES} />

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
          </div>
        )}
      </main>

      <TutorialButton onClick={() => startTutorial(reportsTutorial)} />
    </div>
  );
};

export default Reports;
