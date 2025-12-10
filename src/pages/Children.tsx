import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Pencil, Trash2, Upload, Download, Archive, RotateCcw, FileText, ClipboardList } from "lucide-react";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import * as XLSX from 'xlsx';
import { useTutorial } from "@/components/tutorial/TutorialProvider";
import { childrenTutorial } from "@/components/tutorial/tutorials";
import { TutorialButton } from "@/components/tutorial/TutorialButton";
import { useOnline } from "@/hooks/use-online";
import { queueOfflineOperation } from "@/lib/offlineSync";
import { z } from 'zod';

interface Child {
  id: string;
  name: string;
  birth_date: string;
  gender: string | null;
  grade: string | null;
  school: string | null;
}

interface DeletedChild {
  id: string;
  original_id: string;
  name: string;
  birth_date: string;
  gender: string | null;
  grade: string | null;
  school: string | null;
  evaluator_id: string | null;
  deleted_at: string;
  deleted_by: string;
  created_at: string | null;
  updated_at: string | null;
}

const childSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(200, "El nombre no debe exceder 200 caracteres"),
  birth_date: z.string().min(1, "La fecha de nacimiento es requerida"),
  gender: z.string().max(50).optional(),
  grade: z.string().max(50).optional(),
  school: z.string().trim().max(200, "El nombre de la escuela no debe exceder 200 caracteres").optional()
});

