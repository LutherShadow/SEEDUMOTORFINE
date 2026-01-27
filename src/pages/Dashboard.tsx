import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, BarChart3, Brain, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { helpContent } from "@/lib/helpContent";
import { useTutorial } from "@/components/tutorial/TutorialProvider";
import { dashboardTutorial } from "@/components/tutorial/tutorials";
import { TutorialButton } from "@/components/tutorial/TutorialButton";
import { Header } from "@/components/Layout/Header";
import { motion, Variants } from "framer-motion";

const MotionDiv = motion.div;

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { startTutorial } = useTutorial();

  useEffect(() => {
    const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
    if (!completedTutorials.includes('/dashboard') && user) {
      startTutorial(dashboardTutorial);
    }
  }, [user, startTutorial]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Error checking admin status:", error);
        return;
      }

      setIsAdmin(!!data);
    } catch (error) {
      console.error("Error in checkAdminStatus:", error);
    }
  };

  if (!user) {
    return null;
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
          data-tutorial="dashboard-title"
        >
          <h2 className="text-3xl font-bold mb-2">Panel de Control</h2>
          <p className="text-muted-foreground">
            Bienvenido al sistema de evaluación del desarrollo motor fino
          </p>
        </MotionDiv>

        <MotionDiv
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <MotionDiv variants={itemVariants}>
                  <Card
                    className="cursor-pointer transition-all hover:shadow-medium hover:-translate-y-1 h-full"
                    onClick={() => navigate("/children")}
                    data-tutorial="children-card"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>Aprendientes</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Gestionar registro de aprendientes y sus datos personales
                      </CardDescription>
                    </CardContent>
                  </Card>
                </MotionDiv>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs z-50 bg-popover">
                <p className="font-semibold">{helpContent.dashboard.children}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <MotionDiv variants={itemVariants}>
                  <Card
                    className="cursor-pointer transition-all hover:shadow-medium hover:-translate-y-1 h-full"
                    onClick={() => navigate("/evaluations")}
                    data-tutorial="evaluations-card"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                          <FileText className="h-6 w-6 text-secondary" />
                        </div>
                        <CardTitle>Evaluaciones</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Realizar y consultar evaluaciones de motricidad fina
                      </CardDescription>
                    </CardContent>
                  </Card>
                </MotionDiv>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs z-50 bg-popover">
                <p className="font-semibold">{helpContent.dashboard.evaluations}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <MotionDiv variants={itemVariants}>
                  <Card
                    className="cursor-pointer transition-all hover:shadow-medium hover:-translate-y-1 h-full"
                    onClick={() => navigate("/reports")}
                    data-tutorial="reports-card"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4">
                          <BarChart3 className="h-6 w-6 text-accent" />
                        </div>
                        <CardTitle>Reportes</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Ver análisis y reportes de resultados
                      </CardDescription>
                    </CardContent>
                  </Card>
                </MotionDiv>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs z-50 bg-popover">
                <p className="font-semibold">{helpContent.dashboard.reports}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <MotionDiv variants={itemVariants}>
                  <Card
                    className="cursor-pointer transition-all hover:shadow-medium hover:-translate-y-1 h-full"
                    onClick={() => navigate("/questionnaires")}
                    data-tutorial="questionnaires-card"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <ClipboardList className="h-6 w-6 text-blue-500" />
                        </div>
                        <CardTitle>Cuestionarios</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Aplicar cuestionarios Cornell, CHAEA y TAM
                      </CardDescription>
                    </CardContent>
                  </Card>
                </MotionDiv>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs z-50 bg-popover">
                <p className="font-semibold">Gestiona y aplica cuestionarios pedagógicos para evaluar estilos de aprendizaje y habilidades de estudio</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isAdmin && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <MotionDiv variants={itemVariants}>
                      <Card
                        className="cursor-pointer transition-all hover:shadow-medium hover:-translate-y-1 h-full"
                        onClick={() => navigate("/admin/training")}
                      >
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                              <Brain className="h-6 w-6 text-purple-500" />
                            </div>
                            <CardTitle>Entrenamiento IA</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription>
                            Entrenar modelo de inteligencia artificial
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </MotionDiv>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs z-50 bg-popover">
                    <p className="font-semibold">{helpContent.dashboard.aiTraining}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <MotionDiv variants={itemVariants}>
                      <Card
                        className="cursor-pointer transition-all hover:shadow-medium hover:-translate-y-1 h-full"
                        onClick={() => navigate("/admin/report-settings")}
                      >
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                              <FileText className="h-6 w-6 text-orange-500" />
                            </div>
                            <CardTitle>Configuración PDF</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription>
                            Personalizar reportes PDF con logo y textos
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </MotionDiv>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs z-50 bg-popover">
                    <p className="font-semibold">Configura el logo, encabezado y pie de página de todos los reportes PDF</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </MotionDiv>
      </main>
      <TutorialButton onClick={() => startTutorial(dashboardTutorial)} />
    </div>
  );
};

export default Dashboard;
