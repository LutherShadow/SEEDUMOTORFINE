import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

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
}

interface IntervalComparisonProps {
  evaluations: Evaluation[];
  activities: string[];
}

type IntervalType = "weekly" | "monthly" | "quarterly";

export const IntervalComparison = ({ evaluations, activities }: IntervalComparisonProps) => {
  const [intervalType, setIntervalType] = useState<IntervalType>("monthly");

  if (evaluations.length < 2) {
    return null;
  }

  const getIntervalGroups = () => {
    const sortedEvals = [...evaluations].sort(
      (a, b) => new Date(a.evaluation_date).getTime() - new Date(b.evaluation_date).getTime()
    );

    const groups: { [key: string]: Evaluation[] } = {};

    sortedEvals.forEach((evaluation) => {
      const date = new Date(evaluation.evaluation_date);
      let key: string;

      switch (intervalType) {
        case "weekly":
          const weekNum = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
          key = `Semana ${weekNum + 1} - ${date.getFullYear()}`;
          break;
        case "monthly":
          key = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
          break;
        case "quarterly":
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          key = `Q${quarter} ${date.getFullYear()}`;
          break;
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(evaluation);
    });

    return Object.entries(groups).map(([period, periodEvaluations]) => {
      const avgScores = activities.map((_, index) => {
        const scoreKey = `test_${index + 1}_score` as keyof Evaluation;
        const scores = periodEvaluations
          .map(e => e[scoreKey] as number | null)
          .filter((score): score is number => score !== null);
        
        return scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : null;
      });

      return {
        period,
        avgScores,
        evaluationCount: periodEvaluations.length,
      };
    });
  };

  const intervalGroups = getIntervalGroups();

  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    if (score >= 2.5) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (score >= 1.5) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  const getScoreLabel = (score: number | null) => {
    if (score === null) return "N/A";
    return score.toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Comparación por Intervalos
            </CardTitle>
            <CardDescription>
              Analiza el rendimiento en diferentes períodos de tiempo
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="interval">Intervalo:</Label>
            <Select value={intervalType} onValueChange={(value) => setIntervalType(value as IntervalType)}>
              <SelectTrigger id="interval" className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {intervalGroups.map((group) => (
            <div key={group.period} className="space-y-3 border-b pb-4 last:border-b-0">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold capitalize">{group.period}</h4>
                <Badge variant="outline">
                  {group.evaluationCount} {group.evaluationCount === 1 ? 'evaluación' : 'evaluaciones'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {activities.map((activity, index) => (
                  <div key={index} className="space-y-1">
                    <p className="text-xs text-muted-foreground truncate" title={activity}>
                      {activity}
                    </p>
                    <Badge className={getScoreColor(group.avgScores[index])}>
                      {getScoreLabel(group.avgScores[index])}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
