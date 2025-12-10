import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, Target, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Prediction {
  expectedAverage: number;
  confidenceInterval: [number, number];
  likelihood: number;
}

interface ActivityPrediction {
  activity: string;
  currentScore: number;
  trend: string;
  predictions: {
    oneMonth: number;
    threeMonths: number;
    sixMonths: number;
  };
  improvementPotential: string;
  confidence: number;
}

interface ProgressPredictionProps {
  predictions: {
    modelInfo: {
      algorithm: string;
      confidence: number;
      dataQuality: string;
    };
    overallProgress: {
      currentLevel: string;
      currentAverage: number;
      trend: string;
      learningVelocity: number;
      predictions: {
        oneMonth: Prediction;
        threeMonths: Prediction;
        sixMonths: Prediction;
      };
    };
    activityPredictions: ActivityPrediction[];
    riskFactors: string[];
    opportunities: string[];
    recommendations: {
      priority: string;
      supportNeeded: string;
      focusAreas: string[];
    };
  };
}

export const ProgressPrediction = ({ predictions }: ProgressPredictionProps) => {
  const getTrendIcon = (trend: string) => {
    if (trend.includes('mejora')) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend.includes('deterioro')) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Target className="h-4 w-4 text-yellow-600" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend.includes('mejora rápida')) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (trend.includes('mejora')) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (trend.includes('deterioro')) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  };

  const getLevelColor = (level: string) => {
    if (level === 'alto') return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (level === 'medio') return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  };

  const getPotentialColor = (potential: string) => {
    if (potential === 'alto') return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    if (potential === 'medio') return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <CardTitle>Predicción de Progreso Futuro</CardTitle>
            </div>
            <Badge variant="outline" className="font-mono">
              Confianza: {(predictions.modelInfo.confidence * 100).toFixed(0)}%
            </Badge>
          </div>
          <CardDescription>
            Proyección basada en {predictions.modelInfo.algorithm} • Calidad de datos: {predictions.modelInfo.dataQuality}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estado Actual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Nivel Actual</p>
              <div className="flex items-center gap-2">
                <Badge className={getLevelColor(predictions.overallProgress.currentLevel)}>
                  {predictions.overallProgress.currentLevel.toUpperCase()}
                </Badge>
                <span className="text-2xl font-bold">
                  {predictions.overallProgress.currentAverage.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="bg-background p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Tendencia</p>
              <div className="flex items-center gap-2">
                <Badge className={getTrendColor(predictions.overallProgress.trend)}>
                  {getTrendIcon(predictions.overallProgress.trend)}
                  {predictions.overallProgress.trend}
                </Badge>
              </div>
            </div>
            
            <div className="bg-background p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Velocidad de Aprendizaje</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {predictions.overallProgress.learningVelocity > 0 ? '+' : ''}
                  {predictions.overallProgress.learningVelocity.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">/mes</span>
              </div>
            </div>
          </div>

          {/* Proyecciones Temporales */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Proyecciones Temporales</h3>
            
            {[
              { label: '1 Mes', data: predictions.overallProgress.predictions.oneMonth },
              { label: '3 Meses', data: predictions.overallProgress.predictions.threeMonths },
              { label: '6 Meses', data: predictions.overallProgress.predictions.sixMonths }
            ].map(({ label, data }) => (
              <div key={label} className="bg-background p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{label}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {(data.likelihood * 100).toFixed(0)}% confianza
                    </Badge>
                    <span className="text-lg font-bold">
                      {data.expectedAverage.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Rango esperado:</span>
                  <Badge variant="secondary" className="text-xs">
                    {data.confidenceInterval[0].toFixed(2)} - {data.confidenceInterval[1].toFixed(2)}
                  </Badge>
                </div>
                <Progress 
                  value={(data.expectedAverage / 5) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predicciones por Actividad */}
      <Card>
        <CardHeader>
          <CardTitle>Predicciones por Actividad</CardTitle>
          <CardDescription>
            Proyección del desarrollo en cada actividad motriz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.activityPredictions.map((activity) => (
              <div key={activity.activity} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{activity.activity}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Actual: {activity.currentScore}
                      </Badge>
                      <Badge className={getTrendColor(activity.trend)}>
                        {getTrendIcon(activity.trend)}
                        {activity.trend}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={getPotentialColor(activity.improvementPotential)}>
                    Potencial: {activity.improvementPotential}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted/50 p-2 rounded">
                    <p className="text-xs text-muted-foreground">1 mes</p>
                    <p className="font-bold">{activity.predictions.oneMonth.toFixed(1)}</p>
                  </div>
                  <div className="bg-muted/50 p-2 rounded">
                    <p className="text-xs text-muted-foreground">3 meses</p>
                    <p className="font-bold">{activity.predictions.threeMonths.toFixed(1)}</p>
                  </div>
                  <div className="bg-muted/50 p-2 rounded">
                    <p className="text-xs text-muted-foreground">6 meses</p>
                    <p className="font-bold">{activity.predictions.sixMonths.toFixed(1)}</p>
                  </div>
                </div>
                
                <Progress 
                  value={(activity.confidence * 100)} 
                  className="h-1"
                />
                <p className="text-xs text-muted-foreground text-right">
                  Confianza: {(activity.confidence * 100).toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Factores de Riesgo y Oportunidades */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-orange-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle>Factores de Riesgo</CardTitle>
            </div>
            <CardDescription>Aspectos que requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {predictions.riskFactors.map((risk, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <CardTitle>Oportunidades</CardTitle>
            </div>
            <CardDescription>Áreas con mayor potencial de mejora</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {predictions.opportunities.map((opportunity, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-green-600 mt-1">•</span>
                  <span>{opportunity}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recomendaciones */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle>Recomendaciones Estratégicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-background p-4 rounded-lg">
            <p className="text-sm font-semibold text-blue-600 mb-2">Prioridad Máxima</p>
            <p className="text-sm">{predictions.recommendations.priority}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Apoyo necesario: {predictions.recommendations.supportNeeded}
            </Badge>
          </div>
          
          <div>
            <p className="text-sm font-semibold mb-2">Áreas de Enfoque</p>
            <div className="flex flex-wrap gap-2">
              {predictions.recommendations.focusAreas.map((area, index) => (
                <Badge key={index} variant="outline">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
