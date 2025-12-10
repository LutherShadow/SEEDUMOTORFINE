import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CompetencyIndexData {
  overall: number;
  visualMotor: number;
  precision: number;
  coordination: number;
  strength: number;
  learningVelocity: number;
  trend: string;
  level: string;
}

interface Props {
  competencyIndex: CompetencyIndexData;
  childName: string;
}

const LEVEL_CONFIG = {
  bajo: { label: "Bajo", color: "destructive", icon: "📉" },
  medio: { label: "Medio", color: "secondary", icon: "➡️" },
  alto: { label: "Alto", color: "default", icon: "📈" },
  experto: { label: "Experto", color: "success", icon: "🏆" }
};

export function CompetencyIndex({ competencyIndex, childName }: Props) {
  if (!competencyIndex) return null;

  const levelConfig = LEVEL_CONFIG[competencyIndex.level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG.medio;

  const getTrendIcon = () => {
    if (competencyIndex.trend === 'ascending') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (competencyIndex.trend === 'descending') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-yellow-600" />;
  };

  const getTrendText = () => {
    if (competencyIndex.trend === 'ascending') return 'Ascendente';
    if (competencyIndex.trend === 'descending') return 'Descendente';
    return 'Estable';
  };

  const getIndexColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    if (value >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Índice General */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{levelConfig.icon}</span>
            <div>
              <p className="text-sm font-medium">Índice General de {childName}</p>
              <Badge variant={levelConfig.color as any}>{levelConfig.label}</Badge>
            </div>
          </div>
          <span className={`text-3xl font-bold ${getIndexColor(competencyIndex.overall)}`}>
            {competencyIndex.overall.toFixed(1)}
          </span>
        </div>
        <Progress value={competencyIndex.overall} className="h-3" />
      </div>

      {/* Tendencia de aprendizaje */}
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <div>
            <p className="text-sm font-medium">Tendencia de Aprendizaje</p>
            <p className="text-xs text-muted-foreground">
              Velocidad: {competencyIndex.learningVelocity.toFixed(2)} pts/evaluación
            </p>
          </div>
        </div>
        <Badge variant="outline">{getTrendText()}</Badge>
      </div>

      {/* Índices por Categoría */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Índices por Categoría:</p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Visual-Motor</span>
            <span className={`text-sm font-medium ${getIndexColor(competencyIndex.visualMotor)}`}>
              {competencyIndex.visualMotor.toFixed(1)}
            </span>
          </div>
          <Progress value={competencyIndex.visualMotor} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Precisión</span>
            <span className={`text-sm font-medium ${getIndexColor(competencyIndex.precision)}`}>
              {competencyIndex.precision.toFixed(1)}
            </span>
          </div>
          <Progress value={competencyIndex.precision} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Coordinación</span>
            <span className={`text-sm font-medium ${getIndexColor(competencyIndex.coordination)}`}>
              {competencyIndex.coordination.toFixed(1)}
            </span>
          </div>
          <Progress value={competencyIndex.coordination} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Fuerza</span>
            <span className={`text-sm font-medium ${getIndexColor(competencyIndex.strength)}`}>
              {competencyIndex.strength.toFixed(1)}
            </span>
          </div>
          <Progress value={competencyIndex.strength} className="h-2" />
        </div>
      </div>
    </div>
  );
}
