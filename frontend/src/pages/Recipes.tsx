import { useState, useMemo } from "react";
import { ArrowLeft, Drumstick, Wheat, Droplets, Sparkles, ChevronRight, Clock, Flame, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useMeals } from "@/contexts/MealContext";
import { recipeDatabase, Recipe, searchRecipes } from "@/data/recipeDatabase";
import BottomNav from "@/components/BottomNav";

type CategoryType = "high-protein" | "balanced" | "high-carb" | "low-carb";

const Recipes = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recipes");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("high-protein");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { 
    proteinGoal, 
    carbsGoal, 
    fatGoal,
    getTotalProtein,
    getTotalCarbs,
    getTotalFat,
  } = useMeals();

  const today = new Date();
  const remainingProtein = Math.max(0, proteinGoal - getTotalProtein(today));
  const remainingCarbs = Math.max(0, carbsGoal - getTotalCarbs(today));
  const remainingFat = Math.max(0, fatGoal - getTotalFat(today));

  const filteredRecipes = useMemo(() => {
    if (searchQuery.trim()) {
      return searchRecipes(searchQuery);
    }
    return recipeDatabase.filter(recipe => recipe.category === selectedCategory);
  }, [searchQuery, selectedCategory]);

  const categoryTabs = [
    { 
      id: "high-protein" as CategoryType, 
      label: "Protein", 
      icon: <Drumstick className="w-4 h-4" />,
      color: "bg-macro-protein/20 text-macro-protein"
    },
    { 
      id: "high-carb" as CategoryType, 
      label: "Carbs", 
      icon: <Wheat className="w-4 h-4" />,
      color: "bg-macro-carbs/20 text-macro-carbs"
    },
    { 
      id: "low-carb" as CategoryType, 
      label: "Low Carb", 
      icon: <Droplets className="w-4 h-4" />,
      color: "bg-macro-fat/20 text-macro-fat"
    },
    { 
      id: "balanced" as CategoryType, 
      label: "Balanced", 
      icon: <Sparkles className="w-4 h-4" />,
      color: "bg-primary/20 text-primary"
    },
  ];

  const handleRecipeClick = (recipeId: string) => {
    navigate(`/recipe/${recipeId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Recipes</h1>
            <p className="text-sm text-muted-foreground">Cook meals to hit your goals</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </header>

      <div className="px-5 space-y-6">
        {/* Today's Remaining Macros */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3">You still need today:</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xl font-bold text-macro-protein">{remainingProtein}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-macro-carbs">{remainingCarbs}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-macro-fat">{remainingFat}g</p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        {!searchQuery && (
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as CategoryType)}>
            <TabsList className="grid grid-cols-4 w-full h-auto p-1">
              {categoryTabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex flex-col gap-1 py-2 data-[state=active]:bg-background"
                >
                  <div className={`p-1.5 rounded-lg ${tab.color}`}>
                    {tab.icon}
                  </div>
                  <span className="text-xs">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Recipe List */}
        <div className="space-y-4">
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
            </p>
          )}
          
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recipes found</p>
            </div>
          ) : (
            filteredRecipes.map((recipe) => (
              <Card 
                key={recipe.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
                onClick={() => handleRecipeClick(recipe.id)}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    <img 
                      src={recipe.image} 
                      alt={recipe.name}
                      className="w-28 h-28 object-cover"
                    />
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold line-clamp-1">{recipe.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {recipe.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {recipe.prepTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {recipe.calories} kcal
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  {/* Macro badges */}
                  <div className="px-3 pb-3 flex gap-2">
                    <Badge variant="outline" className="text-xs text-macro-protein border-macro-protein/30">
                      {recipe.protein}g protein
                    </Badge>
                    <Badge variant="outline" className="text-xs text-macro-carbs border-macro-carbs/30">
                      {recipe.carbs}g carbs
                    </Badge>
                    <Badge variant="outline" className="text-xs text-macro-fat border-macro-fat/30">
                      {recipe.fat}g fat
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Recipes;
