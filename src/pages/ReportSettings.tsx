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
import { ArrowLeft, Upload, Trash2, Settings, Save, FileText, Brain, Laptop, Sparkles, Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import { contentTemplates, type ContentTemplate } from "@/lib/contentTemplates";
import { reportTypeTemplates, getReportTypeTemplate, type ReportType } from "@/lib/reportTypeTemplates";
import { ReportPreview } from "@/components/reports/ReportPreview";
import { ReportSectionEditor, type ReportSection } from "@/components/reports/ReportSectionEditor";
// import { OpenRouterConfig } from "@/components/admin/OpenRouterConfig";
import { useTutorial } from "@/components/tutorial/TutorialProvider";
import { reportSettingsTutorial } from "@/components/tutorial/tutorials";
import { TutorialButton } from "@/components/tutorial/TutorialButton";
import { motion, Variants } from "framer-motion";

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

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const MotionDiv = motion.div;

  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
    if (!completedTutorials.includes('/admin/report-settings') && isAdmin) {
      setTimeout(() => startTutorial(reportSettingsTutorial), 500);
    }
  }, [isAdmin, startTutorial]);
  const [saving, setSaving] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [savedSettingsSnapshot, setSavedSettingsSnapshot] = React.useState<string>('');
  const [settings, setSettings] = React.useState<ReportSettingsData>({
    id: "",
    // Usar "prediccion" como tipo por defecto, que es el principal en el editor
    report_type: 'prediccion',
    template: 'modern',
    primary_color: '#8EB8B5',
    logo_urls: [],
    footer_logo_urls: [],
    header_text: "Reporte de Evaluación",
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
  const [isRefining, setIsRefining] = React.useState<Record<string, boolean>>({});

  const handleRefineText = async (sectionId: string, currentText: string) => {
    if (!currentText || currentText.trim().length < 10) {
      toast({
        title: "Texto muy corto",
        description: "Escribe un poco más para que la IA pueda ayudarte a optimizarlo.",
        variant: "destructive"
      });
      return;
    }

    setIsRefining(prev => ({ ...prev, [sectionId]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('refine-report-text', {
        body: {
          text: currentText,
          sectionTitle: sectionId,
          reportType: settings.report_type
        }
      });

      if (error) throw error;

      if (data?.refinedText) {
        setSettings(prev => ({
          ...prev,
          [`content_${sectionId}_text`]: data.refinedText
        }));
        toast({
          title: "Texto Optimizado",
          description: "La IA ha refinado el contenido para hacerlo más profesional.",
        });
      }
    } catch (error: any) {
      console.error('Error refining text:', error);
      toast({
        title: "Error al optimizar",
        description: error.message || "No se pudo conectar con el servicio de IA.",
        variant: "destructive"
      });
    } finally {
      setIsRefining(prev => ({ ...prev, [sectionId]: false }));
    }
  };

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

  // Detect unsaved changes
  React.useEffect(() => {
    if (savedSettingsSnapshot) {
      const currentSnapshot = JSON.stringify(settings);
      setHasUnsavedChanges(currentSnapshot !== savedSettingsSnapshot);
    }
  }, [settings, savedSettingsSnapshot]);

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
      // Cargar configuración inicial desde la fila única de report_settings
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
        const reportType = (data.report_type || settings.report_type || 'prediccion') as ReportType;
        const template = getReportTypeTemplate(reportType);

        // Build settings object with all dynamic content fields
        const settingsObj: any = {
          id: data.id,
          report_type: reportType,
          template: (data.template || template?.defaultConfig.template || 'modern') as 'classic' | 'modern' | 'minimal',
          primary_color: data.primary_color || template?.defaultConfig.primary_color || '#8EB8B5',
          logo_urls: logoUrls as string[],
          footer_logo_urls: footerLogoUrls as string[],
          header_text: data.header_text || template?.defaultConfig.header_text || "Reporte de Evaluación",
          footer_text: data.footer_text || template?.defaultConfig.footer_text || "Generado por el Sistema de Evaluación Educativa",
          use_gemini_charts: data.use_gemini_charts ?? false,
          content_company_name: data.content_company_name || template?.defaultConfig.content_company_name || '',
          content_responsible_agent: data.content_responsible_agent || template?.defaultConfig.content_responsible_agent || '',
          section_order: data.section_order || template?.defaultConfig.section_order || []
        };

        // Load dynamic content from JSONB field or individual columns
        const dynamicContent = (data as any).dynamic_content || {};
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
        // Save snapshot for change detection
        setSavedSettingsSnapshot(JSON.stringify(settingsObj));
        setHasUnsavedChanges(false);

        // Update report sections from saved data using template
        if (template && template.custom_sections) {
          const sectionOrder = settingsObj.section_order || template.defaultConfig.section_order || [];
          const updatedSections: ReportSection[] = sectionOrder
            .map((id: string) => {
              const customSection = template.custom_sections.find(s => s.id === id);
              if (!customSection) return null;

              const showKey = `content_show_${id}`;
              const enabled = settingsObj[showKey] !== false; // Default to true

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
      setHasUnsavedChanges(false);
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

  const generateChartWithAI = async (prompt: string, chartData: any): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-chart-image', {
        body: { prompt, chartData }
      });

      if (error) {
        console.error('Error generating chart with AI:', error);
        return null;
      }

      console.log('Chart generated with provider:', data?.provider);

      if (data?.imageBase64) {
        return `data:${data.mimeType || 'image/png'};base64,${data.imageBase64}`;
      }

      // If no image but text context, log it (could be used for local rendering later)
      if (data?.textContext) {
        console.log('Received text context for chart (no image):', data.textContext.substring(0, 200));
      }

      return null;
    } catch (error) {
      console.error('Error calling AI chart API:', error);
      return null;
    }
  };

  const generatePDFPreview = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const brandColor = hexToRgb(settings.primary_color);

      // Pre-load logo for header/footer
      let headerLogoData: string | null = null;
      if (settings.logo_urls && settings.logo_urls.length > 0) {
        try {
          headerLogoData = await loadImage(settings.logo_urls[0]);
        } catch (e) {
          console.error("Error pre-loading header logo:", e);
        }
      }

      // Helper to add header/footer to internal pages
      const addPageDecorations = (pageNumber: number) => {
        const yPosDecor = 12;

        // Header Logo
        if (headerLogoData) {
          try {
            doc.addImage(headerLogoData, 'PNG', 15, yPosDecor, 25, 15);
          } catch (e) {
            console.error("Error adding header logo to page:", e);
          }
        }

        // Header Text (brand name)
        doc.setFontSize(10);
        doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
        doc.setFont("helvetica", "bold");
        doc.text(settings.content_company_name || "Sistema Educativo", pageWidth - 15, yPosDecor + 10, { align: "right" });

        // Decorative Line
        doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
        doc.setLineWidth(0.5);
        doc.line(15, yPosDecor + 18, pageWidth - 15, yPosDecor + 18);

        // Footer
        doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.setFont("helvetica", "normal");
        doc.text(settings.footer_text || "Reporte Informativo", 15, pageHeight - 15);
        doc.text("www.sistemaeducativo.com", pageWidth - 15, pageHeight - 15, { align: "right" });

        // Page Number badge
        doc.setFillColor(brandColor.r, brandColor.g, brandColor.b, 0.1);
        doc.rect(pageWidth / 2 - 10, pageHeight - 15, 20, 10, 'F');
        doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
        doc.text(`${pageNumber}`, pageWidth / 2, pageHeight - 8, { align: "center" });
      };

      // ===== PÁGINA 1: PORTADA =====
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      if (settings.template === 'modern') {
        doc.setFillColor(brandColor.r, brandColor.g, brandColor.b, 0.05);
        doc.rect(0, pageHeight / 2, pageWidth, pageHeight / 2, 'F');
      }

      let yPosP = 30;
      if (settings.logo_urls.length > 0) {
        const logoSize = 50;
        const spacingP = 15;
        const totalWidth = settings.logo_urls.length * logoSize + (settings.logo_urls.length - 1) * spacingP;
        let xPosP = (pageWidth - totalWidth) / 2;

        for (const logoUrl of settings.logo_urls) {
          try {
            const img = await loadImage(logoUrl);
            doc.addImage(img, 'PNG', xPosP, yPosP, logoSize, logoSize * 0.6);
            xPosP += logoSize + spacingP;
          } catch (error) {
            console.error("Error loading logo:", error);
          }
        }
        yPosP += 50;
      }

      // Polished Cover Page Title Section
      doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("DOCUMENTO OFICIAL", pageWidth / 2, yPosP, { align: "center", charSpace: 2 });
      yPosP += 8;

      doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b, 0.5);
      doc.setLineWidth(0.8);
      doc.line(pageWidth / 2 - 20, yPosP, pageWidth / 2 + 20, yPosP);
      yPosP += 15;

      doc.setFontSize(34);
      doc.setFont("helvetica", "bold");
      doc.text("REPORTE DE", pageWidth / 2, yPosP, { align: "center" });
      yPosP += 12;
      doc.text("EVALUACIÓN", pageWidth / 2, yPosP, { align: "center" });
      yPosP += 20;

      doc.setFontSize(14);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      const subTitleSplit = doc.splitTextToSize(settings.header_text, pageWidth - 60);
      doc.text(subTitleSplit, pageWidth / 2, yPosP, { align: "center" });
      yPosP += (subTitleSplit.length * 7) + 25;

      // Fecha en portada
      doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      const fechaPort = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      doc.text(fechaPort.toUpperCase(), pageWidth / 2, yPosP, { align: "center", charSpace: 1 });
      yPosP += 15;

      // Información del evaluador
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text("Evaluador: Sistema Educativo", pageWidth / 2, pageHeight - 30, { align: "center" });
      doc.text("www.sistemaeducativo.com", pageWidth / 2, pageHeight - 20, { align: "center" });

      const writeTextWithBold = (text: string, x: number, y: number, maxWidth: number, fontSize: number): number => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        let currentX = x;
        let currentY = y;
        const lineHeight = fontSize * 0.5;

        parts.forEach((part) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            doc.setFont("helvetica", "bold");
            const boldText = part.slice(2, -2);
            doc.text(boldText, currentX, currentY);
            currentX += doc.getTextWidth(boldText);
          } else {
            doc.setFont("helvetica", "normal");
            doc.text(part, currentX, currentY);
            currentX += doc.getTextWidth(part);
          }
        });

        return currentY;
      };

      // ===== SECCIONES DINÁMICAS =====
      const templateP2 = getReportTypeTemplate(settings.report_type);
      const sectionOrderP2 = settings.section_order || templateP2?.defaultConfig.section_order || [];
      let currentPageP2 = 2;

      for (const sectionId of sectionOrderP2) {
        const section = templateP2?.custom_sections.find(s => s.id === sectionId);
        let sectionContent = (settings as any)[`content_${sectionId}_text`] || "";
        const isEnabled = (settings as any)[`content_show_${sectionId}`] !== false;

        if (!section || !isEnabled) continue;

        // Start each new section on a fresh page
        doc.addPage();
        addPageDecorations(currentPageP2);
        currentPageP2++;

        let yPosSect = 45;

        // Section Title
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
        doc.text(section.title.toUpperCase(), 15, yPosSect);
        yPosSect += 15;

        // Section content with auto page breaking
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);

        if (sectionContent) {
          // Normalize line breaks and clean special chars
          sectionContent = sectionContent.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, "");

          const lines = doc.splitTextToSize(sectionContent, pageWidth - 30);
          for (const line of lines) {
            // Check if we need a new page BEFORE writing
            if (yPosSect > pageHeight - 30) {
              doc.addPage();
              addPageDecorations(currentPageP2);
              currentPageP2++;
              yPosSect = 45;
              // Reset font state on new page
              doc.setFont("helvetica", "normal");
              doc.setFontSize(11);
              doc.setTextColor(40, 40, 40);
            }

            // Simple Bold Parser per line 
            if (line.includes('**')) {
              const parts = line.split(/(\*\*.*?\*\*)/g);
              let localX = 15;
              parts.forEach(part => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  doc.setFont("helvetica", "bold");
                  const cleanPart = part.slice(2, -2);
                  doc.text(cleanPart, localX, yPosSect);
                  localX += doc.getTextWidth(cleanPart);
                } else {
                  doc.setFont("helvetica", "normal");
                  doc.text(part, localX, yPosSect);
                  localX += doc.getTextWidth(part);
                }
              });
            } else {
              doc.setFont("helvetica", "normal");
              doc.text(line, 15, yPosSect);
            }

            yPosSect += 7;
          }
          yPosSect += 5; // Extra padding after text
        }

        // Handle Chart generation
        const chartSects = ['resultados', 'perfil_estilos', 'modalidades', 'analisis_integral', 'proyecciones', 'analisis_habitos', 'prediccion_avanzada'];
        if (chartSects.includes(sectionId) && settings.use_gemini_charts) {
          const cData = { title: section.title, labels: ['A', 'B', 'C'], values: [85, 70, 95], type: 'bar' };
          const cPrompt = `Gráfico de ${section.title}. Color: ${settings.primary_color}`;
          const cImage = await generateChartWithAI(cPrompt, cData);
          if (cImage) {
            try {
              // Ensure chart fits or wrap to new page
              if (yPosSect + 85 > pageHeight - 30) {
                doc.addPage();
                addPageDecorations(currentPageP2);
                currentPageP2++;
                yPosSect = 45;
              }
              doc.addImage(cImage, 'PNG', 15, yPosSect, pageWidth - 30, 75);
              yPosSect += 85;
            } catch (e) {
              console.error("Error adding chart image:", e);
            }
          }
        }
      }
      const pBlob = doc.output('blob');
      const pUrl = URL.createObjectURL(pBlob);
      if (pdfPreview) URL.revokeObjectURL(pdfPreview);
      setPdfPreview(pUrl);
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
      <header className="border-b bg-card sticky top-0 z-30">
        <MotionDiv
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="container mx-auto px-4 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="bg-white/10 hover:bg-white/20 hover:text-primary transition-all gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver al Panel</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Editor de PDF y Reportes</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className={`transition-all gap-2 relative ${hasUnsavedChanges ? 'bg-amber-600 hover:bg-amber-700' : 'bg-primary hover:bg-primary/90'}`}
              data-tutorial="save-settings-btn"
              title={hasUnsavedChanges ? "Tienes cambios sin guardar" : "Sin cambios pendientes"}
            >
              {hasUnsavedChanges && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
              )}
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">{saving ? "Guardando..." : hasUnsavedChanges ? "¡Guardar Cambios!" : "Guardado"}</span>
            </Button>
          </div>
        </MotionDiv>
      </header>

      <main className="container mx-auto px-4 py-8">
        <MotionDiv
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Left Column: Editor Controls */}
          <MotionDiv variants={itemVariants} className="lg:col-span-5 space-y-6">
            <Card className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Configuración</h2>
              </div>


              {/* AI Debugger - MOVED TO PROFILE (Admin Only) */}
              {/* <OpenRouterConfig /> */}

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
                    <div className="w-full h-16 bg-muted rounded mb-2 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <p className="text-xs font-bold text-center">Clásica (Estándar)</p>
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, template: 'modern' })}
                    className={`p-4 border-2 rounded-lg transition-all ${settings.template === 'modern'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <div className="w-full h-16 bg-primary/20 rounded mb-2 flex items-center justify-center">
                      <Brain className="w-8 h-8 text-primary/40" />
                    </div>
                    <p className="text-xs font-bold text-center">Moderna (Integración IA)</p>
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, template: 'minimal' })}
                    className={`p-4 border-2 rounded-lg transition-all ${settings.template === 'minimal'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <div className="w-full h-16 border-2 border-dashed border-muted rounded mb-2 flex items-center justify-center">
                      <Laptop className="w-8 h-8 text-muted-foreground/20" />
                    </div>
                    <p className="text-xs font-bold text-center">Minimalista</p>
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
                        Generar gráficos usando el proveedor de IA activo en tu perfil
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

                {/* Report Type Selector */}
                <div className="space-y-3" data-tutorial="report-type-selector">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    TIPO DE REPORTE
                  </Label>
                  <Select
                    value={settings.report_type}
                    onValueChange={(value: ReportType) => {
                      const template = getReportTypeTemplate(value);
                      if (template) {
                        // Confirm with user if they want to overwrite current content with defaults?
                        // For now, let's just update the type and let the useEffect handle defaults
                        // but we might want to be more explicit.
                        setSettings({
                          ...settings,
                          report_type: value,
                          // Overwrite with defaults for the new type?
                          // Yes, usually when switching "Type" you want the new structure
                          ...template.defaultConfig
                        });
                        toast({
                          title: "Tipo de reporte cambiado",
                          description: `Se ha aplicado la configuración para ${template.name}`,
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un tipo de reporte" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypeTemplates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          <div className="flex items-center gap-2">
                            <span>{t.icon}</span>
                            <span>{t.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    💡 Al cambiar el tipo de reporte, se aplicarán las secciones y contenidos predefinidos.
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
                    <div key={section.id} className="space-y-2 border-t pt-4 first:border-t-0 first:pt-0">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                          {section.title}
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1.5 hover:text-primary hover:bg-primary/10 transition-all"
                          disabled={isRefining[section.id]}
                          onClick={() => handleRefineText(section.id, (settings as any)[`content_${section.id}_text`] || '')}
                        >
                          {isRefining[section.id] ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Wand2 className="h-3 w-3" />
                          )}
                          Refinar con IA
                        </Button>
                      </div>
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
            </Card>
          </MotionDiv>

          {/* Right Column: Preview */}
          <MotionDiv variants={itemVariants} className="lg:col-span-7">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Vista Previa</h2>
                </div>
                <div className="text-sm text-muted-foreground">
                  Tipo: {settings.report_type === 'prediccion' ? 'Predicción' : settings.report_type === 'chaea' ? 'Estilo de Aprendizaje' : 'Historial'}
                </div>
              </div>
              <Card className="overflow-hidden bg-muted/30 border-dashed border-2 min-h-[800px] flex flex-col">
                <div className="h-full overflow-auto p-2 md:p-4">
                  <div className="max-w-5xl mx-auto">
                    <ReportPreview settings={settings} />
                  </div>
                </div>
              </Card>
            </div>
          </MotionDiv>
        </MotionDiv>
      </main>

      <TutorialButton onClick={() => startTutorial(reportSettingsTutorial)} />
    </div >
  );
};

export default React.memo(ReportSettings);