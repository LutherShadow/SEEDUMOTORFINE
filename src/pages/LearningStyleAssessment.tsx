import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

// TAM Questions based on 8 fine motor activities and learning styles
const QUESTIONS = [
  // Visual Learning Style (Questions 1-14)
  { id: 1, category: "visual", activity: "general", text: "Prefiero observar demostraciones visuales antes de realizar una actividad manual" },
  { id: 2, category: "visual", activity: "test_1", text: "Recuerdo mejor los trazos y líneas cuando los veo en imágenes o diagramas" },
  { id: 3, category: "visual", activity: "test_2", text: "Me ayuda ver videos o fotos de cómo enhebrar correctamente" },
  { id: 4, category: "visual", activity: "test_3", text: "Identifico mejor los colores y formas cuando están organizados visualmente" },
  { id: 5, category: "visual", activity: "test_4", text: "Aprendo mejor a recortar cuando veo líneas y patrones marcados" },
  { id: 6, category: "visual", activity: "test_5", text: "Me gusta ver dibujos de cómo doblar el papel paso a paso" },
  { id: 7, category: "visual", activity: "test_6", text: "Prefiero ver mapas o gráficos de cómo usar las pinzas correctamente" },
  { id: 8, category: "visual", activity: "test_7", text: "Entiendo mejor el punzado cuando veo patrones y diseños visuales" },
  { id: 9, category: "visual", activity: "test_8", text: "Me ayudan los esquemas visuales para entender cómo modelar con plastilina" },
  { id: 10, category: "visual", activity: "general", text: "Necesito ver ejemplos terminados antes de empezar mi trabajo" },
  { id: 11, category: "visual", activity: "general", text: "Prefiero instrucciones escritas o con imágenes" },
  { id: 12, category: "visual", activity: "general", text: "Me distraigo menos cuando tengo referencias visuales claras" },
  { id: 13, category: "visual", activity: "general", text: "Recuerdo mejor las actividades que he visto hacer a otros" },
  { id: 14, category: "visual", activity: "general", text: "Me gusta organizar mi trabajo visualmente antes de empezar" },

  // Auditory Learning Style (Questions 15-28)
  { id: 15, category: "auditory", activity: "general", text: "Aprendo mejor cuando alguien me explica verbalmente cómo hacer algo" },
  { id: 16, category: "auditory", activity: "test_1", text: "Me ayuda escuchar instrucciones sobre cómo realizar los trazos" },
  { id: 17, category: "auditory", activity: "test_2", text: "Entiendo mejor cuando me explican con palabras cómo enhebrar" },
  { id: 18, category: "auditory", activity: "test_3", text: "Prefiero que me digan los nombres de los colores mientras trabajo" },
  { id: 19, category: "auditory", activity: "test_4", text: "Me concentro mejor cuando escucho instrucciones paso a paso para recortar" },
  { id: 20, category: "auditory", activity: "test_5", text: "Aprendo mejor a doblar papel cuando me lo explican verbalmente" },
  { id: 21, category: "auditory", activity: "test_6", text: "Me gusta escuchar cómo usar las pinzas mientras practico" },
  { id: 22, category: "auditory", activity: "test_7", text: "Entiendo mejor el punzado cuando me explican el ritmo y técnica" },
  { id: 23, category: "auditory", activity: "test_8", text: "Me ayuda escuchar instrucciones mientras modelo con plastilina" },
  { id: 24, category: "auditory", activity: "general", text: "Prefiero discutir las actividades antes de realizarlas" },
  { id: 25, category: "auditory", activity: "general", text: "Me gusta repetir en voz alta lo que debo hacer" },
  { id: 26, category: "auditory", activity: "general", text: "Aprendo mejor en ambientes donde puedo hacer preguntas" },
  { id: 27, category: "auditory", activity: "general", text: "Recuerdo mejor cuando escucho música o sonidos relacionados" },
  { id: 28, category: "auditory", activity: "general", text: "Me concentro mejor cuando hay explicaciones verbales claras" },

  // Kinesthetic Learning Style (Questions 29-42)
  { id: 29, category: "kinesthetic", activity: "general", text: "Aprendo mejor haciendo las cosas con mis propias manos" },
  { id: 30, category: "kinesthetic", activity: "test_1", text: "Necesito practicar los trazos muchas veces para aprenderlos" },
  { id: 31, category: "kinesthetic", activity: "test_2", text: "Aprendo mejor a enhebrar practicando directamente" },
  { id: 32, category: "kinesthetic", activity: "test_3", text: "Me gusta tocar y manipular los colores y formas" },
  { id: 33, category: "kinesthetic", activity: "test_4", text: "Aprendo mejor a recortar practicando con diferentes materiales" },
  { id: 34, category: "kinesthetic", activity: "test_5", text: "Necesito doblar el papel yo mismo para entender la técnica" },
  { id: 35, category: "kinesthetic", activity: "test_6", text: "Aprendo mejor usando las pinzas repetidamente" },
  { id: 36, category: "kinesthetic", activity: "test_7", text: "Necesito practicar el punzado para desarrollar la técnica" },
  { id: 37, category: "kinesthetic", activity: "test_8", text: "Aprendo mejor modelando con plastilina directamente" },
  { id: 38, category: "kinesthetic", activity: "general", text: "Me gusta moverme mientras aprendo" },
  { id: 39, category: "kinesthetic", activity: "general", text: "Prefiero actividades donde puedo usar todo mi cuerpo" },
  { id: 40, category: "kinesthetic", activity: "general", text: "Aprendo mejor cuando puedo experimentar físicamente" },
  { id: 41, category: "kinesthetic", activity: "general", text: "Me concentro mejor cuando estoy activo" },
  { id: 42, category: "kinesthetic", activity: "general", text: "Necesito manipular objetos para entender conceptos" },

  // Logical-Mathematical Learning Style (Questions 43-56)
  { id: 43, category: "logical", activity: "general", text: "Me gusta entender la razón y lógica detrás de cada actividad" },
  { id: 44, category: "logical", activity: "test_1", text: "Analizo los patrones y secuencias en los trazos" },
  { id: 45, category: "logical", activity: "test_2", text: "Me gusta entender la secuencia lógica del enhebrado" },
  { id: 46, category: "logical", activity: "test_3", text: "Prefiero clasificar y organizar colores según criterios específicos" },
  { id: 47, category: "logical", activity: "test_4", text: "Me gusta seguir pasos ordenados al recortar" },
  { id: 48, category: "logical", activity: "test_5", text: "Analizo la geometría y simetría al doblar papel" },
  { id: 49, category: "logical", activity: "test_6", text: "Me gusta entender la mecánica de cómo funcionan las pinzas" },
  { id: 50, category: "logical", activity: "test_7", text: "Prefiero seguir patrones matemáticos en el punzado" },
  { id: 51, category: "logical", activity: "test_8", text: "Me gusta planificar las formas antes de modelar con plastilina" },
  { id: 52, category: "logical", activity: "general", text: "Necesito entender el 'por qué' antes de hacer algo" },
  { id: 53, category: "logical", activity: "general", text: "Me gusta resolver problemas de manera sistemática" },
  { id: 54, category: "logical", activity: "general", text: "Prefiero actividades que requieren razonamiento" },
  { id: 55, category: "logical", activity: "general", text: "Me concentro mejor cuando veo relaciones causa-efecto" },
  { id: 56, category: "logical", activity: "general", text: "Me gusta organizar mi trabajo en pasos lógicos" },

  // Social Learning Style (Questions 57-70)
  { id: 57, category: "social", activity: "general", text: "Aprendo mejor trabajando en grupo" },
  { id: 58, category: "social", activity: "test_1", text: "Me gusta practicar trazos junto con otros compañeros" },
  { id: 59, category: "social", activity: "test_2", text: "Prefiero aprender a enhebrar observando a mis compañeros" },
  { id: 60, category: "social", activity: "test_3", text: "Me gusta compartir y comparar colores con otros" },
  { id: 61, category: "social", activity: "test_4", text: "Aprendo mejor a recortar cuando trabajo con otros" },
  { id: 62, category: "social", activity: "test_5", text: "Me gusta doblar papel en actividades grupales" },
  { id: 63, category: "social", activity: "test_6", text: "Prefiero usar pinzas en juegos con compañeros" },
  { id: 64, category: "social", activity: "test_7", text: "Me gusta hacer punzado en proyectos grupales" },
  { id: 65, category: "social", activity: "test_8", text: "Disfruto modelar con plastilina junto a otros aprendientes" },
  { id: 66, category: "social", activity: "general", text: "Me motivo más cuando trabajo con otros" },
  { id: 67, category: "social", activity: "general", text: "Me gusta compartir mis ideas y escuchar las de otros" },
  { id: 68, category: "social", activity: "general", text: "Aprendo mejor en ambientes colaborativos" },
  { id: 69, category: "social", activity: "general", text: "Prefiero actividades donde puedo ayudar a otros" },
  { id: 70, category: "social", activity: "general", text: "Me concentro mejor cuando hay interacción social" },

  // Solitary Learning Style (Questions 71-84)
  { id: 71, category: "solitary", activity: "general", text: "Prefiero trabajar solo en mis actividades" },
  { id: 72, category: "solitary", activity: "test_1", text: "Me concentro mejor practicando trazos en silencio" },
  { id: 73, category: "solitary", activity: "test_2", text: "Aprendo mejor a enhebrar cuando trabajo solo" },
  { id: 74, category: "solitary", activity: "test_3", text: "Prefiero explorar colores de forma independiente" },
  { id: 75, category: "solitary", activity: "test_4", text: "Me gusta recortar a mi propio ritmo sin distracciones" },
  { id: 76, category: "solitary", activity: "test_5", text: "Prefiero doblar papel en un espacio tranquilo" },
  { id: 77, category: "solitary", activity: "test_6", text: "Me concentro mejor usando pinzas cuando estoy solo" },
  { id: 78, category: "solitary", activity: "test_7", text: "Aprendo mejor el punzado trabajando individualmente" },
  { id: 79, category: "solitary", activity: "test_8", text: "Prefiero modelar con plastilina en mi propio espacio" },
  { id: 80, category: "solitary", activity: "general", text: "Necesito tiempo a solas para procesar lo aprendido" },
  { id: 81, category: "solitary", activity: "general", text: "Me gusta reflexionar sobre mi trabajo de forma independiente" },
  { id: 82, category: "solitary", activity: "general", text: "Aprendo mejor cuando puedo establecer mi propio ritmo" },
  { id: 83, category: "solitary", activity: "general", text: "Prefiero ambientes tranquilos para concentrarme" },
  { id: 84, category: "solitary", activity: "general", text: "Me siento más cómodo trabajando de manera autónoma" },
];

