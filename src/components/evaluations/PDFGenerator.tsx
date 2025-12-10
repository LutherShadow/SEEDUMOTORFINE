import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import QRCode from "qrcode";

interface Activity {
  id: number;
  name: string;
  skill: string;
}

const ACTIVITIES: Activity[] = [
  { id: 1, name: "Juego de Pesca", skill: "Coordinación ojo-mano al sujetar la caña y atrapar los peces" },
  { id: 2, name: "Pesca con imán", skill: "Precisión en el uso del imán para atraer objetos pequeños" },
  { id: 3, name: "Ensartado", skill: "Coordinación y precisión para insertar cuentas en el cordón" },
  { id: 4, name: "Enroscar botellas", skill: "Fuerza y precisión en el movimiento de giro para enroscar tapas" },
  { id: 5, name: "Laberintos con crayón", skill: "Control del trazo y direccionalidad al seguir el laberinto" },
  { id: 6, name: "Laberintos con dáctilo pintura", skill: "Coordinación y control del trazo con pintura dactilar" },
  { id: 7, name: "Juego de lanzamiento con muñecas", skill: "Precisión en el agarre y manipulación al vestir/desvestir muñecas" },
  { id: 8, name: "Juego del candado", skill: "Coordinación y precisión para manipular una llave y abrir candado" }
];

const SCORE_LABELS: Record<number, string> = {
  1: "No alcanza",
  2: "Próximo a alcanzar",
  3: "Alcanza",
  4: "Domina",
  5: "Sobresaliente"
};

interface Evaluation {
  id: string;
  evaluation_date: string;
  test_1_score: number | null;
  test_2_score: number | null;
  test_3_score: number | null;
  test_4_score: number | null;
  test_5_score: number | null;
  test_6_score: number | null;
  test_7_score: number | null;
  test_8_score: number | null;
  test_1_observations: string | null;
  test_2_observations: string | null;
  test_3_observations: string | null;
  test_4_observations: string | null;
  test_5_observations: string | null;
  test_6_observations: string | null;
  test_7_observations: string | null;
  test_8_observations: string | null;
  children: {
    name: string;
  };
}

// Helper function to convert hex to RGB array
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
};

