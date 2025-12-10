import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Dimension = {
  id?: string;
  name: string;
  description: string;
  code: string;
  order_index: number;
};

type Question = {
  id?: string;
  question_text: string;
  question_number: number;
  dimension_id: string | null;
  score_weight: number;
  is_reverse_scored: boolean;
};

export default function QuestionnaireEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

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
  const { data: dimensionsData } = useQuery({
    queryKey: ["dimensions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questionnaire_dimensions")
        .select("*")
        .eq("questionnaire_id", id)
        .order("order_index");

      if (error) throw error;
      return data;
    },
  });

  // Fetch questions
  const { data: questionsData } = useQuery({
    queryKey: ["questions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questionnaire_questions")
        .select("*")
        .eq("questionnaire_id", id)
        .order("question_number");

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (dimensionsData) setDimensions(dimensionsData);
  }, [dimensionsData]);

  useEffect(() => {
    if (questionsData) setQuestions(questionsData);
  }, [questionsData]);

  // Save dimensions mutation
  const saveDimensionsMutation = useMutation({
    mutationFn: async () => {
      // Delete existing dimensions not in the current list
      const existingIds = dimensions.filter(d => d.id).map(d => d.id);
      if (dimensionsData) {
        const toDelete = dimensionsData.filter(d => !existingIds.includes(d.id));
        if (toDelete.length > 0) {
          await supabase
            .from("questionnaire_dimensions")
            .delete()
            .in("id", toDelete.map(d => d.id));
        }
      }

      // Upsert dimensions
      for (const dimension of dimensions) {
        if (dimension.id) {
          await supabase
            .from("questionnaire_dimensions")
            .update({
              name: dimension.name,
              description: dimension.description,
              code: dimension.code,
              order_index: dimension.order_index,
            })
            .eq("id", dimension.id);
        } else {
          const { data } = await supabase
            .from("questionnaire_dimensions")
            .insert({
              questionnaire_id: id,
              name: dimension.name,
              description: dimension.description,
              code: dimension.code,
              order_index: dimension.order_index,
            })
            .select()
            .single();

          if (data) {
            dimension.id = data.id;
          }
        }
      }
    },
    onSuccess: () => {
      toast.success("Dimensiones guardadas");
      queryClient.invalidateQueries({ queryKey: ["dimensions", id] });
    },
  });

  // Save questions mutation
  const saveQuestionsMutation = useMutation({
    mutationFn: async () => {
      // Delete existing questions not in the current list
      const existingIds = questions.filter(q => q.id).map(q => q.id);
      if (questionsData) {
        const toDelete = questionsData.filter(q => !existingIds.includes(q.id));
        if (toDelete.length > 0) {
          await supabase
            .from("questionnaire_questions")
            .delete()
            .in("id", toDelete.map(q => q.id));
        }
      }

      // Upsert questions
      for (const question of questions) {
        if (question.id) {
          await supabase
            .from("questionnaire_questions")
            .update({
              question_text: question.question_text,
              question_number: question.question_number,
              dimension_id: question.dimension_id,
              score_weight: question.score_weight,
              is_reverse_scored: question.is_reverse_scored,
            })
            .eq("id", question.id);
        } else {
          await supabase
            .from("questionnaire_questions")
            .insert({
              questionnaire_id: id,
              question_text: question.question_text,
              question_number: question.question_number,
              dimension_id: question.dimension_id,
              score_weight: question.score_weight,
              is_reverse_scored: question.is_reverse_scored,
            });
        }
      }
    },
    onSuccess: () => {
      toast.success("Preguntas guardadas");
      queryClient.invalidateQueries({ queryKey: ["questions", id] });
    },
  });

  const addDimension = () => {
    setDimensions([
      ...dimensions,
      {
        name: "",
        description: "",
        code: "",
        order_index: dimensions.length,
      },
    ]);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        question_number: questions.length + 1,
        dimension_id: dimensions[0]?.id || null,
        score_weight: 1,
        is_reverse_scored: false,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/questionnaires/manage")}>
              ← Volver
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              Editar: {questionnaire?.name}
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dimensions">
          <TabsList>
            <TabsTrigger value="dimensions">Dimensiones/Categorías</TabsTrigger>
            <TabsTrigger value="questions">Preguntas</TabsTrigger>
          </TabsList>

          <TabsContent value="dimensions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Dimensiones del Cuestionario</CardTitle>
                <CardDescription>
                  Define las categorías o dimensiones que evalúa este cuestionario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dimensions.map((dimension, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1 space-y-3">
                          <div>
                            <Label>Nombre</Label>
                            <Input
                              value={dimension.name}
                              onChange={(e) => {
                                const newDimensions = [...dimensions];
                                newDimensions[index].name = e.target.value;
                                setDimensions(newDimensions);
                              }}
                              placeholder="Ej: Activo, Reflexivo, Teórico"
                            />
                          </div>
                          <div>
                            <Label>Código</Label>
                            <Input
                              value={dimension.code}
                              onChange={(e) => {
                                const newDimensions = [...dimensions];
                                newDimensions[index].code = e.target.value;
                                setDimensions(newDimensions);
                              }}
                              placeholder="Código único (ej: active, reflective)"
                            />
                          </div>
                          <div>
                            <Label>Descripción</Label>
                            <Textarea
                              value={dimension.description}
                              onChange={(e) => {
                                const newDimensions = [...dimensions];
                                newDimensions[index].description = e.target.value;
                                setDimensions(newDimensions);
                              }}
                              placeholder="Describe qué mide esta dimensión"
                            />
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDimensions(dimensions.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex gap-2">
                  <Button onClick={addDimension} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Dimensión
                  </Button>
                  <Button onClick={() => saveDimensionsMutation.mutate()}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Dimensiones
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Preguntas del Cuestionario</CardTitle>
                <CardDescription>
                  Configura las preguntas y su asociación con las dimensiones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Número</Label>
                              <Input
                                type="number"
                                value={question.question_number}
                                onChange={(e) => {
                                  const newQuestions = [...questions];
                                  newQuestions[index].question_number = parseInt(e.target.value);
                                  setQuestions(newQuestions);
                                }}
                              />
                            </div>
                            <div>
                              <Label>Dimensión</Label>
                              <select
                                className="w-full border rounded-md px-3 py-2 bg-background"
                                value={question.dimension_id || ""}
                                onChange={(e) => {
                                  const newQuestions = [...questions];
                                  newQuestions[index].dimension_id = e.target.value || null;
                                  setQuestions(newQuestions);
                                }}
                              >
                                <option value="">Sin dimensión</option>
                                {dimensions.map((dim) => (
                                  <option key={dim.id} value={dim.id}>
                                    {dim.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <Label>Pregunta</Label>
                            <Textarea
                              value={question.question_text}
                              onChange={(e) => {
                                const newQuestions = [...questions];
                                newQuestions[index].question_text = e.target.value;
                                setQuestions(newQuestions);
                              }}
                              placeholder="Escribe la pregunta"
                            />
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setQuestions(questions.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex gap-2">
                  <Button onClick={addQuestion} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Pregunta
                  </Button>
                  <Button onClick={() => saveQuestionsMutation.mutate()}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Preguntas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
