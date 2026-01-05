import { useState } from "react";
import { ArrowLeft, Trash2, Edit2, Check, X, Coffee, Sun, Moon, Cookie } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMeals, LoggedMeal } from "@/contexts/MealContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import BottomNav from "@/components/BottomNav";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const mealTypeConfig = {
  Breakfast: { icon: Coffee, color: "bg-amber-500/20 text-amber-500" },
  Lunch: { icon: Sun, color: "bg-orange-500/20 text-orange-500" },
  Dinner: { icon: Moon, color: "bg-indigo-500/20 text-indigo-500" },
  Snack: { icon: Cookie, color: "bg-pink-500/20 text-pink-500" },
};

const MealHistory = () => {
  const navigate = useNavigate();
  const { meals, removeMeal, updateMeal } = useMeals();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<LoggedMeal>>({});
  const [activeTab, setActiveTab] = useState("history");

  const sortedMeals = [...meals].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const startEdit = (meal: LoggedMeal) => {
    setEditingId(meal.id);
    setEditForm({
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      servings: meal.servings,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = (id: string) => {
    updateMeal(id, editForm);
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    removeMeal(id);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-4 p-4 max-w-lg mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Meal History</h1>
            <p className="text-sm text-muted-foreground">
              {meals.length} meal{meals.length !== 1 ? "s" : ""} logged
            </p>
          </div>
        </div>
      </header>

      {/* Meal List */}
      <main className="p-4 max-w-lg mx-auto space-y-3">
        {sortedMeals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No meals logged yet.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/food-logger")}
            >
              Log your first meal
            </Button>
          </div>
        ) : (
          sortedMeals.map((meal) => {
            const config = mealTypeConfig[meal.mealType];
            const Icon = config.icon;
            const isEditing = editingId === meal.id;

            return (
              <div
                key={meal.id}
                className="bg-card rounded-2xl p-4 border border-border animate-slide-up"
              >
                <div className="flex items-start gap-3">
                  {/* Meal Type Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center shrink-0`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Meal Details */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          value={editForm.name || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          placeholder="Meal name"
                          className="font-semibold"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Calories
                            </label>
                            <Input
                              type="number"
                              value={editForm.calories || 0}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  calories: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Protein (g)
                            </label>
                            <Input
                              type="number"
                              value={editForm.protein || 0}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  protein: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Carbs (g)
                            </label>
                            <Input
                              type="number"
                              value={editForm.carbs || 0}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  carbs: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Fat (g)
                            </label>
                            <Input
                              type="number"
                              value={editForm.fat || 0}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  fat: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-foreground truncate">
                          {meal.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {meal.mealType} •{" "}
                          {format(new Date(meal.timestamp), "MMM d, h:mm a")}
                        </p>
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {meal.calories} kcal
                          </span>
                          <span>P: {meal.protein}g</span>
                          <span>C: {meal.carbs}g</span>
                          <span>F: {meal.fat}g</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 shrink-0">
                    {isEditing ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => saveEdit(meal.id)}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={cancelEdit}
                          className="text-muted-foreground"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(meal)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete meal?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove "{meal.name}" from your log.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(meal.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default MealHistory;
