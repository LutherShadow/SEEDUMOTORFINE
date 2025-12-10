import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Child {
  id: string;
  name: string;
}

interface Activity {
  id: number;
  name: string;
  skill: string;
  isPersonalized?: boolean;
  originalActivityId?: number; // Si reemplaza una actividad estándar
  personalizedId?: string; // ID de la actividad personalizada en la DB
}

// Actividades estándar del sistema
const STANDARD_ACTIVITIES: Activity[] = [
  { id: 1, name: "Juego de Pesca", skill: "Coordinación ojo-mano al sujetar la caña y atrapar los peces" },
  { id: 2, name: "Pesca con imán", skill: "Precisión en el uso del imán para atraer objetos pequeños" },
  { id: 3, name: "Ensartado", skill: "Coordinación y precisión para insertar cuentas en el cordón" },
  { id: 4, name: "Enroscar botellas", skill: "Fuerza y precisión en el movimiento de giro para enroscar tapas" },
  { id: 5, name: "Laberintos con crayón", skill: "Control del trazo y direccionalidad al seguir el laberinto" },
  { id: 6, name: "Laberintos con dáctilo pintura", skill: "Coordinación y control del trazo con pintura dactilar" },
  { id: 7, name: "Juego de lanzamiento con muñecas", skill: "Precisión en el agarre y manipulación al vestir/desvestir muñecas" },
  { id: 8, name: "Juego del candado", skill: "Coordinación y precisión para manipular una llave y abrir candado" }
];

const SCORE_LABELS = [
  { value: 1, label: "No alcanza", description: "No logra realizar la actividad" },
  { value: 2, label: "Próximo a alcanzar", description: "Intenta con dificultad" },
  { value: 3, label: "Alcanza", description: "Completa con apoyo ocasional" },
  { value: 4, label: "Domina", description: "Realiza de forma autónoma" },
  { value: 5, label: "Sobresaliente", description: "Ejecuta con fluidez y precisión" }
];

