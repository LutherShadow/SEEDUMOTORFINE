import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Brain, Users, BarChart, ClipboardList } from "lucide-react";
import { WelcomeTour } from "@/components/tutorial/WelcomeTour";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <WelcomeTour />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16" data-tour="hero-section">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="Seedumotorfine - Análisis Motriz IA" 
              className="h-48 w-auto object-contain"
            />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Sistema de Evaluación Educativa
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Plataforma integral para evaluar el desarrollo motor fino, estilos de aprendizaje 
            y habilidades de estudio en aprendientes con herramientas especializadas
          </p>
          <div className="flex gap-4 justify-center" data-tour="login-button">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Iniciar Sesión
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Registrarse
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto" data-tour="features-section">
          <div className="bg-card p-6 rounded-lg shadow-medium hover:shadow-lg transition-shadow">
            <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Gestión de Alumnos</h3>
            <p className="text-muted-foreground">
              Administra registros de estudiantes con carga masiva y almacenamiento 
              seguro en la nube
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-medium hover:shadow-lg transition-shadow">
            <div className="p-3 bg-secondary/10 rounded-lg w-fit mb-4">
              <Brain className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Evaluaciones Motrices</h3>
            <p className="text-muted-foreground">
              Evaluación del desarrollo motor fino con IA que clasifica 
              en niveles bajo, medio y alto
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-medium hover:shadow-lg transition-shadow">
            <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4">
              <ClipboardList className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Cuestionarios</h3>
            <p className="text-muted-foreground">
              Cornell, CHAEA y TAM para evaluar estilos de aprendizaje 
              y habilidades de estudio
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-medium hover:shadow-lg transition-shadow">
            <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4">
              <BarChart className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Reportes Detallados</h3>
            <p className="text-muted-foreground">
              Informes automáticos con recomendaciones educativas 
              y análisis completo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
