import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { getReportTypeTemplate, type ReportType } from "@/lib/reportTypeTemplates";

interface ReportData {
    childName: string;
    reportType: ReportType;
    evaluationDate: string;
    predictions?: any;
    evaluations?: any[];
}

export class ReportPDFGenerator {
    private doc: jsPDF;
    private settings: any;
    private pageWidth: number;
    private pageHeight: number;
    private margin: number = 15;
    private logoImage?: string; // dataURL del logo principal
    private logoAspectRatio?: number; // width / height para no deformar
    private footerLogoImages: string[] = []; // dataURLs de logos de pie de página

    constructor() {
        this.doc = new jsPDF();
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
    }

    private hexToRgb(hex: string): { r: number; g: number; b: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
            : { r: 142, g: 184, b: 181 }; // Default color
    }

    private async loadSettings(reportType: ReportType): Promise<void> {
        // La tabla report_settings se maneja como singleton: una sola fila global
        const { data, error } = await supabase
            .from("report_settings")
            .select("*")
            .single();

        const template = getReportTypeTemplate(reportType);

        if (error && error.code !== "PGRST116") {
            console.error("Error loading settings:", error);
        }

        if (data) {
            // Mezclar dynamic_content para obtener logos y textos globales
            const dynamicContent = (data as any).dynamic_content || {};
            this.settings = {
                report_type: reportType,
                ...data,
                ...dynamicContent,
            };
        } else {
            // Sin fila guardada: base vacía, se rellenará con defaults por tipo
            this.settings = { report_type: reportType };
        }

        // A partir de aquí, forzar siempre el diseño según el tipo de reporte
        const defaultTemplate = template?.defaultConfig;

        this.settings.template = defaultTemplate?.template || this.settings.template || "modern";
        this.settings.primary_color = defaultTemplate?.primary_color || this.settings.primary_color || "#8EB8B5";
        this.settings.header_text = this.settings.header_text || defaultTemplate?.header_text || "Reporte de Evaluación";
        this.settings.footer_text = this.settings.footer_text || defaultTemplate?.footer_text || "Sistema de Evaluación Educativa";
        this.settings.content_company_name = this.settings.content_company_name || defaultTemplate?.content_company_name || "";
        this.settings.content_responsible_agent = this.settings.content_responsible_agent || defaultTemplate?.content_responsible_agent || "";
        this.settings.section_order = defaultTemplate?.section_order || this.settings.section_order || [];
    }

