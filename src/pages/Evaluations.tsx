import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Eye, Download, Upload, FileSpreadsheet } from "lucide-react";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EvaluationForm } from "@/components/evaluations/EvaluationForm";
import { generateIndividualPDF, generateGroupPDF } from "@/components/evaluations/PDFGenerator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import * as XLSX from 'xlsx';
import { useOnline } from "@/hooks/use-online";
import { queueOfflineOperation } from "@/lib/offlineSync";
import { useTutorial } from "@/components/tutorial/TutorialProvider";
import { evaluationsTutorial } from "@/components/tutorial/tutorials";
import { TutorialButton } from "@/components/tutorial/TutorialButton";

interface Child {
  id: string;
  name: string;
}

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
  observations: string | null;
  children: {
    name: string;
    grade: string | null;
  };
}

const ACTIVITIES = [
  { id: 1, name: "Juego de Pesca", skill: "Coordinación ojo-mano al sujetar la caña y atrapar los peces" },
  { id: 2, name: "Pesca con imán", skill: "Precisión en el uso del imán para atraer objetos pequeños" },
  { id: 3, name: "Ensartado", skill: "Coordinación y precisión para insertar cuentas en el cordón" },
  { id: 4, name: "Enroscar botellas", skill: "Fuerza y precisión en el movimiento de giro para enroscar tapas" },
  { id: 5, name: "Laberintos con crayón", skill: "Control del trazo y direccionalidad al seguir el laberinto" },
  { id: 6, name: "Laberintos con dáctilo pintura", skill: "Coordinación y control del trazo con pintura dactilar" },
  { id: 7, name: "Juego de lanzamiento con muñecas", skill: "Precisión en el agarre y manipulación al vestir/desvestir muñecas" },
  { id: 8, name: "Juego del candado", skill: "Coordinación y precisión para manipular una llave y abrir candado" }
];

const SCORE_LABELS = [
  { value: 1, label: "No alcanza", description: "No logra realizar la actividad" },
  { value: 2, label: "Próximo a alcanzar", description: "Intenta con dificultad" },
  { value: 3, label: "Alcanza", description: "Completa con apoyo ocasional" },
  { value: 4, label: "Domina", description: "Realiza de forma autónoma" },
  { value: 5, label: "Sobresaliente", description: "Ejecuta con fluidez y precisión" }
];

