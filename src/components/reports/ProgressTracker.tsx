import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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

interface ProgressTrackerProps {
  evaluations: Evaluation[];
  activities: string[];
}

export const ProgressTracker = ({ evaluations, activities }: ProgressTrackerProps) => {
  if (evaluations.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seguimiento Temporal</CardTitle>
          <CardDescription>
            Se necesitan al menos 2 evaluaciones para mostrar el progreso
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const chartData = evaluations.map((evaluation) => ({
    date: new Date(evaluation.evaluation_date).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    }),
    promedio: [
      evaluation.test_1_score,
      evaluation.test_2_score,
      evaluation.test_3_score,
      evaluation.test_4_score,
      evaluation.test_5_score,
      evaluation.test_6_score,
      evaluation.test_7_score,
      evaluation.test_8_score,
    ]
      .filter((score): score is number => score !== null)
      .reduce((sum, score, _, arr) => sum + score / arr.length, 0),
  }));

  const firstAvg = chartData[0]?.promedio || 0;
  const lastAvg = chartData[chartData.length - 1]?.promedio || 0;
  const progressPercent = firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;

  const getTrendIcon = () => {
    if (progressPercent > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (progressPercent < -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-yellow-600" />;
  };

  const getTrendColor = () => {
    if (progressPercent > 5) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (progressPercent < -5) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  };

  const activityProgressData = activities.map((activity, index) => {
    const scoreKey = `test_${index + 1}_score` as keyof Evaluation;
    const scores = evaluations
      .map(e => e[scoreKey] as number | null)
      .filter((score): score is number => score !== null);

    if (scores.length < 2) return null;

    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    const change = lastScore - firstScore;

    return {
      activity,
      firstScore,
      lastScore,
      change,
      changePercent: firstScore > 0 ? (change / firstScore) * 100 : 0
    };
  }).filter(Boolean);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Evolución General</CardTitle>
              <CardDescription>
                Progreso desde {new Date(evaluations[0].evaluation_date).toLocaleDateString('es-ES')}
              </CardDescription>
            </div>
            <Badge className={getTrendColor()}>
              <span className="flex items-center gap-1">
                {getTrendIcon()}
                {Math.abs(progressPercent).toFixed(1)}%
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.2} />
                  <stop offset="33%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.2} />
                  <stop offset="33%" stopColor="hsl(48, 96%, 53%)" stopOpacity={0.2} />
                  <stop offset="67%" stopColor="hsl(48, 96%, 53%)" stopOpacity={0.2} />
                  <stop offset="67%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.2} />
                </linearGradient>
              </defs>

              {/* Zona Alta (2-3): Verde */}
              <ReferenceArea y1={2} y2={3} fill="hsl(142, 76%, 36%)" fillOpacity={0.1} />

              {/* Zona Media (1-2): Amarillo */}
              <ReferenceArea y1={1} y2={2} fill="hsl(48, 96%, 53%)" fillOpacity={0.1} />

              {/* Zona Baja (0-1): Rojo */}
              <ReferenceArea y1={0} y2={1} fill="hsl(0, 84%, 60%)" fillOpacity={0.1} />

              {/* Líneas de referencia */}
              <ReferenceLine y={2} stroke="hsl(142, 76%, 36%)" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={1} stroke="hsl(48, 96%, 53%)" strokeDasharray="3 3" strokeOpacity={0.5} />

              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis
                domain={[0, 3]}
                className="text-xs"
                tick={{ fill: 'hsl(var(--foreground))' }}
                ticks={[0, 1, 2, 3]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
                formatter={(value: number) => {
                  let status = '';
                  let color = '';
                  if (value >= 2) {
                    status = 'Alto';
                    color = 'hsl(142, 76%, 36%)';
                  } else if (value >= 1) {
                    status = 'Normal';
                    color = 'hsl(48, 96%, 53%)';
                  } else {
                    status = 'Bajo';
                    color = 'hsl(0, 84%, 60%)';
                  }
                  return [
                    <span style={{ color }}>
                      {value.toFixed(2)} - {status}
                    </span>,
                    'Promedio'
                  ];
                }}
              />
              <Legend
                formatter={(value) => 'Promedio de Puntuación'}
                wrapperStyle={{ paddingTop: '10px' }}
              />
              <Line
                type="monotone"
                dataKey="promedio"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                name="Promedio"
                dot={(props: any) => {
                  const { cx, cy, payload, key } = props;
                  const value = payload.promedio;
                  let fill = 'hsl(var(--primary))';
                  if (value >= 2) {
                    fill = 'hsl(142, 76%, 36%)';
                  } else if (value >= 1) {
                    fill = 'hsl(48, 96%, 53%)';
                  } else {
                    fill = 'hsl(0, 84%, 60%)';
                  }
                  return <circle key={key} cx={cx} cy={cy} r={5} fill={fill} stroke="white" strokeWidth={2} />;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(0,84%,60%)]" />
              <span className="text-muted-foreground">Bajo (0-1)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(48,96%,53%)]" />
              <span className="text-muted-foreground">Normal (1-2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(142,76%,36%)]" />
              <span className="text-muted-foreground">Alto (2-3)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progreso por Actividad</CardTitle>
          <CardDescription>
            Comparación primera vs última evaluación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityProgressData.map((item) => (
              <div key={item.activity} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.activity}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {item.firstScore} → {item.lastScore}
                    </Badge>
                    <Badge
                      className={
                        item.lastScore >= 2
                          ? "bg-[hsl(142,76%,36%)] text-white dark:bg-[hsl(142,76%,36%)] dark:text-white"
                          : item.lastScore >= 1
                            ? "bg-[hsl(48,96%,53%)] text-gray-900 dark:bg-[hsl(48,96%,53%)] dark:text-gray-900"
                            : "bg-[hsl(0,84%,60%)] text-white dark:bg-[hsl(0,84%,60%)] dark:text-white"
                      }
                    >
                      {item.change > 0 ? "+" : ""}{item.change}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${item.lastScore >= 2
                        ? "bg-[hsl(142,76%,36%)]"
                        : item.lastScore >= 1
                          ? "bg-[hsl(48,96%,53%)]"
                          : "bg-[hsl(0,84%,60%)]"
                      }`}
                    style={{
                      width: `${Math.min(Math.abs(item.changePercent), 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
