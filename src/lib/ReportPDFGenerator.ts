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

    private async loadSettings(): Promise<void> {
        const { data, error } = await supabase
            .from("report_settings")
            .select("*")
            .single();

        if (error) {
            console.error("Error loading settings:", error);
            // Use default settings
            this.settings = {
                report_type: "motricidad",
                template: "modern",
                primary_color: "#8EB8B5",
                header_text: "Reporte de Evaluación",
                footer_text: "Sistema de Evaluación Educativa",
                content_company_name: "",
                content_responsible_agent: "",
            };
        } else {
            this.settings = data;
        }
    }

    private addCoverPage(reportData: ReportData): void {
        const brandColor = this.hexToRgb(this.settings.primary_color);

        // Header background
        this.doc.setFillColor(brandColor.r, brandColor.g, brandColor.b);
        this.doc.rect(0, 0, this.pageWidth, 80, "F");

        // Logo placeholder (if exists)
        if (this.settings.logo_urls && this.settings.logo_urls.length > 0) {
            // TODO: Add logo image
            this.doc.setFontSize(10);
            this.doc.setTextColor(255, 255, 255);
            this.doc.text("LOGO", this.pageWidth / 2, 30, { align: "center" });
        }

        // Title
        this.doc.setFontSize(32);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(255, 255, 255);
        this.doc.text("REPORTE", this.pageWidth / 2, 100, { align: "center" });

        this.doc.setFontSize(18);
        this.doc.setFont("helvetica", "normal");
        this.doc.text("de Evaluación", this.pageWidth / 2, 115, { align: "center" });

        // Subtitle
        this.doc.setFontSize(14);
        this.doc.setTextColor(100, 100, 100);
        this.doc.text(
            this.settings.header_text || "Reporte de Evaluación",
            this.pageWidth / 2,
            140,
            { align: "center" }
        );

        // Student name
        this.doc.setFontSize(20);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(reportData.childName, this.pageWidth / 2, 170, { align: "center" });

        // Company info
        if (this.settings.content_company_name) {
            this.doc.setFontSize(12);
            this.doc.setFont("helvetica", "normal");
            this.doc.setTextColor(60, 60, 60);
            this.doc.text(
                this.settings.content_company_name,
                this.pageWidth / 2,
                190,
                { align: "center" }
            );
        }

        // Date
        this.doc.setFontSize(11);
        this.doc.text(
            `Fecha: ${new Date(reportData.evaluationDate).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })}`,
            this.pageWidth / 2,
            210,
            { align: "center" }
        );

        // Algorithm info (for prediction reports)
        if (reportData.reportType === "prediccion" && reportData.predictions) {
            this.doc.setFontSize(10);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(
                `Algoritmo: ${reportData.predictions.modelInfo?.algorithm || "Random Forest + Análisis Estadístico Local"}`,
                this.pageWidth / 2,
                225,
                { align: "center" }
            );
            this.doc.text(
                `Confianza del modelo: ${Math.round((reportData.predictions.modelInfo?.confidence || 0.95) * 100)}%`,
                this.pageWidth / 2,
                235,
                { align: "center" }
            );
        }

        // Footer
        this.doc.setFontSize(9);
        this.doc.setTextColor(150, 150, 150);
        this.doc.text(
            this.settings.footer_text || "Generado por el Sistema de Evaluación Educativa",
            this.pageWidth / 2,
            this.pageHeight - 15,
            { align: "center" }
        );
    }

    private addContentPage(sectionTitle: string, sectionContent: string): void {
        this.doc.addPage();
        const brandColor = this.hexToRgb(this.settings.primary_color);

        // Header
        this.doc.setFillColor(brandColor.r, brandColor.g, brandColor.b);
        this.doc.rect(0, 0, this.pageWidth, 25, "F");

        this.doc.setFontSize(14);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(255, 255, 255);
        this.doc.text(sectionTitle.toUpperCase(), this.margin, 17);

        // Content
        let yPos = 40;
        this.doc.setFontSize(11);
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(60, 60, 60);

        const lines = this.doc.splitTextToSize(
            sectionContent || `Contenido de ${sectionTitle}`,
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
        await this.loadSettings();

        // Get template for report type
        const template = getReportTypeTemplate(reportData.reportType);
        if (!template) {
            throw new Error(`Template not found for report type: ${reportData.reportType}`);
        }

        // Cover page
        this.addCoverPage(reportData);

        // Add chart page for prediction reports
        if (reportData.reportType === "prediccion") {
            this.addChartPage(reportData);
        }

        // Content pages based on custom sections
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
