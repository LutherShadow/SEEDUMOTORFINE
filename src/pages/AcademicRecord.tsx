import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, TrendingUp, Award, FileText, Target, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Child {
  id: string;
  name: string;
  birth_date: string;
  gender: string | null;
  grade: string | null;
  school: string | null;
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

interface CompetencyIndex {
  id: string;
  overall_index: number;
  visual_motor_index: number | null;
  precision_index: number | null;
  coordination_index: number | null;
  strength_index: number | null;
  learning_velocity: number | null;
  trend: string | null;
  calculated_at: string;
  notes: string | null;
}

interface AppliedActivity {
  id: string;
  suggestion_type: string;
  suggestion_content: any;
  applied_at: string;
  effectiveness_rating: number | null;
  status: string | null;
  notes: string | null;
}

const ACTIVITIES = [
  "Trazar líneas rectas y curvas",
  "Recortar figuras con tijeras",
  "Ensartar cuentas o botones",
  "Modelar con plastilina",
  "Pintar con pincel fino",
  "Abrochar y desabrochar botones",
  "Completar laberintos",
  "Armar rompecabezas"
];

const AcademicRecord = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const childId = searchParams.get("childId");
  
  const [child, setChild] = useState<Child | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [competencyIndices, setCompetencyIndices] = useState<CompetencyIndex[]>([]);
  const [appliedActivities, setAppliedActivities] = useState<AppliedActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childId) {
      toast({
        title: "Error",
        description: "No se especificó un aprendiente",
        variant: "destructive"
      });
      navigate("/children");
      return;
    }

    fetchAcademicRecord();
  }, [childId]);

  const fetchAcademicRecord = async () => {
    if (!childId) return;

    try {
      setLoading(true);

      // Fetch child info
      const { data: childData, error: childError } = await supabase
        .from("children")
        .select("*")
        .eq("id", childId)
        .single();

      if (childError) throw childError;
      setChild(childData);

      // Fetch evaluations
      const { data: evaluationsData, error: evaluationsError } = await supabase
        .from("evaluations")
        .select("*")
        .eq("child_id", childId)
        .order("evaluation_date", { ascending: false });

      if (evaluationsError) throw evaluationsError;
      setEvaluations(evaluationsData || []);

      // Fetch competency indices
      const { data: indicesData, error: indicesError } = await supabase
        .from("competency_indices")
        .select("*")
        .eq("child_id", childId)
        .order("calculated_at", { ascending: false });

      if (indicesError) throw indicesError;
      setCompetencyIndices(indicesData || []);

      // Fetch applied activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("applied_suggestions")
        .select("*")
        .eq("child_id", childId)
        .order("applied_at", { ascending: false });

      if (activitiesError) throw activitiesError;
      setAppliedActivities(activitiesData || []);

    } catch (error: any) {
      console.error("Error fetching academic record:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el expediente académico",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculateAverageScore = (evaluation: Evaluation) => {
    const scores = [
      evaluation.test_1_score,
      evaluation.test_2_score,
      evaluation.test_3_score,
      evaluation.test_4_score,
      evaluation.test_5_score,
      evaluation.test_6_score,
      evaluation.test_7_score,
      evaluation.test_8_score,
    ].filter((score): score is number => score !== null);

    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const getScoreColor = (score: number) => {
    if (score >= 3) return "text-green-600 dark:text-green-400";
    if (score >= 2) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressColor = (index: number) => {
    if (index >= 80) return "bg-green-500";
    if (index >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando expediente académico...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No encontrado</CardTitle>
            <CardDescription>No se pudo encontrar el aprendiente</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/children")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Aprendientes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const latestCompetency = competencyIndices[0];
  const totalEvaluations = evaluations.length;
  const averageOverallScore = evaluations.length > 0
    ? evaluations.reduce((sum, evaluation) => sum + calculateAverageScore(evaluation), 0) / evaluations.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/children")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Expediente Académico</h1>
                <p className="text-muted-foreground">{child.name}</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Student Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Información Básica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{child.name}</p>
                <p className="text-sm text-muted-foreground">
                  {calculateAge(child.birth_date)} años • {child.gender || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Grado: {child.grade || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Evaluaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{totalEvaluations}</p>
                <p className="text-sm text-muted-foreground">
                  Total realizadas
                </p>
                {evaluations.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Última: {new Date(evaluations[0].evaluation_date).toLocaleDateString('es-ES')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4" />
                Promedio General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className={`text-2xl font-bold ${getScoreColor(averageOverallScore)}`}>
                  {averageOverallScore.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">
                  De 4.0 puntos
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Índice de Competencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {latestCompetency ? (
                  <>
                    <p className="text-2xl font-bold">{latestCompetency.overall_index.toFixed(1)}%</p>
                    <Progress 
                      value={latestCompetency.overall_index} 
                      className="h-2"
                    />
                    {latestCompetency.trend && (
                      <Badge variant={latestCompetency.trend === 'upward' ? 'default' : 'secondary'}>
                        {latestCompetency.trend === 'upward' ? 'Mejorando' : 
                         latestCompetency.trend === 'stable' ? 'Estable' : 'En desarrollo'}
                      </Badge>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin datos</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="evaluations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="evaluations">Historial de Evaluaciones</TabsTrigger>
            <TabsTrigger value="competency">Índices de Competencia</TabsTrigger>
            <TabsTrigger value="activities">Actividades Aplicadas</TabsTrigger>
            <TabsTrigger value="notes">Notas del Docente</TabsTrigger>
          </TabsList>

          <TabsContent value="evaluations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Evaluaciones</CardTitle>
                <CardDescription>
                  Registro completo de todas las evaluaciones realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {evaluations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay evaluaciones registradas
                  </p>
                ) : (
                  <div className="space-y-4">
                    {evaluations.map((evaluation) => {
                      const avgScore = calculateAverageScore(evaluation);
                      return (
                        <div key={evaluation.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {new Date(evaluation.evaluation_date).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <Badge className={getScoreColor(avgScore)}>
                              Promedio: {avgScore.toFixed(1)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {ACTIVITIES.map((activity, idx) => {
                              const scoreKey = `test_${idx + 1}_score` as keyof Evaluation;
                              const score = evaluation[scoreKey] as number | null;
                              return (
                                <div key={idx} className="space-y-1">
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {activity}
                                  </p>
                                  <p className={`text-sm font-medium ${score !== null ? getScoreColor(score) : ''}`}>
                                    {score !== null ? score.toFixed(1) : 'N/A'}
                                  </p>
                                </div>
                              );
                            })}
                          </div>

                          {evaluation.observations && (
                            <>
                              <Separator />
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Observaciones:</p>
                                <p className="text-sm text-muted-foreground">{evaluation.observations}</p>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competency" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Índices de Competencia</CardTitle>
                <CardDescription>
                  Evolución de las competencias motoras finas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {competencyIndices.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay índices de competencia calculados
                  </p>
                ) : (
                  <div className="space-y-4">
                    {competencyIndices.map((index) => (
                      <div key={index.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                              {new Date(index.calculated_at).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          <Badge>{index.overall_index.toFixed(1)}%</Badge>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Índice General</span>
                              <span className="font-medium">{index.overall_index.toFixed(1)}%</span>
                            </div>
                            <Progress value={index.overall_index} className="h-2" />
                          </div>

                          {index.visual_motor_index !== null && (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Visual-Motor</span>
                                <span className="font-medium">{index.visual_motor_index.toFixed(1)}%</span>
                              </div>
                              <Progress value={index.visual_motor_index} className="h-2" />
                            </div>
                          )}

                          {index.precision_index !== null && (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Precisión</span>
                                <span className="font-medium">{index.precision_index.toFixed(1)}%</span>
                              </div>
                              <Progress value={index.precision_index} className="h-2" />
                            </div>
                          )}

                          {index.coordination_index !== null && (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Coordinación</span>
                                <span className="font-medium">{index.coordination_index.toFixed(1)}%</span>
                              </div>
                              <Progress value={index.coordination_index} className="h-2" />
                            </div>
                          )}

                          {index.strength_index !== null && (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Fuerza</span>
                                <span className="font-medium">{index.strength_index.toFixed(1)}%</span>
                              </div>
                              <Progress value={index.strength_index} className="h-2" />
                            </div>
                          )}
                        </div>

                        {index.learning_velocity !== null && (
                          <div className="pt-2 border-t">
                            <p className="text-sm">
                              <span className="text-muted-foreground">Velocidad de aprendizaje:</span>{' '}
                              <span className="font-medium">{index.learning_velocity.toFixed(2)}</span>
                            </p>
                          </div>
                        )}

                        {index.notes && (
                          <>
                            <Separator />
                            <div className="space-y-1">
                              <p className="text-sm font-medium">Notas:</p>
                              <p className="text-sm text-muted-foreground">{index.notes}</p>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Actividades Personalizadas Aplicadas</CardTitle>
                <CardDescription>
                  Historial de actividades personalizadas y su efectividad
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appliedActivities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay actividades aplicadas registradas
                  </p>
                ) : (
                  <div className="space-y-4">
                    {appliedActivities.map((activity) => {
                      const content = activity.suggestion_content;
                      return (
                        <div key={activity.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-primary" />
                              <span className="font-medium">
                                {new Date(activity.applied_at).toLocaleDateString('es-ES')}
                              </span>
                            </div>
                            <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                              {activity.status || 'applied'}
                            </Badge>
                          </div>

                          {content && (
                            <div className="space-y-2">
                              <p className="font-medium">{content.activityName || 'Actividad personalizada'}</p>
                              <p className="text-sm text-muted-foreground">{content.description}</p>
                              
                              {content.targetSkills && (
                                <div className="flex flex-wrap gap-1">
                                  {content.targetSkills.map((skill: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {activity.effectiveness_rating !== null && (
                            <div className="pt-2 border-t">
                              <p className="text-sm">
                                <span className="text-muted-foreground">Efectividad:</span>{' '}
                                <span className="font-medium">{activity.effectiveness_rating}/5</span>
                              </p>
                              <Progress 
                                value={(activity.effectiveness_rating / 5) * 100} 
                                className="h-2 mt-1"
                              />
                            </div>
                          )}

                          {activity.notes && (
                            <>
                              <Separator />
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Notas del docente:</p>
                                <p className="text-sm text-muted-foreground">{activity.notes}</p>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notas del Docente</CardTitle>
                <CardDescription>
                  Todas las observaciones y notas registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Evaluation notes */}
                  {evaluations.filter(evaluation => evaluation.observations).length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">Observaciones de Evaluaciones</h3>
                      <div className="space-y-3">
                        {evaluations
                          .filter(evaluation => evaluation.observations)
                          .map((evaluation) => (
                            <div key={evaluation.id} className="border-l-2 border-primary pl-4 py-2">
                              <p className="text-sm text-muted-foreground mb-1">
                                {new Date(evaluation.evaluation_date).toLocaleDateString('es-ES')}
                              </p>
                              <p className="text-sm">{evaluation.observations}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Competency notes */}
                  {competencyIndices.filter(compIndex => compIndex.notes).length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">Notas de Índices de Competencia</h3>
                      <div className="space-y-3">
                        {competencyIndices
                          .filter(compIndex => compIndex.notes)
                          .map((index) => (
                            <div key={index.id} className="border-l-2 border-primary pl-4 py-2">
                              <p className="text-sm text-muted-foreground mb-1">
                                {new Date(index.calculated_at).toLocaleDateString('es-ES')}
                              </p>
                              <p className="text-sm">{index.notes}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Activity notes */}
                  {appliedActivities.filter(activity => activity.notes).length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">Notas de Actividades Aplicadas</h3>
                      <div className="space-y-3">
                        {appliedActivities
                          .filter(activity => activity.notes)
                          .map((activity) => (
                            <div key={activity.id} className="border-l-2 border-primary pl-4 py-2">
                              <p className="text-sm text-muted-foreground mb-1">
                                {new Date(activity.applied_at).toLocaleDateString('es-ES')}
                              </p>
                              <p className="text-sm">{activity.notes}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {evaluations.filter(evaluation => evaluation.observations).length === 0 &&
                   competencyIndices.filter(compIndex => compIndex.notes).length === 0 &&
                   appliedActivities.filter(activity => activity.notes).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No hay notas del docente registradas
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AcademicRecord;