const Children = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isOnline = useOnline();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [importing, setImporting] = useState(false);
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [schoolFilter, setSchoolFilter] = useState<string>("all");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(9);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [trashDialogOpen, setTrashDialogOpen] = useState(false);
  const [deletedChildren, setDeletedChildren] = useState<DeletedChild[]>([]);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const { startTutorial } = useTutorial();
  const [formData, setFormData] = useState({
    name: "",
    birth_date: "",
    gender: "",
    grade: "",
    school: ""
  });

  useEffect(() => {
    const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
    if (!completedTutorials.includes('/children') && user && children.length > 0) {
      setTimeout(() => startTutorial(childrenTutorial), 500);
    }
  }, [user, children, startTutorial]);

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
      fetchChildren();
      checkAdminRole();
    }
  }, [user]);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, gradeFilter, schoolFilter]);

  const checkAdminRole = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) throw error;
      setIsAdmin(data || false);
    } catch (error) {
      console.error("Error checking admin role:", error);
      setIsAdmin(false);
    }
  };

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .order("name");

      if (error) throw error;
      setChildren(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los aprendientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedChildren = async () => {
    if (!user?.id) return;
    
    setLoadingTrash(true);
    try {
      const { data, error } = await supabase
        .from("deleted_children")
        .select("*")
        .order("deleted_at", { ascending: false });

      if (error) throw error;
      setDeletedChildren(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros eliminados",
        variant: "destructive"
      });
    } finally {
      setLoadingTrash(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast({
        title: "Error",
        description: "No hay sesión activa. Por favor, inicie sesión nuevamente.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    // Validar datos con zod
    try {
      childSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Error de validación",
          description: error.errors[0].message,
          variant: "destructive"
        });
      }
      return;
    }

    try {
      if (editingChild) {
        const updateData = {
          id: editingChild.id,
          name: formData.name.trim(),
          birth_date: formData.birth_date,
          gender: formData.gender || null,
          grade: formData.grade || null,
          school: formData.school?.trim() || null
        };

        if (!isOnline) {
          // Modo offline: guardar en cola
          queueOfflineOperation('update', 'children', updateData);
          
          // Actualizar estado local inmediatamente
          setChildren(prev => prev.map(child => 
            child.id === editingChild.id 
              ? { ...child, ...updateData }
              : child
          ));

          toast({
            title: "Guardado offline",
            description: "Los cambios se sincronizarán cuando haya conexión"
          });
        } else {
          // Modo online: operación normal
          const { error } = await supabase
            .from("children")
            .update(updateData)
            .eq("id", editingChild.id);

          if (error) {
            console.error("Error updating child:", error);
            throw error;
          }

          toast({
            title: "Éxito",
            description: "Aprendiente actualizado correctamente"
          });

          // Refrescar la lista después de actualizar
          await fetchChildren();
        }
      } else {
        const insertData = {
          name: formData.name.trim(),
          birth_date: formData.birth_date,
          gender: formData.gender || null,
          grade: formData.grade || null,
          school: formData.school?.trim() || null,
          evaluator_id: user.id
        };

        if (!isOnline) {
          // Modo offline: guardar en cola
          const tempId = crypto.randomUUID();
          queueOfflineOperation('insert', 'children', { ...insertData, id: tempId });
          
          // Actualizar estado local inmediatamente
          setChildren(prev => [...prev, { id: tempId, ...insertData }].sort((a, b) => a.name.localeCompare(b.name)));

          toast({
            title: "Guardado offline",
            description: "Los datos se sincronizarán cuando haya conexión"
          });
        } else {
          // Modo online: operación normal
          const { error } = await supabase
            .from("children")
            .insert([insertData]);

          if (error) {
            console.error("Error inserting child:", error);
            throw error;
          }

          toast({
            title: "Éxito",
            description: "Aprendiente registrado correctamente"
          });
          
          await fetchChildren();
        }
      }

      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: error.message || "Error al guardar los datos",
        variant: "destructive"
      });
    }
  };

  const moveToTrash = async (id: string) => {
    if (!confirm("¿Mover este registro a la papelera?")) return;
    if (!user?.id) return;

    try {
      // Get the child data first
      const { data: childData, error: fetchError } = await supabase
        .from("children")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Insert into deleted_children
      const { error: insertError } = await supabase
        .from("deleted_children")
        .insert({
          original_id: childData.id,
          name: childData.name,
          birth_date: childData.birth_date,
          gender: childData.gender,
          grade: childData.grade,
          school: childData.school,
          evaluator_id: childData.evaluator_id,
          deleted_by: user.id,
          created_at: childData.created_at,
          updated_at: childData.updated_at
        });

      if (insertError) throw insertError;

      // Delete from children table
      const { error: deleteError } = await supabase
        .from("children")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // Update local state immediately
      setChildren(prev => prev.filter(child => child.id !== id));

      toast({
        title: "Éxito",
        description: "Registro movido a la papelera"
      });
    } catch (error: any) {
      console.error("Error moving to trash:", error);
      toast({
        title: "Error",
        description: "Error al mover el registro a la papelera",
        variant: "destructive"
      });
    }
  };

  const restoreChild = async (deletedChild: DeletedChild) => {
    if (!confirm("¿Restaurar este registro?")) return;

    try {
      // Insert back into children table
      const { error: insertError } = await supabase
        .from("children")
        .insert({
          id: deletedChild.original_id,
          name: deletedChild.name,
          birth_date: deletedChild.birth_date,
          gender: deletedChild.gender,
          grade: deletedChild.grade,
          school: deletedChild.school,
          evaluator_id: deletedChild.evaluator_id,
          created_at: deletedChild.created_at,
          updated_at: deletedChild.updated_at
        });

      if (insertError) throw insertError;

      // Delete from deleted_children
      const { error: deleteError } = await supabase
        .from("deleted_children")
        .delete()
        .eq("id", deletedChild.id);

      if (deleteError) throw deleteError;

      // Update local states immediately
      setChildren(prev => [...prev, {
        id: deletedChild.original_id,
        name: deletedChild.name,
        birth_date: deletedChild.birth_date,
        gender: deletedChild.gender,
        grade: deletedChild.grade,
        school: deletedChild.school
      }].sort((a, b) => a.name.localeCompare(b.name)));
      
      setDeletedChildren(prev => prev.filter(child => child.id !== deletedChild.id));

      toast({
        title: "Éxito",
        description: "Registro restaurado correctamente"
      });
    } catch (error: any) {
      console.error("Error restoring child:", error);
      toast({
        title: "Error",
        description: "Error al restaurar el registro",
        variant: "destructive"
      });
    }
  };

  const deletePermanently = async (id: string) => {
    if (!confirm("⚠️ ¿Eliminar permanentemente? Esta acción no se puede deshacer.")) return;

    try {
      const { error } = await supabase
        .from("deleted_children")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Update local state immediately
      setDeletedChildren(prev => prev.filter(child => child.id !== id));

      toast({
        title: "Éxito",
        description: "Registro eliminado permanentemente"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al eliminar permanentemente",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (child: Child) => {
    setEditingChild(child);
    setFormData({
      name: child.name,
      birth_date: child.birth_date,
      gender: child.gender || "",
      grade: child.grade || "",
      school: child.school || ""
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      birth_date: "",
      gender: "",
      grade: "",
      school: ""
    });
    setEditingChild(null);
  };

  const handleExportExcel = () => {
    if (children.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay alumnos para exportar",
        variant: "destructive"
      });
      return;
    }

    try {
      // Preparar datos para exportar
      const exportData = children.map(child => ({
        'Nombre': child.name,
        'Fecha de Nacimiento': new Date(child.birth_date).toLocaleDateString('es-ES'),
        'Género': child.gender || 'N/A',
        'Grado': child.grade || 'N/A',
        'Escuela': child.school || 'N/A'
      }));

      // Crear libro de Excel
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Alumnos');

      // Ajustar ancho de columnas
      const maxWidth = 30;
      worksheet['!cols'] = [
        { wch: maxWidth },
        { wch: 20 },
        { wch: 15 },
        { wch: 20 },
        { wch: maxWidth }
      ];

      // Descargar archivo
      const fileName = `lista_alumnos_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Éxito",
        description: `Lista de ${children.length} alumno(s) exportada correctamente`
      });
    } catch (error: any) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Error al exportar la lista de alumnos",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user?.id) {
      toast({
        title: "Error",
        description: "No hay sesión activa",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      let errorCount = 0;

      for (const row of jsonData) {
        try {
          const childData: any = row;
          
          // Mapear columnas del Excel a campos de la base de datos
          const childToInsert = {
            name: childData.nombre || childData.Nombre || childData.name || "",
            birth_date: childData.fecha_nacimiento || childData["Fecha de Nacimiento"] || childData.birth_date || "",
            gender: childData.genero || childData.Género || childData.gender || null,
            grade: childData.grado || childData.Grado || childData.grade || null,
            school: childData.escuela || childData.Escuela || childData.school || null,
            evaluator_id: user.id
          };

          if (!childToInsert.name || !childToInsert.birth_date) {
            errorCount++;
            continue;
          }

          const { error } = await supabase
            .from("children")
            .insert([childToInsert]);

          if (error) {
            console.error("Error inserting child:", error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error("Error processing row:", error);
          errorCount++;
        }
      }

      toast({
        title: "Importación completada",
        description: `${successCount} alumnos importados correctamente${errorCount > 0 ? `, ${errorCount} errores` : ''}`
      });

      fetchChildren();
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Error",
        description: "Error al procesar el archivo Excel",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Panel
            </Button>
            <ThemeToggle />
          </div>

          <TooltipProvider>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleExportExcel}
                    disabled={children.length === 0}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exportar Excel</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importing}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{importing ? "Importando..." : "Importar Excel"}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      setTrashDialogOpen(true);
                      fetchDeletedChildren();
                    }}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Papelera</p>
                </TooltipContent>
              </Tooltip>

              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <Tooltip>
                  <DialogTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button data-tutorial="add-child-btn">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                  </DialogTrigger>
                  <TooltipContent>
                    <p>Agregar Aprendiente</p>
                  </TooltipContent>
                </Tooltip>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingChild ? "Editar Aprendiente" : "Agregar Aprendiente"}</DialogTitle>
                <DialogDescription>
                  Complete los datos del aprendiente
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    maxLength={200}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="birth_date">Fecha de Nacimiento *</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Género</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Femenino">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="grade">Grado</Label>
                  <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar grado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1ro">1ro</SelectItem>
                      <SelectItem value="2do">2do</SelectItem>
                      <SelectItem value="3ro">3ro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="school">Escuela</Label>
                  <Input
                    id="school"
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    maxLength={200}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingChild ? "Actualizar" : "Guardar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
            </div>
          </TooltipProvider>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestión de Aprendientes</h1>
          <p className="text-muted-foreground">
            Administra los registros de los aprendientes evaluados
          </p>
        </div>

        {!loading && children.length > 0 && (
          <div className="mb-6 space-y-4" data-tutorial="search-filter">
            <div>
              <Label htmlFor="search" className="mb-2 block">Buscar por nombre</Label>
              <Input
                id="search"
                type="text"
                placeholder="Buscar aprendiente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-96"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade-filter" className="mb-2 block">Filtrar por grado</Label>
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger id="grade-filter" className="w-full bg-card">
                    <SelectValue placeholder="Todos los grados" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="all">Todos los grados</SelectItem>
                    <SelectItem value="1ro">1ro</SelectItem>
                    <SelectItem value="2do">2do</SelectItem>
                    <SelectItem value="3ro">3ro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isAdmin && (
                <div>
                  <Label htmlFor="school-filter" className="mb-2 block">Filtrar por escuela</Label>
                  <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                    <SelectTrigger id="school-filter" className="w-full bg-card">
                      <SelectValue placeholder="Todas las escuelas" />
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      <SelectItem value="all">Todas las escuelas</SelectItem>
                      {Array.from(new Set(children.map(c => c.school).filter(Boolean))).sort().map(school => (
                        <SelectItem key={school} value={school!}>{school}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Cargando...</p>
          </Card>
        ) : children.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              No hay aprendientes registrados. Haga clic en "Agregar Aprendiente" para comenzar.
            </p>
          </Card>
        ) : (() => {
          // Filtrar children
          const filteredChildren = children.filter(child => {
            const matchesSearch = searchTerm === "" || 
              child.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGrade = gradeFilter === "all" || child.grade === gradeFilter;
            const matchesSchool = !isAdmin || schoolFilter === "all" || child.school === schoolFilter;
            return matchesSearch && matchesGrade && matchesSchool;
          });

          // Calcular paginación
          const totalPages = Math.ceil(filteredChildren.length / itemsPerPage);
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedChildren = filteredChildren.slice(startIndex, endIndex);

          // Resetear a página 1 si no hay resultados en la página actual
          if (filteredChildren.length > 0 && paginatedChildren.length === 0 && currentPage > 1) {
            setCurrentPage(1);
          }

          return (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-tutorial="children-table">
                {paginatedChildren.map((child) => (
              <Card key={child.id}>
                <CardHeader>
                  <CardTitle>{child.name}</CardTitle>
                  <CardDescription>
                    Nacimiento: {new Date(child.birth_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {child.gender && <p><strong>Género:</strong> {child.gender}</p>}
                    {child.grade && <p><strong>Grado:</strong> {child.grade}</p>}
                    {child.school && <p><strong>Escuela:</strong> {child.school}</p>}
                  </div>
                  <div className="flex gap-2 mt-4" data-tutorial="child-actions">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/academic-record?childId=${child.id}`)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Expediente Académico</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/questionnaires?childId=${child.id}`)}
                        >
                          <ClipboardList className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ver Cuestionarios</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(child)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="destructive" size="sm" onClick={() => moveToTrash(child.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Mover a papelera</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          );
        })()}
      </main>

      {/* Trash Dialog */}
      <Dialog open={trashDialogOpen} onOpenChange={setTrashDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Papelera de Reciclaje</DialogTitle>
            <DialogDescription>
              Registros eliminados que pueden ser restaurados
            </DialogDescription>
          </DialogHeader>

          {loadingTrash ? (
            <div className="text-center py-8">Cargando...</div>
          ) : deletedChildren.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              La papelera está vacía
            </div>
          ) : (
            <div className="space-y-4">
              {deletedChildren.map((child) => (
                <Card key={child.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{child.name}</h3>
                        <div className="text-sm text-muted-foreground space-y-1 mt-2">
                          <p>Fecha de nacimiento: {new Date(child.birth_date).toLocaleDateString()}</p>
                          {child.gender && <p>Género: {child.gender}</p>}
                          {child.grade && <p>Grado: {child.grade}</p>}
                          {child.school && <p>Escuela: {child.school}</p>}
                          <p className="text-xs mt-2">
                            Eliminado: {new Date(child.deleted_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => restoreChild(child)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Restaurar registro</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deletePermanently(child.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Eliminar permanentemente</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <TutorialButton onClick={() => startTutorial(childrenTutorial)} />
    </div>
  );
};

export default Children;
