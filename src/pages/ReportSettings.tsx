import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Trash2, Settings, Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import { contentTemplates, type ContentTemplate } from "@/lib/contentTemplates";
import { reportTypeTemplates, getReportTypeTemplate, type ReportType } from "@/lib/reportTypeTemplates";
import { ReportPreview } from "@/components/reports/ReportPreview";
import { ReportSectionEditor, type ReportSection } from "@/components/reports/ReportSectionEditor";
import { useTutorial } from "@/components/tutorial/TutorialProvider";
import { reportSettingsTutorial } from "@/components/tutorial/tutorials";
import { TutorialButton } from "@/components/tutorial/TutorialButton";

interface ReportSettingsData {
  id: string;
  report_type: ReportType;
  template: 'classic' | 'modern' | 'minimal';
  primary_color: string;
  logo_urls: string[];
  footer_logo_urls: string[];
  header_text: string;
  footer_text: string;
  use_gemini_charts: boolean;
  content_introduction_text?: string;
  content_conclusion_text?: string;
  content_recommendations_text?: string;
  content_company_name?: string;
  content_responsible_agent?: string;
  content_show_introduction?: boolean;
  content_show_conclusion?: boolean;
  content_show_recommendations?: boolean;
  section_order?: string[];
}

const ReportSettings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startTutorial } = useTutorial();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
    if (!completedTutorials.includes('/admin/report-settings') && isAdmin) {
      setTimeout(() => startTutorial(reportSettingsTutorial), 500);
    }
  }, [isAdmin, startTutorial]);
  const [saving, setSaving] = React.useState(false);
  const [settings, setSettings] = React.useState<ReportSettingsData>({
    id: "",
    report_type: 'motricidad',
    template: 'modern',
    primary_color: '#8EB8B5',
    logo_urls: [],
    footer_logo_urls: [],
    header_text: "Reporte de Evaluación de Motricidad Fina",
    footer_text: "Generado por el Sistema de Evaluación Educativa",
    use_gemini_charts: false,
    content_introduction_text: '',
    content_conclusion_text: '',
    content_recommendations_text: '',
    content_company_name: '',
    content_responsible_agent: '',
    content_show_introduction: true,
    content_show_conclusion: true,
    content_show_recommendations: true,
    section_order: ['introduction', 'recommendations', 'conclusion']
  });
  const [pdfPreview, setPdfPreview] = React.useState<string | null>(null);

  // Initialize sections - will be updated when settings load
  const [reportSections, setReportSections] = React.useState<ReportSection[]>([
    { id: 'introduction', title: 'Introducción', enabled: true },
    { id: 'recommendations', title: 'Recomendaciones', enabled: true },
    { id: 'conclusion', title: 'Conclusiones', enabled: true }
  ]);

  React.useEffect(() => {
    checkAdminAndFetchSettings();
  }, []);

  React.useEffect(() => {
    if (settings.template) {
      generatePDFPreview();
    }
  }, [settings]);

  // Sync reportSections with settings - now works with any template
  React.useEffect(() => {
    const template = getReportTypeTemplate(settings.report_type);
    if (!template || !template.custom_sections) return;

    const sectionOrder = settings.section_order || template.defaultConfig.section_order || [];
    const updatedSections: ReportSection[] = sectionOrder
      .map((id) => {
        const customSection = template.custom_sections.find(s => s.id === id);
        if (!customSection) return null;

        const showKey = `content_show_${id}`;
        const enabled = (settings as any)[showKey] !== false; // Default to true

        return {
          id: customSection.id,
          title: customSection.title,
          enabled
        };
      })
      .filter((s): s is ReportSection => s !== null);

    // Only update if different to avoid infinite loops
    if (JSON.stringify(updatedSections) !== JSON.stringify(reportSections)) {
      setReportSections(updatedSections);
    }
  }, [settings.report_type, settings.section_order, settings]);

  // Update sections and settings when report type changes to use custom sections
  React.useEffect(() => {
    const template = getReportTypeTemplate(settings.report_type);
    if (template && template.custom_sections) {
      const sectionOrder = settings.section_order || template.defaultConfig.section_order || [];
      
      // Initialize sections from template
      const updatedSections: ReportSection[] = sectionOrder
        .map((id) => {
          const customSection = template.custom_sections.find(s => s.id === id);
          if (customSection) {
            const showKey = `content_show_${id}`;
            return {
              id: customSection.id,
              title: customSection.title,
              enabled: (settings as any)[showKey] !== false // Use existing value or default to true
            };
          }
          return null;
        })
        .filter((s): s is ReportSection => s !== null);

      // Initialize content fields from template defaults if not already set
      const updatedSettings: any = { ...settings };
      template.custom_sections.forEach(section => {
        const contentKey = `content_${section.id}_text`;
        const showKey = `content_show_${section.id}`;
        
        // Only set defaults if not already in settings
        if (!(contentKey in updatedSettings)) {
          updatedSettings[contentKey] = template.defaultConfig[contentKey] || '';
        }
        if (!(showKey in updatedSettings)) {
          updatedSettings[showKey] = true;
        }
      });

      // Update section_order if not set
      if (!updatedSettings.section_order || updatedSettings.section_order.length === 0) {
        updatedSettings.section_order = sectionOrder;
      }

      setSettings(updatedSettings);

      if (updatedSections.length > 0 && JSON.stringify(updatedSections) !== JSON.stringify(reportSections)) {
        setReportSections(updatedSections);
      }
    }
  }, [settings.report_type]);

  const checkAdminAndFetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!roleData) {
        toast({
          title: "Acceso denegado",
          description: "Solo los administradores pueden acceder a esta sección",
          variant: "destructive"
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await fetchSettings();
    } catch (error: any) {
      console.error("Error checking admin status:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("report_settings")
        .select("*")
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const logoUrls = Array.isArray(data.logo_urls) ? data.logo_urls : [];
        const footerLogoUrls = Array.isArray(data.footer_logo_urls) ? data.footer_logo_urls : [];
        const reportType = (data.report_type || 'motricidad') as ReportType;
        const template = getReportTypeTemplate(reportType);

        // Build settings object with all dynamic content fields
        const settingsObj: any = {
          id: data.id,
          report_type: reportType,
          template: (data.template || 'modern') as 'classic' | 'modern' | 'minimal',
          primary_color: data.primary_color || '#8EB8B5',
          logo_urls: logoUrls as string[],
          footer_logo_urls: footerLogoUrls as string[],
          header_text: data.header_text || template?.defaultConfig.header_text || "Reporte de Evaluación",
          footer_text: data.footer_text || template?.defaultConfig.footer_text || "Generado por el Sistema de Evaluación Educativa",
          use_gemini_charts: data.use_gemini_charts ?? false,
          content_company_name: data.content_company_name || '',
          content_responsible_agent: data.content_responsible_agent || '',
          section_order: data.section_order || template?.defaultConfig.section_order || []
        };

        // Load dynamic content from JSONB field or individual columns
        const dynamicContent = data.dynamic_content || {};
        if (template && template.custom_sections) {
          template.custom_sections.forEach(section => {
            const contentKey = `content_${section.id}_text`;
            const showKey = `content_show_${section.id}`;
            
            // Try dynamic_content first, then individual column, then template default
            settingsObj[contentKey] = dynamicContent[contentKey] || 
                                     data[contentKey] || 
                                     template.defaultConfig[contentKey] || '';
            settingsObj[showKey] = dynamicContent[showKey] !== false && 
                                  data[showKey] !== false; // Default to true if not set
          });
        }

        setSettings(settingsObj);

        // Update report sections from saved data using template
        if (template && template.custom_sections) {
          const sectionOrder = data.section_order || template.defaultConfig.section_order || [];
          const updatedSections: ReportSection[] = sectionOrder
            .map((id: string) => {
              const customSection = template.custom_sections.find(s => s.id === id);
              if (!customSection) return null;

              const showKey = `content_show_${id}`;
              const enabled = data[showKey] !== false; // Default to true

              return {
                id: customSection.id,
                title: customSection.title,
                enabled
              };
            })
            .filter((s): s is ReportSection => s !== null);

          if (updatedSections.length > 0) {
            setReportSections(updatedSections);
          }
        }
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración",
        variant: "destructive"
      });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 2 * 1024 * 1024) continue;

      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}_${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('report-logos')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('report-logos')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    setSettings({
      ...settings,
      logo_urls: [...settings.logo_urls, ...uploadedUrls]
    });

    toast({
      title: "Éxito",
      description: `${uploadedUrls.length} logo(s) subido(s) correctamente`
    });
  };

  const handleDeleteLogo = async (index: number) => {
    const logoUrl = settings.logo_urls[index];
    const fileName = logoUrl.split('/').pop();

    if (fileName) {
      await supabase.storage
        .from('report-logos')
        .remove([fileName]);
    }

    setSettings({
      ...settings,
      logo_urls: settings.logo_urls.filter((_, i) => i !== index)
    });
  };

  const handleFooterLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 2 * 1024 * 1024) continue;

      const fileExt = file.name.split('.').pop();
      const fileName = `footer_logo_${Date.now()}_${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('report-logos')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading footer logo:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('report-logos')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    setSettings({
      ...settings,
      footer_logo_urls: [...settings.footer_logo_urls, ...uploadedUrls]
    });

    toast({
      title: "Éxito",
      description: `${uploadedUrls.length} logo(s) de pie de página subido(s) correctamente`
    });
  };

  const handleDeleteFooterLogo = async (index: number) => {
    const logoUrl = settings.footer_logo_urls[index];
    const fileName = logoUrl.split('/').pop();

    if (fileName) {
      await supabase.storage
        .from('report-logos')
        .remove([fileName]);
    }

    setSettings({
      ...settings,
      footer_logo_urls: settings.footer_logo_urls.filter((_, i) => i !== index)
    });
  };

  const handleSectionsChange = (newSections: ReportSection[]) => {
    setReportSections(newSections);

    // Update settings with new order and visibility for all sections
    const updatedSettings: any = {
      ...settings,
      section_order: newSections.map(s => s.id)
    };

    // Update visibility flags for all sections dynamically
    newSections.forEach(section => {
      updatedSettings[`content_show_${section.id}`] = section.enabled;
    });

    setSettings(updatedSettings);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Build upsert object with all dynamic content fields
      const template = getReportTypeTemplate(settings.report_type);
      const upsertData: any = {
        id: settings.id || undefined,
        report_type: settings.report_type,
        template: settings.template,
        primary_color: settings.primary_color,
        logo_urls: settings.logo_urls,
        footer_logo_urls: settings.footer_logo_urls,
        header_text: settings.header_text,
        footer_text: settings.footer_text,
        use_gemini_charts: settings.use_gemini_charts,
        content_company_name: settings.content_company_name,
        content_responsible_agent: settings.content_responsible_agent,
        section_order: settings.section_order,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      };

      // Build dynamic_content JSONB object with all dynamic fields
      const dynamicContent: any = {};
      if (template && template.custom_sections) {
        template.custom_sections.forEach(section => {
          const contentKey = `content_${section.id}_text`;
          const showKey = `content_show_${section.id}`;
          dynamicContent[contentKey] = (settings as any)[contentKey] || '';
          dynamicContent[showKey] = (settings as any)[showKey] !== false;
        });
      }
      
      // Only add dynamic_content if it has content
      if (Object.keys(dynamicContent).length > 0) {
        upsertData.dynamic_content = dynamicContent;
      }

      const { error } = await supabase
        .from("report_settings")
        .upsert(upsertData);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Configuración guardada correctamente"
      });

      await fetchSettings();
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: error.message || "Error al guardar la configuración",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 142, g: 184, b: 181 };
  };

  const generateChartWithGemini = async (prompt: string, chartData: any): Promise<string | null> => {
    // DISABLED: Edge Function has persistent 500 errors
    // Use placeholders instead until Edge Function is fixed
    console.warn('Gemini chart generation disabled - Edge Function returns 500');
    return null;

    /* ORIGINAL CODE - DISABLED
    try {
      const { data, error } = await supabase.functions.invoke('generate-chart-image', {
        body: { prompt, chartData }
      });

      if (error) {
        console.error('Error generating chart with Gemini:', error);
        return null;
      }

      if (data?.imageBase64) {
        return `data:${data.mimeType || 'image/png'};base64,${data.imageBase64}`;
      }

      return null;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return null;
    }
    */
  };

  const generatePDFPreview = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const brandColor = hexToRgb(settings.primary_color);

      // ===== PÁGINA 1: PORTADA =====
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Background decorativo en portada
      if (settings.template === 'modern') {
        doc.setFillColor(brandColor.r, brandColor.g, brandColor.b, 0.05);
        doc.rect(0, pageHeight / 2, pageWidth, pageHeight / 2, 'F');
      }

      // Logos en portada (centrados, tamaño grande)
      let yPos = 30;
      if (settings.logo_urls.length > 0) {
        const logoSize = 50;
        const spacing = 15;
        const totalWidth = settings.logo_urls.length * logoSize + (settings.logo_urls.length - 1) * spacing;
        let xPos = (pageWidth - totalWidth) / 2;

        for (const logoUrl of settings.logo_urls) {
          try {
            const img = await loadImage(logoUrl);
            doc.addImage(img, 'PNG', xPos, yPos, logoSize, logoSize * 0.6);
            xPos += logoSize + spacing;
          } catch (error) {
            console.error("Error loading logo:", error);
          }
        }
        yPos += 50;
      }

      // Título principal de portada
      doc.setFillColor(brandColor.r, brandColor.g, brandColor.b);
      doc.rect(0, yPos, pageWidth, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.setFont("helvetica", "bold");
      doc.text("REPORTE", pageWidth / 2, yPos + 15, { align: "center" });
      doc.setFontSize(28);
      doc.text(settings.header_text.toUpperCase(), pageWidth / 2, yPos + 30, { align: "center" });
      yPos += 60;

      // Fecha en portada
      doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
      doc.setFontSize(18);
      doc.setFont("helvetica", "normal");
      const fecha = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      doc.text(fecha.charAt(0).toUpperCase() + fecha.slice(1), pageWidth / 2, yPos, { align: "center" });
      yPos += 20;

      // Información del evaluador
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text("Evaluador: Sistema Educativo", pageWidth / 2, pageHeight - 30, { align: "center" });
      doc.text("www.sistemaeducativo.com", pageWidth / 2, pageHeight - 20, { align: "center" });

      // ===== PÁGINA 2: INTRODUCCIÓN Y ANÁLISIS =====
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Header con logo pequeño
      yPos = 15;
      if (settings.logo_urls.length > 0) {
        try {
          const img = await loadImage(settings.logo_urls[0]);
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

      // SECCIÓN: INTRODUCCIÓN
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
      doc.text("INTRODUCCIÓN", 15, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      const introText = "El presente reporte de evaluación presenta un análisis detallado del progreso y desarrollo de habilidades del aprendiente. Este documento consolida los resultados de evaluaciones realizadas, identificando fortalezas y áreas de oportunidad para el desarrollo continuo.";
      const splitIntro = doc.splitTextToSize(introText, pageWidth - 30);
      doc.text(splitIntro, 15, yPos);
      yPos += splitIntro.length * 6 + 10;

      // SECCIÓN: ANÁLISIS DE RESULTADOS
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
      doc.text("ANÁLISIS DE RESULTADOS", 15, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      const analysisText = "Los resultados de las evaluaciones muestran un progreso constante en las áreas evaluadas. El siguiente gráfico presenta la evolución del desempeño en los últimos períodos.";
      const splitAnalysis = doc.splitTextToSize(analysisText, pageWidth - 30);
      doc.text(splitAnalysis, 15, yPos);
      yPos += splitAnalysis.length * 6 + 10;

      // Generar gráfico de progreso con Gemini API
      // DISABLED: Edge Function has persistent 500 errors
      if (false && settings.use_gemini_charts) {
        const progressChartData = {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          values: [65, 72, 78, 85, 88, 92],
          type: 'line',
          colors: [settings.primary_color]
        };

        const progressChartPrompt = `Genera un gráfico de líneas profesional que muestre la evolución del progreso del aprendiente. 
        Datos: ${JSON.stringify(progressChartData)}
        El gráfico debe tener:
        - Eje X con los meses: Enero, Febrero, Marzo, Abril, Mayo, Junio
        - Eje Y con valores de 0 a 100 (porcentaje de progreso)
        - Una línea suave conectando los puntos con color ${settings.primary_color}
        - Puntos marcadores en cada mes
        - Fondo blanco limpio
        - Cuadrícula sutil gris claro
        - Título: "Evolución del Progreso"
        - Etiquetas claras y legibles
        - Tamaño: 800x400 píxeles`;

        const chartImage = await generateChartWithGemini(progressChartPrompt, progressChartData);

        if (chartImage) {
          try {
            doc.addImage(chartImage, 'PNG', 15, yPos, pageWidth - 30, 60);
          } catch (error) {
            console.error('Error adding chart image:', error);
            // Fallback al placeholder
            doc.setFillColor(brandColor.r, brandColor.g, brandColor.b, 0.1);
            doc.rect(15, yPos, pageWidth - 30, 60, 'F');
            doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
            doc.rect(15, yPos, pageWidth - 30, 60);
            doc.setFontSize(10);
            doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
            doc.text("[Error al cargar gráfico]", pageWidth / 2, yPos + 30, { align: "center" });
          }
        } else {
          // Fallback si Gemini no está disponible
          doc.setFillColor(brandColor.r, brandColor.g, brandColor.b, 0.1);
          doc.rect(15, yPos, pageWidth - 30, 60, 'F');
          doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
          doc.rect(15, yPos, pageWidth - 30, 60);
          doc.setFontSize(10);
          doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
          doc.text("[Gráfico de progreso - Activar Gemini Charts]", pageWidth / 2, yPos + 30, { align: "center" });
        }
      } else {
        // Placeholder cuando Gemini Charts está desactivado
        doc.setFillColor(brandColor.r, brandColor.g, brandColor.b, 0.1);
        doc.rect(15, yPos, pageWidth - 30, 60, 'F');
        doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
        doc.rect(15, yPos, pageWidth - 30, 60);
        doc.setFontSize(10);
        doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
        doc.text("[Gráfico de progreso - Activar Gemini Charts en configuración]", pageWidth / 2, yPos + 30, { align: "center" });
      }
      yPos += 70;

      // Texto después del gráfico
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text("Como se observa en el gráfico, el aprendiente ha mostrado mejora constante.", 15, yPos);

      // Footer de página 2
      doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
      doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("Evaluador: Sistema Educativo", 15, pageHeight - 15);
      doc.text("www.sistemaeducativo.com", pageWidth - 15, pageHeight - 15, { align: "right" });
      doc.text("Página 2", pageWidth / 2, pageHeight - 10, { align: "center" });

      // ===== PÁGINA 3: COMPETENCIAS Y RECOMENDACIONES =====
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Header con logo pequeño
      yPos = 15;
      if (settings.logo_urls.length > 0) {
        try {
          const img = await loadImage(settings.logo_urls[0]);
          doc.addImage(img, 'PNG', 15, yPos, 30, 18);
        } catch (error) {
          console.error("Error loading header logo:", error);
        }
      }

      doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
      doc.setLineWidth(0.5);
      doc.line(15, yPos + 22, pageWidth - 15, yPos + 22);
      yPos += 35;

      // SECCIÓN: DISTRIBUCIÓN DE COMPETENCIAS
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
      doc.text("DISTRIBUCIÓN DE COMPETENCIAS", 15, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      const compText = "La evaluación de competencias muestra el nivel de desarrollo en diferentes áreas clave. El siguiente gráfico presenta la distribución por categoría.";
      const splitComp = doc.splitTextToSize(compText, pageWidth - 30);
      doc.text(splitComp, 15, yPos);
      yPos += splitComp.length * 6 + 10;

      // Generar gráfico de distribución con Gemini API
      // DISABLED: Edge Function has persistent 500 errors
      if (false && settings.use_gemini_charts) {
        const distributionChartData = {
          labels: ['Coordinación', 'Precisión', 'Visual-Motor', 'Fuerza'],
          values: [85, 78, 92, 73],
          type: 'bar',
          colors: [settings.primary_color, '#FFA726', '#66BB6A', '#5C6BC0']
        };

        const distributionChartPrompt = `Genera un gráfico de barras horizontal profesional que muestre la distribución de competencias del aprendiente.
        Datos: ${JSON.stringify(distributionChartData)}
        El gráfico debe tener:
        - Eje Y con las categorías: Coordinación, Precisión, Visual-Motor, Fuerza
        - Eje X con valores de 0 a 100 (nivel de competencia)
        - Barras horizontales con los colores especificados
        - Valores numéricos al final de cada barra
        - Fondo blanco limpio
        - Título: "Distribución de Competencias"
        - Etiquetas claras y legibles
        - Tamaño: 800x500 píxeles`;

        const chartImage = await generateChartWithGemini(distributionChartPrompt, distributionChartData);

        if (chartImage) {
          try {
            doc.addImage(chartImage, 'PNG', 15, yPos, pageWidth - 30, 70);
          } catch (error) {
            console.error('Error adding distribution chart:', error);
            // Fallback al placeholder
            doc.setFillColor(brandColor.r, brandColor.g, brandColor.b, 0.1);
            doc.rect(15, yPos, pageWidth - 30, 70, 'F');
            doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
            doc.rect(15, yPos, pageWidth - 30, 70);
            doc.setFontSize(10);
            doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
            doc.text("[Error al cargar gráfico]", pageWidth / 2, yPos + 35, { align: "center" });
          }
        } else {
          doc.setFillColor(brandColor.r, brandColor.g, brandColor.b, 0.1);
          doc.rect(15, yPos, pageWidth - 30, 70, 'F');
          doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
          doc.rect(15, yPos, pageWidth - 30, 70);
          doc.setFontSize(10);
          doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
          doc.text("[Gráfico de distribución - Activar Gemini Charts]", pageWidth / 2, yPos + 35, { align: "center" });
        }
      } else {
        // Placeholder cuando Gemini Charts está desactivado
        doc.setFillColor(brandColor.r, brandColor.g, brandColor.b, 0.1);
        doc.rect(15, yPos, pageWidth - 30, 70, 'F');
        doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
        doc.rect(15, yPos, pageWidth - 30, 70);
        doc.setFontSize(10);
        doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
        doc.text("[Gráfico de distribución - Activar Gemini Charts en configuración]", pageWidth / 2, yPos + 35, { align: "center" });
      }
      yPos += 80;

      // SECCIÓN: RECOMENDACIONES
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
      doc.text("RECOMENDACIONES", 15, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);

      const recomendaciones = [
        "Reforzar actividades de coordinación ojo-mano mediante ejercicios prácticos.",
        "Continuar con el desarrollo de precisión motriz a través de actividades dirigidas.",
        "Implementar ejercicios que promuevan la integración de habilidades adquiridas."
      ];

      recomendaciones.forEach((rec, index) => {
        doc.setFillColor(brandColor.r, brandColor.g, brandColor.b, 0.1);
        const textHeight = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40).length * 6;
        doc.rect(15, yPos - 3, pageWidth - 30, textHeight + 4, 'F');

        doc.setFont("helvetica", "bold");
        doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
        doc.text(`${index + 1}.`, 20, yPos);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        const split = doc.splitTextToSize(rec, pageWidth - 45);
        doc.text(split, 30, yPos);

        yPos += textHeight + 8;
      });

      // Footer de página 3
      doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
      doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("Evaluador: Sistema Educativo", 15, pageHeight - 15);
      doc.text("www.sistemaeducativo.com", pageWidth - 15, pageHeight - 15, { align: "right" });
      doc.text("Página 3", pageWidth / 2, pageHeight - 10, { align: "center" });

      // ===== PÁGINA 4: CONCLUSIONES =====
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Header con logo
      yPos = 15;
      if (settings.logo_urls.length > 0) {
        try {
          const img = await loadImage(settings.logo_urls[0]);
          doc.addImage(img, 'PNG', 15, yPos, 30, 18);
        } catch (error) {
          console.error("Error loading header logo:", error);
        }
      }

      doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
      doc.setLineWidth(0.5);
      doc.line(15, yPos + 22, pageWidth - 15, yPos + 22);
      yPos += 35;

      // SECCIÓN: CONCLUSIONES
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
      doc.text("CONCLUSIONES", 15, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      const conclusionText = "El aprendiente ha demostrado un desarrollo positivo en las áreas evaluadas. Los resultados indican que el proceso de aprendizaje está siendo efectivo y que las estrategias implementadas están generando los resultados esperados. Se recomienda continuar con el plan de desarrollo establecido, monitoreando el progreso de forma regular para asegurar la consolidación de las habilidades adquiridas.";
      const splitConc = doc.splitTextToSize(conclusionText, pageWidth - 30);
      doc.text(splitConc, 15, yPos);
      yPos += splitConc.length * 6 + 20;

      // Firma y fecha
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Fecha del reporte:", 15, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }), 60, yPos);
      yPos += 10;

      doc.setFont("helvetica", "bold");
      doc.text("Generado por:", 15, yPos);
      doc.setFont("helvetica", "normal");
      doc.text("Sistema de Evaluación Educativa", 60, yPos);

      // Footer logos múltiples (si existen)
      if (settings.footer_logo_urls && settings.footer_logo_urls.length > 0) {
        const footerLogoSize = 20;
        const footerSpacing = 10;
        const totalFooterWidth = settings.footer_logo_urls.length * footerLogoSize + (settings.footer_logo_urls.length - 1) * footerSpacing;
        let footerXPos = (pageWidth - totalFooterWidth) / 2;
        const footerYPos = pageHeight - 50;

        for (const logoUrl of settings.footer_logo_urls) {
          try {
            const img = await loadImage(logoUrl);
            doc.addImage(img, 'PNG', footerXPos, footerYPos, footerLogoSize, footerLogoSize * 0.6);
            footerXPos += footerLogoSize + footerSpacing;
          } catch (error) {
            console.error("Error loading footer logo:", error);
          }
        }
      }

      // Footer de página 4
      doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
      doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(settings.footer_text, 15, pageHeight - 15);
      doc.text("www.sistemaeducativo.com", pageWidth - 15, pageHeight - 15, { align: "right" });
      doc.text("Página 4", pageWidth / 2, pageHeight - 10, { align: "center" });

      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      if (pdfPreview) {
        URL.revokeObjectURL(pdfPreview);
      }

      setPdfPreview(pdfUrl);
    } catch (error) {
      console.error("Error generating preview:", error);
    }
  };

  const loadImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
            <div className="flex items-center gap-3 md:gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg md:text-xl font-semibold">Editor de Reportes</h1>
                <p className="text-xs md:text-sm text-muted-foreground">v1.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={settings.report_type}
                onValueChange={(value: ReportType) => {
                  const template = getReportTypeTemplate(value);
                  if (template) {
                    setSettings({
                      ...settings,
                      report_type: value,
                      ...template.defaultConfig
                    });
                    toast({
                      title: "Plantilla aplicada",
                      description: `Se aplicó la plantilla "${template.name}"`
                    });
                  }
                }}
                data-tutorial="report-type-selector"
              >
                <SelectTrigger className="w-[180px] md:w-[240px] h-9">
                  <SelectValue placeholder="Tipo de reporte" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypeTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <span className="flex items-center gap-2">
                        <span>{template.icon}</span>
                        <span>{template.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="gap-2 relative"
                data-tutorial="save-btn"
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">{saving ? "Guardando..." : "Guardar Cambios"}</span>
                <span className="sm:hidden">{saving ? "..." : "Guardar"}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Info Banner */}
      <div className="bg-primary/5 border-b border-primary/20 px-4 py-2">
        <p className="text-xs text-center text-muted-foreground">
          💡 <strong>Importante:</strong> Después de cambiar el tipo de reporte o cualquier configuración, haz clic en <strong>"Guardar Cambios"</strong> para aplicar los ajustes al PDF final. La vista previa es solo una demostración temporal.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-89px)] md:h-[calc(100vh-89px)]">
        {/* Left Sidebar - Configuration */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r bg-card overflow-y-auto max-h-[50vh] lg:max-h-none">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Configuración</h2>
            </div>

            {/* Template Selection */}
            <div className="space-y-3" data-tutorial="template-selector">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                PLANTILLA
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSettings({ ...settings, template: 'classic' })}
                  className={`p-4 border-2 rounded-lg transition-all ${settings.template === 'classic'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                    }`}
                >
                  <div className="w-full h-16 bg-muted rounded mb-2" />
                  <p className="text-xs font-medium text-center">Classic</p>
                </button>
                <button
                  onClick={() => setSettings({ ...settings, template: 'modern' })}
                  className={`p-4 border-2 rounded-lg transition-all ${settings.template === 'modern'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                    }`}
                >
                  <div className="w-full h-16 bg-foreground rounded mb-2" />
                  <p className="text-xs font-medium text-center">Modern</p>
                </button>
                <button
                  onClick={() => setSettings({ ...settings, template: 'minimal' })}
                  className={`p-4 border-2 rounded-lg transition-all ${settings.template === 'minimal'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                    }`}
                >
                  <div className="w-full h-16 border-2 border-muted rounded mb-2" />
                  <p className="text-xs font-medium text-center">Minimal</p>
                </button>
              </div>
            </div>

            {/* Branding */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: settings.primary_color }} />
                </div>
                <h3 className="font-medium">Branding Corporativo</h3>
              </div>

              {/* Color Picker */}
              <div className="space-y-2" data-tutorial="color-picker">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  COLOR DE MARCA
                </Label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                    style={{ backgroundColor: settings.primary_color }}
                    onClick={() => document.getElementById('color-picker')?.click()}
                  />
                  <div className="flex-1">
                    <Input
                      id="color-picker"
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                      className="hidden"
                    />
                    <Input
                      type="text"
                      value={settings.primary_color.toUpperCase()}
                      onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                      className="font-mono text-sm"
                      placeholder="#8EB8B5"
                    />
                  </div>
                </div>
              </div>

              {/* Logos Header */}
              <div className="space-y-3" data-tutorial="logo-upload">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    LOGOTIPOS (PORTADA)
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {settings.logo_urls.length} guardados
                  </span>
                </div>

                {/* Logo Grid */}
                {settings.logo_urls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {settings.logo_urls.map((url, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square border-2 border-primary/20 rounded-lg overflow-hidden bg-card p-2"
                      >
                        <img
                          src={url}
                          alt={`Logo ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                        <button
                          onClick={() => handleDeleteLogo(index)}
                          className="absolute inset-0 bg-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Trash2 className="h-4 w-4 text-destructive-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  <Upload className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Subir logo portada</span>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-muted-foreground">
                  Aparecen en portada. Máx: 2MB
                </p>
              </div>

              {/* Gemini Charts Toggle */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Gráficos con IA</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Generar gráficos profesionales usando Gemini API
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.use_gemini_charts}
                      onChange={(e) => setSettings({ ...settings, use_gemini_charts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              {/* Logos Footer */}
              <div className="space-y-3 pt-4 border-t" data-tutorial="footer-logo-upload">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    LOGOTIPOS (PIE DE PÁGINA)
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {settings.footer_logo_urls.length} guardados
                  </span>
                </div>

                {/* Footer Logo Grid */}
                {settings.footer_logo_urls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {settings.footer_logo_urls.map((url, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square border-2 border-primary/20 rounded-lg overflow-hidden bg-card p-2"
                      >
                        <img
                          src={url}
                          alt={`Footer Logo ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                        <button
                          onClick={() => handleDeleteFooterLogo(index)}
                          className="absolute inset-0 bg-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Trash2 className="h-4 w-4 text-destructive-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button Footer */}
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  <Upload className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Subir logo pie de página</span>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFooterLogoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-muted-foreground">
                  Aparecen en páginas internas. Máx: 2MB
                </p>
              </div>
            </div>

            {/* Content Customization Section */}
            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-medium">Contenido del Reporte</h3>
              </div>

              {/* Report Type Info */}
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  TIPO DE REPORTE ACTUAL
                </Label>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{getReportTypeTemplate(settings.report_type)?.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">
                        {getReportTypeTemplate(settings.report_type)?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getReportTypeTemplate(settings.report_type)?.description}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Cambia el tipo de reporte en el selector superior para aplicar configuraciones predefinidas
                </p>
              </div>

              {/* Section Order Editor */}
              <div className="pt-6 border-t" data-tutorial="section-editor">
                <ReportSectionEditor
                  sections={reportSections}
                  onSectionsChange={handleSectionsChange}
                />
              </div>

              {/* Company Info */}
              <div className="space-y-3" data-tutorial="content-fields">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  INFORMACIÓN INSTITUCIONAL
                </Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Nombre de la Institución"
                    value={settings.content_company_name || ''}
                    onChange={(e) => setSettings({ ...settings, content_company_name: e.target.value })}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Responsable/Evaluador"
                    value={settings.content_responsible_agent || ''}
                    onChange={(e) => setSettings({ ...settings, content_responsible_agent: e.target.value })}
                    className="text-sm"
                  />
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      📅 <strong>Fecha automática:</strong> La fecha del reporte se genera automáticamente al momento de creación
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Content Sections based on Report Type */}
              {(() => {
                const template = getReportTypeTemplate(settings.report_type);
                if (!template || !template.custom_sections) return null;

                return template.custom_sections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      {section.title}
                    </Label>
                    {section.description && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {section.description}
                      </p>
                    )}
                    <Textarea
                      placeholder={`Contenido de ${section.title.toLowerCase()}...`}
                      value={(settings as any)[`content_${section.id}_text`] || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        [`content_${section.id}_text`]: e.target.value
                      })}
                      className="text-sm resize-none"
                      rows={3}
                    />
                  </div>
                ));
              })()}
            </div>
          </div>
        </aside>

        {/* Main Content - Preview */}
        <main className="flex-1 overflow-hidden bg-muted/30">
          <div className="h-full overflow-auto p-2 md:p-4">
            <div className="max-w-5xl mx-auto">
              <ReportPreview settings={settings} />
            </div>
          </div>
        </main>
      </div>

      <TutorialButton onClick={() => startTutorial(reportSettingsTutorial)} />
    </div>
  );
};

export default React.memo(ReportSettings);