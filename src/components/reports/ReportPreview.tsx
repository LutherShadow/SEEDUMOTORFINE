import React from "react";
import { Card } from "@/components/ui/card";
import { getReportTypeTemplate, type ReportType } from "@/lib/reportTypeTemplates";

interface ReportPreviewProps {
  settings: {
    report_type: ReportType;
    template: 'classic' | 'modern' | 'minimal';
    primary_color: string;
    logo_urls: string[];
    footer_logo_urls: string[];
    header_text: string;
    footer_text: string;
    content_company_name?: string;
    content_responsible_agent?: string;
    section_order?: string[];
    [key: string]: any; // Allow dynamic content fields like content_estado_actual_text
  };
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ settings }) => {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 142, g: 184, b: 181 };
  };

  const rgb = hexToRgb(settings.primary_color);

  // Render based on template type
  const renderCoverPage = () => {
    if (settings.template === 'classic') {
      return (
        <Card className="w-full aspect-[8.5/11] bg-white shadow-2xl overflow-hidden">
          <div className="h-full flex flex-col relative">
            {/* Classic ornamental borders */}
            <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: settings.primary_color }} />
            <div className="absolute bottom-0 left-0 right-0 h-2" style={{ backgroundColor: settings.primary_color }} />

            <div className="flex-1 flex flex-col items-center justify-center p-16">
              {/* Ornamental top border */}
              <div className="mb-8 w-32 h-1 bg-gradient-to-r from-transparent via-current to-transparent" style={{ color: settings.primary_color }} />

              {/* Logo */}
              {settings.logo_urls.length > 0 ? (
                <div className="mb-8 flex items-center justify-center gap-6">
                  {settings.logo_urls.map((logoUrl, index) => (
                    <div key={index} className="p-4 border-4 border-double" style={{ borderColor: settings.primary_color }}>
                      <img
                        src={logoUrl}
                        alt={`Logo ${index + 1}`}
                        className="w-28 h-28 object-contain"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-8 w-32 h-32 border-4 border-double flex items-center justify-center" style={{ borderColor: settings.primary_color }}>
                  <span className="text-5xl font-serif font-bold" style={{ color: settings.primary_color }}>R</span>
                </div>
              )}

              {/* Title with premium layout */}
              <div className="text-center space-y-8 max-w-2xl py-12">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.4em] font-medium" style={{ color: settings.primary_color }}>
                    Documento Oficial
                  </p>
                  <h1 className="text-5xl font-serif font-bold tracking-tight" style={{ color: settings.primary_color }}>
                    REPORTE DE<br />EVALUACIÓN
                  </h1>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-12 bg-current opacity-30" style={{ color: settings.primary_color }} />
                  <p className="text-lg font-serif italic text-muted-foreground whitespace-pre-wrap max-w-md">
                    {settings.header_text}
                  </p>
                  <div className="h-px w-12 bg-current opacity-30" style={{ color: settings.primary_color }} />
                </div>
              </div>

              {/* Ornamental bottom border */}
              <div className="mt-8 w-32 h-1 bg-gradient-to-r from-transparent via-current to-transparent" style={{ color: settings.primary_color }} />

              {/* Footer section */}
              <div className="mt-auto pt-12 text-center space-y-4">
                <p className="text-base font-serif font-medium" style={{ color: settings.primary_color }}>
                  {settings.content_company_name || "Institución Educativa"}
                </p>
                <p className="text-sm text-muted-foreground font-serif">
                  {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>

                {settings.footer_logo_urls && settings.footer_logo_urls.length > 0 && (
                  <div className="flex items-center justify-center gap-8 pt-6">
                    {settings.footer_logo_urls.map((logoUrl, index) => (
                      <img
                        key={index}
                        src={logoUrl}
                        alt={`Logo ${index + 1}`}
                        className="h-10 object-contain"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      );
    }

    if (settings.template === 'modern') {
      return (
        <Card className="w-full aspect-[8.5/11] bg-white shadow-2xl overflow-hidden">
          <div className="h-full flex flex-col relative">
            {/* Modern gradient background */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                background: `linear-gradient(135deg, ${settings.primary_color} 0%, transparent 50%)`
              }}
            />

            <div className="relative z-10 flex-1 flex flex-col p-16">
              {/* Modern geometric shapes */}
              <div className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 rounded-full opacity-10" style={{ backgroundColor: settings.primary_color }} />
              <div className="absolute bottom-0 left-0 w-48 h-48 -ml-24 -mb-24 rounded-full opacity-10" style={{ backgroundColor: settings.primary_color }} />

              {/* Logo with modern styling */}
              {settings.logo_urls.length > 0 ? (
                <div className="mb-12 flex justify-start gap-6">
                  {settings.logo_urls.map((logoUrl, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -inset-2 rounded-2xl opacity-20 blur-xl" style={{ backgroundColor: settings.primary_color }} />
                      <img
                        src={logoUrl}
                        alt={`Logo ${index + 1}`}
                        className="relative w-20 h-20 object-contain"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-12 flex justify-start">
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold text-white" style={{ backgroundColor: settings.primary_color }}>
                    R
                  </div>
                </div>
              )}

              {/* Modern title layout */}
              <div className="flex-1 flex flex-col justify-center space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-1 rounded-full" style={{ backgroundColor: settings.primary_color }} />
                    <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-60">Insight Report</p>
                  </div>
                  <h1 className="text-7xl font-extrabold tracking-tight leading-[0.9]" style={{ color: settings.primary_color }}>
                    REPORTE<br />
                    <span className="text-5xl opacity-80 font-light">EVALUATIVO</span>
                  </h1>
                </div>

                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed border-l-4 pl-6" style={{ borderColor: settings.primary_color }}>
                  {settings.header_text}
                </p>
              </div>

              {/* Modern footer */}
              <div className="mt-auto space-y-6">
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold" style={{ color: settings.primary_color }}>
                      {settings.content_company_name || "Institución Educativa"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  {settings.footer_logo_urls && settings.footer_logo_urls.length > 0 && (
                    <div className="flex items-center gap-6">
                      {settings.footer_logo_urls.map((logoUrl, index) => (
                        <img
                          key={index}
                          src={logoUrl}
                          alt={`Logo ${index + 1}`}
                          className="h-12 object-contain"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-1.5 w-full rounded-full" style={{
                  background: `linear-gradient(90deg, ${settings.primary_color} 0%, transparent 100%)`
                }} />
              </div>
            </div>
          </div>
        </Card>
      );
    }

    // Minimal template
    return (
      <Card className="w-full aspect-[8.5/11] bg-white shadow-2xl overflow-hidden">
        <div className="h-full flex flex-col p-20">
          <div className="flex-1 flex flex-col justify-between">
            {/* Minimal header */}
            <div className="space-y-12">
              {settings.logo_urls.length > 0 ? (
                <div className="flex items-center gap-6">
                  {settings.logo_urls.map((logoUrl, index) => (
                    <img
                      key={index}
                      src={logoUrl}
                      alt={`Logo ${index + 1}`}
                      className="w-14 h-14 object-contain"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-16 h-16 border border-current flex items-center justify-center text-2xl font-light" style={{ color: settings.primary_color }}>
                  R
                </div>
              )}

              <div className="space-y-8">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Reporte
                  </p>
                  <div className="w-12 h-px" style={{ backgroundColor: settings.primary_color }} />
                </div>

                <h1 className="text-5xl font-light tracking-tight leading-[1.1]" style={{ color: settings.primary_color }}>
                  {settings.header_text}
                </h1>
              </div>
            </div>

            {/* Minimal center space */}
            <div className="py-16" />

            {/* Minimal footer */}
            <div className="space-y-8">
              {settings.footer_logo_urls && settings.footer_logo_urls.length > 0 && (
                <div className="flex items-center gap-8">
                  {settings.footer_logo_urls.map((logoUrl, index) => (
                    <img
                      key={index}
                      src={logoUrl}
                      alt={`Logo ${index + 1}`}
                      className="h-8 object-contain opacity-60"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-end justify-between text-sm">
                <div className="space-y-1">
                  <p className="font-light text-muted-foreground">
                    {settings.content_company_name || "Institución Educativa"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString('es-ES', { year: 'numeric' })}
                  </p>
                </div>

                <div className="w-24 h-px" style={{ backgroundColor: settings.primary_color }} />
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderInternalPage = (title: string, content: string | undefined, pageIndex: number, sectionId: string, showSection: boolean = true) => {
    const pageNum = (pageIndex + 2).toString().padStart(2, '0');
    if (!showSection) return null;
    if (settings.template === 'classic') {
      return (
        <Card className="w-full aspect-[8.5/11] bg-white shadow-2xl overflow-hidden">
          <div className="h-full flex flex-col p-12">
            {/* Polished header matching PDF */}
            <div className="flex items-center justify-between pb-4 mb-8" style={{ borderBottom: `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` }}>
              {settings.logo_urls.length > 0 && (
                <img
                  src={settings.logo_urls[0]}
                  alt="Logo"
                  className="h-10 object-contain"
                />
              )}
              <div className="flex-1 text-right">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: settings.primary_color }}>
                  {settings.content_company_name || "Sistema Educativo"}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center border" style={{ borderColor: settings.primary_color }}>
                    <div className="w-4 h-4" style={{ backgroundColor: settings.primary_color }} />
                  </div>
                  <h2 className="text-2xl font-serif font-bold" style={{ color: settings.primary_color }}>
                    {title}
                  </h2>
                </div>
                <div className="h-px bg-gradient-to-r from-current to-transparent" style={{ color: settings.primary_color }} />
              </div>

              <div className="space-y-4 text-base text-[#282828] leading-relaxed font-serif whitespace-pre-wrap">
                {sectionId !== 'recommendations' ? (
                  content ? (
                    <p>
                      {content.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                        part.startsWith('**') && part.endsWith('**') ?
                          <strong key={i}>{part.slice(2, -2)}</strong> : part
                      )}
                    </p>
                  ) : (
                    <p className="italic opacity-40">
                      Contenido de {title} aparecerá aquí...
                    </p>
                  )
                ) : null}
              </div>
              {sectionId === 'recommendations' && (
                <div className="space-y-3 pt-4">
                  {content && content.length > 0 ? (
                    // Mostrar todos los puntos del chunk actual
                    content.split('\n').filter(line => line.trim()).map((rec, num) => (
                      <div key={num} className="flex gap-3 p-3 border" style={{ borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` }}>
                        <span className="text-lg font-serif font-bold" style={{ color: settings.primary_color }}>{num + 1}.</span>
                        <span className="text-sm text-muted-foreground font-serif">{rec.replace(/^[-•]\s*/, '')}</span>
                      </div>
                    ))
                  ) : (
                    // Placeholder de ejemplo
                    [1, 2, 3].map((num) => (
                      <div key={num} className="flex gap-3 p-3 border opacity-40" style={{ borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` }}>
                        <span className="text-lg font-serif font-bold" style={{ color: settings.primary_color }}>{num}.</span>
                        <span className="text-sm text-muted-foreground font-serif">Ejemplo de recomendación personalizada...</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Polished footer matching PDF */}
            <div className="pt-4 mt-auto border-t" style={{ borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` }}>
              <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                <p>{settings.footer_text || "Reporte Informativo"}</p>
                <p>www.sistemaeducativo.com</p>
              </div>
              <div className="flex justify-center mt-2">
                <div className="px-3 py-1 rounded text-[10px] font-bold" style={{ backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`, color: settings.primary_color }}>
                  {pageNum}
                </div>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    if (settings.template === 'modern') {
      return (
        <Card className="w-full aspect-[8.5/11] bg-white shadow-2xl overflow-hidden">
          <div className="h-full flex flex-col relative">
            {/* Modern accent */}
            <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: settings.primary_color }} />

            <div className="flex-1 flex flex-col p-12 pl-16">
              {/* Modern header */}
              <div className="flex items-center justify-between mb-8">
                {settings.logo_urls.length > 0 && (
                  <img
                    src={settings.logo_urls[0]}
                    alt="Logo"
                    className="h-10 object-contain"
                  />
                )}
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: settings.primary_color }}>
                    {settings.content_company_name || "Sistema Educativo"}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-6">
                <div className="space-y-3">
                  <div className="w-12 h-1 rounded-full" style={{ backgroundColor: settings.primary_color }} />
                  <h2 className="text-3xl font-bold tracking-tight" style={{ color: settings.primary_color }}>
                    {title}
                  </h2>
                </div>

                <div className="space-y-4 text-base text-[#282828] leading-relaxed whitespace-pre-wrap">
                  {sectionId !== 'recommendations' ? (
                    content ? (
                      <p>
                        {content.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                          part.startsWith('**') && part.endsWith('**') ?
                            <strong key={i}>{part.slice(2, -2)}</strong> : part
                        )}
                      </p>
                    ) : (
                      <p className="italic opacity-40">
                        Contenido de {title} aparecerá aquí...
                      </p>
                    )
                  ) : null}
                </div>
                {sectionId === 'recommendations' && (
                  <div className="space-y-3 pt-4">
                    {content && content.length > 0 ? (
                      content.split('\n').filter(line => line.trim()).map((rec, num) => (
                        <div key={num} className="flex gap-4 p-4 rounded-lg" style={{ backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)` }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: settings.primary_color }}>
                            {num + 1}
                          </div>
                          <span className="text-sm text-muted-foreground flex-1">{rec.replace(/^[-•]\s*/, '')}</span>
                        </div>
                      ))
                    ) : (
                      [1, 2, 3].map((num) => (
                        <div key={num} className="flex gap-4 p-4 rounded-lg opacity-40" style={{ backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)` }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: settings.primary_color }}>
                            {num}
                          </div>
                          <span className="text-sm text-muted-foreground flex-1">Ejemplo de recomendación personalizada...</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Modern footer matching PDF */}
              <div className="pt-4 mt-auto border-t" style={{ borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` }}>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                  <p>{settings.footer_text || "Reporte Informativo"}</p>
                  <p>www.sistemaeducativo.com</p>
                </div>
                <div className="flex justify-center mt-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold" style={{ backgroundColor: settings.primary_color }}>
                    {pageNum}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    // Minimal template
    return (
      <Card className="w-full aspect-[8.5/11] bg-white shadow-2xl overflow-hidden">
        <div className="h-full flex flex-col p-16">
          {/* Minimal header */}
          <div className="flex items-start justify-between mb-12">
            {settings.logo_urls.length > 0 && (
              <img
                src={settings.logo_urls[0]}
                alt="Logo"
                className="h-8 object-contain opacity-40"
              />
            )}
            <span className="text-xs text-muted-foreground font-light">
              {pageNum}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-8">
            <div className="space-y-3">
              <div className="w-8 h-px" style={{ backgroundColor: settings.primary_color }} />
              <h2 className="text-3xl font-light tracking-tight" style={{ color: settings.primary_color }}>
                {title}
              </h2>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed font-light">
              {sectionId !== 'recommendations' ? (
                content ? (
                  <p>
                    {content.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                      part.startsWith('**') && part.endsWith('**') ?
                        <strong key={i} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong> : part
                    )}
                  </p>
                ) : (
                  <p className="italic opacity-60">
                    Contenido de {title}...
                  </p>
                )
              ) : null}
            </div>
            {sectionId === 'recommendations' && (
              <div className="space-y-4 pt-6">
                {content && content.length > 0 ? (
                  content.split('\n').filter(line => line.trim()).map((rec, num) => (
                    <div key={num} className="flex gap-4 pb-4" style={{ borderBottom: `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` }}>
                      <span className="text-sm font-light" style={{ color: settings.primary_color }}>{num + 1}</span>
                      <span className="text-sm text-muted-foreground font-light flex-1">{rec.replace(/^[-•]\s*/, '')}</span>
                    </div>
                  ))
                ) : (
                  [1, 2, 3].map((num) => (
                    <div key={num} className="flex gap-4 pb-4 opacity-40" style={{ borderBottom: `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` }}>
                      <span className="text-sm font-light" style={{ color: settings.primary_color }}>{num}</span>
                      <span className="text-sm text-muted-foreground font-light flex-1">Ejemplo de recomendación...</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Minimal footer */}
          <div className="pt-8 mt-8" style={{ borderTop: `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` }}>
            <p className="text-xs text-muted-foreground font-light">{settings.footer_text}</p>
          </div>
        </div>
      </Card>
    );
  };

  // Get custom sections from report type template
  const template = getReportTypeTemplate(settings.report_type);
  const customSections = template?.custom_sections || [];
  const sectionOrder = settings.section_order || customSections.map(s => s.id);

  // Use a ref-like approach to track page count across maps
  let globalPageIndex = 0;

  return (
    <div className="w-full h-full overflow-y-auto bg-muted/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cover Page */}
        {renderCoverPage()}

        {/* Render sections in custom order */}
        {sectionOrder.map((sectionId) => {
          const section = customSections.find(s => s.id === sectionId);
          if (!section) return null;

          const rawContent = settings[`content_${sectionId}_text`] || '';

          // Hybrid Split Logic: Accounts for both line height and total length
          // Lowered thresholds to fit fixed aspect ratio cards better
          const maxLinesPerChunk = 16;
          const maxCharsPerChunk = 900;

          const chunks: string[] = [];
          const lines = rawContent.split('\n');
          let currentChunkLines: string[] = [];
          let currentChunkChars = 0;

          lines.forEach(line => {
            const lineChars = line.length;
            if (currentChunkLines.length >= maxLinesPerChunk || (currentChunkChars + lineChars) > maxCharsPerChunk) {
              if (currentChunkLines.length > 0) {
                chunks.push(currentChunkLines.join('\n'));
                currentChunkLines = [];
                currentChunkChars = 0;
              }
            }
            currentChunkLines.push(line);
            currentChunkChars += lineChars;
          });

          if (currentChunkLines.length > 0) {
            chunks.push(currentChunkLines.join('\n'));
          }

          // If empty but section exists, show at least one empty page if required
          if (chunks.length === 0) chunks.push('');

          return chunks.map((chunk, chunkIdx) => {
            const currentPIndex = globalPageIndex;
            globalPageIndex++;

            return (
              <div key={`${sectionId}-${chunkIdx}`} className="mb-8">
                {renderInternalPage(
                  chunkIdx === 0 ? section.title : `${section.title} (Cont.)`,
                  chunk,
                  currentPIndex,
                  sectionId,
                  chunkIdx === chunks.length - 1
                )}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};