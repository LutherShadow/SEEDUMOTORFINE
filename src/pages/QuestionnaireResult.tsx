import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Download } from "lucide-react";
import type { ReportType } from "@/lib/reportTypeTemplates";

export default function QuestionnaireResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch response
  const { data: response, isLoading } = useQuery({
    queryKey: ["questionnaire-response", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questionnaire_responses")
        .select(`
          *,
          questionnaires:questionnaire_id (name, type, description),
          children:child_id (name, birth_date)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      
      // Fetch dimensions for this questionnaire
      if (data && data.questionnaire_id) {
        const { data: dimensions } = await supabase
          .from("questionnaire_dimensions")
          .select("id, name, code")
          .eq("questionnaire_id", data.questionnaire_id);
        
        if (dimensions && data.dimension_scores) {
          const dimensionMap = new Map(
            dimensions.map((d) => [d.id, d.name])
          );
          
          // Convert dimension_scores from {uuid: score} to {name: score}
          const scores = data.dimension_scores as Record<string, number>;
          const namedScores: Record<string, number> = {};
          
          Object.entries(scores).forEach(([dimensionId, score]) => {
            const dimensionName = dimensionMap.get(dimensionId) || dimensionId;
            namedScores[dimensionName] = score;
          });
          
          data.dimension_scores = namedScores;
          
          // Map dominant and secondary dimensions
          if (data.dominant_dimension && dimensionMap.has(data.dominant_dimension)) {
            data.dominant_dimension = dimensionMap.get(data.dominant_dimension) || data.dominant_dimension;
          }
          if (data.secondary_dimension && dimensionMap.has(data.secondary_dimension)) {
            data.secondary_dimension = dimensionMap.get(data.secondary_dimension) || data.secondary_dimension;
          }
        }
      }
      
      return data;
    },
  });

  const generatePDF = async () => {
    if (!response) return;

    // Determinar reportType a partir del tipo de cuestionario
    const questionnaireType = response.questionnaires?.type?.toLowerCase();
    const reportTypeMap: Record<string, ReportType> = {
      tam: 'tam',
      chaea: 'chaea',
      cornell: 'cornell',
    };
    const reportType: ReportType = reportTypeMap[questionnaireType || ''] || 'tam';

    // Usar el generador unificado de reportes para aplicar plantillas y estilos
    const { generateReportPDF } = await import('@/lib/ReportPDFGenerator');

    const childName = response.children?.name || 'Aprendiente';
    const evaluationDate = response.response_date || new Date().toISOString();

    await generateReportPDF({
      childName,
      reportType,
      evaluationDate,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Cargando resultado...</p>
      </div>
    );
  }

  const scores = (response?.dimension_scores as Record<string, number>) || {};

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/questionnaires")}>
              ← Volver
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Resultado del Cuestionario</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="font-semibold">Cuestionario:</span>{" "}
              {response?.questionnaires?.name}
            </p>
            <p>
              <span className="font-semibold">Tipo:</span>{" "}
              {response?.questionnaires?.type}
            </p>
            <p>
              <span className="font-semibold">Alumno:</span>{" "}
              {response?.children?.name}
            </p>
            <p>
              <span className="font-semibold">Fecha de aplicación:</span>{" "}
              {new Date(response?.response_date || "").toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resultados por Dimensión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const scoreValues = Object.values(scores);
                const maxScore = Math.max(...scoreValues, 1);
                // Determine if this is a high-range questionnaire (like TAM with scores > 10)
                const isHighRange = maxScore > 10;
                const normalizer = isHighRange ? maxScore : 5;
                
                return Object.entries(scores).map(([dimension, score]) => (
                  <div key={dimension}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm sm:text-base break-words max-w-[60%]">{dimension}</span>
                      <span className="text-primary font-semibold text-sm sm:text-base whitespace-nowrap">{score.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5 sm:h-3">
                      <div
                        className="bg-primary rounded-full h-2.5 sm:h-3 transition-all"
                        style={{ width: `${Math.min((score / normalizer) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>

        {response?.dominant_dimension && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Análisis de Resultados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-semibold">Dimensión Dominante:</span>{" "}
                <span className="text-primary text-lg">{response.dominant_dimension}</span>
              </div>
              {response.secondary_dimension && (
                <div>
                  <span className="font-semibold">Dimensión Secundaria:</span>{" "}
                  <span className="text-primary">{response.secondary_dimension}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {response?.notes && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Notas del Evaluador</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{response.notes}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button onClick={() => navigate("/questionnaires")} variant="outline" className="flex-1">
            Volver a Cuestionarios
          </Button>
          <Button onClick={generatePDF} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </main>
    </div>
  );
}
