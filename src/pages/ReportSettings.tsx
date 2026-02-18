import React, { useState, useEffect } from "react";
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
import { ArrowLeft, Upload, Trash2, Settings, Save, FileText, Brain, Laptop, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import { contentTemplates, type ContentTemplate } from "@/lib/contentTemplates";
import { reportTypeTemplates, getReportTypeTemplate, type ReportType } from "@/lib/reportTypeTemplates";
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
  const [randomData, setRandomData] = useState<any[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);

  useEffect(() => {
    fetchRandomData();
  }, []);

  const fetchRandomData = async () => {
    setIsFetchingData(true);
    setPdfPreview(null);
    try {
      const { data: evals, error: eError } = await supabase
        .from('evaluations')
        .select(`
          observations, 
          test_1_observations,
          test_2_observations,
          recommendations:ai_results(recommendations), 
          child:children(name)
        `)
        .not('observations', 'is', null)
        .limit(20);

      if (eError) throw eError;

      // Shuffle the results to get different variety each time
      const items = (evals || []).sort(() => Math.random() - 0.5);
      setRandomData(items);
    } catch (error) {
      console.error("Error fetching random data:", error);
    } finally {
      setIsFetchingData(false);
    }
  };

  const getRandomValue = (sectionId: string): string => {
    if (randomData.length === 0) return "Cargando datos aleatorios de ejemplo...";

    // Use a hash of sectionId to pick a stable-ish but unique entry from the pool
    // This ensures that different sections likely get different students
    const sectionHash = sectionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = sectionHash % randomData.length;
    const entry = randomData[index];
    // Anonymize the name for the preview
    const learnerName = "el aprendiente";

    if (sectionId === 'recomendaciones' || sectionId === 'recommendations') {
      const recs = entry.recommendations?.[0]?.recommendations || entry.test_1_observations || entry.observations;
      return `Sugerencias para **${learnerName}**:\n\n${recs || "Continuar con el proceso de fortalecimiento de habilidades motoras."}`;
    }

    if (sectionId === 'estado_actual' || sectionId === 'introduction') {
      return `El aprendiente presenta un nivel de desarrollo actual caracterizado por un desempeño promedio del 78% en las evaluaciones de motricidad fina realizadas durante el último trimestre. Se observa una velocidad de aprendizaje moderada-alta, con mejoras consistentes del 12% mensual en coordinación ojo-mano y precisión manual.\n\nCompetencias Actuales:\n• Coordinación Ojo-Mano: 82% - Nivel avanzado\n• Precisión Manual: 75% - Nivel intermedio-avanzado\n• Fuerza de Agarre: 71% - Nivel intermedio\n• Control Visual-Motor: 84% - Nivel avanzado\n\nEl perfil de aprendizaje muestra predominancia visual-kinestésica, con mejor retención en actividades que combinan observación y manipulación directa. La curva de aprendizaje indica una fase de consolidación de habilidades básicas con potencial para avanzar a ejercicios de mayor complejidad.`;
    }

    if (sectionId === 'areas_enfoque' || sectionId === 'proyecciones') {
      return `Proyección estratégica para **${learnerName}**:\n\n${entry.test_2_observations || entry.observations}`;
    }

    // For other sections, use observations or a variation
    return `Evaluación de seguimiento (**${learnerName}**):\n\n${entry.observations}`;
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
  }, [settings, randomData]);

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

  const fetchSettings = async (reportTypeOverride?: ReportType) => {
    const targetType = reportTypeOverride || settings.report_type;
    try {
      const { data, error } = await supabase
        .from("report_settings")
        .select("*")
        .eq("report_type", targetType)
        .maybeSingle();

      if (error) throw error;

      const template = getReportTypeTemplate(targetType);
      let settingsObj: any;

      if (data) {
        const logoUrls = Array.isArray(data.logo_urls) ? data.logo_urls : [];
        const footerLogoUrls = Array.isArray(data.footer_logo_urls) ? data.footer_logo_urls : [];
        const reportType = (data.report_type || targetType) as ReportType;

        // Build settings object with all dynamic content fields
        settingsObj = {
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
      } else {
        // No data found for this type, initialize with template defaults
        settingsObj = {
          id: "",
          report_type: targetType,
          template: template?.defaultConfig.template || 'modern',
          primary_color: template?.defaultConfig.primary_color || '#8EB8B5',
          logo_urls: [],
          footer_logo_urls: [],
          header_text: template?.defaultConfig.header_text || "Reporte de Evaluación",
          footer_text: template?.defaultConfig.footer_text || "Generado por el Sistema de Evaluación Educativa",
          use_gemini_charts: false,
          content_company_name: template?.defaultConfig.content_company_name || '',
          content_responsible_agent: template?.defaultConfig.content_responsible_agent || '',
          section_order: template?.defaultConfig.section_order || []
        };

        // Add dynamic section defaults
        if (template?.custom_sections) {
          template.custom_sections.forEach(section => {
            settingsObj[`content_${section.id}_text`] = template.defaultConfig[`content_${section.id}_text`] || '';
            settingsObj[`content_show_${section.id}`] = true;
          });
        }
      }

      setSettings(settingsObj);
      // Save snapshot for change detection - use stringify to ensure we have a clean comparison
      const snapshot = JSON.stringify(settingsObj);
      setSavedSettingsSnapshot(snapshot);
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
        // REMOVED: id: settings.id || undefined, 
        // We rely on report_type uniqueness for upsert to prevent singleton conflicts
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
        .upsert(upsertData, { onConflict: 'report_type' });

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
    // Clear previous
    if (pdfPreview) URL.revokeObjectURL(pdfPreview);
    setPdfPreview(null);

    try {
      // Mock dimension scores based on report type for preview
      let mockDimensionScores: Record<string, number> | undefined = undefined;

      if (settings.report_type === 'cornell') {
        mockDimensionScores = { "Organización": 75, "Toma de Notas": 68, "Gestión del Tiempo": 72, "Preparación Exámenes": 80, "Lectura": 70 };
      } else if (settings.report_type === 'chaea') {
        mockDimensionScores = { "Activo": 12, "Reflexivo": 15, "Teórico": 14, "Pragmático": 13 };
      } else if (settings.report_type === 'tam') {
        mockDimensionScores = { "Visual": 35, "Auditivo": 28, "Kinestésico": 32 };
      } else if (settings.report_type === 'motricidad') {
        mockDimensionScores = { "Precisión": 85, "Coordinación": 78, "Fuerza": 72, "Control": 88 };
      } else if (settings.report_type === 'competencias') {
        mockDimensionScores = { "Motricidad": 80, "Estudio": 70, "Estilos": 75, "Modalidades": 85, "General": 78 };
      } else if (settings.report_type === 'custom_questionnaire') {
        mockDimensionScores = { "Dimensión 1": 80, "Dimensión 2": 65, "Dimensión 3": 90 };
      }

      // Create mock report data from current settings and random/example data
      const mockReportData = {
        childName: "Adriana Marín Tovar",
        age: "4 años",
        evaluatorName: settings.content_responsible_agent || "Evaluador Principal",
        schoolName: settings.content_company_name || "Institución Educativa",
        date: new Date().toLocaleDateString(),
        reportType: settings.report_type,
        dimensionScores: mockDimensionScores,
        // Map settings to content structure expected by generator
        content: {
          introduction: (settings as any).content_introduction_text || getRandomValue('introduction'),
          conclusion: (settings as any).content_conclusion_text || getRandomValue('conclusion'),
          recommendations: (settings as any).content_recommendations_text || getRandomValue('recommendations')
        },
        // Add specific section content from settings if they exist
        ...settings,
        // Mock predictions for visual components
        predictions: {
          modelInfo: { algorithm: "Random Forest", confidence: 0.88, dataQuality: "Alta" },
          overallProgress: {
            currentLevel: "medio",
            currentAverage: 78,
            trend: "mejora",
            learningVelocity: 12,
            predictions: {
              oneMonth: { expectedAverage: 82, confidenceInterval: [79, 85], likelihood: 0.85 },
              threeMonths: { expectedAverage: 88, confidenceInterval: [85, 91], likelihood: 0.75 },
              sixMonths: { expectedAverage: 94, confidenceInterval: [90, 98], likelihood: 0.65 }
            }
          },
          activityPredictions: [
            { activity: "Ensartado de Cuentas", currentScore: 75, trend: "mejora", predictions: { oneMonth: 82, threeMonths: 88, sixMonths: 94 }, improvementPotential: "alto", confidence: 0.9 },
            { activity: "Recorte de Figuras", currentScore: 62, trend: "estable", predictions: { oneMonth: 65, threeMonths: 70, sixMonths: 78 }, improvementPotential: "medio", confidence: 0.85 },
            { activity: "Trazo de Líneas", currentScore: 80, trend: "mejora rápida", predictions: { oneMonth: 88, threeMonths: 94, sixMonths: 98 }, improvementPotential: "bajo", confidence: 0.95 },
            { activity: "Pinza Digital", currentScore: 58, trend: "deterioro leve", predictions: { oneMonth: 60, threeMonths: 65, sixMonths: 72 }, improvementPotential: "alto", confidence: 0.8 }
          ],
          riskFactors: ["Dificultad en manejo de tijeras (Agarre inconsistente)", "Prensión débil en mano izquierda", "Fatiga rápida en actividades de precisión (Necesita descansos frecuentes)"],
          opportunities: ["Interés alto en actividades de construcción con bloques", "Buena atención visual y seguimiento de instrucciones visuales", "Motivación por juegos de encaje y rompecabezas"],
          recommendations: {
            priority: "Alta Prioridad\n- Reforzar agarre de pinza con ejercicios de plastilina\n- Fomentar uso de tijeras con guía visual para mejorar la dirección del corte\n\nPrioridad Media\n- Integrar juegos de construcción cronometrados para mejorar velocidad\n- Practicar abotonado y cierre de cremalleras en prendas de vestir",
            supportNeeded: "Supervisión moderada constante durante actividades de recorte",
            focusAreas: ["Motricidad Fina", "Coordinación Bilateral", "Control de Fuerza"]
          }
        }
      };

      // Import dynamically to avoid huge bundle or circular deps if any
      const { getReportPDFPreview } = await import('@/lib/ReportPDFGenerator');

      // Pass local settings so preview updates immediately
      const blobUrl = await getReportPDFPreview(mockReportData as any, settings);

      setPdfPreview(blobUrl);

    } catch (error) {
      console.error("Error generating PDF preview:", error);
      toast({
        title: "Error",
        description: "No se pudo generar la vista previa del PDF",
        variant: "destructive"
      });
    }
  };

  const generatePDFPreviewOld = async () => {
    setPdfPreview(null); // Clear previous preview
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

        if (settings.template === 'modern') {
          // Modern Left Accent
          doc.setFillColor(brandColor.r, brandColor.g, brandColor.b);
          doc.rect(0, 0, 1.5, pageHeight, 'F');

          // Header Logo
          if (headerLogoData) {
            try {
              doc.addImage(headerLogoData, 'PNG', 15, yPosDecor, 18, 11);
            } catch (e) {
              console.error("Error adding header logo to page:", e);
            }
          }

          // Header Text (brand name) - Modern style
          doc.setFontSize(9);
          doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
          doc.setFont("helvetica", "bold");
          doc.text(settings.content_company_name?.toUpperCase() || "SISTEMA EDUCATIVO", pageWidth - 15, yPosDecor + 6, { align: "right" });

          // Footer
          doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b, 0.2);
          doc.setLineWidth(0.2);
          doc.line(18, pageHeight - 20, pageWidth - 15, pageHeight - 20);
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.setFont("helvetica", "normal");
          doc.text(settings.footer_text || "Reporte Informativo", 18, pageHeight - 12);
          doc.text("www.sistemaeducativo.com", pageWidth - 15, pageHeight - 12, { align: "right" });

          // Page Number badge - Modern Circle
          doc.setFillColor(brandColor.r, brandColor.g, brandColor.b);
          doc.circle(pageWidth / 2, pageHeight - 12, 4, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.text(`${pageNumber}`.padStart(2, '0'), pageWidth / 2, pageHeight - 11, { align: "center" });
        } else if (settings.template === 'minimal') {
          // Minimal style
          doc.setFontSize(9);
          doc.setTextColor(150, 150, 150);
          doc.setFont("helvetica", "normal");
          doc.text(`${pageNumber}`.padStart(2, '0'), pageWidth - 15, yPosDecor + 5, { align: "right" });

          if (headerLogoData) {
            doc.addImage(headerLogoData, 'PNG', 15, yPosDecor, 15, 8);
          }

          doc.setDrawColor(240, 240, 240);
          doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
          doc.text(settings.footer_text || "Reporte Informativo", 15, pageHeight - 12);
        } else {
          // Classic style (Standard)
          if (headerLogoData) {
            try {
              doc.addImage(headerLogoData, 'PNG', 15, yPosDecor, 25, 15);
            } catch (e) {
              console.error("Error adding header logo to page:", e);
            }
          }

          doc.setFontSize(10);
          doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
          doc.setFont("helvetica", "bold");
          doc.text(settings.content_company_name || "Sistema Educativo", pageWidth - 15, yPosDecor + 10, { align: "right" });

          doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
          doc.setLineWidth(0.5);
          doc.line(15, yPosDecor + 18, pageWidth - 15, yPosDecor + 18);

          doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);
          doc.setFontSize(8);
          doc.setTextColor(120, 120, 120);
          doc.setFont("helvetica", "normal");
          doc.text(settings.footer_text || "Reporte Informativo", 15, pageHeight - 15);
          doc.text("www.sistemaeducativo.com", pageWidth - 15, pageHeight - 15, { align: "right" });

          doc.setFillColor(brandColor.r, brandColor.g, brandColor.b, 0.1);
          doc.rect(pageWidth / 2 - 10, pageHeight - 15, 20, 10, 'F');
          doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
          doc.text(`${pageNumber}`, pageWidth / 2, pageHeight - 8, { align: "center" });
        }
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

        // Use random data if requested (override content except for institutional info)
        if (randomData.length > 0) {
          sectionContent = getRandomValue(sectionId);
        }

        // Start each new section on a fresh page
        doc.addPage();
        addPageDecorations(currentPageP2);
        currentPageP2++;

        let yPosSect = 45;

        // Section Title
        if (settings.template === 'modern') {
          doc.setFillColor(brandColor.r, brandColor.g, brandColor.b);
          doc.rect(15, yPosSect - 6, 12, 1.2, 'F');
          doc.setFontSize(26);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
          doc.text(section.title, 15, yPosSect);
          yPosSect += 15;
        } else if (settings.template === 'minimal') {
          doc.setFillColor(brandColor.r, brandColor.g, brandColor.b);
          doc.rect(15, yPosSect - 2, 8, 0.5, 'F');
          doc.setFontSize(24);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
          doc.text(section.title, 15, yPosSect);
          yPosSect += 12;
        } else {
          doc.setFontSize(22);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
          doc.text(section.title.toUpperCase(), 15, yPosSect);
          yPosSect += 15;
        }

        // Section content with auto page breaking
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);

        if (sectionContent) {
          sectionContent = (sectionContent as string).replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, "");
          const xOffset = settings.template === 'modern' ? 18 : 15;
          const lines = doc.splitTextToSize(sectionContent, pageWidth - (xOffset + 15));

          for (const line of lines) {
            if (yPosSect > pageHeight - 35) {
              doc.addPage();
              addPageDecorations(currentPageP2);
              currentPageP2++;
              yPosSect = 45;
              doc.setFont("helvetica", "normal");
              doc.setFontSize(11);
              doc.setTextColor(40, 40, 40);
            }

            if (line.includes('**')) {
              const parts = line.split(/(\*\*.*?\*\*)/g);
              let localX = xOffset;
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
              doc.text(line, xOffset, yPosSect);
            }
            yPosSect += 7;
          }
          yPosSect += 5;
        }


        // === CUSTOM VISUAL RENDERER FOR 'ESTADO_ACTUAL' ===
        if (sectionId === 'estado_actual' || sectionId === 'introduction') {
          // We want to render the rich content with some graphical elements (progress bars for competencies)
          // The text is long, so let's parse it or render it manually to inject the bars.

          // 1. Render Intro Paragraph
          const introText = "El aprendiente presenta un nivel de desarrollo actual caracterizado por un desempeño promedio del 78% en las evaluaciones de motricidad fina realizadas durante el último trimestre. Se observa una velocidad de aprendizaje moderada-alta, con mejoras consistentes del 12% mensual en coordinación ojo-mano y precisión manual.";

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(60, 60, 60);
          const splitIntro = doc.splitTextToSize(introText, pageWidth - 35);
          doc.text(splitIntro, settings.template === 'modern' ? 18 : 15, yPosSect);
          yPosSect += (splitIntro.length * 6) + 10;

          // 2. Render Competencies Chart
          const competencies = [
            { name: "Coordinación Ojo-Mano", value: 82, level: "Avanzado" },
            { name: "Precisión Manual", value: 75, level: "Intermedio-Avanzado" },
            { name: "Fuerza de Agarre", value: 71, level: "Intermedio" },
            { name: "Control Visual-Motor", value: 84, level: "Avanzado" }
          ];

          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(settings.template === 'modern' ? brandColor.r : 0, settings.template === 'modern' ? brandColor.g : 0, settings.template === 'modern' ? brandColor.b : 0);
          doc.text("Competencias Actuales", settings.template === 'modern' ? 18 : 15, yPosSect);
          yPosSect += 8;

          competencies.forEach(comp => {
            const xStart = settings.template === 'modern' ? 18 : 15;
            const barWidth = 100; // Max width of bar
            const barHeight = 4;

            // Label
            doc.setFontSize(9);
            doc.setFont("helvetica", "medium");
            doc.setTextColor(80, 80, 80);
            doc.text(comp.name, xStart, yPosSect);

            // Value text
            doc.setFont("helvetica", "bold");
            doc.text(`${comp.value}%`, xStart + 110, yPosSect);

            // Level text
            doc.setFont("helvetica", "normal");
            doc.setTextColor(120, 120, 120);
            doc.setFontSize(8);
            doc.text(`- ${comp.level}`, xStart + 125, yPosSect);

            yPosSect += 3;

            // Background Bar
            doc.setFillColor(230, 230, 230);
            doc.roundedRect(xStart, yPosSect, barWidth, barHeight, 1, 1, 'F');

            // Value Bar
            doc.setFillColor(brandColor.r, brandColor.g, brandColor.b); // Use brand color
            doc.roundedRect(xStart, yPosSect, (comp.value / 100) * barWidth, barHeight, 1, 1, 'F');

            yPosSect += 10;
          });

          yPosSect += 5;

          // 3. Render Conclusion Paragraph
          const conclusionText = "El perfil de aprendizaje muestra predominancia visual-kinestésica, con mejor retención en actividades que combinan observación y manipulación directa. La curva de aprendizaje indica una fase de consolidación de habilidades básicas con potencial para avanzar a ejercicios de mayor complejidad.";

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(60, 60, 60);
          const splitConclusion = doc.splitTextToSize(conclusionText, pageWidth - 35);

          // Check if we need new page
          if (yPosSect + (splitConclusion.length * 6) > pageHeight - 20) {
            doc.addPage();
            addPageDecorations(currentPageP2);
            currentPageP2++;
            yPosSect = 40;
          }

          doc.text(splitConclusion, settings.template === 'modern' ? 18 : 15, yPosSect);
          yPosSect += (splitConclusion.length * 6) + 10;

          // Prevent standard text rendering
          sectionContent = "";
        }


        // === CUSTOM VISUAL RENDERER FOR 'PROYECCIONES' ===
        if (sectionId === 'proyecciones' || sectionId === 'prediccion_avanzada') {
          // If we have content, render it first
          if (sectionContent) {
            // ... logic to render text context if needed, but user wants visual "instead of" or "in addition to"
            // Let's render a small intro text if available, then the cards.
          }

          // Mock Data for "Activity Cards" visual
          const activities = [
            { name: "Juego de Pesca", current: 3, status: "estable", potential: "medio", p1: 3.0, p3: 3.1, p6: 3.1, progress: 0.9 },
            { name: "Pesca con imán", current: 2, status: "mejora", potential: "alto", p1: 2.5, p3: 3.8, p6: 4.5, progress: 0.6 },
            { name: "Coordinación", current: 4, status: "estable", potential: "bajo", p1: 4.0, p3: 4.1, p6: 4.2, progress: 0.95 }
          ];

          let currentY = yPosSect + 5;

          // Define card colors - Dark UI theme usually, but for print we use clean borders
          // User asked "como se ve en la interfaz" which is likely the dark cards.
          // We will simulate a "Light Mode" version of the UI card for better printing, 
          // but keep the layout exactly as requested.

          activities.forEach((act) => {
            // Check page break for card (approx height 45)
            if (currentY + 50 > pageHeight - 20) {
              doc.addPage();
              addPageDecorations(currentPageP2);
              currentPageP2++;
              currentY = 45;
            }

            // Card Background
            doc.setDrawColor(220, 220, 230);
            doc.setFillColor(248, 250, 252); // Very light slate
            doc.roundedRect(15, currentY, pageWidth - 30, 42, 3, 3, 'FD');

            // Title Row
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 41, 59); // Slate 800
            doc.text(act.name, 20, currentY + 10);

            // Potential Badge (Right aligned)
            const potText = `Potencial: ${act.potential}`;
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            const badgeWidth = doc.getTextWidth(potText) + 6;
            doc.setFillColor(59, 130, 246); // Blue 500
            doc.roundedRect(pageWidth - 20 - badgeWidth, currentY + 6, badgeWidth, 6, 2, 2, 'F');
            doc.text(potText, pageWidth - 20 - badgeWidth + 3, currentY + 10);

            // Current & Status Badge
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.setFont("helvetica", "normal");
            doc.text(`Actual: ${act.current}`, 20, currentY + 18);

            const statusText = act.status;
            doc.setFontSize(8);
            const statusWidth = doc.getTextWidth(statusText) + 6;

            // Status badge color
            if (act.status === 'estable') doc.setFillColor(234, 179, 8); // Yellow 500
            else if (act.status === 'mejora') doc.setFillColor(34, 197, 94); // Green 500
            else doc.setFillColor(100, 116, 139); // Slate 500

            doc.roundedRect(20 + 15 + 5, currentY + 14, statusWidth, 5, 2, 2, 'F'); // x relative to "Actual: 3"
            doc.setTextColor(255, 255, 255);
            doc.text(statusText, 20 + 15 + 8, currentY + 17.5);

            // Data Grid Box (Darker background for data)
            const gridY = currentY + 22;
            const gridHeight = 12;
            doc.setFillColor(30, 41, 59); // Slate 800 (Dark background like screenshot)
            doc.roundedRect(20, gridY, pageWidth - 40, gridHeight, 2, 2, 'F');

            // Grid Columns (1 mes, 3 meses, 6 meses)
            doc.setTextColor(148, 163, 184); // Slate 400
            doc.setFontSize(7);
            const colWidth = (pageWidth - 40) / 3;

            // Col 1
            doc.text("1 mes", 20 + colWidth * 0.5, gridY + 4, { align: 'center' });
            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.text(`${act.p1}`, 20 + colWidth * 0.5, gridY + 9, { align: 'center' });

            // Col 2
            doc.setFont("helvetica", "normal");
            doc.setTextColor(148, 163, 184);
            doc.setFontSize(7);
            doc.text("3 meses", 20 + colWidth * 1.5, gridY + 4, { align: 'center' });
            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.text(`${act.p3}`, 20 + colWidth * 1.5, gridY + 9, { align: 'center' });

            // Col 3
            doc.setFont("helvetica", "normal");
            doc.setTextColor(148, 163, 184);
            doc.setFontSize(7);
            doc.text("6 meses", 20 + colWidth * 2.5, gridY + 4, { align: 'center' });
            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.text(`${act.p6}`, 20 + colWidth * 2.5, gridY + 9, { align: 'center' });

            // Progress Bar
            const barY = gridY + gridHeight + 4; // Below grid
            doc.setDrawColor(59, 130, 246); // Blue outline
            doc.setLineWidth(0.5);
            doc.line(20, barY, pageWidth - 20, barY); // Base line

            // Progress fill
            doc.setDrawColor(34, 197, 94); // Green progress
            doc.setLineWidth(1.5);
            doc.line(20, barY, 20 + ((pageWidth - 40) * act.progress), barY);

            currentY += 48; // Card height + spacing
          });

          // Update yPosSect for next steps
          yPosSect = currentY;

          // Skip standard text rendering if we just did the visual cards?
          // Or allow text to appear after?
          // Let's mark sectionId as handled if we don't want standard text. 
          // But the loop below handles text logic if sectionContent exists.
          // We can clear sectionContent to prevent duplication or use it as intro.
          sectionContent = ""; // Prevent standard text rendering for this section to avoid clutter
        }

        // Handle Chart generation
        const chartSects = ['resultados', 'perfil_estilos', 'modalidades', 'analisis_integral', 'analisis_habitos', 'estado_actual', 'areas_enfoque'];
        if (chartSects.includes(sectionId) && settings.use_gemini_charts) {
          const cData = { title: section.title, labels: ['Nivel 1', 'Nivel 2', 'Nivel 3'], values: [85, 70, 95], type: sectionId === 'proyecciones' ? 'line' : 'bar' };
          const cPrompt = `Gráfico de ${section.title}. Color: ${settings.primary_color}`;
          const cImage = await generateChartWithAI(cPrompt, cData);
          if (cImage) {
            try {
              if (yPosSect + 85 > pageHeight - 35) {
                doc.addPage();
                addPageDecorations(currentPageP2);
                currentPageP2++;
                yPosSect = 45;
              }
              const xOffset = settings.template === 'modern' ? 18 : 15;
              doc.addImage(cImage, 'PNG', xOffset, yPosSect, pageWidth - (xOffset + 15), 75);
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
                      // Fetch settings for the new report type to avoid leakage
                      fetchSettings(value);
                      toast({
                        title: "Cargando configuración",
                        description: `Cambiando al tipo de reporte: ${value}`,
                      });
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
                        📅 <strong>Fecha automática:</strong> La fecha del reporte se genera automáticamente al momento de creación.
                      </p>
                      <p className="text-xs text-blue-600/80 mt-2 font-medium">
                        ✨ El resto de secciones (Recomendaciones, Avances, etc.) se muestran en la vista previa usando datos aleatorios de tus aprendientes actuales para fines ilustrativos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </MotionDiv>

          {/* Right Column: Preview */}
          <MotionDiv variants={itemVariants} className="lg:col-span-7">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Vista Previa Real (PDF)</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={fetchRandomData}
                    disabled={isFetchingData}
                  >
                    <Sparkles className={`h-3.5 w-3.5 ${isFetchingData ? 'animate-spin' : ''}`} />
                    Regenerar ejemplo
                  </Button>
                  <div className="text-sm text-muted-foreground hidden sm:block">
                    Tipo: {settings.report_type === 'prediccion' ? 'Predicción' : settings.report_type === 'chaea' ? 'Estilo de Aprendizaje' : 'Historial'}
                  </div>
                </div>
              </div>
              <Card className="overflow-hidden bg-white shadow-2xl ring-1 ring-black/5 min-h-[800px] flex flex-col relative">
                {pdfPreview ? (
                  <iframe
                    src={`${pdfPreview}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-[850px] border-none"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Generando Documento</h3>
                    <p className="text-sm text-muted-foreground max-w-[200px] mt-2">
                      Esto puede tardar unos segundos dependiendo de los gráficos...
                    </p>
                  </div>
                )}
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