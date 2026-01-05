import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X, Search, Sparkles, Plus, ChevronRight, Camera, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { searchFoods } from "@/data/foodDatabase";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const mealFilters = ["Breakfast", "Lunch", "Dinner", "Snack"];

const recentHistory = [
  { id: "banana", name: "Banana (Medium)", calories: 105, serving: "1 serving", image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop" },
  { id: "avocado-toast", name: "Avocado Toast", calories: 250, serving: "1 slice", image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=400&fit=crop" },
  { id: "greek-yogurt", name: "Greek Yogurt", calories: 120, serving: "1 cup", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop" },
];

const frequentPairs = [
  { id: 1, name: "Coffee + 2% Milk", calories: 45, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop" },
  { id: 2, name: "Protein Shake + Water", calories: 140, image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop" },
];

const FoodLogger = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMealType = searchParams.get("mealType") || "Breakfast";
  const [selectedMeal, setSelectedMeal] = useState(initialMealType);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const searchResults = searchFoods(searchQuery);
  const isSearching = searchQuery.trim().length > 0;

  const handleFoodClick = (foodId: string) => {
    navigate(`/food-details/${foodId}?meal=${selectedMeal}`);
  };

  const handleAnalyzeWithAI = () => {
    const encodedFood = encodeURIComponent(searchQuery.trim());
    navigate(`/food-details/ai-analyze?meal=${selectedMeal}&foodName=${encodedFood}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleAnalyzeWithAI();
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzingImage(true);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setPreviewImage(base64);

      // Call the Python backend API
      const data = await api.analyzeImage(file);

      // Store data in sessionStorage to avoid URL length issues
      sessionStorage.setItem('aiImageData', JSON.stringify(data));
      sessionStorage.setItem('aiImagePreview', base64);

      // Navigate to food details
      navigate(`/food-details/ai-image?meal=${selectedMeal}`);

    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze image. Make sure the backend server is running.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingImage(false);
      setPreviewImage(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Image Analysis Loading Overlay */}
      {isAnalyzingImage && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8">
          <div className="text-center space-y-4">
            {previewImage && (
              <div className="w-32 h-32 rounded-2xl overflow-hidden mx-auto mb-4 border-2 border-primary/30">
                <img src={previewImage} alt="Analyzing" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Analyzing your food</h2>
            <p className="text-muted-foreground">AI is identifying food and calculating calories...</p>
            <div className="flex items-center justify-center gap-2 text-sm text-primary">
              <Sparkles className="w-4 h-4" />
              <span>Powered by CalorieSense AI</span>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <button
          onClick={() => navigate("/")}
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Log Food</h1>
        <button
          onClick={() => navigate("/")}
          className="text-primary font-semibold hover:text-primary/80 transition-colors"
        >
          Done
        </button>
      </header>

      <div className="px-4 pb-8 space-y-6">
        {/* Photo Upload Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Scan Food with AI</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Take a photo or upload an image to instantly calculate calories
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12"
            >
              <Camera className="w-5 h-5 mr-2" />
              Take Photo
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1 border-primary/30 text-foreground hover:bg-primary/10 rounded-xl h-12"
            >
              <Image className="w-5 h-5 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search any food you eat (e.g., chicken, mutton, paneer, milk)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-card border border-border rounded-xl py-3.5 pl-12 pr-14 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground px-1">
            Can't find your food? Just type it — AI will analyze it.
          </p>
        </div>

        {/* Meal Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {mealFilters.map((meal) => (
            <button
              key={meal}
              onClick={() => setSelectedMeal(meal)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedMeal === meal
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
            >
              {meal}
            </button>
          ))}
        </div>

        {/* Search Results */}
        {isSearching ? (
          <section className="space-y-3">
            {/* AI Analyze Action - Always visible when searching */}
            <button
              onClick={handleAnalyzeWithAI}
              className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-2xl hover:from-primary/15 hover:to-primary/10 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-foreground">Analyze with AI</h3>
                <p className="text-sm text-muted-foreground">
                  Get nutrition info for "<span className="font-medium text-foreground">{searchQuery}</span>"
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>

            {/* Database Suggestions */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold px-1">
                  Quick suggestions
                </p>
                <div className="bg-card rounded-2xl overflow-hidden divide-y divide-border">
                  {searchResults.slice(0, 5).map((food) => (
                    <button
                      key={food.id}
                      onClick={() => handleFoodClick(food.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={food.image}
                          alt={food.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-foreground truncate">
                            {highlightMatch(food.name, searchQuery)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {food.calories} kcal • {food.protein}g protein
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : (
          <>
            {/* AI Suggests Card */}
            <div className="bg-card border border-primary/30 rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-primary tracking-wide">AI SUGGESTS</span>
                  </div>
                  <h3 className="text-foreground font-semibold text-lg">Oatmeal & Berries</h3>
                  <p className="text-muted-foreground text-sm">Fits your morning carb target.</p>
                </div>
                <Button
                  size="icon"
                  onClick={() => handleFoodClick("oatmeal")}
                  className="rounded-full bg-primary hover:bg-primary/90 h-10 w-10 shrink-0"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Recent History */}
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Recent History
              </h2>
              <div className="space-y-2">
                {recentHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleFoodClick(item.id)}
                    className="flex items-center justify-between bg-card rounded-xl p-3 cursor-pointer hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.calories} kcal • {item.serving}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground h-10 w-10"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            {/* Frequent Pairs */}
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Frequent Pairs
              </h2>
              <div className="space-y-2">
                {frequentPairs.map((pair) => (
                  <div
                    key={pair.id}
                    onClick={() => handleFoodClick("coffee")}
                    className="flex items-center justify-between bg-card rounded-xl p-3 cursor-pointer hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={pair.image}
                        alt={pair.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-foreground">{pair.name}</h3>
                        <p className="text-sm text-muted-foreground">{pair.calories} kcal</p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground h-10 w-10"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

// Helper function to highlight matching text
const highlightMatch = (text: string, query: string) => {
  if (!query.trim()) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <>
      {before}
      <span className="font-bold text-primary">{match}</span>
      {after}
    </>
  );
};

export default FoodLogger;