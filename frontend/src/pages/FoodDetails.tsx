import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Share2, Loader2, Sparkles, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMeals } from "@/contexts/MealContext";
import { toast } from "@/hooks/use-toast";
import { getFoodById, FoodItem } from "@/data/foodDatabase";
import { supabase } from "@/integrations/supabase/client";

interface AIFoodData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar?: number;
  sodium?: number;
  servingSize: string;
  servingSizes: string[];
  description?: string;
  image: string;
  confidence?: string;
  detectedItems?: string[];
}

interface DisplayFood {
  id: string;
  name: string;
  image: string;
  emoji?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar?: number;
  sodium?: number;
  servingSizes: { label: string; grams: number }[];
  vitamins: { name: string; amount: string; percent: number }[];
  description?: string;
  confidence?: string;
  detectedItems?: string[];
}

const defaultFood: DisplayFood = {
  id: "unknown",
  name: "Unknown Food",
  image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop",
  calories: 100,
  protein: 5,
  carbs: 10,
  fat: 5,
  fiber: 2,
  servingSizes: [
    { label: "1 serving (100g)", grams: 100 },
  ],
  vitamins: [
    { name: "Vitamin C", amount: "10mg", percent: 11 },
  ],
};

const FoodDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const mealType = (searchParams.get("meal") as "Breakfast" | "Lunch" | "Dinner" | "Snack") || "Breakfast";
  const foodNameParam = searchParams.get("foodName");
  
  const [quantity, setQuantity] = useState(1);
  const [selectedServing, setSelectedServing] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [aiFood, setAiFood] = useState<AIFoodData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const { addMeal } = useMeals();

  const isAIAnalysis = id === "ai-analyze" && foodNameParam;
  const isImageAnalysis = id === "ai-image";
  const dbFood = !isAIAnalysis && !isImageAnalysis && id ? getFoodById(id) : null;
  
  // Handle image analysis data from sessionStorage
  useEffect(() => {
    if (isImageAnalysis) {
      try {
        const storedData = sessionStorage.getItem('aiImageData');
        const storedPreview = sessionStorage.getItem('aiImagePreview');
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setAiFood(parsedData);
          
          if (storedPreview) {
            setUploadedImagePreview(storedPreview);
          }
          
          // Clear sessionStorage after reading
          sessionStorage.removeItem('aiImageData');
          sessionStorage.removeItem('aiImagePreview');
        } else {
          setError('No image data found. Please try uploading again.');
        }
      } catch (err) {
        console.error('Error parsing image data:', err);
        setError('Failed to load image analysis data');
      }
    }
  }, [isImageAnalysis]);

  // Fetch AI analysis for custom foods
  useEffect(() => {
    if (isAIAnalysis && foodNameParam) {
      analyzeFood(decodeURIComponent(foodNameParam));
    }
  }, [isAIAnalysis, foodNameParam]);

  const analyzeFood = async (foodName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-food', {
        body: { foodName }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAiFood(data);
    } catch (err) {
      console.error('Error analyzing food:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze food');
      toast({
        title: "Analysis failed",
        description: err instanceof Error ? err.message : 'Failed to analyze food',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Determine food data based on source
  const food: DisplayFood = aiFood ? {
    id: isImageAnalysis ? "ai-image" : "ai-" + (foodNameParam || "custom"),
    name: aiFood.name,
    image: uploadedImagePreview || (aiFood.image.startsWith("http") ? aiFood.image : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop"),
    emoji: !uploadedImagePreview && aiFood.image.length < 10 ? aiFood.image : undefined,
    calories: aiFood.calories,
    protein: aiFood.protein,
    carbs: aiFood.carbs,
    fat: aiFood.fat,
    fiber: aiFood.fiber,
    sugar: aiFood.sugar,
    sodium: aiFood.sodium,
    servingSizes: aiFood.servingSizes.map((s, i) => ({ label: s, grams: i === 0 ? 100 : 100 })),
    vitamins: aiFood.sodium ? [{ name: "Sodium", amount: `${aiFood.sodium}mg`, percent: Math.round((aiFood.sodium / 2300) * 100) }] : [],
    description: aiFood.description,
    confidence: aiFood.confidence,
    detectedItems: aiFood.detectedItems,
  } : dbFood ? {
    ...dbFood,
    emoji: undefined,
    sugar: undefined,
    sodium: undefined,
    description: undefined,
  } : defaultFood;

  // Calculate nutrition based on serving size and quantity
  const baseGrams = food.servingSizes[0]?.grams || 100;
  const selectedGrams = food.servingSizes[selectedServing]?.grams || baseGrams;
  const multiplier = (selectedGrams / baseGrams) * quantity;

  const adjustedCalories = Math.round(food.calories * multiplier);
  const adjustedProtein = Math.round(food.protein * multiplier * 10) / 10;
  const adjustedCarbs = Math.round(food.carbs * multiplier * 10) / 10;
  const adjustedFat = Math.round(food.fat * multiplier * 10) / 10;
  const adjustedFiber = Math.round(food.fiber * multiplier * 10) / 10;

  const handleAddMeal = () => {
    addMeal({
      foodId: food.id,
      name: food.name,
      image: food.emoji || food.image,
      calories: adjustedCalories,
      protein: adjustedProtein,
      carbs: adjustedCarbs,
      fat: adjustedFat,
      servings: quantity,
      mealType: mealType,
    });

    toast({
      title: "Added to " + mealType,
      description: `${food.name} (${adjustedCalories} kcal) added successfully!`,
    });

    navigate("/");
  };

  // Loading state for AI analysis
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Analyzing with AI</h2>
          <p className="text-muted-foreground">
            Getting nutrition info for "<span className="font-medium text-foreground">{foodNameParam ? decodeURIComponent(foodNameParam) : 'food'}</span>"
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-primary">
            <Sparkles className="w-4 h-4" />
            <span>Powered by AI</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !aiFood) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-foreground">Couldn't analyze food</h2>
          <p className="text-muted-foreground max-w-sm">{error}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Food Details</h1>
        <button className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4 pb-32 space-y-6">
        {/* Food Hero with Image or Emoji */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40">
          {food.emoji && !food.image.startsWith("http") ? (
            <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-8xl">{food.emoji}</span>
            </div>
          ) : (
            <div className="aspect-video">
              <img 
                src={food.image} 
                alt={food.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4">
            <div className="flex items-center gap-2 flex-wrap">
              {aiFood && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  AI Analyzed
                </span>
              )}
              {isImageAnalysis && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  <Camera className="w-3 h-3" />
                  Photo Scan
                </span>
              )}
              {food.confidence && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  food.confidence === 'high' ? 'bg-green-500/10 text-green-500' :
                  food.confidence === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {food.confidence} confidence
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-foreground mt-1">{food.name}</h2>
            {food.description && (
              <p className="text-sm text-muted-foreground mt-1">{food.description}</p>
            )}
            {food.detectedItems && food.detectedItems.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Detected: {food.detectedItems.join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Quantity & Measure Selectors */}
        <div className="bg-card rounded-2xl p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Quantity</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                  className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 bg-muted/30 rounded-lg px-4 py-2.5 text-center font-semibold">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity(quantity + 0.5)}
                  className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Measure Selector */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Measure</label>
              <select
                value={selectedServing}
                onChange={(e) => setSelectedServing(Number(e.target.value))}
                className="w-full bg-muted/30 border-0 rounded-lg px-4 py-2.5 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
              >
                {food.servingSizes.map((size, index) => (
                  <option key={index} value={index}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Macronutrients Breakdown */}
        <div className="bg-card rounded-2xl p-4 space-y-4">
          <h3 className="text-base font-semibold text-foreground">Macronutrients Breakdown</h3>
          
          {/* Calories Header */}
          <div className="flex items-end justify-between border-b border-border pb-4">
            <div>
              <p className="text-sm text-muted-foreground">Calories</p>
              <p className="text-4xl font-bold text-foreground">{adjustedCalories} <span className="text-lg font-normal">Cal</span></p>
            </div>
            <div className="bg-muted/50 rounded-full px-3 py-1.5 text-sm text-muted-foreground">
              Net wt: {Math.round(selectedGrams * quantity)} g
            </div>
          </div>

          {/* Macro List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">🍗</span>
                <span className="text-foreground">Proteins</span>
              </div>
              <span className="font-medium text-foreground">{adjustedProtein} g</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">💧</span>
                <span className="text-foreground">Fats</span>
              </div>
              <span className="font-medium text-foreground">{adjustedFat} g</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">🍞</span>
                <span className="text-foreground">Carbs</span>
              </div>
              <span className="font-medium text-foreground">{adjustedCarbs} g</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">🌿</span>
                <span className="text-foreground">Fiber</span>
              </div>
              <span className="font-medium text-foreground">{adjustedFiber} g</span>
            </div>
            {food.sugar !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🍬</span>
                  <span className="text-foreground">Sugar</span>
                </div>
                <span className="font-medium text-foreground">{Math.round(food.sugar * multiplier * 10) / 10} g</span>
              </div>
            )}
          </div>
        </div>

        {/* Micronutrients Breakdown */}
        {food.vitamins && food.vitamins.length > 0 && (
          <div className="bg-card rounded-2xl p-4 space-y-4">
            <h3 className="text-base font-semibold text-foreground">Micronutrients Breakdown</h3>
            <div className="space-y-3">
              {food.vitamins.map((vitamin, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-foreground">{vitamin.name}</span>
                  <span className="text-muted-foreground">{vitamin.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
        <Button
          onClick={handleAddMeal}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg"
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default FoodDetails;
