import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, ExternalLink, Loader2 } from "lucide-react";

interface Child {
  id: string;
  name: string;
}

interface Questionnaire {
  id: string;
  name: string;
}

interface GenerateParentLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: Child[];
  questionnaires: Questionnaire[];
}

export function GenerateParentLinkDialog({
  open,
  onOpenChange,
  children,
  questionnaires
}: GenerateParentLinkDialogProps) {
  const [selectedChild, setSelectedChild] = useState("");
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  const handleGenerate = async () => {
    if (!selectedChild || !selectedQuestionnaire) {
      toast.error("Por favor seleccione un aprendiente y un cuestionario");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-parent-token', {
        body: {
          childId: selectedChild,
          questionnaireId: selectedQuestionnaire,
          expiresInDays: parseInt(expiresInDays),
          parentName: parentName.trim() || null,
          parentEmail: parentEmail.trim() || null
        }
      });

      if (error) throw error;

      setGeneratedCode(data.token);
      toast.success("Código de verificación generado exitosamente");
    } catch (error: any) {
      console.error('Error generating link:', error);
      toast.error(error.message || "Error al generar el enlace");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success("Código copiado al portapapeles");
  };

  const handleReset = () => {
    setSelectedChild("");
    setSelectedQuestionnaire("");
    setParentName("");
    setParentEmail("");
    setExpiresInDays("30");
    setGeneratedCode("");
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Generar Código de Verificación para Padres</DialogTitle>
          <DialogDescription>
            Genere un código de verificación para que los padres respondan el cuestionario
          </DialogDescription>
        </DialogHeader>

        {!generatedCode ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="child">Aprendiente *</Label>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un aprendiente" />
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

            <div className="space-y-2">
              <Label htmlFor="questionnaire">Cuestionario *</Label>
              <Select value={selectedQuestionnaire} onValueChange={setSelectedQuestionnaire}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un cuestionario" />
                </SelectTrigger>
                <SelectContent>
                  {questionnaires.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentName">Nombre del Padre/Madre (opcional)</Label>
              <Input
                id="parentName"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Nombre completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentEmail">Email del Padre/Madre (opcional)</Label>
              <Input
                id="parentEmail"
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires">Válido por (días)</Label>
              <Input
                id="expires"
                type="number"
                min="1"
                max="365"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Código de Verificación Generado</Label>
              <div className="flex gap-2">
                <Input value={generatedCode} readOnly className="font-mono text-2xl font-bold text-center tracking-widest" />
                <Button onClick={handleCopy} size="icon" variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold">Instrucciones para el Padre/Madre:</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Ingrese a: <span className="font-mono font-semibold">https://seedumotorfine.netlify.app/questionnaires/parents</span></li>
                  <li>Introduzca el código: <span className="font-mono font-bold text-lg">{generatedCode}</span></li>
                  <li>Complete el cuestionario</li>
                </ol>
                <p className="text-xs text-muted-foreground pt-2">
                  Este código expirará en {expiresInDays} días y solo puede usarse una vez
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {!generatedCode ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleGenerate} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generar Código
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleReset}>
                Generar Otro
              </Button>
              <Button onClick={handleClose}>
                Cerrar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
