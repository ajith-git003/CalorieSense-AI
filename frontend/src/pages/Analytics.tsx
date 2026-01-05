import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, Flame, Target, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeals } from "@/contexts/MealContext";
import { format, subDays } from "date-fns";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line } from "recharts";
import BottomNav from "@/components/BottomNav";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface BackendAnalytics {
  weeklyAverage?: number;
  daysOnTarget?: number;
  insights?: string[];
  recommendations?: string[];
}

const Analytics = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analytics");
  const [backendData, setBackendData] = useState<BackendAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {
    calorieGoal,
    proteinGoal,
    carbsGoal,
    fatGoal,
    getTotalCalories,
    getTotalProtein,
    getTotalCarbs,
    getTotalFat,
    getMealsByDate,
  } = useMeals();

  // Generate last 7 days data for charts (always needed for fallback/charts)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayMeals = getMealsByDate(date);
    const calories = dayMeals.reduce((sum, m) => sum + m.calories, 0);
    const protein = dayMeals.reduce((sum, m) => sum + m.protein, 0);
    const carbs = dayMeals.reduce((sum, m) => sum + m.carbs, 0);
    const fat = dayMeals.reduce((sum, m) => sum + m.fat, 0);

    return {
      day: format(date, "EEE"),
      date: format(date, "MMM d"),
      calories,
      protein,
      carbs,
      fat,
      goal: calorieGoal,
    };
  });

  // Fetch analytics from backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Gather last 30 days of meals for robust analytics
        const allMeals = [];
        for (let i = 0; i < 30; i++) {
          const date = subDays(new Date(), i);
          const dayMeals = getMealsByDate(date);
          if (dayMeals.length > 0) {
            allMeals.push(...dayMeals);
          }
        }

        // Pass meals to backend
        const data = await api.getAnalytics(allMeals);
        setBackendData(data);
      } catch (error) {
        console.error('Failed to fetch analytics from backend:', error);
        // Continue with local data if backend fails
        toast({
          title: "Backend unavailable",
          description: "Showing local analytics data",
          variant: "default",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []); // Dependencies empty to run once on mount

  // Today's macro breakdown
  const todayProtein = getTotalProtein(new Date());
  const todayCarbs = getTotalCarbs(new Date());
  const todayFat = getTotalFat(new Date());

  const macroData = [
    { name: "Protein", value: todayProtein, goal: proteinGoal, color: "hsl(var(--macro-protein))" },
    { name: "Carbs", value: todayCarbs, goal: carbsGoal, color: "hsl(var(--macro-carbs))" },
    { name: "Fat", value: todayFat, goal: fatGoal, color: "hsl(var(--macro-fat))" },
  ];

  // Use backend data if available, otherwise calculate locally
  const weeklyAverage = backendData?.weeklyAverage ?? Math.round(last7Days.reduce((sum, d) => sum + d.calories, 0) / 7);
  const daysOnTarget = backendData?.daysOnTarget ?? last7Days.filter(d => d.calories >= calorieGoal * 0.8 && d.calories <= calorieGoal * 1.1).length;

  const chartConfig = {
    calories: {
      label: "Calories",
      color: "hsl(var(--primary))",
    },
    goal: {
      label: "Goal",
      color: "hsl(var(--muted-foreground))",
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Analytics</h1>
        </div>
      </header>

      <div className="px-5 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Weekly Avg</span>
              </div>
              <p className="text-2xl font-bold">{weeklyAverage}</p>
              <p className="text-xs text-muted-foreground">kcal/day</p>
            </CardContent>
          </Card>
          <Card className="bg-macro-protein/10 border-macro-protein/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-macro-protein" />
                <span className="text-sm text-muted-foreground">On Target</span>
              </div>
              <p className="text-2xl font-bold">{daysOnTarget}/7</p>
              <p className="text-xs text-muted-foreground">days this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Backend Insights */}
        {backendData?.insights && backendData.insights.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {backendData.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Weekly Calories Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Weekly Calories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={last7Days}>
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="calories"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary" />
                <span className="text-muted-foreground">Calories</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-2 border-dashed border-muted-foreground" />
                <span className="text-muted-foreground">Goal: {calorieGoal}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Macro Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Today's Macros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {macroData.map((macro) => (
                <div key={macro.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{macro.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {macro.value}g / {macro.goal}g
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((macro.value / macro.goal) * 100, 100)}%`,
                        backgroundColor: macro.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Protein Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Protein Trend (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ protein: { label: "Protein", color: "hsl(var(--macro-protein))" } }} className="h-[150px] w-full">
              <LineChart data={last7Days}>
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  width={30}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="protein"
                  stroke="hsl(var(--macro-protein))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--macro-protein))", strokeWidth: 0 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Analytics;