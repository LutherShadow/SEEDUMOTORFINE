import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ParentQuestionnairePublic() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'code' | 'questionnaire'>('code');
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationData, setValidationData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");

  const validateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error("Por favor ingrese el código de verificación");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://tctypxdamgmqrlswmxqg.supabase.co/functions/v1/validate-parent-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: code.toUpperCase().trim() })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.valid) {
        toast.error(data.error || "Código inválido o expirado");
        return;
      }

      setValidationData(data);
      setQuestions(data.questions || []);
      setStep('questionnaire');
      toast.success(`Cuestionario cargado para ${data.child.name}`);
    } catch (error: any) {
      console.error('Error validating code:', error);
      toast.error(error.message || "Error al validar el código");
    } finally {
      setLoading(false);
    }
  };

  const calculateScores = () => {
    // Build dimension map
    const dimensions = validationData?.dimensions || [];
    const dimensionMap = new Map<string, { name: string; sum: number; count: number }>();
    
    dimensions.forEach((dim: any) => {
      dimensionMap.set(dim.id, { name: dim.name, sum: 0, count: 0 });
    });

    questions.forEach((question) => {
      const response = responses[question.id];
      if (response !== undefined && question.dimension_id) {
        const score = question.is_reverse_scored ? (6 - response) : response;
        const weight = question.score_weight || 1;
        
        const dimData = dimensionMap.get(question.dimension_id);
        if (dimData) {
          dimData.sum += score * weight;
          dimData.count += 1;
        }
      }
    });

    // Convert to named dimension scores
    const dimensionScores: Record<string, number> = {};
    const dimensionAverages: Array<[string, number]> = [];
    
    dimensionMap.forEach((data) => {
      if (data.count > 0) {
        const avgScore = data.sum / data.count;
        dimensionScores[data.name] = avgScore;
        dimensionAverages.push([data.name, avgScore]);
      }
    });

    const sortedDimensions = dimensionAverages.sort(([, a], [, b]) => b - a);

    return {
      dimensionScores,
      dominantDimension: sortedDimensions[0]?.[0] || null,
      secondaryDimension: sortedDimensions[1]?.[0] || null
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.keys(responses).length !== questions.length) {
      toast.error("Por favor responda todas las preguntas");
      return;
    }

    setSubmitting(true);

    try {
      const { dimensionScores, dominantDimension, secondaryDimension } = calculateScores();

      const response = await fetch(
        `https://tctypxdamgmqrlswmxqg.supabase.co/functions/v1/submit-parent-response`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: code.toUpperCase().trim(),
            responses: responses,
            dimensionScores: dimensionScores,
            dominantDimension: dominantDimension,
            secondaryDimension: secondaryDimension,
            notes: notes.trim() || null
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error al enviar el cuestionario");
      }

      toast.success("¡Cuestionario enviado exitosamente! Gracias por su participación.");
      setTimeout(() => {
        setStep('code');
        setCode("");
        setResponses({});
        setNotes("");
        setValidationData(null);
        setQuestions([]);
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting response:', error);
      toast.error(error.message || "Error al enviar el cuestionario");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'code') {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Cuestionario para Padres de Familia</CardTitle>
              <CardDescription>
                Ingrese el código de verificación proporcionado por el docente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={validateCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código de Verificación</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Ejemplo: ABC123"
                    className="text-center text-2xl font-mono tracking-wider"
                    maxLength={6}
                    disabled={loading}
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    El código consta de 6 caracteres (letras y números)
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !code.trim()}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continuar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { child, questionnaire } = validationData;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{questionnaire.name}</CardTitle>
            <CardDescription>
              Cuestionario para: <span className="font-semibold text-foreground">{child.name}</span>
            </CardDescription>
            {questionnaire.description && (
              <p className="text-sm text-muted-foreground mt-2">{questionnaire.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {questions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {index + 1}. {question.question_text}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={responses[question.id]?.toString()}
                      onValueChange={(value) =>
                        setResponses({ ...responses, [question.id]: parseInt(value) })
                      }
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id={`${question.id}-1`} />
                          <Label htmlFor={`${question.id}-1`}>1 - Totalmente en desacuerdo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2" id={`${question.id}-2`} />
                          <Label htmlFor={`${question.id}-2`}>2 - En desacuerdo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3" id={`${question.id}-3`} />
                          <Label htmlFor={`${question.id}-3`}>3 - Neutral</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="4" id={`${question.id}-4`} />
                          <Label htmlFor={`${question.id}-4`}>4 - De acuerdo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="5" id={`${question.id}-5`} />
                          <Label htmlFor={`${question.id}-5`}>5 - Totalmente de acuerdo</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              ))}

              <div className="space-y-2">
                <Label htmlFor="notes">Comentarios adicionales (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Si desea agregar algún comentario o información adicional..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep('code');
                    setCode("");
                    setResponses({});
                    setNotes("");
                  }}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || Object.keys(responses).length !== questions.length}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar Cuestionario
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
