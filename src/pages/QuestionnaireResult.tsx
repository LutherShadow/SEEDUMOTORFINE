import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";

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

  const loadImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 142, g: 184, b: 181 };
  };

  const generatePDF = async () => {
    if (!response) return;

    // Determine report type from questionnaire type
    const questionnaireType = response.questionnaires?.type?.toLowerCase();
    const reportTypeMap: Record<string, string> = {
      'tam': 'tam',
      'chaea': 'chaea',
      'cornell': 'cornell'
    };
    const reportType = reportTypeMap[questionnaireType || ''] || 'tam';

    // Fetch report settings for the specific report type
    const { data: settings } = await supabase
      .from("report_settings")
      .select("*")
      .eq("report_type", reportType)
      .maybeSingle();
    
    // Merge dynamic_content if exists
    const dynamicContent = settings?.dynamic_content || {};
    const mergedSettings = settings ? { ...settings, ...dynamicContent } : null;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Get template for this report type
    const { getReportTypeTemplate } = await import('@/lib/reportTypeTemplates');
    const reportTemplate = getReportTypeTemplate(reportType as any);
    
    const primaryColor = mergedSettings?.primary_color || reportTemplate?.defaultConfig.primary_color || '#8EB8B5';
    const brandColor = hexToRgb(primaryColor);
    const logoUrls = Array.isArray(mergedSettings?.logo_urls) ? mergedSettings.logo_urls as string[] : [];
    const footerLogoUrls = Array.isArray(mergedSettings?.footer_logo_urls) ? mergedSettings.footer_logo_urls as string[] : [];
    const template = mergedSettings?.template || reportTemplate?.defaultConfig.template || 'modern';

    // ===== PÁGINA 1: PORTADA =====
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Background decorativo según template
    if (template === 'modern') {
      doc.setFillColor(brandColor.r, brandColor.g, brandColor.b);
      doc.rect(0, pageHeight - 60, pageWidth, 60, 'F');
    } else if (template === 'classic') {
      doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
      doc.setLineWidth(2);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    }

    // Logos en portada (centrados, tamaño grande)
    let yPos = 30;
    if (logoUrls.length > 0) {
      const logoSize = 50;
      const spacing = 15;
      const totalWidth = logoUrls.length * logoSize + (logoUrls.length - 1) * spacing;
      let xPos = (pageWidth - totalWidth) / 2;

      for (const logoUrl of logoUrls) {
        try {
          const img = await loadImage(logoUrl);
          doc.addImage(img, 'PNG', xPos, yPos, logoSize, logoSize * 0.6);
          xPos += logoSize + spacing;
        } catch (error) {
          console.error("Error loading logo:", error);
        }
      }
      yPos += 60;
    }

    // Company/Institution info
    if (mergedSettings?.content_company_name || reportTemplate?.defaultConfig.content_company_name) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
      doc.text(mergedSettings?.content_company_name || reportTemplate?.defaultConfig.content_company_name || "", pageWidth / 2, yPos, { align: "center" });
      yPos += 10;
    }

    // Título principal en portada
    yPos += 10;
    doc.setFillColor(brandColor.r, brandColor.g, brandColor.b);
    doc.rect(0, yPos, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("REPORTE DE CUESTIONARIO", pageWidth / 2, yPos + 15, { align: "center" });
    doc.setFontSize(16);
    doc.text(response.questionnaires?.name?.toUpperCase() || "CUESTIONARIO", pageWidth / 2, yPos + 27, { align: "center" });
    yPos += 55;

    // Información del aprendiente
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`Aprendiente: ${response.children?.name || "N/A"}`, pageWidth / 2, yPos, { align: "center" });
    yPos += 10;
    doc.text(`Tipo: ${response.questionnaires?.type || "N/A"}`, pageWidth / 2, yPos, { align: "center" });
    yPos += 10;
    doc.text(`Fecha: ${new Date(response.response_date).toLocaleDateString('es-ES')}`, pageWidth / 2, yPos, { align: "center" });
    yPos += 20;

    // Responsable
    if (mergedSettings?.content_responsible_agent || reportTemplate?.defaultConfig.content_responsible_agent) {
      doc.setFontSize(11);
      doc.text(`Responsable: ${mergedSettings?.content_responsible_agent || reportTemplate?.defaultConfig.content_responsible_agent || ""}`, pageWidth / 2, yPos, { align: "center" });
    }

    // Footer de portada con logos de pie de página
    if (footerLogoUrls.length > 0) {
      const footerLogoSize = 25;
      const footerSpacing = 10;
      const footerTotalWidth = footerLogoUrls.length * footerLogoSize + (footerLogoUrls.length - 1) * footerSpacing;
      let footerXPos = (pageWidth - footerTotalWidth) / 2;

      for (const logoUrl of footerLogoUrls) {
        try {
          const img = await loadImage(logoUrl);
          doc.addImage(img, 'PNG', footerXPos, pageHeight - 45, footerLogoSize, footerLogoSize * 0.6);
          footerXPos += footerLogoSize + footerSpacing;
        } catch (error) {
          console.error("Error loading footer logo:", error);
        }
      }
    }

    // Texto de pie de página en portada
    doc.setFontSize(9);
    doc.setTextColor(template === 'modern' ? 255 : 100, template === 'modern' ? 255 : 100, template === 'modern' ? 255 : 100);
    doc.text(mergedSettings?.footer_text || reportTemplate?.defaultConfig.footer_text || "Generado por el Sistema de Evaluación Educativa", pageWidth / 2, pageHeight - 15, { align: "center" });

    // ===== PÁGINA 2: CONTENIDO =====
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Header con logo pequeño
    yPos = 15;
    if (logoUrls.length > 0) {
      try {
        const img = await loadImage(logoUrls[0]);
        doc.addImage(img, 'PNG', 15, yPos, 30, 18);
      } catch (error) {
        console.error("Error loading header logo:", error);
      }
    }

    // Línea decorativa del header
    doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
    doc.setLineWidth(0.5);
    doc.line(15, yPos + 22, pageWidth - 15, yPos + 22);
    yPos += 35;

    // Get content from settings or template defaults
    const getContent = (sectionId: string): string | null => {
      const contentKey = `content_${sectionId}_text`;
      const showKey = `content_show_${sectionId}`;
      
      // Check if section should be shown
      if (mergedSettings && (mergedSettings as any)[showKey] === false) {
        return null;
      }
      
      // Get content from settings or template default
      const content = mergedSettings?.[contentKey] || reportTemplate?.defaultConfig[contentKey] || null;
      return content;
    };

    // Helper function to add page header
    const addPageHeader = async () => {
      if (logoUrls.length > 0) {
        try {
          const img = await loadImage(logoUrls[0]);
          doc.addImage(img, 'PNG', 15, 15, 30, 18);
        } catch (error) {}
      }
      doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
      doc.setLineWidth(0.5);
      doc.line(15, 37, pageWidth - 15, 37);
      return 45;
    };

    // Helper function to check and handle page break
    const checkPageBreak = async (requiredSpace: number) => {
      if (yPos > pageHeight - requiredSpace) {
        doc.addPage();
        yPos = await addPageHeader();
      }
    };

    // Get section order from template or use default
    const sectionOrder = mergedSettings?.section_order || reportTemplate?.defaultConfig.section_order || ['introduction', 'recommendations', 'conclusion'];
    
    // Render sections in order
    for (const sectionId of sectionOrder) {
      // Skip if section should not be shown
      const showKey = `content_show_${sectionId}`;
      if (mergedSettings && (mergedSettings as any)[showKey] === false) {
        continue;
      }

      const sectionContent = getContent(sectionId);
      if (!sectionContent) continue;

      await checkPageBreak(30);
      
      // Get section title from template
      const section = reportTemplate?.custom_sections.find(s => s.id === sectionId);
      const sectionTitle = section?.title || sectionId.toUpperCase();
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
      doc.text(sectionTitle.toUpperCase(), 15, yPos);
      yPos += 3;
      
      // Decorative line under title
      doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
      doc.setLineWidth(0.5);
      doc.line(15, yPos, 15 + (sectionTitle.length * 3), yPos);
      yPos += 8;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const contentLines = doc.splitTextToSize(sectionContent, pageWidth - 30);
      doc.text(contentLines, 15, yPos);
      yPos += (contentLines.length * 5) + 15;
    }

    // Dimension scores section (data from questionnaire, shown after template sections)
    if (response.dimension_scores && Object.keys(response.dimension_scores).length > 0) {
      await checkPageBreak(50);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
      doc.text("RESULTADOS POR DIMENSIÓN", 15, yPos);
      yPos += 12;

      const scores = response.dimension_scores as Record<string, number> || {};
      const scoreEntries = Object.entries(scores);
      const maxScore = Math.max(...Object.values(scores), 100);
      const barWidth = pageWidth - 80;
      
      // Draw dimension scores with visual bars
      for (const [dimension, score] of scoreEntries) {
        await checkPageBreak(25);
        
        // Dimension name
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(dimension, 15, yPos);
        
        // Score value
        doc.setFont("helvetica", "bold");
        doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
        doc.text(score.toFixed(2), pageWidth - 15, yPos, { align: "right" });
        
        yPos += 4;
        
        // Background bar
        doc.setFillColor(230, 230, 230);
        doc.rect(15, yPos, barWidth, 6, 'F');
        
        // Filled bar (proportional to max score)
        const fillWidth = (score / maxScore) * barWidth;
        doc.setFillColor(brandColor.r, brandColor.g, brandColor.b);
        doc.rect(15, yPos, fillWidth, 6, 'F');
        
        yPos += 14;
      }
      
      yPos += 8;
    }

    // Dominant dimensions section (data from questionnaire)
    if (response.dominant_dimension || response.secondary_dimension) {
      await checkPageBreak(50);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
      doc.text("ANÁLISIS DE DIMENSIONES", 15, yPos);
      yPos += 10;
      
      // Box for dimension analysis
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
      doc.setLineWidth(0.3);
      const boxHeight = (response.dominant_dimension && response.secondary_dimension) ? 35 : 20;
      doc.rect(15, yPos, pageWidth - 30, boxHeight, 'FD');
      
      yPos += 8;
      
      if (response.dominant_dimension) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Dimensión Dominante:", 20, yPos);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
        doc.text(response.dominant_dimension, 70, yPos);
        yPos += 12;
      }

      if (response.secondary_dimension) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Dimensión Secundaria:", 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        doc.text(response.secondary_dimension, 73, yPos);
        yPos += 12;
      }
      
      yPos += 10;
    }


    // Notes
    if (response.notes) {
      const splitNotes = doc.splitTextToSize(response.notes, pageWidth - 30);
      const notesHeight = splitNotes.length * 5 + 20;
      await checkPageBreak(notesHeight);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
      doc.text("NOTAS DEL EVALUADOR", 15, yPos);
      yPos += 3;
      
      doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
      doc.setLineWidth(0.5);
      doc.line(15, yPos, 85, yPos);
      yPos += 8;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(splitNotes, 15, yPos);
      yPos += (splitNotes.length * 5) + 15;
    }

    // Conclusion if configured
    const conclusionContent = getContent('conclusion');
    if (conclusionContent) {
      const conclusionLines = doc.splitTextToSize(conclusionContent, pageWidth - 30);
      const conclusionHeight = conclusionLines.length * 5 + 20;
      await checkPageBreak(conclusionHeight);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
      doc.text("CONCLUSIÓN", 15, yPos);
      yPos += 3;
      
      doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
      doc.setLineWidth(0.5);
      doc.line(15, yPos, 55, yPos);
      yPos += 8;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(conclusionLines, 15, yPos);
    }

    // Footer en páginas de contenido
    const totalPages = doc.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
      doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(mergedSettings?.content_company_name || reportTemplate?.defaultConfig.content_company_name || "Sistema de Evaluación", 15, pageHeight - 12);
      doc.text(mergedSettings?.footer_text || reportTemplate?.defaultConfig.footer_text || "", pageWidth - 15, pageHeight - 12, { align: "right" });
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 7, { align: "center" });
    }

    const fileName = `cuestionario_${response.children?.name?.replace(/\s+/g, '_')}_${response.response_date}.pdf`;
    doc.save(fileName);
    toast.success("PDF generado exitosamente");
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