const LIKERT_SCALE = [
  { value: "1", label: "Totalmente en desacuerdo" },
  { value: "2", label: "En desacuerdo" },
  { value: "3", label: "Neutral" },
  { value: "4", label: "De acuerdo" },
  { value: "5", label: "Totalmente de acuerdo" },
];

const LearningStyleAssessment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const childId = searchParams.get("childId");
  const [childName, setChildName] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const questionsPerPage = 10;
  const totalPages = Math.ceil(QUESTIONS.length / questionsPerPage);
  const currentQuestions = QUESTIONS.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchChild = async () => {
      if (!childId) return;
      const { data, error } = await supabase
        .from("children")
        .select("name")
        .eq("id", childId)
        .single();
      
      if (error) {
        toast.error("Error al cargar información del aprendiente");
        return;
      }
      setChildName(data.name);
    };
    fetchChild();
  }, [childId]);

  const handleResponseChange = (questionId: number, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateScores = (allResponses: Record<number, string>) => {
    const scores = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      logical: 0,
      social: 0,
      solitary: 0,
    };

    const counts = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      logical: 0,
      social: 0,
      solitary: 0,
    };

    QUESTIONS.forEach(question => {
      const response = allResponses[question.id];
      if (response) {
        const value = parseInt(response);
        scores[question.category as keyof typeof scores] += value;
        counts[question.category as keyof typeof counts] += 1;
      }
    });

    // Calculate averages
    const avgScores = Object.keys(scores).reduce((acc, key) => {
      const k = key as keyof typeof scores;
      acc[k] = counts[k] > 0 ? scores[k] / counts[k] : 0;
      return acc;
    }, {} as Record<keyof typeof scores, number>);

    // Find dominant styles
    const sortedStyles = Object.entries(avgScores).sort((a, b) => b[1] - a[1]);
    
    return {
      scores: avgScores,
      dominant_style: sortedStyles[0][0],
      secondary_style: sortedStyles[1][0],
    };
  };

  const handleSubmit = async () => {
    if (!childId || !user) return;

    // Check if all questions are answered
    const unansweredCount = QUESTIONS.filter(q => !responses[q.id]).length;
    if (unansweredCount > 0) {
      toast.error(`Por favor responda todas las preguntas (${unansweredCount} pendientes)`);
      return;
    }

    setIsSubmitting(true);

    try {
      const { scores, dominant_style, secondary_style } = calculateScores(responses);

      const { error } = await supabase
        .from("learning_style_assessments")
        .insert({
          child_id: childId,
          evaluator_id: user.id,
          responses: responses,
          visual_score: scores.visual,
          auditory_score: scores.auditory,
          kinesthetic_score: scores.kinesthetic,
          logical_score: scores.logical,
          social_score: scores.social,
          solitary_score: scores.solitary,
          dominant_style,
          secondary_style,
        });

      if (error) throw error;

      toast.success("Evaluación de estilo de aprendizaje guardada exitosamente");
      navigate("/children");
    } catch (error: any) {
      console.error("Error saving assessment:", error);
      toast.error("Error al guardar la evaluación");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((Object.keys(responses).length / QUESTIONS.length) * 100);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/children")}
              className="w-fit"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <ThemeToggle />
          </div>
          <CardTitle className="text-2xl">Test de Análisis de Modalidades (TAM)</CardTitle>
          <CardDescription>
            Cuestionario de Estilos de Aprendizaje para {childName || "el alumno"}
          </CardDescription>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progreso: {Object.keys(responses).length} de {QUESTIONS.length} preguntas</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="space-y-6">
            {currentQuestions.map((question, index) => (
              <Card key={question.id} className="p-6">
                <div className="space-y-4">
                  <div className="font-medium">
                    {currentPage * questionsPerPage + index + 1}. {question.text}
                  </div>
                  <RadioGroup
                    value={responses[question.id] || ""}
                    onValueChange={(value) => handleResponseChange(question.id, value)}
                  >
                    <div className="space-y-2">
                      {LIKERT_SCALE.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={`q${question.id}-${option.value}`} />
                          <Label htmlFor={`q${question.id}-${option.value}`} className="cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>

            <span className="text-sm text-muted-foreground">
              Página {currentPage + 1} de {totalPages}
            </span>

            {currentPage < totalPages - 1 ? (
              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              >
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(responses).length < QUESTIONS.length}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Guardando..." : "Guardar Evaluación"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningStyleAssessment;