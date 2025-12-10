import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Ban, Copy, XCircle, CheckCircle, Clock, Link2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { GenerateParentLinkDialog } from "@/components/GenerateParentLinkDialog";

export default function ParentLinks() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  // Fetch parent access tokens
  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ["parent-tokens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parent_access_tokens")
        .select(`
          *,
          children:child_id (name),
          questionnaires:questionnaire_id (name, type)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch children for dialog
  const { data: children = [] } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Fetch questionnaires for dialog
  const { data: questionnaires = [] } = useQuery({
    queryKey: ["questionnaires"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questionnaires")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (tokenId: string) => {
      const { error } = await supabase
        .from("parent_access_tokens")
        .update({ is_active: false })
        .eq("id", tokenId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-tokens"] });
      toast.success("Enlace desactivado");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al desactivar enlace");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (tokenId: string) => {
      const { error } = await supabase
        .from("parent_access_tokens")
        .delete()
        .eq("id", tokenId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-tokens"] });
      toast.success("Enlace eliminado");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al eliminar enlace");
    },
  });

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success("Código copiado al portapapeles");
  };

  const getStatusBadge = (token: any) => {
    if (!token.is_active) {
      return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Desactivado</Badge>;
    }
    if (token.used_at) {
      return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Usado</Badge>;
    }
    const now = new Date();
    const expires = new Date(token.expires_at);
    if (now > expires) {
      return <Badge variant="destructive"><Clock className="w-3 h-3 mr-1" />Expirado</Badge>;
    }
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
      <Clock className="w-3 h-3 mr-1" />Activo
    </Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/questionnaires")}>
              ← Volver
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Códigos de Verificación para Padres</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-muted-foreground">
            Gestiona los códigos de verificación enviados a padres de familia
          </p>
          <Button onClick={() => setShowGenerateDialog(true)}>
            <Link2 className="w-4 h-4 mr-2" />
            Generar Nuevo Código
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Cargando enlaces...</div>
        ) : tokens.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay códigos generados aún
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tokens.map((token: any) => (
              <Card key={token.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {token.children?.name}
                      </CardTitle>
                      <CardDescription>
                        Cuestionario: {token.questionnaires?.name}
                      </CardDescription>
                      {token.parent_name && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Para: {token.parent_name}
                          {token.parent_email && ` (${token.parent_email})`}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(token)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-2 items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Creado: {new Date(token.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2 items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Expira: {new Date(token.expires_at).toLocaleString()}</span>
                    </div>
                    {token.used_at && (
                      <div className="flex gap-2 items-center text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4" />
                        <span>Usado: {new Date(token.used_at).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="bg-muted px-3 py-2 rounded font-mono text-xl font-bold text-center tracking-wider">
                      {token.token}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(token.token)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Código
                      </Button>
                      {token.is_active && !token.used_at && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deactivateMutation.mutate(token.id)}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Desactivar
                        </Button>
                      )}
                      {(!token.is_active || token.used_at) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMutation.mutate(token.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <GenerateParentLinkDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        children={children}
        questionnaires={questionnaires}
      />
    </div>
  );
}
