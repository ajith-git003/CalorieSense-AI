import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Users, Flame, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getRecipeById } from "@/data/recipeDatabase";

const RecipeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const recipe = getRecipeById(id || "");

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Recipe not found</h2>
          <Button onClick={() => navigate("/recipes")}>Back to Recipes</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Hero Image */}
      <div className="relative h-64">
        <img 
          src={recipe.image} 
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-12 left-4 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={() => navigate("/recipes")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="px-5 -mt-8 relative z-10 space-y-6">
        {/* Title & Tags */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{recipe.name}</h1>
          <p className="text-muted-foreground text-sm mb-3">{recipe.description}</p>
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="bg-muted/50">
            <CardContent className="p-3 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Prep</p>
              <p className="text-sm font-medium">{recipe.prepTime}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-3 text-center">
              <ChefHat className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Cook</p>
              <p className="text-sm font-medium">{recipe.cookTime}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-3 text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Serves</p>
              <p className="text-sm font-medium">{recipe.servings}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-3 text-center">
              <Flame className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Calories</p>
              <p className="text-sm font-medium">{recipe.calories}</p>
            </CardContent>
          </Card>
        </div>

        {/* Macros */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Nutrition per serving</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-macro-protein">{recipe.protein}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div>
                <p className="text-xl font-bold text-macro-carbs">{recipe.carbs}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div>
                <p className="text-xl font-bold text-macro-fat">{recipe.fat}g</p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingredients */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Ingredients</h3>
          <Card>
            <CardContent className="p-4">
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-sm">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Instructions</h3>
          <div className="space-y-3">
            {recipe.instructions.map((step, index) => (
              <Card key={index}>
                <CardContent className="p-4 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-relaxed">{step}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
