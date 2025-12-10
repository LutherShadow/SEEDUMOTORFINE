import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Brain, Play, Download, Info, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTutorial } from "@/components/tutorial/TutorialProvider";
import { aiTrainingTutorial } from "@/components/tutorial/tutorials";
import { TutorialButton } from "@/components/tutorial/TutorialButton";

const AITraining = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startTutorial } = useTutorial();

  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
    if (!completedTutorials.includes('/admin/training')) {
      startTutorial(aiTrainingTutorial);
    }
  }, [startTutorial]);
  const [progress, setProgress] = useState(0);
  const [totalSamples, setTotalSamples] = useState(300);
  const [trainingSamples, setTrainingSamples] = useState(240);
  const [validationSamples, setValidationSamples] = useState(30);
  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);
  const [selectedComparison, setSelectedComparison] = useState<string | null>(null);

  const [metrics, setMetrics] = useState({
    accuracy: 0,
    precisionHigh: 0,
    precisionMedium: 0,
    precisionLow: 0,
    f1High: 0,
    f1Medium: 0,
    f1Low: 0,
    trainingTime: 0,
    lastTrained: "No hay entrenamientos previos"
  });

  const [confusionMatrix, setConfusionMatrix] = useState([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]);

  useEffect(() => {
    loadLastTraining();
    loadTrainingHistory();
  }, []);

  const loadLastTraining = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_training_models')
        .select('*')
        .order('trained_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No hay datos, usar valores por defecto
          return;
        }
        throw error;
      }

      if (data) {
        setMetrics({
          accuracy: data.accuracy || 0,
          precisionHigh: data.precision_high || 0,
          precisionMedium: data.precision_medium || 0,
          precisionLow: data.precision_low || 0,
          f1High: data.f1_high || 0,
          f1Medium: data.f1_medium || 0,
          f1Low: data.f1_low || 0,
          trainingTime: data.training_time_seconds || 0,
          lastTrained: new Date(data.trained_at).toLocaleString('es-MX', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        });

        if (data.confusion_matrix) {
          setConfusionMatrix(data.confusion_matrix as number[][]);
        }

        setTotalSamples(data.training_samples + data.validation_samples + data.test_samples);
        setTrainingSamples(data.training_samples);
        setValidationSamples(data.validation_samples);
      }
    } catch (error: any) {
      console.error('Error cargando último entrenamiento:', error);
    }
  };

  const loadTrainingHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_training_models')
        .select('*')
        .order('trained_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        setTrainingHistory(data);
      }
    } catch (error: any) {
      console.error('Error cargando historial:', error);
    }
  };

  const handleTrain = async () => {
    setIsTraining(true);
    setProgress(10); // Start progress

    try {
      // 1. Trigger the Edge Function
      const { data, error } = await supabase.functions.invoke('train-ai-model');

      if (error) throw error;

      // Simulate progress bar while function processes (optimization usually takes a few seconds)
      // Note: In a real streaming scenario we'd get progress updates, but here we just animate to 90
      let currentProgress = 10;
      const progressInterval = setInterval(() => {
        if (currentProgress < 90) {
          currentProgress += 5;
          setProgress(currentProgress);
        }
      }, 200);

      // 2. Process Result
      if (data && data.metrics) {
        clearInterval(progressInterval);
        setProgress(100);

        setMetrics({
          accuracy: data.metrics.accuracy,
          precisionHigh: data.metrics.precision_high,
          precisionMedium: data.metrics.precision_medium,
          precisionLow: data.metrics.precision_low,
          f1High: data.metrics.f1_high,
          f1Medium: data.metrics.f1_medium,
          f1Low: data.metrics.f1_low,
          trainingTime: data.metrics.training_time_seconds,
          lastTrained: new Date().toLocaleString('es-MX', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        });

        if (data.metrics.confusion_matrix) {
          setConfusionMatrix(data.metrics.confusion_matrix);
        }

        toast({
          title: "Entrenamiento completado",
          description: `Modelo actualizado con éxito. Contexto aprendido: ${data.learnedContext?.substring(0, 50)}...`,
        });

        // Recargar historial
        await loadTrainingHistory();
      } else {
        throw new Error('Formato de respuesta inválido del servidor');
      }

      setIsTraining(false);

    } catch (error: any) {
      console.error('Error al entrenar:', error);
      setIsTraining(false);
      toast({
        title: "Error",
        description: error.message || "No se pudo completar el entrenamiento",
        variant: "destructive",
      });
    }
  };

  const handleDownloadMetrics = () => {
    const metricsData = {
      modelo: "Random Forest + Red Neuronal",
      fechaEntrenamiento: metrics.lastTrained,
      configuracion: {
        muestrasTotal: totalSamples,
        muestrasEntrenamiento: trainingSamples,
        muestrasValidacion: validationSamples,
      },
      metricas: {
        precision: `${metrics.accuracy.toFixed(2)}%`,
        f1Score: `${metrics.f1High.toFixed(2)}%`,
        tiempoEntrenamiento: `${metrics.trainingTime.toFixed(2)}s`,
      },
      metricasPorClase: {
        alto: {
          precision: `${metrics.precisionHigh.toFixed(2)}%`,
          f1Score: `${metrics.f1High.toFixed(2)}%`,
        },
        medio: {
          precision: `${metrics.precisionMedium.toFixed(2)}%`,
          f1Score: `${metrics.f1Medium.toFixed(2)}%`,
        },
        bajo: {
          precision: `${metrics.precisionLow.toFixed(2)}%`,
          f1Score: `${metrics.f1Low.toFixed(2)}%`,
        },
      },
      matrizConfusion: confusionMatrix,
    };

    const blob = new Blob([JSON.stringify(metricsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metricas-entrenamiento-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Descarga iniciada",
      description: "Las métricas se han descargado correctamente",
    });
  };

  const getConfusionMatrixExplanation = (row: number, col: number, value: number) => {
    const classes = ['Alto', 'Medio', 'Bajo'];
    const isCorrect = row === col;

    if (isCorrect) {
      return {
        title: `Predicciones correctas: ${classes[row]}`,
        description: `El modelo clasificó correctamente ${value} casos como nivel "${classes[row]}". Estas son las predicciones acertadas.`,
      };
    } else {
      return {
        title: `Error de clasificación`,
        description: `El modelo clasificó ${value} casos como "${classes[col]}" cuando en realidad eran "${classes[row]}". Este es un error de clasificación que el modelo puede mejorar.`,
      };
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Entrenamiento del Modelo</h1>
                  <p className="text-muted-foreground">
                    Algoritmo: Random Forest (Greedy) + Red Neuronal
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button onClick={handleDownloadMetrics} variant="outline" data-tutorial="download-metrics-btn">
                <Download className="h-4 w-4 mr-2" />
                Descargar Métricas
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Dataset Configuration */}
            <Card data-tutorial="dataset-config">
              <CardHeader>
                <CardTitle>Configuración del Dataset</CardTitle>
                <CardDescription>
                  Configure las muestras para entrenamiento y validación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total">Dataset Total</Label>
                    <Input
                      id="total"
                      type="number"
                      value={totalSamples}
                      onChange={(e) => setTotalSamples(Number(e.target.value))}
                      disabled={isTraining}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="training">Entrenamiento</Label>
                    <Input
                      id="training"
                      type="number"
                      value={trainingSamples}
                      onChange={(e) => setTrainingSamples(Number(e.target.value))}
                      disabled={isTraining}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validation">Validación</Label>
                    <Input
                      id="validation"
                      type="number"
                      value={validationSamples}
                      onChange={(e) => setValidationSamples(Number(e.target.value))}
                      disabled={isTraining}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleTrain}
                    disabled={isTraining}
                    className="w-full"
                    data-tutorial="train-btn"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isTraining ? "Entrenando..." : "Iniciar Entrenamiento"}
                  </Button>
                </div>

                {isTraining && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Progreso: {progress}%
                      </span>
                      <span className="text-muted-foreground">
                        Procesando datos y optimizando parámetros
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card data-tutorial="performance-metrics">
              <CardHeader>
                <CardTitle>Métricas de Rendimiento</CardTitle>
                <CardDescription>
                  Evaluación del modelo Random Forest
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold text-primary">
                        {metrics.accuracy.toFixed(2)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Precisión</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold text-primary">
                        {metrics.f1High.toFixed(2)}%
                      </div>
                      <div className="text-sm text-muted-foreground">F1-Score</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Alto</span>
                      <span className="font-medium">
                        {metrics.precisionHigh.toFixed(2)}% / {metrics.f1High.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Medio</span>
                      <span className="font-medium">
                        {metrics.precisionMedium.toFixed(2)}% / {metrics.f1Medium.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Bajo</span>
                      <span className="font-medium">
                        {metrics.precisionLow.toFixed(2)}% / {metrics.f1Low.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Tiempo de entrenamiento:
                      </span>
                      <span className="font-medium">{metrics.trainingTime.toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">
                        Último entrenamiento:
                      </span>
                      <span className="font-medium">{metrics.lastTrained}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training History */}
            {trainingHistory.length > 0 && (
              <Card className="md:col-span-2" data-tutorial="training-history">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Historial de Entrenamientos
                      </CardTitle>
                      <CardDescription>
                        Compara las métricas de entrenamientos previos
                      </CardDescription>
                    </div>
                    <Select value={selectedComparison || ""} onValueChange={setSelectedComparison}>
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Seleccionar para comparar" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainingHistory.map((training) => (
                          <SelectItem key={training.id} value={training.id}>
                            {new Date(training.trained_at).toLocaleString('es-MX', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-4 text-sm font-semibold border-b pb-2">
                      <div>Fecha</div>
                      <div className="text-center">Precisión</div>
                      <div className="text-center">F1-Score</div>
                      <div className="text-center">Muestras</div>
                      <div className="text-center">Tiempo</div>
                    </div>
                    {trainingHistory.map((training, index) => {
                      const isSelected = training.id === selectedComparison;
                      const isCurrent = index === 0;
                      return (
                        <div
                          key={training.id}
                          className={`grid grid-cols-5 gap-4 text-sm p-3 rounded-lg transition-colors ${isSelected ? 'bg-primary/10 border-2 border-primary' :
                            isCurrent ? 'bg-muted/50' : 'hover:bg-muted/30'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCurrent && (
                              <span className="text-xs font-semibold text-primary">Actual</span>
                            )}
                            <span className="text-muted-foreground">
                              {new Date(training.trained_at).toLocaleString('es-MX', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="text-center font-medium">
                            {training.accuracy?.toFixed(2)}%
                          </div>
                          <div className="text-center font-medium">
                            {training.f1_high?.toFixed(2)}%
                          </div>
                          <div className="text-center text-muted-foreground">
                            {training.training_samples + training.validation_samples + training.test_samples}
                          </div>
                          <div className="text-center text-muted-foreground">
                            {training.training_time_seconds?.toFixed(2)}s
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedComparison && (() => {
                    const comparedTraining = trainingHistory.find(t => t.id === selectedComparison);
                    if (!comparedTraining) return null;

                    const currentTraining = trainingHistory[0];
                    const accuracyDiff = currentTraining.accuracy - comparedTraining.accuracy;
                    const f1Diff = currentTraining.f1_high - comparedTraining.f1_high;

                    return (
                      <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                        <h4 className="font-semibold mb-3">Comparación con entrenamiento seleccionado</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground mb-1">Cambio en Precisión</div>
                            <div className={`text-lg font-bold ${accuracyDiff > 0 ? 'text-green-600 dark:text-green-400' : accuracyDiff < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                              {accuracyDiff > 0 ? '+' : ''}{accuracyDiff.toFixed(2)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Cambio en F1-Score</div>
                            <div className={`text-lg font-bold ${f1Diff > 0 ? 'text-green-600 dark:text-green-400' : f1Diff < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                              {f1Diff > 0 ? '+' : ''}{f1Diff.toFixed(2)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Mejora General</div>
                            <div className="text-lg font-bold">
                              {((accuracyDiff + f1Diff) / 2) > 0 ? '✓ Mejor' : ((accuracyDiff + f1Diff) / 2) < 0 ? '✗ Peor' : '= Igual'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Confusion Matrix */}
            <Card className="md:col-span-2" data-tutorial="confusion-matrix">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>Matriz de Confusión</CardTitle>
                    <CardDescription>
                      Los valores en la diagonal principal (verde) representan
                      clasificaciones correctas. Los valores fuera de la diagonal
                      indican errores de clasificación.
                    </CardDescription>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p className="font-semibold mb-2">¿Cómo leer la matriz?</p>
                      <p className="text-sm">
                        Las filas representan las clases reales y las columnas las predicciones del modelo.
                        Los valores verdes (diagonal) son aciertos. Los valores rojos son errores de clasificación.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="inline-block">
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {/* Header */}
                        <div className="w-24"></div>
                        <div className="w-24 font-semibold text-sm">Alto</div>
                        <div className="w-24 font-semibold text-sm">Medio</div>
                        <div className="w-24 font-semibold text-sm">Bajo</div>

                        {/* Rows */}
                        {confusionMatrix.map((row, i) => (
                          <div key={`row-${i}`} className="contents">
                            <div className="w-24 font-semibold text-sm flex items-center justify-end pr-4">
                              {i === 0 ? "Alto" : i === 1 ? "Medio" : "Bajo"}
                            </div>
                            {row.map((value, j) => {
                              const explanation = getConfusionMatrixExplanation(i, j, value);
                              return (
                                <Tooltip key={`${i}-${j}`}>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={`w-24 h-24 flex items-center justify-center rounded-lg text-2xl font-bold cursor-help transition-all hover:scale-105 ${i === j
                                        ? "bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/30"
                                        : "bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20"
                                        }`}
                                    >
                                      {value}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="font-semibold mb-1">{explanation.title}</p>
                                    <p className="text-sm">{explanation.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
                    <p><strong>Algoritmo utilizado:</strong> Random Forest (Greedy) con capa de Red Neuronal</p>
                    <p><strong>Características del modelo:</strong></p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Random Forest para extracción de patrones y clasificación inicial</li>
                      <li>Red Neuronal para refinamiento y ajuste de predicciones</li>
                      <li>Optimización greedy para selección de características más relevantes</li>
                      <li>Validación cruzada con {validationSamples} muestras</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <TutorialButton onClick={() => startTutorial(aiTrainingTutorial)} />
    </TooltipProvider>
  );
};

export default AITraining;
