import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Droplet, Calendar, User, Settings, LogOut, Camera as CameraIcon, Edit, Plus, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import avatarMemoji from "@/assets/avatar-memoji.jpg";
import CalorieCircle from "@/components/CalorieCircle";
import MacroCard from "@/components/MacroCard";
import MealItem from "@/components/MealItem";
import LogDinnerCard from "@/components/LogDinnerCard";
import HydrationTracker from "@/components/HydrationTracker";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useMeals } from "@/contexts/MealContext";
import { format, isToday } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";

interface HealthInsight {
  message?: string;
  tip?: string;
  greeting?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [waterGlasses, setWaterGlasses] = useState(4);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [healthInsight, setHealthInsight] = useState<HealthInsight | null>(null);

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

  // Fetch health insight from backend
  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const data = await api.getInsight({
          protein: getTotalProtein(new Date()),
          carbs: getTotalCarbs(new Date()),
          goal: calorieGoal,
        });
        setHealthInsight(data);
      } catch (error) {
        console.error('Failed to fetch health insight:', error);
        // Silent fail - insight is optional
      }
    };

    fetchInsight();
  }, []);

  // Get meals for selected date
  const mealsForDate = getMealsByDate(selectedDate);

  // Group meals by type for selected date
  const mealsByType = mealsForDate.reduce((acc, meal) => {
    if (!acc[meal.mealType]) {
      acc[meal.mealType] = { calories: 0, items: [] };
    }
    acc[meal.mealType].calories += meal.calories;
    acc[meal.mealType].items.push(meal.name);
    return acc;
  }, {} as Record<string, { calories: number; items: string[] }>);

  const mealTypeConfig: Record<string, { icon: React.ReactNode; iconBgColor: string }> = {
    Breakfast: { icon: <Flame className="w-6 h-6" />, iconBgColor: "bg-primary/20" },
    Lunch: { icon: <Droplet className="w-6 h-6" />, iconBgColor: "bg-water/20" },
    Dinner: { icon: <Flame className="w-6 h-6" />, iconBgColor: "bg-macro-fat/20" },
    Snack: { icon: <Flame className="w-6 h-6" />, iconBgColor: "bg-macro-carbs/20" },
  };

  // Format date for display
  const formattedDate = format(selectedDate, "EEEE, MMM d");
  const isViewingToday = isToday(selectedDate);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Check which meals haven't been logged
  const hasBreakfast = !!mealsByType["Breakfast"];
  const hasLunch = !!mealsByType["Lunch"];
  const hasDinner = !!mealsByType["Dinner"];

  const handleLogMeal = (mealType: string) => {
    navigate(`/food-logger?mealType=${mealType}`);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-12 h-12 border-2 border-primary cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage src={avatarMemoji} alt="Arjun" />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                  <CameraIcon className="mr-2 h-4 w-4" />
                  Change Profile Photo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div>
              <p className="text-sm text-muted-foreground">
                {isViewingToday ? `${getGreeting()}, Arjun` : "Viewing"}
              </p>
              <h1 className="text-lg font-semibold text-foreground">
                {isViewingToday ? `Today, ${formattedDate.split(", ")[1]}` : formattedDate}
              </h1>
            </div>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-10 h-10 rounded-xl bg-card flex items-center justify-center hover:bg-accent transition-colors">
                <Calendar className="w-5 h-5 text-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date > new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 space-y-6">
        {/* Health Insight from Backend */}
        {healthInsight?.tip && (
          <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Daily Insight</h3>
                <p className="text-sm text-muted-foreground mt-1">{healthInsight.tip}</p>
              </div>
            </div>
          </section>
        )}

        {/* Calorie Circle */}
        <section>
          <CalorieCircle consumed={getTotalCalories(selectedDate)} goal={calorieGoal} />
        </section>

        {/* Macro Cards */}
        <section className="flex gap-3">
          <MacroCard
            name="Protein"
            current={getTotalProtein(selectedDate)}
            goal={proteinGoal}
            unit="g"
            type="protein"
          />
          <MacroCard
            name="Carbs"
            current={getTotalCarbs(selectedDate)}
            goal={carbsGoal}
            unit="g"
            type="carbs"
          />
          <MacroCard
            name="Fat"
            current={getTotalFat(selectedDate)}
            goal={fatGoal}
            unit="g"
            type="fat"
          />
        </section>

        {/* Today's Meals */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">
              {isViewingToday ? "Today's Meals" : `Meals on ${format(selectedDate, "MMM d")}`}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80"
              onClick={() => navigate("/meal-history")}
            >
              See all
            </Button>
          </div>
          <div className="space-y-3">
            {Object.entries(mealsByType).map(([mealType, data]) => {
              const config = mealTypeConfig[mealType] || mealTypeConfig.Breakfast;
              return (
                <div key={mealType} className="flex items-center gap-2">
                  <div className="flex-1">
                    <MealItem
                      name={mealType}
                      calories={data.calories}
                      description={data.items.join(", ")}
                      icon={config.icon}
                      iconBgColor={config.iconBgColor}
                      onClick={() => navigate("/meal-history")}
                    />
                  </div>
                  {isViewingToday && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogMeal(mealType);
                      }}
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              );
            })}
            {isViewingToday && (
              <>
                {!hasBreakfast && (
                  <LogDinnerCard
                    mealName="Log Breakfast"
                    suggestion="Suggest: 300-500 kcal"
                    onClick={() => handleLogMeal("Breakfast")}
                  />
                )}
                {!hasLunch && (
                  <LogDinnerCard
                    mealName="Log Lunch"
                    suggestion="Suggest: 400-600 kcal"
                    onClick={() => handleLogMeal("Lunch")}
                  />
                )}
                {!hasDinner && (
                  <LogDinnerCard
                    mealName="Log Dinner"
                    suggestion="Suggest: 500-700 kcal"
                    onClick={() => handleLogMeal("Dinner")}
                  />
                )}
              </>
            )}
            {Object.keys(mealsByType).length === 0 && !isViewingToday && (
              <div className="text-center py-8 text-muted-foreground">
                No meals logged for this day
              </div>
            )}
          </div>
        </section>

        {/* Hydration Tracker */}
        <section>
          <HydrationTracker
            glasses={waterGlasses}
            goal={8}
            onAdd={() => setWaterGlasses((prev) => Math.min(prev + 1, 8))}
          />
        </section>
      </main>

      {/* Floating Action Button */}
      {isViewingToday && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2">
          <Button
            onClick={() => navigate("/food-logger")}
            className="rounded-full px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30"
          >
            <Camera className="w-5 h-5 mr-2" />
            Log Food
          </Button>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;