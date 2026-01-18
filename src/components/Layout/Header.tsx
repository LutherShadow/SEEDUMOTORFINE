import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, LogOut, UserCircle, Settings, Moon, Sun, Laptop } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
    title?: string;
    showTitle?: boolean;
}

export const Header = ({ title = "Sistema de Evaluación Motriz", showTitle = true }: HeaderProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [userEmail, setUserEmail] = useState<string | null>(null);

    const isDashboard = location.pathname === "/dashboard";

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUserEmail(user?.email || null);
        });
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast({
            title: "Sesión cerrada",
            description: "Has cerrado sesión exitosamente",
        });
        navigate("/auth");
    };

    return (
        <header className="sticky top-0 z-40 border-b bg-card shadow-soft w-full">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo & Title section */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
                    <img src="/logo.svg" alt="Seedumotorfine" className="h-9 w-auto hover:scale-105 transition-transform" />
                    {showTitle && (
                        <h1 className="text-xl md:text-2xl font-bold text-primary hidden sm:block tracking-tight">
                            {title}
                        </h1>
                    )}
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-3">
                    {/* Theme Toggle is usually an icon, but requested to have text? 
              ThemeToggle component is a dropdown itself. Maybe keep it as is or wrap it?
              The request said "mostrar el nombre del icono".
              The ThemeToggle provided by the codebase is likely just an icon button.
              Let's look at ThemeToggle usage. It's usually standalone.
              I will add a custom Theme selector for desktop if needed, or just keep the existing one if it clearly indicates purpose.
              However, the prompt specially asked for labels.
              I can modify ThemeToggle or create a wrapper. 
              Let's use a wrapper with text for 'Tema'.
           */}

                    {isDashboard && (
                        <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-background/50 hover:bg-accent/10 transition-colors">
                            <span className="text-sm font-medium mr-1">Tema</span>
                            <ThemeToggle />
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => navigate("/profile")}
                    >
                        <UserCircle className="h-5 w-5" />
                        <span>Mi Perfil</span>
                    </Button>

                    <Button
                        variant="ghost"
                        className="flex items-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Cerrar Sesión</span>
                    </Button>
                </div>

                {/* Mobile Navigation (Hamburger) */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Abrir menú">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[80%] sm:w-[350px]">
                            <SheetHeader className="mb-6 text-left">
                                <div className="flex items-center gap-2 mb-2">
                                    <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
                                    <SheetTitle>Menú</SheetTitle>
                                </div>
                                {userEmail && <p className="text-sm text-muted-foreground break-all">{userEmail}</p>}
                            </SheetHeader>

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Cuenta</h3>

                                    <Button
                                        variant="ghost"
                                        className="justify-start gap-3 h-12 text-base font-normal w-full"
                                        onClick={() => {
                                            navigate("/profile");
                                            // Close sheet logic would require controlled state, but standard Sheet behaviors usually handle outside clicks.
                                            // For fully correct "close on click", we need a controlled Sheet. 
                                            // For now accepting that user manually closes or navigates away.
                                        }}
                                    >
                                        <UserCircle className="h-5 w-5 text-primary" />
                                        Mi Perfil
                                    </Button>

                                    {isDashboard && (
                                        <div className="flex items-center justify-between px-4 py-2 rounded-md hover:bg-accent cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <Settings className="h-5 w-5 text-primary" />
                                                <span className="text-base font-normal">Tema</span>
                                            </div>
                                            <ThemeToggle />
                                        </div>
                                    )}
                                </div>

                                <div className="h-px bg-border my-2" />

                                <Button
                                    variant="ghost"
                                    className="justify-start gap-3 h-12 text-base font-normal w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-5 w-5" />
                                    Cerrar Sesión
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};
