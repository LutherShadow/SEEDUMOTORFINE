import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, Target, TrendingUp, Package, Trash2, ChevronRight, Pencil, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface PersonalizedActivity {
  id: string;
  activity_name: string;
  activity_type: string;
  description: string;
  difficulty_level: string;
  target_skills: string[] | null;
  materials_needed: string[] | null;
  duration_minutes: number | null;
  repetitions_recommended: number | null;
  success_criteria: string | null;
  progression_notes: string | null;
  replaces_activity_id: number | null;
  ai_confidence: number | null;
  is_active: boolean | null;
}

interface Props {
  activities: PersonalizedActivity[];
  childId: string;
  childName: string;
  onActivitiesUpdated: () => void;
}

const DIFFICULTY_CONFIG = {
  basic: { label: "Básico", color: "bg-blue-500" },
  intermediate: { label: "Intermedio", color: "bg-yellow-500" },
  advanced: { label: "Avanzado", color: "bg-orange-500" },
  expert: { label: "Experto", color: "bg-red-500" }
};

const ACTIVITY_NAMES = [
  "Juego de Pesca",
  "Pesca con imán",
  "Ensartado",
  "Enroscar botellas",
  "Laberintos con crayón",
  "Laberintos con dáctilo pintura",
  "Juego de lanzamiento con muñecas",
  "Juego del candado"
];

