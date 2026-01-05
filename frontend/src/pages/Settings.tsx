import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Flame, Dumbbell, Wheat, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMeals } from "@/contexts/MealContext";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { calorieGoal, proteinGoal, carbsGoal, fatGoal, updateGoals } = useMeals();
  
  const [calories, setCalories] = useState(calorieGoal.toString());
  const [protein, setProtein] = useState(proteinGoal.toString());
  const [carbs, setCarbs] = useState(carbsGoal.toString());
  const [fat, setFat] = useState(fatGoal.toString());

  const handleSave = () => {
    const newGoals = {
      calorieGoal: parseInt(calories) || 2000,
      proteinGoal: parseInt(protein) || 150,
      carbsGoal: parseInt(carbs) || 250,
      fatGoal: parseInt(fat) || 80,
    };

    updateGoals(newGoals);
    
    toast({
      title: "Goals updated",
      description: "Your daily nutrition goals have been saved.",
    });
    
    navigate(-1);
  };

  const goalCards = [
    {
      icon: Flame,
      label: "Daily Calories",
      value: calories,
      setValue: setCalories,
      unit: "kcal",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Dumbbell,
      label: "Protein",
      value: protein,
      setValue: setProtein,
      unit: "g",
      color: "text-macro-protein",
      bgColor: "bg-macro-protein/10",
    },
    {
      icon: Wheat,
      label: "Carbohydrates",
      value: carbs,
      setValue: setCarbs,
      unit: "g",
      color: "text-macro-carbs",
      bgColor: "bg-macro-carbs/10",
    },
    {
      icon: Droplets,
      label: "Fat",
      value: fat,
      setValue: setFat,
      unit: "g",
      color: "text-macro-fat",
      bgColor: "bg-macro-fat/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Settings</h1>
        <div className="w-10" />
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Goals Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Daily Goals</h2>
              <p className="text-sm text-muted-foreground">Set your nutrition targets</p>
            </div>
          </div>

          <div className="space-y-4">
            {goalCards.map((goal) => (
              <div
                key={goal.label}
                className="bg-card rounded-2xl p-4 border border-border"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${goal.bgColor} flex items-center justify-center`}>
                    <goal.icon className={`w-5 h-5 ${goal.color}`} />
                  </div>
                  <Label htmlFor={goal.label} className="text-base font-medium text-foreground">
                    {goal.label}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id={goal.label}
                    type="number"
                    value={goal.value}
                    onChange={(e) => goal.setValue(e.target.value)}
                    className="text-lg font-semibold bg-muted/30 border-0 focus-visible:ring-primary"
                  />
                  <span className="text-muted-foreground font-medium min-w-[40px]">
                    {goal.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Quick presets</p>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCalories("1500");
                setProtein("120");
                setCarbs("150");
                setFat("50");
              }}
              className="rounded-full"
            >
              Weight Loss
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCalories("2000");
                setProtein("150");
                setCarbs("200");
                setFat("65");
              }}
              className="rounded-full"
            >
              Maintenance
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCalories("2800");
                setProtein("180");
                setCarbs("300");
                setFat("90");
              }}
              className="rounded-full"
            >
              Muscle Gain
            </Button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
        <Button
          onClick={handleSave}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg"
        >
          Save Goals
        </Button>
      </div>
    </div>
  );
};

export default Settings;