const Evaluations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isOnline = useOnline();
  const { startTutorial } = useTutorial();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [childFilter, setChildFilter] = useState<string>("all");
  const [displayLimit, setDisplayLimit] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
    if (!completedTutorials.includes('/evaluations') && user) {
      startTutorial(evaluationsTutorial);
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
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [childrenRes, evaluationsRes] = await Promise.all([
        supabase.from("children").select("id, name").order("name"),
        supabase.from("evaluations").select("*, children(name, grade)").order("evaluation_date", { ascending: false })
      ]);

      if (childrenRes.error) throw childrenRes.error;
      if (evaluationsRes.error) throw evaluationsRes.error;

      setChildren(childrenRes.data || []);
      setEvaluations(evaluationsRes.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (evaluations: any[]) => {
    try {
      const evaluationsWithEvaluator = evaluations.map(evaluation => ({
        ...evaluation,
        evaluator_id: user?.id
      }));

      if (!isOnline) {
        // Modo offline: guardar en cola
        evaluationsWithEvaluator.forEach(evaluation => {
          const tempId = crypto.randomUUID();
          queueOfflineOperation('insert', 'evaluations', { ...evaluation, id: tempId });
        });

        toast({
          title: "Guardado offline",
          description: `${evaluations.length} evaluación(es) guardada(s). Se sincronizarán cuando haya conexión`
        });
      } else {
        // Modo online: operación normal
        const { error } = await supabase
          .from("evaluations")
          .insert(evaluationsWithEvaluator);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: `${evaluations.length} evaluación(es) guardada(s) correctamente`
        });

        fetchData();
      }

      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDownloadPDF = async (evaluation: Evaluation) => {
    try {
      await generateIndividualPDF(evaluation);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive"
      });
    }
  };

  const handleDownloadGroupPDF = async () => {
    if (evaluations.length === 0) {
      toast({
        title: "Error",
        description: "No hay evaluaciones para descargar",
        variant: "destructive"
      });
      return;
    }
    try {
      await generateGroupPDF(evaluations);
    } catch (error) {
      console.error("Error generating group PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF grupal",
        variant: "destructive"
      });
    }
  };

  const getScoreLabel = (score: number | null) => {
    if (!score) return { label: "N/A", color: "secondary" };
    const scoreInfo = SCORE_LABELS.find(s => s.value === score);
    const colors: Record<number, string> = {
      1: "destructive",
      2: "warning",
      3: "secondary",
      4: "default",
      5: "success"
    };
    return { label: scoreInfo?.label || "N/A", color: colors[score] || "secondary" };
  };

  const calculateAverage = (evaluation: Evaluation) => {
    const scores = [
      evaluation.test_1_score,
      evaluation.test_2_score,
      evaluation.test_3_score,
      evaluation.test_4_score,
      evaluation.test_5_score,
      evaluation.test_6_score,
      evaluation.test_7_score,
      evaluation.test_8_score
    ].filter((s): s is number => s !== null && typeof s === 'number');

    if (scores.length === 0) return { average: "0.00", completed: 0, total: 8 };
    
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = (sum / scores.length).toFixed(2);
    
    return { average, completed: scores.length, total: 8 };
  };

  const handleExportExcel = () => {
    if (evaluations.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay evaluaciones para exportar",
        variant: "destructive"
      });
      return;
    }

    try {
      const exportData = evaluations.map(evaluation => {
        const avgData = calculateAverage(evaluation);
        return {
          'Nombre del Aprendiente': evaluation.children.name,
          'Fecha de Evaluación': new Date(evaluation.evaluation_date).toLocaleDateString('es-ES'),
          'Juego de Pesca': evaluation.test_1_score || '',
          'Pesca con imán': evaluation.test_2_score || '',
          'Ensartado': evaluation.test_3_score || '',
          'Enroscar botellas': evaluation.test_4_score || '',
          'Laberintos con crayón': evaluation.test_5_score || '',
          'Laberintos con dáctilo pintura': evaluation.test_6_score || '',
          'Juego de lanzamiento con muñecas': evaluation.test_7_score || '',
          'Juego del candado': evaluation.test_8_score || '',
          'Promedio': avgData.average,
          'Observaciones Generales': evaluation.observations || ''
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Evaluaciones');

      worksheet['!cols'] = [
        { wch: 25 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 18 }, { wch: 20 }, { wch: 28 }, { wch: 30 }, { wch: 18 },
        { wch: 12 }, { wch: 40 }
      ];

      const fileName = `evaluaciones_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Éxito",
        description: `${evaluations.length} evaluación(es) exportada(s) correctamente`
      });
    } catch (error: any) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Error al exportar las evaluaciones",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast({
          title: "Error",
          description: "El archivo está vacío",
          variant: "destructive"
        });
        return;
      }

      const evaluationsToImport = [];
      const errors: string[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i];
        const rowNum = i + 2;

        const childName = row['Nombre del Aprendiente']?.toString().trim();
        if (!childName) {
          errors.push(`Fila ${rowNum}: Falta el nombre del aprendiente`);
          continue;
        }

        const child = children.find(c => c.name.toLowerCase() === childName.toLowerCase());
        if (!child) {
          errors.push(`Fila ${rowNum}: No se encontró el aprendiente "${childName}"`);
          continue;
        }

        const evaluationDate = row['Fecha de Evaluación'];
        let parsedDate;
        
        if (typeof evaluationDate === 'number') {
          const excelDate = new Date((evaluationDate - 25569) * 86400 * 1000);
          parsedDate = excelDate.toISOString().split('T')[0];
        } else if (typeof evaluationDate === 'string') {
          const dateParts = evaluationDate.split('/');
          if (dateParts.length === 3) {
            parsedDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
          } else {
            errors.push(`Fila ${rowNum}: Formato de fecha inválido`);
            continue;
          }
        } else {
          parsedDate = new Date().toISOString().split('T')[0];
        }

        const scores = [
          row['Juego de Pesca'],
          row['Pesca con imán'],
          row['Ensartado'],
          row['Enroscar botellas'],
          row['Laberintos con crayón'],
          row['Laberintos con dáctilo pintura'],
          row['Juego de lanzamiento con muñecas'],
          row['Juego del candado']
        ].map(score => {
          const num = Number(score);
          return (num >= 1 && num <= 5) ? num : null;
        });

        evaluationsToImport.push({
          child_id: child.id,
          evaluator_id: user?.id,
          evaluation_date: parsedDate,
          test_1_score: scores[0],
          test_2_score: scores[1],
          test_3_score: scores[2],
          test_4_score: scores[3],
          test_5_score: scores[4],
          test_6_score: scores[5],
          test_7_score: scores[6],
          test_8_score: scores[7],
          observations: row['Observaciones Generales']?.toString() || null
        });
      }

      if (errors.length > 0) {
        toast({
          title: "Advertencia",
          description: `Se encontraron ${errors.length} error(es). Revise el archivo.`,
          variant: "destructive"
        });
        console.error("Import errors:", errors);
        if (evaluationsToImport.length === 0) return;
      }

      if (evaluationsToImport.length > 0) {
        const { error } = await supabase
          .from("evaluations")
          .insert(evaluationsToImport);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: `${evaluationsToImport.length} evaluación(es) importada(s) correctamente`
        });

        fetchData();
      }
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Error",
        description: "Error al importar las evaluaciones",
        variant: "destructive"
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const monthOptions = useMemo(() => {
    const months = Array.from(new Set(evaluations.map(e => {
      const date = new Date(e.evaluation_date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }))).sort().reverse();
    return months;
  }, [evaluations]);

  const gradeOptions = useMemo(() => {
    const grades = Array.from(new Set(evaluations.map(e => e.children.grade).filter(Boolean))).sort();
    return grades;
  }, [evaluations]);

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(evaluation => {
      const evalDate = new Date(evaluation.evaluation_date);
      const evalMonth = `${evalDate.getFullYear()}-${String(evalDate.getMonth() + 1).padStart(2, '0')}`;
      const matchMonth = monthFilter === "all" || evalMonth === monthFilter;
      const matchGrade = gradeFilter === "all" || evaluation.children.grade === gradeFilter;
      const evalChild = children.find(c => c.name === evaluation.children.name);
      const matchChild = childFilter === "all" || evalChild?.id === childFilter;
      return matchMonth && matchGrade && matchChild;
    });
  }, [evaluations, monthFilter, gradeFilter, childFilter, children]);

  const displayedEvaluations = useMemo(() => {
    return filteredEvaluations.slice(0, displayLimit);
  }, [filteredEvaluations, displayLimit]);

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
            <div className="flex gap-2" data-tutorial="export-buttons">
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
                    onClick={() => fileInputRef.current?.click()}
                    disabled={children.length === 0}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Importar evaluaciones desde Excel</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleExportExcel}
                    disabled={evaluations.length === 0}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exportar a Excel</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleDownloadGroupPDF}
                    disabled={filteredEvaluations.length === 0}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Descargar Reporte Grupal</p>
                </TooltipContent>
              </Tooltip>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <Tooltip>
                  <DialogTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button disabled={children.length === 0} data-tutorial="new-evaluation-btn">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                  </DialogTrigger>
                  <TooltipContent>
                    <p>Nueva Evaluación</p>
                  </TooltipContent>
                </Tooltip>
              <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Nueva Evaluación de Motricidad Fina</DialogTitle>
                  <DialogDescription>
                    Seleccione las actividades y alumnos a evaluar
                  </DialogDescription>
                </DialogHeader>
                <EvaluationForm
                  children={children}
                  onSubmit={handleSubmit}
                  onCancel={() => setDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
            </div>
          </TooltipProvider>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Evaluaciones</h1>
          <p className="text-muted-foreground">
            Administra las evaluaciones de motricidad fina
          </p>
        </div>

        {!loading && evaluations.length > 0 && (
          <div className="mb-6 grid gap-4 md:grid-cols-3" data-tutorial="evaluation-filters">
            <div>
              <Label htmlFor="month-filter" className="mb-2 block">Filtrar por mes</Label>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger id="month-filter" className="bg-card">
                  <SelectValue placeholder="Todos los meses" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="all">Todos los meses</SelectItem>
                  {monthOptions.map((month) => {
                    const [year, monthNum] = month.split('-');
                    const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                    return <SelectItem key={month} value={month}>{monthName}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="grade-filter" className="mb-2 block">Filtrar por grado</Label>
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger id="grade-filter" className="bg-card">
                  <SelectValue placeholder="Todos los grados" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="all">Todos los grados</SelectItem>
                  {gradeOptions.map((grade) => (
                    <SelectItem key={grade} value={grade!}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="child-filter" className="mb-2 block">Filtrar por alumno</Label>
              <Select value={childFilter} onValueChange={setChildFilter}>
                <SelectTrigger id="child-filter" className="bg-card">
                  <SelectValue placeholder="Todos los alumnos" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="all">Todos los alumnos</SelectItem>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              Primero debe registrar aprendientes en la sección de "Gestión de Aprendientes"
            </p>
          </Card>
        ) : evaluations.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              No hay evaluaciones registradas. Haga clic en "Nueva Evaluación" para comenzar.
            </p>
          </Card>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Mostrando {displayedEvaluations.length} de {filteredEvaluations.length} evaluaciones
            </div>
            <div className="grid gap-4" data-tutorial="evaluations-table">
              {displayedEvaluations.map((evaluation) => (
              <Card key={evaluation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{evaluation.children.name}</CardTitle>
                      <CardDescription>
                        {new Date(evaluation.evaluation_date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-lg font-bold">
                        Promedio: {calculateAverage(evaluation).average}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {calculateAverage(evaluation).completed} de {calculateAverage(evaluation).total} actividades
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {ACTIVITIES.map((activity) => {
                      const score = evaluation[`test_${activity.id}_score` as keyof Evaluation] as number | null;
                      const { label, color } = getScoreLabel(score);
                      return (
                        <div key={activity.id} className="text-sm">
                          <p className="font-medium truncate">{activity.name}</p>
                          <Badge variant={color as any}>{label}</Badge>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEvaluation(evaluation);
                        setViewDialogOpen(true);
                      }}
                      data-tutorial="view-evaluation-btn"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalles
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(evaluation)}
                      data-tutorial="download-pdf-btn"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
            {displayedEvaluations.length < filteredEvaluations.length && (
              <div className="mt-6 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setDisplayLimit(prev => prev + 50)}
                >
                  Cargar más evaluaciones ({filteredEvaluations.length - displayedEvaluations.length} restantes)
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Evaluación</DialogTitle>
            <DialogDescription>
              {selectedEvaluation?.children.name} - {selectedEvaluation && new Date(selectedEvaluation.evaluation_date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4">
              {selectedEvaluation && ACTIVITIES.map((activity) => {
                const score = selectedEvaluation[`test_${activity.id}_score` as keyof Evaluation] as number | null;
                const observations = selectedEvaluation[`test_${activity.id}_observations` as keyof Evaluation] as string | null;
                const scoreInfo = SCORE_LABELS.find(s => s.value === score);
                
                if (score === null) return null;
                
                return (
                  <Card key={activity.id} className="p-4">
                    <h4 className="font-medium mb-2">{activity.id}. {activity.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{activity.skill}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold">Puntuación:</span>
                      <Badge>{score} - {scoreInfo?.label}</Badge>
                    </div>
                    {scoreInfo && (
                      <p className="text-sm text-muted-foreground mb-2">{scoreInfo.description}</p>
                    )}
                    {observations && (
                      <div className="mt-3 p-3 bg-muted rounded">
                        <p className="text-sm font-medium mb-1">Observaciones:</p>
                        <p className="text-sm">{observations}</p>
                      </div>
                    )}
                  </Card>
                );
              })}
              {selectedEvaluation?.observations && (
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Observaciones</h4>
                  <p className="text-sm">{selectedEvaluation.observations}</p>
                </Card>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <TutorialButton onClick={() => startTutorial(evaluationsTutorial)} />
    </div>
  );
};

export default Evaluations;