export function PersonalizedActivities({ activities, childId, childName, onActivitiesUpdated }: Props) {
  const { toast } = useToast();
  const [selectedActivity, setSelectedActivity] = useState<PersonalizedActivity | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<PersonalizedActivity>>({});

  const startEditing = () => {
    if (selectedActivity) {
      setEditForm({
        activity_name: selectedActivity.activity_name || '',
        description: selectedActivity.description || '',
        difficulty_level: selectedActivity.difficulty_level || 'intermediate',
        materials_needed: selectedActivity.materials_needed || [],
        duration_minutes: selectedActivity.duration_minutes || 15,
        repetitions_recommended: selectedActivity.repetitions_recommended || 3,
        success_criteria: selectedActivity.success_criteria || '',
        progression_notes: selectedActivity.progression_notes || '',
        replaces_activity_id: selectedActivity.replaces_activity_id
      });
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const saveEdits = async () => {
    if (!selectedActivity) return;

    try {
      const { error } = await supabase
        .from('personalized_activities')
        .update({
          activity_name: editForm.activity_name,
          description: editForm.description,
          difficulty_level: editForm.difficulty_level,
          materials_needed: editForm.materials_needed,
          duration_minutes: editForm.duration_minutes,
          repetitions_recommended: editForm.repetitions_recommended,
          success_criteria: editForm.success_criteria,
          progression_notes: editForm.progression_notes,
          replaces_activity_id: editForm.replaces_activity_id
        })
        .eq('id', selectedActivity.id);

      if (error) throw error;

      toast({
        title: "Actividad actualizada",
        description: `"${editForm.activity_name}" se ha actualizado correctamente`
      });

      setIsEditing(false);
      setIsDialogOpen(false);
      onActivitiesUpdated();
    } catch (error: any) {
      console.error('Error updating activity:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la actividad",
        variant: "destructive"
      });
    }
  };

  const handleApplyActivity = async (activity: PersonalizedActivity) => {
    try {
      const { error: updateError } = await supabase
        .from('personalized_activities')
        .update({
          is_active: true,
          applied_at: new Date().toISOString(),
          applied_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', activity.id);

      if (updateError) throw updateError;

      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const { error: suggestionError } = await supabase
        .from('applied_suggestions')
        .insert({
          child_id: childId,
          suggestion_type: 'personalized_activity',
          suggestion_content: activity as any,
          applied_by: userId,
          status: 'applied'
        });

      if (suggestionError) throw suggestionError;

      toast({
        title: "Actividad aplicada",
        description: `"${activity.activity_name}" se usará en futuras evaluaciones de ${childName}`
      });

      setIsDialogOpen(false);
      onActivitiesUpdated();
    } catch (error: any) {
      console.error('Error applying activity:', error);
      toast({
        title: "Error",
        description: "No se pudo aplicar la actividad",
        variant: "destructive"
      });
    }
  };

  const handleDeactivateActivity = async (activity: PersonalizedActivity) => {
    try {
      const { error } = await supabase
        .from('personalized_activities')
        .update({ is_active: false })
        .eq('id', activity.id);

      if (error) throw error;

      toast({
        title: "Actividad desactivada",
        description: `"${activity.activity_name}" ya no se usará en evaluaciones`
      });

      setIsDialogOpen(false);
      onActivitiesUpdated();
    } catch (error: any) {
      console.error('Error deactivating activity:', error);
      toast({
        title: "Error",
        description: "No se pudo desactivar la actividad",
        variant: "destructive"
      });
    }
  };

  const handleDeleteActivity = async (activity: PersonalizedActivity) => {
    try {
      const { error } = await supabase
        .from('personalized_activities')
        .delete()
        .eq('id', activity.id);

      if (error) throw error;

      toast({
        title: "Sugerencia eliminada",
        description: `"${activity.activity_name}" ha sido eliminada`
      });

      setIsDialogOpen(false);
      onActivitiesUpdated();
    } catch (error: any) {
      console.error('Error deleting activity:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la actividad",
        variant: "destructive"
      });
    }
  };

  if (!activities || activities.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-2">
        {activities.map((activity) => {
          const difficultyConfig = DIFFICULTY_CONFIG[activity.difficulty_level as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG.intermediate;

          return (
            <div
              key={activity.id}
              className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
              onClick={() => {
                setSelectedActivity(activity);
                setIsEditing(false);
                setIsDialogOpen(true);
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-base">{activity.activity_name || 'Actividad sin nombre'}</h4>
                    <Badge className={difficultyConfig.color} variant="secondary">
                      {difficultyConfig.label}
                    </Badge>
                    {activity.is_active && (
                      <Badge variant="default" className="bg-green-600">
                        ✓ Activa
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {activity.description || activity.activity_type || 'Sin descripción'}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      {selectedActivity && (
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setIsEditing(false);
            setEditForm({});
          }
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                {isEditing ? (
                  <Input
                    value={editForm.activity_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, activity_name: e.target.value })}
                    className="font-semibold text-lg"
                    placeholder="Nombre de la actividad"
                  />
                ) : (
                  <DialogTitle>{selectedActivity.activity_name || 'Actividad sin nombre'}</DialogTitle>
                )}
                {!isEditing && (
                  <Badge className={DIFFICULTY_CONFIG[selectedActivity.difficulty_level as keyof typeof DIFFICULTY_CONFIG]?.color || "bg-gray-500"}>
                    {DIFFICULTY_CONFIG[selectedActivity.difficulty_level as keyof typeof DIFFICULTY_CONFIG]?.label || "Intermedio"}
                  </Badge>
                )}
                {!isEditing && selectedActivity.is_active && (
                  <Badge variant="default" className="bg-green-600">
                    ✓ Activa
                  </Badge>
                )}
              </div>
              {isEditing ? (
                <Textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Descripción de la actividad"
                  rows={2}
                />
              ) : (
                <DialogDescription>
                  {selectedActivity.description || 'Sin descripción'}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="space-y-4 py-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nivel de dificultad</Label>
                      <Select
                        value={editForm.difficulty_level || 'intermediate'}
                        onValueChange={(value) => setEditForm({ ...editForm, difficulty_level: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Básico</SelectItem>
                          <SelectItem value="intermediate">Intermedio</SelectItem>
                          <SelectItem value="advanced">Avanzado</SelectItem>
                          <SelectItem value="expert">Experto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Reemplaza actividad</Label>
                      <Select
                        value={editForm.replaces_activity_id?.toString() || 'new'}
                        onValueChange={(value) => setEditForm({ 
                          ...editForm, 
                          replaces_activity_id: value === 'new' ? null : parseInt(value) 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Nueva actividad (no reemplaza)</SelectItem>
                          {ACTIVITY_NAMES.map((name, index) => (
                            <SelectItem key={index + 1} value={(index + 1).toString()}>
                              {index + 1}. {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Duración (minutos)</Label>
                      <Input
                        type="number"
                        value={editForm.duration_minutes || 15}
                        onChange={(e) => setEditForm({ ...editForm, duration_minutes: parseInt(e.target.value) || 15 })}
                        min={1}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Repeticiones recomendadas</Label>
                      <Input
                        type="number"
                        value={editForm.repetitions_recommended || 3}
                        onChange={(e) => setEditForm({ ...editForm, repetitions_recommended: parseInt(e.target.value) || 3 })}
                        min={1}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Materiales necesarios (separados por coma)</Label>
                    <Input
                      value={Array.isArray(editForm.materials_needed) ? editForm.materials_needed.join(', ') : ''}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        materials_needed: e.target.value.split(',').map(m => m.trim()).filter(Boolean)
                      })}
                      placeholder="Lápiz, papel, tijeras..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Criterios de éxito</Label>
                    <Textarea
                      value={editForm.success_criteria || ''}
                      onChange={(e) => setEditForm({ ...editForm, success_criteria: e.target.value })}
                      placeholder="Criterios para evaluar el éxito de la actividad"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notas de progresión</Label>
                    <Textarea
                      value={editForm.progression_notes || ''}
                      onChange={(e) => setEditForm({ ...editForm, progression_notes: e.target.value })}
                      placeholder="Pasos o instrucciones para la actividad"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-primary mt-1" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Habilidades objetivo:</p>
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(selectedActivity.target_skills) && selectedActivity.target_skills.length > 0
                              ? selectedActivity.target_skills.join(', ')
                              : 'No especificado'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 text-primary mt-1" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Materiales necesarios:</p>
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(selectedActivity.materials_needed) && selectedActivity.materials_needed.length > 0
                              ? selectedActivity.materials_needed.join(', ')
                              : 'No especificado'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-primary mt-1" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Duración y repeticiones:</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedActivity.duration_minutes || 0} min × {selectedActivity.repetitions_recommended || 0} veces
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-primary mt-1" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Reemplaza:</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedActivity.replaces_activity_id 
                              ? ACTIVITY_NAMES[selectedActivity.replaces_activity_id - 1] 
                              : 'Nueva actividad (no reemplaza ninguna)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t">
                    <div>
                      <p className="font-medium text-sm mb-1">Criterios de éxito:</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedActivity.success_criteria || 'No especificado'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-1">Notas de progresión:</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedActivity.progression_notes || 'No especificado'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>Tipo: {selectedActivity.activity_type || 'general'}</span>
                      <span>Confianza IA: {((selectedActivity.ai_confidence || 0) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={cancelEditing}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                  <div className="flex-1" />
                  <Button
                    onClick={saveEdits}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteActivity(selectedActivity)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={startEditing}
                    className="gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                  <div className="flex-1" />
                  {!selectedActivity.is_active ? (
                    <Button
                      onClick={() => handleApplyActivity(selectedActivity)}
                      className="gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Aplicar Actividad
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => handleDeactivateActivity(selectedActivity)}
                    >
                      Desactivar
                    </Button>
                  )}
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
