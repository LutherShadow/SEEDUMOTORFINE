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

              {/* Title with classic typography */}
              <div className="text-center space-y-6 max-w-2xl">
                <h1 className="text-4xl font-serif font-bold tracking-wide" style={{ color: settings.primary_color }}>
                  REPORTE DE EVALUACIÓN
                </h1>

                <div className="h-px bg-gradient-to-r from-transparent via-current to-transparent mx-16" style={{ color: settings.primary_color }} />

                <p className="text-lg font-serif text-muted-foreground leading-relaxed px-8">
                  {settings.header_text}
                </p>
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
              <div className="flex-1 flex flex-col justify-center space-y-8">
                <div className="space-y-4">
                  <div className="w-16 h-1.5 rounded-full" style={{ backgroundColor: settings.primary_color }} />
                  <h1 className="text-6xl font-bold tracking-tight leading-tight" style={{ color: settings.primary_color }}>
                    REPORTE<br />
                    <span className="text-4xl text-muted-foreground font-normal">de Evaluación</span>
                  </h1>
                </div>

                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
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

  const renderInternalPage = (title: string, content: string | undefined, type: 'introduction' | 'recommendations' | 'conclusion', showSection: boolean = true) => {
    if (!showSection) return null;
    if (settings.template === 'classic') {
      return (
        <Card className="w-full aspect-[8.5/11] bg-white shadow-2xl overflow-hidden">
          <div className="h-full flex flex-col p-12">
            {/* Classic header */}
            <div className="flex items-center justify-between pb-6 mb-6" style={{ borderBottom: `2px double ${settings.primary_color}` }}>
              {settings.logo_urls.length > 0 && (
                <img
                  src={settings.logo_urls[0]}
                  alt="Logo"
                  className="h-10 object-contain"
                />
              )}
              <div className="flex-1 text-right">
                <div className="inline-block px-4 py-1 border" style={{ borderColor: settings.primary_color }}>
                  <span className="text-xs font-serif tracking-wider" style={{ color: settings.primary_color }}>
                    PÁGINA {type === 'introduction' ? '02' : type === 'recommendations' ? '03' : '04'}
                  </span>
                </div>
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

              <div className="space-y-4 text-base text-muted-foreground leading-relaxed font-serif">
                {content ? (
                  <p>{content}</p>
                ) : (
                  <p className="italic opacity-60">
                    {type === 'introduction' && 'Aquí aparecerá el texto de introducción personalizado...'}
                    {type === 'recommendations' && 'Aquí aparecerán las recomendaciones personalizadas...'}
                    {type === 'conclusion' && 'Aquí aparecerá el texto de conclusión personalizado...'}
                  </p>
                )}
              </div>

              {type === 'recommendations' && (
                <div className="space-y-3 pt-4">
                  {content && content.length > 0 ? (
                    // Si hay contenido, intentar dividirlo en puntos
                    content.split('\n').filter(line => line.trim()).slice(0, 3).map((rec, num) => (
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

            {/* Classic footer */}
            <div className="pt-6 mt-6 text-center" style={{ borderTop: `2px double ${settings.primary_color}` }}>
              <p className="text-xs text-muted-foreground font-serif">{settings.footer_text}</p>
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
              <div className="flex items-center justify-between mb-10">
                {settings.logo_urls.length > 0 && (
                  <img
                    src={settings.logo_urls[0]}
                    alt="Logo"
                    className="h-10 object-contain"
                  />
                )}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: settings.primary_color }} />
                  <span className="text-xs font-semibold tracking-wider" style={{ color: settings.primary_color }}>
                    0{type === 'introduction' ? '2' : type === 'recommendations' ? '3' : '4'}
                  </span>
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

                <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
                  {content ? (
                    <p>{content}</p>
                  ) : (
                    <p className="italic opacity-60">
                      {type === 'introduction' && 'Aquí aparecerá el texto de introducción personalizado...'}
                      {type === 'recommendations' && 'Aquí aparecerán las recomendaciones personalizadas...'}
                      {type === 'conclusion' && 'Aquí aparecerá el texto de conclusión personalizado...'}
                    </p>
                  )}
                </div>

                {type === 'recommendations' && (
                  <div className="space-y-3 pt-4">
                    {content && content.length > 0 ? (
                      content.split('\n').filter(line => line.trim()).slice(0, 3).map((rec, num) => (
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

              {/* Modern footer */}
              <div className="pt-6 mt-6">
                <div className="h-px w-full" style={{ background: `linear-gradient(90deg, ${settings.primary_color} 0%, transparent 100%)` }} />
                <p className="text-xs text-muted-foreground mt-4">{settings.footer_text}</p>
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
              {type === 'introduction' ? '02' : type === 'recommendations' ? '03' : '04'}
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
              {content ? (
                <p>{content}</p>
              ) : (
                <p className="italic opacity-60">
                  {type === 'introduction' && 'Aquí aparecerá el texto de introducción personalizado...'}
                  {type === 'recommendations' && 'Aquí aparecerán las recomendaciones personalizadas...'}
                  {type === 'conclusion' && 'Aquí aparecerá el texto de conclusión personalizado...'}
                </p>
              )}
            </div>

            {type === 'recommendations' && (
              <div className="space-y-4 pt-6">
                {content && content.length > 0 ? (
                  content.split('\n').filter(line => line.trim()).slice(0, 3).map((rec, num) => (
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

  // Build dynamic section map
  const sectionMap: Record<string, { title: string; content?: string; show: boolean }> = {};
  customSections.forEach(section => {
    sectionMap[section.id] = {
      title: section.title,
      content: settings[`content_${section.id}_text`],
      show: true
    };
  });

  const sectionOrder = settings.section_order || customSections.map(s => s.id);

  return (
    <div className="w-full h-full overflow-y-auto bg-muted/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cover Page */}
        {renderCoverPage()}

        {/* Render sections in custom order */}
        {sectionOrder.map((sectionId) => {
          const section = sectionMap[sectionId as keyof typeof sectionMap];
          if (!section || !section.show) return null;

          return (
            <div key={sectionId}>
              {renderInternalPage(
                section.title,
                section.content,
                sectionId as 'introduction' | 'recommendations' | 'conclusion',
                section.show
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};