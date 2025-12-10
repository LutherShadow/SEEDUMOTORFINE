import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function QuestionnaireTake() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedChild, setSelectedChild] = useState("");
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");

  // Fetch questionnaire
  const { data: questionnaire } = useQuery({
    queryKey: ["questionnaire", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questionnaires")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch dimensions
  const { data: dimensions } = useQuery({
    queryKey: ["dimensions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questionnaire_dimensions")
        .select("*")
        .eq("questionnaire_id", id)
        .order("order_index");

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch questions
  const { data: questions } = useQuery({
    queryKey: ["questions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questionnaire_questions")
        .select("*")
        .eq("questionnaire_id", id)
        .order("question_number");

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch children
  const { data: children } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("evaluator_id", user.id)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      // Calculate dimension scores
      const dimensionScores: Record<string, number> = {};
      const dimensionIdToName = new Map<string, string>();
      
      if (dimensions) {
        dimensions.forEach((dim) => {
          dimensionIdToName.set(dim.id, dim.name);
          const dimQuestions = questions?.filter((q) => q.dimension_id === dim.id) || [];
          const dimResponses = dimQuestions
            .map((q) => responses[q.id!])
            .filter((r) => r !== undefined);

          if (dimResponses.length > 0) {
            // Use dimension name as key instead of ID
            dimensionScores[dim.name] = dimResponses.reduce((a, b) => a + b, 0) / dimResponses.length;
          }
        });
      }

      // Find dominant and secondary dimensions (already using names as keys)
      const sortedDimensions = Object.entries(dimensionScores)
        .sort(([, a], [, b]) => b - a);

      const dominant = sortedDimensions[0]?.[0] || null;
      const secondary = sortedDimensions[1]?.[0] || null;

      const { data, error } = await supabase
        .from("questionnaire_responses")
        .insert({
          questionnaire_id: id,
          child_id: selectedChild,
          evaluator_id: user.id,
          responses: responses,
          dimension_scores: dimensionScores,
          dominant_dimension: dominant,
          secondary_dimension: secondary,
          notes: notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Cuestionario completado exitosamente");
      navigate(`/questionnaires/result/${data.id}`);
    },
    onError: (error: any) => {
      toast.error("Error al guardar: " + error.message);
    },
  });

  const handleSubmit = () => {
    if (!selectedChild) {
      toast.error("Selecciona un alumno");
      return;
    }

    const unanswered = questions?.filter((q) => !responses[q.id!]) || [];
    if (unanswered.length > 0) {
      toast.error(`Faltan ${unanswered.length} preguntas por responder`);
      return;
    }

    submitMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/questionnaires")}>
              ← Volver
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              {questionnaire?.name}
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Información del Alumno</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Seleccionar Alumno</Label>
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un alumno" />
              </SelectTrigger>
              <SelectContent>
                {children?.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Preguntas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions?.map((question) => (
              <div key={question.id} className="border-b pb-4 last:border-b-0">
                <Label className="text-base font-medium">
                  {question.question_number}. {question.question_text}
                </Label>
                <RadioGroup
                  className="mt-3"
                  value={responses[question.id!]?.toString()}
                  onValueChange={(value) =>
                    setResponses({ ...responses, [question.id!]: parseInt(value) })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id={`${question.id}-1`} />
                    <Label htmlFor={`${question.id}-1`}>Totalmente en desacuerdo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id={`${question.id}-2`} />
                    <Label htmlFor={`${question.id}-2`}>En desacuerdo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id={`${question.id}-3`} />
                    <Label htmlFor={`${question.id}-3`}>Neutral</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id={`${question.id}-4`} />
                    <Label htmlFor={`${question.id}-4`}>De acuerdo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id={`${question.id}-5`} />
                    <Label htmlFor={`${question.id}-5`}>Totalmente de acuerdo</Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notas Adicionales (Opcional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agrega observaciones o comentarios sobre la evaluación"
              rows={4}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={() => navigate("/questionnaires")} variant="outline" className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? "Guardando..." : "Completar Cuestionario"}
          </Button>
        </div>
      </main>
    </div>
  );
}
