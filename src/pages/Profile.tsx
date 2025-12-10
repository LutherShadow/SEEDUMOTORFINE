import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, User as UserIcon, HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ResetTourButton } from "@/components/tutorial/ResetTourButton";

interface Profile {
  id: string;
  full_name: string | null;
  role: string | null;
  institution: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  if (!user || loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Panel
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-lg">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Mi Perfil</h1>
          </div>
          <p className="text-muted-foreground">
            Gestiona tu información personal
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Actualiza tus datos de perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  El correo electrónico no se puede modificar
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Ingrese su nombre completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institución</Label>
                <Input
                  id="institution"
                  value={profile.institution || ""}
                  onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                  placeholder="Nombre de la institución educativa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Input
                  id="role"
                  value={profile.role || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  El rol es asignado por el sistema
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preferencias</CardTitle>
            <CardDescription>Configura tus preferencias de la aplicación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tutorials-toggle" className="text-base flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Guía de Pasos
                </Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar tutoriales interactivos al ingresar a cada sección
                </p>
              </div>
              <Switch
                id="tutorials-toggle"
                checked={tutorialsEnabled}
                onCheckedChange={(checked) => {
                  setTutorialsEnabled(checked);
                  localStorage.setItem('tutorialsEnabled', String(checked));
                  toast({
                    title: checked ? "Tutoriales activados" : "Tutoriales desactivados",
                    description: checked 
                      ? "Verás las guías de ayuda al ingresar a cada sección" 
                      : "No se mostrarán tutoriales automáticamente"
                  });
                }}
              />
            </div>

            <Separator />

            <div>
              <Label className="mb-2 block">Reiniciar tours</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Reinicia los tours de ayuda para volver a verlos en cada sección
              </p>
              <ResetTourButton />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha de registro:</span>
              <span>{new Date(user.created_at).toLocaleDateString('es-ES')}</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