interface EvaluationFormProps {
  children: Child[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const EvaluationForm = ({ children, onSubmit, onCancel }: EvaluationFormProps) => {
  const [evaluationType, setEvaluationType] = useState<"individual" | "group">("individual");
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
  const [evaluationDate, setEvaluationDate] = useState(new Date().toISOString().split('T')[0]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [observations, setObservations] = useState<Record<string, string>>({});
  
  // Actividades disponibles para el aprendiente seleccionado
  const [availableActivities, setAvailableActivities] = useState<Activity[]>(STANDARD_ACTIVITIES);
  const [personalizedActivities, setPersonalizedActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Cargar actividades personalizadas cuando se selecciona un aprendiente en modo individual
  useEffect(() => {
    if (evaluationType === "individual" && selectedChildren.length === 1) {
      loadPersonalizedActivities(selectedChildren[0]);
    } else {
      // En modo grupal o sin selección, usar solo actividades estándar
      setAvailableActivities(STANDARD_ACTIVITIES);
      setPersonalizedActivities([]);
    }
  }, [evaluationType, selectedChildren]);

  const loadPersonalizedActivities = async (childId: string) => {
    setLoadingActivities(true);
    try {
      const { data, error } = await supabase
        .from("personalized_activities")
        .select("*")
        .eq("child_id", childId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPersonalizedActivities(data || []);

      // Crear lista de actividades combinando estándar y personalizadas
      const combinedActivities: Activity[] = [];
      const replacedActivityIds = new Set<number>();

      // Primero, identificar qué actividades estándar están reemplazadas
      (data || []).forEach((pa: any) => {
        if (pa.replaces_activity_id) {
          replacedActivityIds.add(pa.replaces_activity_id);
        }
      });

      // Agregar actividades estándar (excepto las reemplazadas)
      STANDARD_ACTIVITIES.forEach(activity => {
        if (!replacedActivityIds.has(activity.id)) {
          combinedActivities.push(activity);
        }
      });

      // Agregar actividades personalizadas
      (data || []).forEach((pa: any, index: number) => {
        const targetSkills = Array.isArray(pa.target_skills) 
          ? pa.target_skills.join(', ') 
          : (typeof pa.target_skills === 'string' ? pa.target_skills : pa.description);

        if (pa.replaces_activity_id) {
          // Insertar en la posición de la actividad reemplazada
          const replaceIndex = combinedActivities.findIndex(a => a.id === pa.replaces_activity_id);
          const newActivity: Activity = {
            id: pa.replaces_activity_id, // Mantener el ID para que se guarde correctamente
            name: pa.activity_name,
            skill: targetSkills,
            isPersonalized: true,
            originalActivityId: pa.replaces_activity_id,
            personalizedId: pa.id
          };
          
          if (replaceIndex >= 0) {
            combinedActivities.splice(replaceIndex, 0, newActivity);
          } else {
            combinedActivities.push(newActivity);
          }
        } else {
          // Actividad adicional (no reemplaza ninguna)
          combinedActivities.push({
            id: 100 + index, // IDs altos para actividades adicionales
            name: pa.activity_name,
            skill: targetSkills,
            isPersonalized: true,
            personalizedId: pa.id
          });
        }
      });

      // Ordenar por ID para mantener consistencia
      combinedActivities.sort((a, b) => a.id - b.id);

      setAvailableActivities(combinedActivities);
    } catch (error) {
      console.error('Error loading personalized activities:', error);
      setAvailableActivities(STANDARD_ACTIVITIES);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleActivityToggle = (activityId: number) => {
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleChildToggle = (childId: string) => {
    setSelectedChildren(prev => {
      if (evaluationType === "individual") {
        // En modo individual, solo permitir un aprendiente
        return prev.includes(childId) ? [] : [childId];
      }
      return prev.includes(childId)
        ? prev.filter(id => id !== childId)
        : [...prev, childId];
    });
    
    // Limpiar selección de actividades al cambiar de aprendiente
    setSelectedActivities([]);
    setScores({});
    setObservations({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const childrenToEvaluate = evaluationType === "individual" 
      ? selectedChildren.slice(0, 1)
      : selectedChildren;

    const evaluations = childrenToEvaluate.map(childId => {
      const evaluationData: any = {
        child_id: childId,
        evaluation_date: evaluationDate
      };

      selectedActivities.forEach(activityId => {
        // Para actividades personalizadas con ID >= 100, necesitamos manejarlas diferente
        // Por ahora, las actividades personalizadas que reemplazan mantienen el ID original
        const testId = activityId <= 8 ? activityId : null;
        
        if (testId) {
          evaluationData[`test_${testId}_score`] = scores[`${childId}_${activityId}`] 
            ? parseInt(scores[`${childId}_${activityId}`]) 
            : null;
          evaluationData[`test_${testId}_observations`] = observations[`${childId}_${activityId}`] || null;
        }
      });

      return evaluationData;
    });

    await onSubmit(evaluations);
  };

  const hasPersonalizedActivities = personalizedActivities.length > 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full max-h-[calc(90vh-8rem)]">
      <ScrollArea className="flex-1 pr-4 min-h-0">
        <div className="space-y-6 pb-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tipo de Evaluación</Label>
            <RadioGroup 
              value={evaluationType} 
              onValueChange={(value: any) => {
                setEvaluationType(value);
                setSelectedChildren([]);
                setSelectedActivities([]);
                setScores({});
                setObservations({});
              }}
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual" className="cursor-pointer flex-1">
                  Individual
                  <span className="text-xs text-muted-foreground ml-2">(incluye actividades personalizadas)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer">
                <RadioGroupItem value="group" id="group" />
                <Label htmlFor="group" className="cursor-pointer flex-1">
                  Grupal
                  <span className="text-xs text-muted-foreground ml-2">(actividades estándar del sistema)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Fecha de Evaluación *</Label>
            <input
              type="date"
              className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm transition-colors hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={evaluationDate}
              onChange={(e) => setEvaluationDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Seleccionar {evaluationType === "individual" ? "Aprendiente" : "Aprendientes"} *</Label>
            <Card className="p-4 space-y-2 border-2 hover:border-primary/30 transition-colors">
              <ScrollArea className="h-[150px]">
                <div className="space-y-2 pr-4">
                  {children.map(child => (
                    <div key={child.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/50 transition-colors">
                      <Checkbox
                        id={`child-${child.id}`}
                        checked={selectedChildren.includes(child.id)}
                        onCheckedChange={() => handleChildToggle(child.id)}
                        disabled={evaluationType === "individual" && selectedChildren.length > 0 && !selectedChildren.includes(child.id)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label htmlFor={`child-${child.id}`} className="cursor-pointer flex-1 font-medium">{child.name}</Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Seleccionar Actividades a Evaluar *</Label>
              {hasPersonalizedActivities && evaluationType === "individual" && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 gap-1">
                  <Sparkles className="h-3 w-3" />
                  {personalizedActivities.length} personalizada(s)
                </Badge>
              )}
            </div>
            
            {loadingActivities ? (
              <Card className="p-4 border-2">
                <p className="text-center text-muted-foreground">Cargando actividades...</p>
              </Card>
            ) : (
              <Card className="p-4 space-y-2 border-2 hover:border-primary/30 transition-colors">
                {hasPersonalizedActivities && evaluationType === "individual" && (
                  <div className="mb-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Este aprendiente tiene actividades personalizadas por IA. Las actividades marcadas con ✨ reemplazan o complementan las estándar.
                    </p>
                  </div>
                )}
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2 pr-4">
                    {availableActivities.map(activity => (
                      <div key={activity.id} className="space-y-1">
                        <div className={`flex items-center space-x-3 p-3 rounded-md hover:bg-accent/50 transition-colors ${activity.isPersonalized ? 'bg-primary/5 border border-primary/20' : ''}`}>
                          <Checkbox
                            id={`activity-${activity.id}`}
                            checked={selectedActivities.includes(activity.id)}
                            onCheckedChange={() => handleActivityToggle(activity.id)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <div className="flex-1">
                            <Label htmlFor={`activity-${activity.id}`} className="cursor-pointer font-medium flex items-center gap-2">
                              {activity.name}
                              {activity.isPersonalized && (
                                <Badge variant="secondary" className="bg-primary/20 text-primary text-xs gap-1">
                                  <Sparkles className="h-3 w-3" />
                                  IA
                                </Badge>
                              )}
                              {activity.originalActivityId && (
                                <span className="text-xs text-muted-foreground">
                                  (reemplaza #{activity.originalActivityId})
                                </span>
                              )}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">{activity.skill}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            )}
          </div>
        </div>

        {selectedChildren.length > 0 && selectedActivities.length > 0 && (
          <div className="space-y-6 pt-4 border-t-2 border-primary/20">
            <h3 className="text-lg font-semibold text-primary">Evaluaciones</h3>
            <div className="space-y-6">
              {selectedChildren.map(childId => {
                const child = children.find(c => c.id === childId);
                return (
                  <Card key={childId} className="p-5 border-2 hover:border-primary/30 transition-colors animate-fade-in">
                    <h3 className="font-semibold text-lg mb-4 text-primary">{child?.name}</h3>
                    <div className="space-y-4">
                      {selectedActivities.map(activityId => {
                        const activity = availableActivities.find(a => a.id === activityId);
                        const key = `${childId}_${activityId}`;
                        
                        return (
                          <Card key={activityId} className={`p-4 border hover:border-primary/40 transition-all hover:shadow-md ${activity?.isPersonalized ? 'bg-primary/5' : 'bg-accent/30'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-base">{activity?.name}</h4>
                              {activity?.isPersonalized && (
                                <Badge variant="secondary" className="bg-primary/20 text-primary text-xs gap-1">
                                  <Sparkles className="h-3 w-3" />
                                  Personalizada
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 italic">{activity?.skill}</p>
                            
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label className="font-semibold">Puntuación *</Label>
                                <Select
                                  value={scores[key] || ""}
                                  onValueChange={(value) => setScores({ ...scores, [key]: value })}
                                  required
                                >
                                  <SelectTrigger className="h-11 border-2 hover:border-primary/50 transition-colors">
                                    <SelectValue placeholder="Seleccionar puntuación" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {SCORE_LABELS.map((score) => (
                                      <SelectItem key={score.value} value={score.value.toString()}>
                                        {score.value} - {score.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="font-semibold">Observaciones</Label>
                                <Textarea
                                  value={observations[key] || ""}
                                  onChange={(e) => setObservations({ ...observations, [key]: e.target.value })}
                                  rows={3}
                                  placeholder="Observaciones específicas para esta actividad..."
                                  className="border-2 hover:border-primary/50 focus:border-primary transition-colors resize-none"
                                />
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="flex gap-3 justify-end pt-4 pb-2 border-t border-border/50 bg-background/95 backdrop-blur-sm shrink-0">
        <Button type="button" variant="outline" onClick={onCancel} className="min-w-[120px] h-11">
          Cancelar
        </Button>
        <Button 
          type="submit"
          disabled={selectedChildren.length === 0 || selectedActivities.length === 0}
          className="min-w-[120px] h-11"
        >
          Guardar Evaluación
        </Button>
      </div>
    </form>
  );
};
