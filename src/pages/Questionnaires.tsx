import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ClipboardList, Settings, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GenerateParentLinkDialog } from "@/components/GenerateParentLinkDialog";
import { FixDimensionNames } from "@/components/FixDimensionNames";
import { useTutorial } from "@/components/tutorial/TutorialProvider";
import { questionnairesTutorial } from "@/components/tutorial/tutorials";
import { TutorialButton } from "@/components/tutorial/TutorialButton";

export default function Questionnaires() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const childId = searchParams.get("childId");
  const [activeTab, setActiveTab] = useState("available");
  const [showParentLinkDialog, setShowParentLinkDialog] = useState(false);
  const { startTutorial } = useTutorial();

  // Tutorial effect
  useEffect(() => {
    const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
    if (!completedTutorials.includes('/questionnaires')) {
      startTutorial(questionnairesTutorial);
    }
  }, [startTutorial]);

  // Fetch questionnaires
  const { data: questionnaires = [], isLoading } = useQuery({
    queryKey: ["questionnaires"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questionnaires")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch user responses
  const { data: responses = [] } = useQuery({
    queryKey: ["questionnaire-responses", childId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      let query = supabase
        .from("questionnaire_responses")
        .select(`
          *,
          questionnaires:questionnaire_id (name, type),
          children:child_id (name)
        `)
        .eq("evaluator_id", user.id)
        .order("response_date", { ascending: false });

      // Filter by child if childId is provided
      if (childId) {
        query = query.eq("child_id", childId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Convert UUID dimensions to names if needed
      if (data) {
        for (const response of data) {
          if (response.questionnaire_id) {
            const { data: dimensions } = await supabase
              .from("questionnaire_dimensions")
              .select("id, name")
              .eq("questionnaire_id", response.questionnaire_id);
            
            if (dimensions) {
              const dimensionMap = new Map(dimensions.map((d) => [d.id, d.name]));
              
              // Convert dominant_dimension if it's a UUID
              if (response.dominant_dimension && dimensionMap.has(response.dominant_dimension)) {
                response.dominant_dimension = dimensionMap.get(response.dominant_dimension);
              }
              
              // Convert secondary_dimension if it's a UUID
              if (response.secondary_dimension && dimensionMap.has(response.secondary_dimension)) {
                response.secondary_dimension = dimensionMap.get(response.secondary_dimension);
              }
            }
          }
        }
      }
      
      return data;
    },
  });

  // Check if user is admin
  const { data: userRole } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      return data?.role;
    },
  });

  const isAdmin = userRole === "admin";

  // Fetch children for parent link generation
  const { data: children = [] } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const { data, error } = await supabase
        .from("children")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const getQuestionnaireTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cornell: "Cornell",
      chaea: "CHAEA",
      tam: "TAM (Estilos de Aprendizaje)",
      custom: "Personalizado",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              ← Volver
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Cuestionarios</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {childId && (
          <div className="mb-4">
            <Button variant="ghost" onClick={() => navigate("/children")}>
              ← Volver a Aprendientes
            </Button>
          </div>
        )}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Gestiona y aplica cuestionarios de evaluación pedagógica
            </p>
            {childId && responses.length > 0 && (
              <p className="text-sm text-primary mt-1">
                Mostrando resultados para: {responses[0]?.children?.name}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <FixDimensionNames />
            <Button variant="outline" onClick={() => navigate("/parent-links")} data-tutorial="manage-links-btn">
              <Link2 className="w-4 h-4 mr-2" />
              Gestionar Enlaces
            </Button>
            <Button variant="outline" onClick={() => setShowParentLinkDialog(true)} data-tutorial="generate-link-btn">
              <Link2 className="w-4 h-4 mr-2" />
              Generar Enlace
            </Button>
            {isAdmin && (
              <Button onClick={() => navigate("/questionnaires/manage")}>
                <Settings className="w-4 h-4 mr-2" />
                Administrar Cuestionarios
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md" data-tutorial="questionnaires-tabs">
            <TabsTrigger value="available">Cuestionarios Disponibles</TabsTrigger>
            <TabsTrigger value="responses">Mis Respuestas</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-6">
            {isLoading ? (
              <div className="text-center py-8">Cargando cuestionarios...</div>
            ) : questionnaires.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No hay cuestionarios disponibles
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-tutorial="questionnaire-list">
                {questionnaires.map((questionnaire) => (
                  <Card key={questionnaire.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <ClipboardList className="w-8 h-8 text-primary" />
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {getQuestionnaireTypeLabel(questionnaire.type)}
                        </span>
                      </div>
                      <CardTitle className="mt-4">{questionnaire.name}</CardTitle>
                      <CardDescription>{questionnaire.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full"
                        onClick={() => navigate(`/questionnaires/take/${questionnaire.id}`)}
                        data-tutorial="apply-questionnaire-btn"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Aplicar Cuestionario
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="responses" className="mt-6">
            {responses.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No has aplicado ningún cuestionario aún
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {responses.map((response: any) => (
                  <Card key={response.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">
                            {response.questionnaires?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Alumno: {response.children?.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Fecha: {new Date(response.response_date).toLocaleDateString()}
                          </p>
                          {response.dominant_dimension && (
                            <p className="text-sm mt-2">
                              <span className="font-medium">Dimensión dominante:</span>{" "}
                              <span className="text-primary">{response.dominant_dimension}</span>
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/questionnaires/result/${response.id}`)}
                        >
                          Ver Resultado
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <GenerateParentLinkDialog
        open={showParentLinkDialog}
        onOpenChange={setShowParentLinkDialog}
        children={children}
        questionnaires={questionnaires}
      />

      <TutorialButton onClick={() => startTutorial(questionnairesTutorial)} />
    </div>
  );
}
