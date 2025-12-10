import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, Save, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function QuestionnaireManage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string | null>(null);

  const [newQuestionnaire, setNewQuestionnaire] = useState({
    name: "",
    description: "",
    type: "custom" as const,
  });

  // Fetch all questionnaires
  const { data: questionnaires = [], isLoading } = useQuery({
    queryKey: ["all-questionnaires"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questionnaires")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create questionnaire mutation
  const createQuestionnaireMutation = useMutation({
    mutationFn: async (questionnaireData: typeof newQuestionnaire) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const { data, error } = await supabase
        .from("questionnaires")
        .insert({
          ...questionnaireData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Cuestionario creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["all-questionnaires"] });
      setIsCreateOpen(false);
      setNewQuestionnaire({ name: "", description: "", type: "custom" });
      navigate(`/questionnaires/edit/${data.id}`);
    },
    onError: (error: any) => {
      toast.error("Error al crear cuestionario: " + error.message);
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("questionnaires")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Estado actualizado");
      queryClient.invalidateQueries({ queryKey: ["all-questionnaires"] });
    },
  });

  // Delete questionnaire mutation
  const deleteQuestionnaireMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("questionnaires")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cuestionario eliminado");
      queryClient.invalidateQueries({ queryKey: ["all-questionnaires"] });
    },
    onError: (error: any) => {
      toast.error("Error al eliminar: " + error.message);
    },
  });

  // Initialize questionnaires mutation
  const initializeQuestionnaires = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `https://tctypxdamgmqrlswmxqg.supabase.co/functions/v1/initialize-questionnaires`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al inicializar cuestionarios');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["all-questionnaires"] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleCreate = () => {
    if (!newQuestionnaire.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    createQuestionnaireMutation.mutate(newQuestionnaire);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/questionnaires")}>
              ← Volver
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Administrar Cuestionarios</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Alert className="mb-6">
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium mb-1">Cuestionarios Pre-configurados</p>
                <p className="text-sm text-muted-foreground">
                  Inicializa los cuestionarios oficiales: Cornell (44 preguntas), CHAEA (80 preguntas) y TAM (84 preguntas). 
                  Una vez creados, puedes personalizarlos y adaptarlos según tus necesidades.
                </p>
              </div>
              <Button 
                onClick={() => initializeQuestionnaires.mutate()}
                disabled={initializeQuestionnaires.isPending}
                variant="outline"
                className="ml-4 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${initializeQuestionnaires.isPending ? 'animate-spin' : ''}`} />
                Inicializar Cuestionarios
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <div className="mb-6 flex justify-between items-center">
          <p className="text-muted-foreground">
            Crea y gestiona cuestionarios personalizados
          </p>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Cuestionario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Cuestionario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={newQuestionnaire.name}
                    onChange={(e) => setNewQuestionnaire({ ...newQuestionnaire, name: e.target.value })}
                    placeholder="Ej: Cuestionario CHAEA"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newQuestionnaire.description}
                    onChange={(e) => setNewQuestionnaire({ ...newQuestionnaire, description: e.target.value })}
                    placeholder="Describe el propósito del cuestionario"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={newQuestionnaire.type}
                    onValueChange={(value: any) => setNewQuestionnaire({ ...newQuestionnaire, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cornell">Cornell</SelectItem>
                      <SelectItem value="chaea">CHAEA</SelectItem>
                      <SelectItem value="tam">TAM (Estilos de Aprendizaje)</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={createQuestionnaireMutation.isPending}>
                  Crear Cuestionario
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <div className="grid gap-4">
            {questionnaires.map((questionnaire) => (
              <Card key={questionnaire.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{questionnaire.name}</CardTitle>
                      <CardDescription>{questionnaire.description}</CardDescription>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-secondary px-2 py-1 rounded">
                          {questionnaire.type.toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${questionnaire.is_active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"}`}>
                          {questionnaire.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/questionnaires/edit/${questionnaire.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActiveMutation.mutate({ id: questionnaire.id, isActive: questionnaire.is_active })}
                      >
                        {questionnaire.is_active ? "Desactivar" : "Activar"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("¿Eliminar este cuestionario? Esta acción no se puede deshacer.")) {
                            deleteQuestionnaireMutation.mutate(questionnaire.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