// Generate QR code with document verification info
const generateQRCode = async (evaluationId: string, studentName: string, date: string): Promise<string> => {
  try {
    const verificationData = {
      evaluationId,
      studentName,
      date,
      timestamp: new Date().toISOString(),
      url: `https://seedumotorfine.netlify.app/evaluations/${evaluationId}`
    };
    
    const qrDataURL = await QRCode.toDataURL(JSON.stringify(verificationData), {
      width: 80,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};

export const generateIndividualPDF = async (evaluation: Evaluation) => {
  // Fetch report settings
  const { data: settings } = await supabase
    .from("report_settings")
    .select("*")
    .single();

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Use custom margins from settings
  const margins = settings?.page_margins 
    ? (typeof settings.page_margins === 'object' 
        ? settings.page_margins as { top: number; right: number; bottom: number; left: number }
        : { top: 20, right: 20, bottom: 20, left: 20 })
    : { top: 20, right: 20, bottom: 20, left: 20 };
  
  let yPos = margins.top;

  // Get template colors
  const getTemplateColors = () => {
    const template = settings?.template || 'formal';
    switch(template) {
      case 'colorido':
        return {
          primary: hexToRgb(settings?.primary_color || '#1e40af'),
          secondary: hexToRgb(settings?.secondary_color || '#f3f4f6'),
          accent: hexToRgb(settings?.accent_color || '#3b82f6'),
          headerBg: hexToRgb(settings?.primary_color || '#1e40af'),
          activityBg: hexToRgb(settings?.secondary_color || '#f3f4f6')
        };
      case 'minimalista':
        return {
          primary: [0, 0, 0] as [number, number, number],
          secondary: [250, 250, 250] as [number, number, number],
          accent: [100, 100, 100] as [number, number, number],
          headerBg: [255, 255, 255] as [number, number, number],
          activityBg: [250, 250, 250] as [number, number, number]
        };
      default: // formal
        return {
          primary: [30, 64, 175] as [number, number, number],
          secondary: [243, 244, 246] as [number, number, number],
          accent: [59, 130, 246] as [number, number, number],
          headerBg: [243, 244, 246] as [number, number, number],
          activityBg: [240, 240, 240] as [number, number, number]
        };
    }
  };

  const colors = getTemplateColors();
  const template = settings?.template || 'formal';
  const fontFamily = (settings?.font_family || 'helvetica') as 'helvetica' | 'times' | 'courier';
  const bodyFontSize = settings?.body_font_size || 11;
  const borderColor = hexToRgb(settings?.border_color || '#e5e7eb');

  // Add watermark if enabled
  if (settings?.show_watermark && settings?.watermark_text) {
    doc.saveGraphicsState();
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(60);
    doc.setFont(fontFamily, "bold");
    
    const watermarkX = pageWidth / 2;
    const watermarkY = pageHeight / 2;
    doc.text(settings.watermark_text, watermarkX, watermarkY, {
      align: "center",
      angle: 45
    });
    doc.restoreGraphicsState();
  }

  // Generate and add QR code if enabled
  let qrCodeDataURL = '';
  if (settings?.show_qr_code) {
    qrCodeDataURL = await generateQRCode(
      evaluation.id,
      evaluation.children.name,
      evaluation.evaluation_date
    );
  }

  // Add QR code at the specified position
  if (qrCodeDataURL && settings?.show_qr_code) {
    const qrSize = 25;
    let qrX = 0;
    let qrY = 0;
    
    switch(settings.qr_code_position) {
      case 'top-right':
        qrX = pageWidth - margins.right - qrSize;
        qrY = margins.top;
        break;
      case 'bottom-right':
        qrX = pageWidth - margins.right - qrSize;
        qrY = pageHeight - margins.bottom - qrSize - 5;
        break;
      case 'bottom-left':
        qrX = margins.left;
        qrY = pageHeight - margins.bottom - qrSize - 5;
        break;
    }
    
    doc.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSize, qrSize);
  }

  // Add multiple logos if they exist
  const logoUrls = settings?.logo_urls && Array.isArray(settings.logo_urls) && settings.logo_urls.length > 0
    ? (settings.logo_urls as string[])
    : (settings?.logo_url ? [settings.logo_url] : []);
  
  if (logoUrls.length > 0) {
    try {
      const logoSize = 40; // Tamaño predeterminado para logos principales
      const logoSpacing = 10;
      const totalWidth = (logoSize * logoUrls.length) + (logoSpacing * (logoUrls.length - 1));
      let startX = margins.left;
      
      if (settings?.logo_position === 'center') {
        startX = (pageWidth - totalWidth) / 2;
      } else if (settings?.logo_position === 'right') {
        startX = pageWidth - totalWidth - margins.right;
      }
      
      for (let i = 0; i < logoUrls.length; i++) {
        try {
          const logoData = await loadImage(logoUrls[i]);
          const logoX = startX + (i * (logoSize + logoSpacing));
          doc.addImage(logoData, 'PNG', logoX, yPos, logoSize, logoSize * 0.6);
        } catch (err) {
          console.error(`Error loading logo ${i}:`, err);
        }
      }
      yPos += (logoSize * 0.6) + 10;
    } catch (error) {
      console.error("Error loading logos:", error);
    }
  }

  // Add header line separator
  if (settings?.show_header_border !== false) {
    if (template === 'colorido') {
      doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setLineWidth(settings?.border_width || 2);
    } else {
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(settings?.border_width || 0.5);
    }
    doc.line(margins.left, yPos, pageWidth - margins.right, yPos);
    yPos += template === 'colorido' ? 12 : 10;
  }

  // Title with template styling
  const headerFontSize = settings?.header_font_size || 18;
  if (template === 'colorido') {
    doc.setFillColor(colors.headerBg[0], colors.headerBg[1], colors.headerBg[2]);
    doc.rect(margins.left, yPos - 5, pageWidth - margins.left - margins.right, headerFontSize + 10, 'F');
  }
  
  doc.setFontSize(headerFontSize);
  doc.setFont(fontFamily, "bold");
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  const headerText = settings?.header_text || "Reporte de Evaluación de Motricidad Fina";
  const headerLines = doc.splitTextToSize(headerText, pageWidth - margins.left - margins.right);
  doc.text(headerLines, pageWidth / 2, yPos, { align: "center" });
  yPos += headerLines.length * 8 + 15;

  // Institution information if available
  if (settings?.institution_name) {
    doc.setFontSize(10);
    doc.setFont(fontFamily, "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(settings.institution_name, pageWidth / 2, yPos, { align: "center" });
    yPos += 5;
    
    if (settings?.institution_address) {
      doc.setFontSize(8);
      doc.text(settings.institution_address, pageWidth / 2, yPos, { align: "center" });
      yPos += 4;
    }
    
    if (settings?.institution_phone || settings?.institution_email) {
      doc.setFontSize(8);
      const contactInfo = [settings.institution_phone, settings.institution_email].filter(Boolean).join(' | ');
      doc.text(contactInfo, pageWidth / 2, yPos, { align: "center" });
      yPos += 4;
    }
    yPos += 10;
  }

  // Student info
  doc.setFontSize(bodyFontSize);
  doc.setFont(fontFamily, "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Aprendiente:", margins.left, yPos);
  doc.setFont(fontFamily, "normal");
  doc.text(evaluation.children.name, margins.left + 30, yPos);
  yPos += 7;
  
  doc.setFont(fontFamily, "bold");
  doc.text("Fecha:", margins.left, yPos);
  doc.setFont(fontFamily, "normal");
  doc.text(new Date(evaluation.evaluation_date).toLocaleDateString('es-ES'), margins.left + 30, yPos);
  yPos += 7;

  // Custom fields if configured
  if (settings?.custom_field_1_label && settings?.custom_field_1_value) {
    doc.setFont(fontFamily, "bold");
    doc.text(`${settings.custom_field_1_label}:`, margins.left, yPos);
    doc.setFont(fontFamily, "normal");
    doc.text(settings.custom_field_1_value, margins.left + 30, yPos);
    yPos += 7;
  }

  if (settings?.custom_field_2_label && settings?.custom_field_2_value) {
    doc.setFont(fontFamily, "bold");
    doc.text(`${settings.custom_field_2_label}:`, margins.left, yPos);
    doc.setFont(fontFamily, "normal");
    doc.text(settings.custom_field_2_value, margins.left + 30, yPos);
    yPos += 7;
  }

  if (settings?.custom_field_3_label && settings?.custom_field_3_value) {
    doc.setFont(fontFamily, "bold");
    doc.text(`${settings.custom_field_3_label}:`, margins.left, yPos);
    doc.setFont(fontFamily, "normal");
    doc.text(settings.custom_field_3_value, margins.left + 30, yPos);
    yPos += 7;
  }

  if (settings?.evaluator_name) {
    doc.setFont(fontFamily, "bold");
    doc.text("Evaluador:", margins.left, yPos);
    doc.setFont(fontFamily, "normal");
    doc.text(settings.evaluator_name, margins.left + 30, yPos);
    yPos += 7;
  }

  yPos += 8;

  // Activities
  ACTIVITIES.forEach((activity) => {
    const score = evaluation[`test_${activity.id}_score` as keyof Evaluation] as number | null;
    const observations = evaluation[`test_${activity.id}_observations` as keyof Evaluation] as string | null;

    if (score !== null) {
      // Check if we need a new page
      if (yPos > pageHeight - margins.bottom - 60) {
        doc.addPage();
        yPos = margins.top;
        
        // Re-add watermark on new page
        if (settings?.show_watermark && settings?.watermark_text) {
          doc.saveGraphicsState();
          doc.setTextColor(200, 200, 200);
          doc.setFontSize(60);
          doc.setFont(fontFamily, "bold");
          
          const watermarkX = pageWidth / 2;
          const watermarkY = pageHeight / 2;
          doc.text(settings.watermark_text, watermarkX, watermarkY, {
            align: "center",
            angle: 45
          });
          doc.restoreGraphicsState();
        }
      }

      // Activity title with background
      doc.setFillColor(colors.activityBg[0], colors.activityBg[1], colors.activityBg[2]);
      doc.rect(margins.left, yPos - 5, pageWidth - margins.left - margins.right, 10, 'F');
      
      doc.setFontSize(13);
      doc.setFont(fontFamily, "bold");
      doc.setTextColor(template === 'colorido' ? colors.primary[0] : 0, template === 'colorido' ? colors.primary[1] : 0, template === 'colorido' ? colors.primary[2] : 0);
      doc.text(`${activity.id}. ${activity.name}`, margins.left + 2, yPos);
      yPos += 10;

      // Activity skill description
      doc.setFontSize(10);
      doc.setFont(fontFamily, "italic");
      doc.setTextColor(80, 80, 80);
      const skillLines = doc.splitTextToSize(activity.skill, pageWidth - margins.left - margins.right - 4);
      doc.text(skillLines, margins.left + 2, yPos);
      yPos += skillLines.length * 5 + 5;

      // Score
      doc.setFontSize(bodyFontSize);
      doc.setFont(fontFamily, "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(`Puntuación: ${score} - ${SCORE_LABELS[score]}`, margins.left + 2, yPos);
      yPos += 7;

      // Observations if any
      if (observations) {
        doc.setFont(fontFamily, "italic");
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const obsLines = doc.splitTextToSize(`Observaciones: ${observations}`, pageWidth - margins.left - margins.right - 4);
        doc.text(obsLines, margins.left + 2, yPos);
        yPos += obsLines.length * 5 + 5;
      }

      yPos += 7;
    }
  });

  // Add signature if enabled
  if (settings?.show_signature && settings?.signature_url) {
    try {
      const signatureData = await loadImage(settings.signature_url);
      const sigWidth = 40;
      const sigHeight = 20;
      const sigY = pageHeight - margins.bottom - sigHeight - 35;
      
      doc.addImage(signatureData, 'PNG', margins.left, sigY, sigWidth, sigHeight);
      
      if (settings.signature_text) {
        doc.setFontSize(9);
        doc.setFont(fontFamily, "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(settings.signature_text, margins.left, sigY + sigHeight + 5);
      }
    } catch (error) {
      console.error("Error loading signature:", error);
    }
  }

  // Add page numbers if enabled
  const totalPages = doc.getNumberOfPages();
  if (settings?.show_page_numbers !== false) {
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setFont(fontFamily, "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - margins.bottom + 5, { align: "center" });
    }
  }

  // Add footer to all pages
  const footerLogoUrls = settings?.footer_logo_urls && Array.isArray(settings.footer_logo_urls) && settings.footer_logo_urls.length > 0
    ? (settings.footer_logo_urls as string[])
    : [];
  const footerText = settings?.footer_text || "Generado por el Sistema de Evaluación Educativa";
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    const footerY = pageHeight - margins.bottom - 35;
    
    // Footer line separator
    if (settings?.show_footer_border !== false) {
      if (template === 'colorido') {
        doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.setLineWidth(settings?.border_width || 1);
      } else {
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.setLineWidth(settings?.border_width || 0.5);
      }
      doc.line(margins.left, footerY, pageWidth - margins.right, footerY);
    }
    
    // Footer logos
    if (footerLogoUrls.length > 0) {
      try {
        const footerLogoSize = 18; // Tamaño predeterminado para logos de footer
        const logoSpacing = 12;
        const totalLogoWidth = (footerLogoSize * footerLogoUrls.length) + (logoSpacing * (footerLogoUrls.length - 1));
        const startX = (pageWidth - totalLogoWidth) / 2;
        const logoY = footerY + 3;
        
        for (let j = 0; j < footerLogoUrls.length; j++) {
          try {
            const logoData = await loadImage(footerLogoUrls[j]);
            const logoX = startX + (j * (footerLogoSize + logoSpacing));
            doc.addImage(logoData, 'PNG', logoX, logoY, footerLogoSize, footerLogoSize * 0.6);
          } catch (err) {
            console.error(`Error loading footer logo ${j}:`, err);
          }
        }
      } catch (error) {
        console.error("Error loading footer logos:", error);
      }
    }
    
    doc.setFontSize(8);
    doc.setFont(fontFamily, "italic");
    doc.setTextColor(100, 100, 100);
    const footerLines = doc.splitTextToSize(footerText, pageWidth - margins.left - margins.right);
    doc.text(footerLines, pageWidth / 2, pageHeight - margins.bottom - 2, { align: "center" });
  }

  // Save
  doc.save(`evaluacion_${evaluation.children.name}_${evaluation.evaluation_date}.pdf`);
};

export const generateGroupPDF = async (evaluations: Evaluation[]) => {
  // Fetch report settings
  const { data: settings } = await supabase
    .from("report_settings")
    .select("*")
    .single();

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Use custom margins from settings
  const margins = settings?.page_margins 
    ? (typeof settings.page_margins === 'object' 
        ? settings.page_margins as { top: number; right: number; bottom: number; left: number }
        : { top: 20, right: 20, bottom: 20, left: 20 })
    : { top: 20, right: 20, bottom: 20, left: 20 };

  // Load logos and signature once if exist
  const logoUrls = settings?.logo_urls && Array.isArray(settings.logo_urls) && settings.logo_urls.length > 0
    ? (settings.logo_urls as string[])
    : (settings?.logo_url ? [settings.logo_url] : []);
  
  const logoImages: string[] = [];
  for (const url of logoUrls) {
    try {
      const img = await loadImage(url);
      logoImages.push(img);
    } catch (error) {
      console.error("Error loading logo:", error);
    }
  }
  
  const footerLogoUrls = settings?.footer_logo_urls && Array.isArray(settings.footer_logo_urls) && settings.footer_logo_urls.length > 0
    ? (settings.footer_logo_urls as string[])
    : [];
  
  const footerLogoImages: string[] = [];
  for (const url of footerLogoUrls) {
    try {
      const img = await loadImage(url);
      footerLogoImages.push(img);
    } catch (error) {
      console.error("Error loading footer logo:", error);
    }
  }
  
  let signatureImg: string | null = null;

  // Get template colors
  const getTemplateColors = () => {
    const template = settings?.template || 'formal';
    switch(template) {
      case 'colorido':
        return {
          primary: hexToRgb(settings?.primary_color || '#1e40af'),
          secondary: hexToRgb(settings?.secondary_color || '#f3f4f6'),
          accent: hexToRgb(settings?.accent_color || '#3b82f6'),
          headerBg: hexToRgb(settings?.primary_color || '#1e40af'),
          activityBg: hexToRgb(settings?.secondary_color || '#f3f4f6')
        };
      case 'minimalista':
        return {
          primary: [0, 0, 0] as [number, number, number],
          secondary: [250, 250, 250] as [number, number, number],
          accent: [100, 100, 100] as [number, number, number],
          headerBg: [255, 255, 255] as [number, number, number],
          activityBg: [250, 250, 250] as [number, number, number]
        };
      default: // formal
        return {
          primary: [30, 64, 175] as [number, number, number],
          secondary: [243, 244, 246] as [number, number, number],
          accent: [59, 130, 246] as [number, number, number],
          headerBg: [243, 244, 246] as [number, number, number],
          activityBg: [240, 240, 240] as [number, number, number]
        };
    }
  };

  const colors = getTemplateColors();
  const template = settings?.template || 'formal';
  const fontFamily = (settings?.font_family || 'helvetica') as 'helvetica' | 'times' | 'courier';
  const bodyFontSize = settings?.body_font_size || 11;
  const borderColor = hexToRgb(settings?.border_color || '#e5e7eb');

  if (settings?.show_signature && settings?.signature_url) {
    try {
      signatureImg = await loadImage(settings.signature_url);
    } catch (error) {
      console.error("Error loading signature:", error);
    }
  }

  for (let index = 0; index < evaluations.length; index++) {
    const evaluation = evaluations[index];
    
    if (index > 0) {
      doc.addPage();
    }

    let yPos = margins.top;

    // Add watermark if enabled
    if (settings?.show_watermark && settings?.watermark_text) {
      doc.saveGraphicsState();
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(60);
      doc.setFont(fontFamily, "bold");
      
      const watermarkX = pageWidth / 2;
      const watermarkY = pageHeight / 2;
      doc.text(settings.watermark_text, watermarkX, watermarkY, {
        align: "center",
        angle: 45
      });
      doc.restoreGraphicsState();
    }

    // Generate and add QR code if enabled
    if (settings?.show_qr_code) {
      const qrCodeDataURL = await generateQRCode(
        evaluation.id,
        evaluation.children.name,
        evaluation.evaluation_date
      );

      if (qrCodeDataURL) {
        const qrSize = 25;
        let qrX = 0;
        let qrY = 0;
        
        switch(settings.qr_code_position) {
          case 'top-right':
            qrX = pageWidth - margins.right - qrSize;
            qrY = margins.top;
            break;
          case 'bottom-right':
            qrX = pageWidth - margins.right - qrSize;
            qrY = pageHeight - margins.bottom - qrSize - 5;
            break;
          case 'bottom-left':
            qrX = margins.left;
            qrY = pageHeight - margins.bottom - qrSize - 5;
            break;
        }
        
        doc.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSize, qrSize);
      }
    }

    // Add multiple logos if exist
    if (logoImages.length > 0) {
      const logoSize = 40; // Tamaño predeterminado para logos principales
      const logoSpacing = 10;
      const totalWidth = (logoSize * logoImages.length) + (logoSpacing * (logoImages.length - 1));
      let startX = margins.left;
      
      if (settings?.logo_position === 'center') {
        startX = (pageWidth - totalWidth) / 2;
      } else if (settings?.logo_position === 'right') {
        startX = pageWidth - totalWidth - margins.right;
      }
      
      for (let i = 0; i < logoImages.length; i++) {
        const logoX = startX + (i * (logoSize + logoSpacing));
        doc.addImage(logoImages[i], 'PNG', logoX, yPos, logoSize, logoSize * 0.6);
      }
      yPos += (logoSize * 0.6) + 10;
    }

    // Add header line separator
    if (settings?.show_header_border !== false) {
      if (template === 'colorido') {
        doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.setLineWidth(settings?.border_width || 2);
      } else {
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.setLineWidth(settings?.border_width || 0.5);
      }
      doc.line(margins.left, yPos, pageWidth - margins.right, yPos);
      yPos += template === 'colorido' ? 12 : 10;
    }

    // Title with template styling
    const headerFontSize = settings?.header_font_size || 18;
    if (template === 'colorido') {
      doc.setFillColor(colors.headerBg[0], colors.headerBg[1], colors.headerBg[2]);
      doc.rect(margins.left, yPos - 5, pageWidth - margins.left - margins.right, headerFontSize + 10, 'F');
    }
    
    doc.setFontSize(headerFontSize);
    doc.setFont(fontFamily, "bold");
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    const headerText = settings?.header_text || "Reporte de Evaluación de Motricidad Fina";
    const headerLines = doc.splitTextToSize(headerText, pageWidth - margins.left - margins.right);
    doc.text(headerLines, pageWidth / 2, yPos, { align: "center" });
    yPos += headerLines.length * 8 + 15;

    // Institution information if available
    if (settings?.institution_name) {
      doc.setFontSize(10);
      doc.setFont(fontFamily, "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(settings.institution_name, pageWidth / 2, yPos, { align: "center" });
      yPos += 5;
      
      if (settings?.institution_address) {
        doc.setFontSize(8);
        doc.text(settings.institution_address, pageWidth / 2, yPos, { align: "center" });
        yPos += 4;
      }
      
      if (settings?.institution_phone || settings?.institution_email) {
        doc.setFontSize(8);
        const contactInfo = [settings.institution_phone, settings.institution_email].filter(Boolean).join(' | ');
        doc.text(contactInfo, pageWidth / 2, yPos, { align: "center" });
        yPos += 4;
      }
      yPos += 10;
    }

    // Student info
    doc.setFontSize(bodyFontSize);
    doc.setFont(fontFamily, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Aprendiente:", margins.left, yPos);
    doc.setFont(fontFamily, "normal");
    doc.text(evaluation.children.name, margins.left + 30, yPos);
    yPos += 7;
    
    doc.setFont(fontFamily, "bold");
    doc.text("Fecha:", margins.left, yPos);
    doc.setFont(fontFamily, "normal");
    doc.text(new Date(evaluation.evaluation_date).toLocaleDateString('es-ES'), margins.left + 30, yPos);
    yPos += 7;

    // Custom fields
    if (settings?.custom_field_1_label && settings?.custom_field_1_value) {
      doc.setFont(fontFamily, "bold");
      doc.text(`${settings.custom_field_1_label}:`, margins.left, yPos);
      doc.setFont(fontFamily, "normal");
      doc.text(settings.custom_field_1_value, margins.left + 30, yPos);
      yPos += 7;
    }

    if (settings?.custom_field_2_label && settings?.custom_field_2_value) {
      doc.setFont(fontFamily, "bold");
      doc.text(`${settings.custom_field_2_label}:`, margins.left, yPos);
      doc.setFont(fontFamily, "normal");
      doc.text(settings.custom_field_2_value, margins.left + 30, yPos);
      yPos += 7;
    }

    if (settings?.custom_field_3_label && settings?.custom_field_3_value) {
      doc.setFont(fontFamily, "bold");
      doc.text(`${settings.custom_field_3_label}:`, margins.left, yPos);
      doc.setFont(fontFamily, "normal");
      doc.text(settings.custom_field_3_value, margins.left + 30, yPos);
      yPos += 7;
    }

    if (settings?.evaluator_name) {
      doc.setFont(fontFamily, "bold");
      doc.text("Evaluador:", margins.left, yPos);
      doc.setFont(fontFamily, "normal");
      doc.text(settings.evaluator_name, margins.left + 30, yPos);
      yPos += 7;
    }

    yPos += 8;

    // Activities
    ACTIVITIES.forEach((activity) => {
      const score = evaluation[`test_${activity.id}_score` as keyof Evaluation] as number | null;
      const observations = evaluation[`test_${activity.id}_observations` as keyof Evaluation] as string | null;

      if (score !== null) {
        // Check if we need a new page
        if (yPos > pageHeight - margins.bottom - 60) {
          doc.addPage();
          yPos = margins.top;
          
          // Re-add watermark on new page
          if (settings?.show_watermark && settings?.watermark_text) {
            doc.saveGraphicsState();
            doc.setTextColor(200, 200, 200);
            doc.setFontSize(60);
            doc.setFont(fontFamily, "bold");
            
            const watermarkX = pageWidth / 2;
            const watermarkY = pageHeight / 2;
            doc.text(settings.watermark_text, watermarkX, watermarkY, {
              align: "center",
              angle: 45
            });
            doc.restoreGraphicsState();
          }
        }

        // Activity title with background
        doc.setFillColor(colors.activityBg[0], colors.activityBg[1], colors.activityBg[2]);
        doc.rect(margins.left, yPos - 5, pageWidth - margins.left - margins.right, 10, 'F');
        
        doc.setFontSize(13);
        doc.setFont(fontFamily, "bold");
        doc.setTextColor(template === 'colorido' ? colors.primary[0] : 0, template === 'colorido' ? colors.primary[1] : 0, template === 'colorido' ? colors.primary[2] : 0);
        doc.text(`${activity.id}. ${activity.name}`, margins.left + 2, yPos);
        yPos += 10;

        // Activity skill description
        doc.setFontSize(10);
        doc.setFont(fontFamily, "italic");
        doc.setTextColor(80, 80, 80);
        const skillLines = doc.splitTextToSize(activity.skill, pageWidth - margins.left - margins.right - 4);
        doc.text(skillLines, margins.left + 2, yPos);
        yPos += skillLines.length * 5 + 5;

        // Score
        doc.setFontSize(bodyFontSize);
        doc.setFont(fontFamily, "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(`Puntuación: ${score} - ${SCORE_LABELS[score]}`, margins.left + 2, yPos);
        yPos += 7;

        // Observations if any
        if (observations) {
          doc.setFont(fontFamily, "italic");
          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);
          const obsLines = doc.splitTextToSize(`Observaciones: ${observations}`, pageWidth - margins.left - margins.right - 4);
          doc.text(obsLines, margins.left + 2, yPos);
          yPos += obsLines.length * 5 + 5;
        }

        yPos += 7;
      }
    });

    // Add signature if enabled
    if (signatureImg && settings?.show_signature) {
      const sigWidth = 40;
      const sigHeight = 20;
      const sigY = pageHeight - margins.bottom - sigHeight - 35;
      
      doc.addImage(signatureImg, 'PNG', margins.left, sigY, sigWidth, sigHeight);
      
      if (settings.signature_text) {
        doc.setFontSize(9);
        doc.setFont(fontFamily, "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(settings.signature_text, margins.left, sigY + sigHeight + 5);
      }
    }
  }

  // Add page numbers if enabled
  const totalPages = doc.getNumberOfPages();
  if (settings?.show_page_numbers !== false) {
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setFont(fontFamily, "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - margins.bottom + 5, { align: "center" });
    }
  }

  // Add footer to all pages
  const footerText = settings?.footer_text || "Generado por el Sistema de Evaluación Educativa";
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    const footerY = pageHeight - margins.bottom - 35;
    
    // Footer line separator
    if (settings?.show_footer_border !== false) {
      if (template === 'colorido') {
        doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.setLineWidth(settings?.border_width || 1);
      } else {
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.setLineWidth(settings?.border_width || 0.5);
      }
      doc.line(margins.left, footerY, pageWidth - margins.right, footerY);
    }
    
    // Footer logos
    if (footerLogoImages.length > 0) {
      const footerLogoSize = 18; // Tamaño predeterminado para logos de footer
      const logoSpacing = 12;
      const totalLogoWidth = (footerLogoSize * footerLogoImages.length) + (logoSpacing * (footerLogoImages.length - 1));
      const startX = (pageWidth - totalLogoWidth) / 2;
      const logoY = footerY + 3;
      
      for (let j = 0; j < footerLogoImages.length; j++) {
        const logoX = startX + (j * (footerLogoSize + logoSpacing));
        doc.addImage(footerLogoImages[j], 'PNG', logoX, logoY, footerLogoSize, footerLogoSize * 0.6);
      }
    }
    
    doc.setFontSize(8);
    doc.setFont(fontFamily, "italic");
    doc.setTextColor(100, 100, 100);
    const footerLines = doc.splitTextToSize(footerText, pageWidth - margins.left - margins.right);
    doc.text(footerLines, pageWidth / 2, pageHeight - margins.bottom - 2, { align: "center" });
  }

  // Save
  const date = evaluations[0]?.evaluation_date || new Date().toISOString().split('T')[0];
  doc.save(`evaluacion_grupal_${date}.pdf`);
};

// Helper function to load images
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
