import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, User as UserIcon, HelpCircle, Sun, Moon, Monitor, Shield, Mail, Building, LogOut } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ResetTourButton } from "@/components/tutorial/ResetTourButton";
import { useTheme } from "@/components/ThemeProvider";
import { motion, Variants } from "framer-motion";
import { AIConnectionManager } from "@/components/admin/AIConnectionManager";

interface Profile {
  id: string;
  full_name: string | null;
  role: string | null;
  institution: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    id: "",
    full_name: "",
    role: "",
    institution: ""
  });
  const [tutorialsEnabled, setTutorialsEnabled] = useState(() => {
    return localStorage.getItem('tutorialsEnabled') !== 'false';
  });

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
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // Si no existe perfil, crear uno vacío con el ID del usuario
        setProfile({
          id: user?.id || "",
          full_name: "",
          role: "evaluator",
          institution: ""
        });
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user?.id,
          full_name: profile.full_name || null,
          role: profile.role || "evaluator",
          institution: profile.institution || null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente"
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el perfil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user || loading) {
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
    <div className="min-h-screen bg-muted/30">
      {/* Title Section */}
      <div className="bg-background border-b mb-8">
        <div className="max-w-6xl mx-auto py-8 px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <MotionDiv
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-3 bg-primary/10 rounded-2xl border border-primary/20"
            >
              <UserIcon className="h-8 w-8 text-primary" />
            </MotionDiv>
            <div>
              <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold tracking-tight"
              >
                Mi Perfil
              </motion.h1>
              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mt-1"
              >
                Gestiona tu información personal y preferencias
              </motion.p>
            </div>
          </div>
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="shadow-sm transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Panel
            </Button>
          </MotionDiv>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pb-12">
        <MotionDiv
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-12 gap-8"
        >
          {/* Sidebar / Left Column (Account Summary) */}
          <MotionDiv variants={itemVariants} className="md:col-span-4 space-y-6">
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="h-24 bg-gradient-to-br from-primary/5 to-primary/10" />
              <CardContent className="-mt-12 relative px-6 pb-6">
                <div className="flex justify-center mb-4">
                  <div className="h-24 w-24 rounded-full bg-background border-4 border-background shadow-xl flex items-center justify-center">
                    <UserIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>

                <div className="text-center space-y-1 mb-6">
                  <h2 className="text-xl font-bold">{profile.full_name || "Usuario"}</h2>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span className="capitalize">{profile.role === 'admin' ? 'Administrador' : 'Evaluador'}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Correo</p>
                      <p className="text-sm font-medium truncate" title={user.email}>{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Institución</p>
                      <p className="text-sm font-medium truncate">
                        {profile.institution || "Sin especificar"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Miembro desde</span>
                    <span className="font-medium">{new Date(user.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  className="w-full mt-6"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg">Acceso Rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/children")}>
                  Gestión de Aprendientes
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/dashboard")}>
                  Ir al Dashboard
                </Button>
              </CardContent>
            </Card>
          </MotionDiv>

          {/* Main Content / Right Column (Edit Form & Settings) */}
          <MotionDiv variants={itemVariants} className="md:col-span-8 space-y-6">
            <Card className="shadow-md border-0 transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  Editar Información
                </CardTitle>
                <CardDescription>
                  Actualiza tus datos personales y de contacto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nombre Completo</Label>
                      <Input
                        id="full_name"
                        value={profile.full_name || ""}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        placeholder="Tu nombre completo"
                        className="transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="institution">Institución Educativa</Label>
                      <Input
                        id="institution"
                        value={profile.institution || ""}
                        onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                        placeholder="Nombre de la escuela"
                        className="transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-display">Correo Electrónico</Label>
                      <Input id="email-display" value={user.email || ""} disabled className="bg-muted text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role-display">Rol del Sistema</Label>
                      <Input id="role-display" value={profile.role === 'admin' ? 'Administrador' : 'Evaluador'} disabled className="bg-muted text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saving} className="min-w-[140px]">
                      {saving ? (
                        <>Guardando...</>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0 transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  Preferencias del Sistema
                </CardTitle>
                <CardDescription>Personaliza tu experiencia en la plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">

                {/* Theme Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Apariencia
                  </Label>
                  <div className="grid grid-cols-3 gap-4">
                    <ThemeOption
                      active={theme === 'light'}
                      onClick={() => setTheme('light')}
                      icon={Sun}
                      label="Claro"
                    />
                    <ThemeOption
                      active={theme === 'dark'}
                      onClick={() => setTheme('dark')}
                      icon={Moon}
                      label="Oscuro"
                    />
                    <ThemeOption
                      active={theme === 'system'}
                      onClick={() => setTheme('system')}
                      icon={Monitor}
                      label="Sistema"
                    />
                  </div>
                </div>

                <Separator />

                {/* Tutorials */}
                <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/5 transition-colors">
                  <div className="space-y-1">
                    <Label htmlFor="tutorials-toggle" className="text-base font-medium flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      Guía Interactiva
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar ayudas visuales al navegar por nuevas secciones
                    </p>
                  </div>
                  <Switch
                    id="tutorials-toggle"
                    checked={tutorialsEnabled}
                    onCheckedChange={(checked) => {
                      setTutorialsEnabled(checked);
                      localStorage.setItem('tutorialsEnabled', String(checked));
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/5 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Reiniciar tutoriales</Label>
                    <p className="text-sm text-muted-foreground">
                      Vuelve a ver todas las guías de ayuda desde el principio
                    </p>
                  </div>
                  <ResetTourButton />
                </div>

              </CardContent>
            </Card>

            {/* Admin Section: AI Configuration */}
            {profile.role === 'admin' && (
              <div className="pt-4">
                {/* Lazy load or direct import */}
                <AIConnectionManager />
              </div>
            )}

          </MotionDiv>
        </MotionDiv>
      </main>
    </div>
  );
};

// Helper component for Theme Options
const ThemeOption = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button
    onClick={onClick}
    className={`
      relative group flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200
      ${active
        ? 'border-primary bg-primary/5 text-primary'
        : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
      }
    `}
  >
    <div className={`p-2 rounded-full ${active ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
      <Icon className="h-5 w-5" />
    </div>
    <span className="text-sm font-medium">{label}</span>
    {active && (
      <motion.div
        layoutId="activeTheme"
        className="absolute inset-0 rounded-xl border-2 border-primary pointer-events-none"
      />
    )}
  </button>
);

// Wrapper to handle motion div types safely
const MotionDiv = motion.div;

export default Profile;