    // Cargar logos de pie de página como dataURL para evitar problemas de CORS
    private async loadFooterLogos(): Promise<void> {
        this.footerLogoImages = [];

        try {
            const urls: string[] = this.settings?.footer_logo_urls || [];
            if (!urls || urls.length === 0) return;

            const loaded: string[] = [];

            for (const url of urls) {
                try {
                    const response = await fetch(url);
                    const blob = await response.blob();

                    const dataUrl: string = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            if (typeof reader.result === "string") {
                                resolve(reader.result);
                            } else {
                                reject(new Error("Invalid footer logo data"));
                            }
                        };
                        reader.onerror = () => reject(reader.error);
                        reader.readAsDataURL(blob);
                    });

                    loaded.push(dataUrl);
                } catch (e) {
                    console.error("Error loading footer logo for PDF:", e);
                }
            }

            this.footerLogoImages = loaded;
        } catch (error) {
            console.error("Error preparing footer logos for PDF:", error);
            this.footerLogoImages = [];
        }
    }

    // Cargar el primer logo de portada (si existe) como dataURL y guardar su relación de aspecto
    private async loadLogoImage(): Promise<void> {
        try {
            const urls: string[] = this.settings?.logo_urls || [];
            if (!urls || urls.length === 0) return;

            const response = await fetch(urls[0]);
            const blob = await response.blob();

            await new Promise<void>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === "string") {
                        this.logoImage = reader.result;

                        // Crear imagen temporal para calcular proporción original
                        const img = new Image();
                        img.onload = () => {
                            if (img.width && img.height) {
                                this.logoAspectRatio = img.width / img.height;
                            }
                            resolve();
                        };
                        img.onerror = () => resolve();
                        img.src = reader.result;
                    } else {
                        resolve();
                    }
                };
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Error loading logo image for PDF:", error);
            this.logoImage = undefined;
            this.logoAspectRatio = undefined;
        }
    }

    private addCoverPage(reportData: ReportData): void {
        const brandColor = this.hexToRgb(this.settings.primary_color);

        // Franja superior de color (similar a la plantilla de ejemplo)
        this.doc.setFillColor(brandColor.r, brandColor.g, brandColor.b);
        this.doc.rect(0, 0, this.pageWidth, 80, "F");

        // LOGO centrado en la franja (usa logo de configuración si existe, si no texto)
        if (this.logoImage) {
            // Para la plantilla modern de Predicción IA usamos un logo más grande
            const isModernPrediction =
                this.settings?.template === "modern" &&
                (this.settings?.report_type === "prediccion" || reportData.reportType === "prediccion");

            // Tamaños máximos; se escalará manteniendo proporción
            const maxWidth = isModernPrediction ? 80 : 40;
            const maxHeight = isModernPrediction ? 28 : 16;

            let logoWidth = maxWidth;
            let logoHeight = maxHeight;

            if (this.logoAspectRatio && this.logoAspectRatio > 0) {
                // Ajustar según proporción real
                const widthBasedHeight = maxWidth / this.logoAspectRatio;
                const heightBasedWidth = maxHeight * this.logoAspectRatio;

                if (widthBasedHeight <= maxHeight) {
                    logoWidth = maxWidth;
                    logoHeight = widthBasedHeight;
                } else {
                    logoWidth = heightBasedWidth;
                    logoHeight = maxHeight;
                }
            }
            const x = (this.pageWidth - logoWidth) / 2;
            const y = isModernPrediction ? 26 : 30;

            try {
                this.doc.addImage(this.logoImage, "PNG", x, y, logoWidth, logoHeight);
            } catch (error) {
                console.error("Error adding logo image to PDF:", error);
                this.doc.setFont("helvetica", "normal");
                this.doc.setFontSize(11);
                this.doc.setTextColor(255, 255, 255);
                this.doc.text("LOGO", this.pageWidth / 2, 40, { align: "center" });
            }
        } else {
            this.doc.setFont("helvetica", "normal");
            this.doc.setFontSize(11);
            this.doc.setTextColor(255, 255, 255);
            this.doc.text("LOGO", this.pageWidth / 2, 40, { align: "center" });
        }

        // Títulos en portada
        const isModernPredictionTitle =
            this.settings?.template === "modern" &&
            (this.settings?.report_type === "prediccion" || reportData.reportType === "prediccion");

        const headerText =
            reportData.reportType === "prediccion"
                ? (this.settings.header_text || "Reporte de Predicción de Progreso - Modelo IA")
                : (this.settings.header_text || "Reporte de Evaluación");

        if (isModernPredictionTitle) {
            // Pequeña barra sobre el título
            this.doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
            this.doc.setLineWidth(1.2);
            this.doc.line(this.pageWidth / 2 - 18, 104, this.pageWidth / 2 + 18, 104);

            // Título principal "REPORTE" en color de marca
            this.doc.setFont("helvetica", "bold");
            this.doc.setFontSize(24);
            this.doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
            this.doc.text("REPORTE", this.pageWidth / 2, 118, { align: "center" });

            // Subtítulo "de Evaluación" en gris
            this.doc.setFont("helvetica", "normal");
            this.doc.setFontSize(14);
            this.doc.setTextColor(120, 120, 120);
            this.doc.text("de Evaluación", this.pageWidth / 2, 132, { align: "center" });

            // Texto descriptivo (header_text) en gris suave
            this.doc.setFontSize(11);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(headerText, this.pageWidth / 2, 148, { align: "center" });
        } else {
            // Estilo genérico anterior
            this.doc.setTextColor(0, 0, 0);
            this.doc.setFont("helvetica", "normal");
            this.doc.setFontSize(13);
            this.doc.text(headerText, this.pageWidth / 2, 115, { align: "center" });
        }

        // Nombre del aprendiente en grande
        this.doc.setFont("helvetica", "bold");
        this.doc.setFontSize(20);
        this.doc.setTextColor(0, 0, 0);
        const studentNameY = isModernPredictionTitle ? 168 : 140;
        this.doc.text(reportData.childName, this.pageWidth / 2, studentNameY, { align: "center" });

        // Subtítulo de sistema
        const systemSubtitle =
            reportData.reportType === "prediccion"
                ? "Sistema de Predicción Inteligente"
                : this.settings.content_company_name || "Sistema de Evaluación";

        this.doc.setFont("helvetica", "normal");
        this.doc.setFontSize(12);
        this.doc.setTextColor(80, 80, 80);
        this.doc.text(systemSubtitle, this.pageWidth / 2, studentNameY + 18, { align: "center" });

        // Fecha del reporte
        this.doc.setFontSize(11);
        this.doc.text(
            `Fecha: ${new Date(reportData.evaluationDate).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })}`,
            this.pageWidth / 2,
            176,
            { align: "center" }
        );

        // Información de algoritmo y confianza (solo para predicción)
        if (reportData.reportType === "prediccion" && reportData.predictions) {
            const algorithm = reportData.predictions.modelInfo?.algorithm ||
                "Random Forest + Análisis Estadístico Local";
            const confidence = Math.round(
                (reportData.predictions.modelInfo?.confidence || 0.95) * 100
            );

            this.doc.setFontSize(10);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(
                `Algoritmo: ${algorithm}`,
                this.pageWidth / 2,
                194,
                { align: "center" }
            );
            this.doc.text(
                `Confianza del modelo: ${confidence}%`,
                this.pageWidth / 2,
                206,
                { align: "center" }
            );
        }

        // Pie de página
        this.doc.setFontSize(9);
        this.doc.setTextColor(150, 150, 150);
        const footerText =
            reportData.reportType === "prediccion"
                ? (this.settings.footer_text || "Predicción Generada por Inteligencia Artificial")
                : (this.settings.footer_text || "Generado por el Sistema de Evaluación Educativa");

        // Para plantilla modern de predicción añadimos una franja inferior con institución y logos
        const isModernPredictionFooter =
            this.settings?.template === "modern" &&
            (this.settings?.report_type === "prediccion" || reportData.reportType === "prediccion");

        if (isModernPredictionFooter) {
            const baseY = this.pageHeight - 35;

            // Nombre de institución y fecha, alineados al centro
            const institution = this.settings.content_company_name || "Institución Tecnológica";
            this.doc.setFontSize(10);
            this.doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
            this.doc.text(institution, this.pageWidth / 2, baseY, { align: "center" });

            this.doc.setFontSize(9);
            this.doc.setTextColor(120, 120, 120);
            this.doc.text(
                new Date(reportData.evaluationDate).toLocaleDateString("es-ES", {
                    month: "long",
                    year: "numeric",
                }),
                this.pageWidth / 2,
                baseY + 8,
                { align: "center" }
            );

            // Línea decorativa
            this.doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
            this.doc.setLineWidth(0.5);
            this.doc.line(this.margin, baseY + 12, this.pageWidth - this.margin, baseY + 12);

            // Logos de pie de página (si existen)
            if (this.footerLogoImages.length > 0) {
                const logoSize = 14;
                const spacing = 6;
                const totalWidth = this.footerLogoImages.length * logoSize + (this.footerLogoImages.length - 1) * spacing;
                let xPos = this.pageWidth - this.margin - totalWidth;
                const yPos = baseY + 16;

                this.footerLogoImages.forEach((img) => {
                    try {
                        this.doc.addImage(img, "PNG", xPos, yPos, logoSize, logoSize * 0.6);
                    } catch {
                        // Si falla, simplemente no dibujamos ese logo
                    }
                    xPos += logoSize + spacing;
                });
            }

            // Texto de pie de página centrado al final
            this.doc.setFontSize(8);
            this.doc.setTextColor(150, 150, 150);
            this.doc.text(
                footerText,
                this.pageWidth / 2,
                this.pageHeight - 10,
                { align: "center" }
            );
        } else {
            // Footer genérico: texto centrado y, si hay logos, mostrarlos alineados al centro
            const baseY = this.pageHeight - 20;

            this.doc.text(
                footerText,
                this.pageWidth / 2,
                baseY,
                { align: "center" }
            );

            if (this.footerLogoImages.length > 0) {
                const logoSize = 12;
                const spacing = 6;
                const totalWidth = this.footerLogoImages.length * logoSize + (this.footerLogoImages.length - 1) * spacing;
                let xPos = (this.pageWidth - totalWidth) / 2;
                const yPos = baseY + 4;

                this.footerLogoImages.forEach((img) => {
                    try {
                        this.doc.addImage(img, "PNG", xPos, yPos, logoSize, logoSize * 0.6);
                    } catch {
                        // Ignorar errores individuales de logo
                    }
                    xPos += logoSize + spacing;
                });
            }
        }
    }

    // Eliminar marcadores Markdown simples (por ejemplo **negritas**) para que el texto
    // se vea limpio en el PDF, sin asteriscos visibles
    private normalizeContentText(sectionContent: string): string {
        if (!sectionContent) return "";

        return sectionContent
            // Quitar ** de negritas Markdown
            .replace(/\*\*/g, "")
            // Normalizar saltos de línea
            .replace(/\r\n/g, "\n");
    }

    private addContentPage(sectionTitle: string, sectionContent: string): void {
        this.doc.addPage();
        const brandColor = this.hexToRgb(this.settings.primary_color);
        const templateType: string = this.settings?.template || "modern";

        if (templateType === "modern") {
            // Estilo moderno: barra lateral y título en color de marca
            this.doc.setFillColor(brandColor.r, brandColor.g, brandColor.b);
            this.doc.rect(0, 0, 4, this.pageHeight, "F");

            this.doc.setFontSize(14);
            this.doc.setFont("helvetica", "bold");
            this.doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
            this.doc.text(sectionTitle, this.margin, 24);

            this.doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
            this.doc.setLineWidth(0.6);
            this.doc.line(this.margin, 28, this.pageWidth - this.margin, 28);
        } else if (templateType === "classic") {
            // Estilo clásico: línea superior y título centrado en color de marca
            this.doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
            this.doc.setLineWidth(0.8);
            this.doc.line(this.margin, 22, this.pageWidth - this.margin, 22);

            this.doc.setFontSize(14);
            this.doc.setFont("helvetica", "bold");
            this.doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
            this.doc.text(sectionTitle.toUpperCase(), this.pageWidth / 2, 18, { align: "center" });

            // Línea inferior suave
            this.doc.setLineWidth(0.4);
            this.doc.line(this.margin, 26, this.pageWidth - this.margin, 26);
        } else {
            // Estilo minimal: título ligero alineado a la izquierda con línea corta
            this.doc.setFontSize(13);
            this.doc.setFont("helvetica", "normal");
            this.doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
            this.doc.text(sectionTitle, this.margin, 24);

            this.doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
            this.doc.setLineWidth(0.4);
            this.doc.line(this.margin, 28, this.margin + 40, 28);
        }

        // Content
        let yPos = 40;
        this.doc.setFontSize(11);
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(60, 60, 60);

        const normalizedContent = this.normalizeContentText(
            sectionContent || `Contenido de ${sectionTitle}`
        );

        const lines = this.doc.splitTextToSize(
            normalizedContent,
            this.pageWidth - 2 * this.margin
        );

        lines.forEach((line: string) => {
            if (yPos > this.pageHeight - 30) {
                this.doc.addPage();
                yPos = this.margin;
            }
            this.doc.text(line, this.margin, yPos);
            yPos += 6;
        });

        // Footer
        this.doc.setFontSize(8);
        this.doc.setTextColor(150, 150, 150);
        this.doc.text(
            `Página ${this.doc.getNumberOfPages()}`,
            this.pageWidth / 2,
            this.pageHeight - 10,
            { align: "center" }
        );
    }

    private addChartPage(reportData: ReportData): void {
        if (reportData.reportType !== "prediccion" || !reportData.predictions) {
            return;
        }

        this.doc.addPage();
        const brandColor = this.hexToRgb(this.settings.primary_color);

        // Header
        this.doc.setFillColor(brandColor.r, brandColor.g, brandColor.b);
        this.doc.rect(0, 0, this.pageWidth, 25, "F");

        this.doc.setFontSize(14);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(255, 255, 255);
        this.doc.text("RESULTADOS POR DIMENSIÓN", this.margin, 17);

        // Chart placeholder (simple bar chart representation)
        let yPos = 50;
        this.doc.setFontSize(11);
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(60, 60, 60);

        const dimensions = [
            { name: "Social", value: 42 },
            { name: "Individual", value: 62 },
            { name: "Lógico-Matemático", value: 49 },
            { name: "Kinestésico", value: 55 },
            { name: "Visual", value: 54 },
            { name: "Auditivo", value: 50 },
        ];

        dimensions.forEach((dim) => {
            // Label
            this.doc.setTextColor(60, 60, 60);
            this.doc.text(dim.name, this.margin, yPos);

            // Bar
            const barWidth = ((this.pageWidth - 2 * this.margin - 40) * dim.value) / 100;
            this.doc.setFillColor(brandColor.r, brandColor.g, brandColor.b);
            this.doc.rect(this.margin + 60, yPos - 5, barWidth, 8, "F");

            // Background bar
            this.doc.setFillColor(220, 220, 220);
            this.doc.rect(
                this.margin + 60 + barWidth,
                yPos - 5,
                this.pageWidth - 2 * this.margin - 40 - 60 - barWidth,
                8,
                "F"
            );

            // Value
            this.doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
            this.doc.setFont("helvetica", "bold");
            this.doc.text(dim.value.toString(), this.pageWidth - this.margin, yPos, {
                align: "right",
            });

            yPos += 20;
        });
    }

    async generatePDF(reportData: ReportData): Promise<void> {
        await this.loadSettings(reportData.reportType);

        // Cargar logo (si existe) antes de construir las páginas
        await this.loadLogoImage();
        // Cargar logos de pie de página (si existen)
        await this.loadFooterLogos();

        // Get template for report type
        const template = getReportTypeTemplate(reportData.reportType);
        if (!template) {
            throw new Error(`Template not found for report type: ${reportData.reportType}`);
        }

        // Portada
        this.addCoverPage(reportData);

        // Páginas de contenido basadas en las secciones personalizadas de la plantilla
        const sectionOrder = this.settings.section_order || template.defaultConfig.section_order;

        template.custom_sections.forEach((section) => {
            if (sectionOrder.includes(section.id)) {
                const content = this.settings[`content_${section.id}_text`] ||
                    template.defaultConfig[`content_${section.id}_text`] ||
                    `Contenido de ${section.title}`;

                this.addContentPage(section.title, content);
            }
        });

        // Save PDF
        const fileName = `${reportData.reportType}_${reportData.childName.replace(
            /\s+/g,
            "_"
        )}_${new Date().toISOString().split("T")[0]}.pdf`;
        this.doc.save(fileName);
    }
}

// Export function for easy use
export async function generateReportPDF(reportData: ReportData): Promise<void> {
    const generator = new ReportPDFGenerator();
    await generator.generatePDF(reportData);
}
