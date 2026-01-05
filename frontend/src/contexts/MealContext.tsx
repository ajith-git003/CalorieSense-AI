import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { format, isSameDay, subDays } from "date-fns";

export interface LoggedMeal {
  id: string;
  foodId: string;
  name: string;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: number;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  timestamp: Date;
}

export interface GoalSettings {
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

interface MealContextType {
  meals: LoggedMeal[];
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  addMeal: (meal: Omit<LoggedMeal, "id" | "timestamp">) => void;
  removeMeal: (id: string) => void;
  updateMeal: (id: string, meal: Partial<Omit<LoggedMeal, "id" | "timestamp">>) => void;
  getTotalCalories: (date?: Date) => number;
  getTotalProtein: (date?: Date) => number;
  getTotalCarbs: (date?: Date) => number;
  getTotalFat: (date?: Date) => number;
  getRemainingCalories: (date?: Date) => number;
  updateGoals: (goals: GoalSettings) => void;
  getMealsByDate: (date: Date) => LoggedMeal[];
}

const MealContext = createContext<MealContextType | undefined>(undefined);

const DEFAULT_GOALS: GoalSettings = {
  calorieGoal: 2500,
  proteinGoal: 150,
  carbsGoal: 250,
  fatGoal: 80,
};

const STORAGE_KEY = "nutrition-goals";
const MEALS_STORAGE_KEY = "logged-meals";

export const MealProvider = ({ children }: { children: ReactNode }) => {
  const [meals, setMeals] = useState<LoggedMeal[]>(() => {
    try {
      const stored = localStorage.getItem(MEALS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((meal: LoggedMeal) => ({
          ...meal,
          timestamp: new Date(meal.timestamp),
        }));
      }
    } catch (e) {
      console.error("Error loading meals from storage:", e);
    }
    // Default sample meals for today
    const today = new Date();
    const yesterday = subDays(today, 1);
    return [
      {
        id: "1",
        foodId: "breakfast-1",
        name: "Oatmeal & Berries",
        image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=400&fit=crop",
        calories: 320,
        protein: 12,
        carbs: 54,
        fat: 6,
        servings: 1,
        mealType: "Breakfast" as const,
        timestamp: today,
      },
      {
        id: "2",
        foodId: "lunch-1",
        name: "Grilled Chicken Salad",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop",
        calories: 450,
        protein: 35,
        carbs: 20,
        fat: 18,
        servings: 1,
        mealType: "Lunch" as const,
        timestamp: today,
      },
      {
        id: "3",
        foodId: "breakfast-2",
        name: "Eggs & Toast",
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=400&fit=crop",
        calories: 380,
        protein: 18,
        carbs: 32,
        fat: 20,
        servings: 1,
        mealType: "Breakfast" as const,
        timestamp: yesterday,
      },
      {
        id: "4",
        foodId: "dinner-1",
        name: "Pasta Bolognese",
        image: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400&h=400&fit=crop",
        calories: 650,
        protein: 28,
        carbs: 75,
        fat: 24,
        servings: 1,
        mealType: "Dinner" as const,
        timestamp: yesterday,
      },
    ];
  });

  const [goals, setGoals] = useState<GoalSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error loading goals from storage:", e);
    }
    return DEFAULT_GOALS;
  });

  // Save meals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(meals));
    } catch (e) {
      console.error("Error saving meals to storage:", e);
    }
  }, [meals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    } catch (e) {
      console.error("Error saving goals to storage:", e);
    }
  }, [goals]);

  const updateGoals = (newGoals: GoalSettings) => {
    setGoals(newGoals);
  };

  const getMealsByDate = (date: Date) => {
    return meals.filter((meal) => isSameDay(new Date(meal.timestamp), date));
  };

  const addMeal = (meal: Omit<LoggedMeal, "id" | "timestamp">) => {
    const newMeal: LoggedMeal = {
      ...meal,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMeals((prev) => [...prev, newMeal]);
  };

  const removeMeal = (id: string) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== id));
  };

  const updateMeal = (id: string, updates: Partial<Omit<LoggedMeal, "id" | "timestamp">>) => {
    setMeals((prev) =>
      prev.map((meal) => (meal.id === id ? { ...meal, ...updates } : meal))
    );
  };

  const getTotalCalories = (date?: Date) => {
    const filtered = date ? getMealsByDate(date) : meals;
    return filtered.reduce((sum, meal) => sum + meal.calories, 0);
  };
  
  const getTotalProtein = (date?: Date) => {
    const filtered = date ? getMealsByDate(date) : meals;
    return filtered.reduce((sum, meal) => sum + meal.protein, 0);
  };
  
  const getTotalCarbs = (date?: Date) => {
    const filtered = date ? getMealsByDate(date) : meals;
    return filtered.reduce((sum, meal) => sum + meal.carbs, 0);
  };
  
  const getTotalFat = (date?: Date) => {
    const filtered = date ? getMealsByDate(date) : meals;
    return filtered.reduce((sum, meal) => sum + meal.fat, 0);
  };
  
  const getRemainingCalories = (date?: Date) => goals.calorieGoal - getTotalCalories(date);

  return (
    <MealContext.Provider
      value={{
        meals,
        calorieGoal: goals.calorieGoal,
        proteinGoal: goals.proteinGoal,
        carbsGoal: goals.carbsGoal,
        fatGoal: goals.fatGoal,
        addMeal,
        removeMeal,
        updateMeal,
        getTotalCalories,
        getTotalProtein,
        getTotalCarbs,
        getTotalFat,
        getRemainingCalories,
        updateGoals,
        getMealsByDate,
      }}
    >
      {children}
    </MealContext.Provider>
  );
};

export const useMeals = () => {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error("useMeals must be used within a MealProvider");
  }
  return context;
};
