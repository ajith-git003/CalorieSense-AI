import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MealProvider } from "@/contexts/MealContext";
import Index from "./pages/Index";
import FoodLogger from "./pages/FoodLogger";
import FoodDetails from "./pages/FoodDetails";
import Settings from "./pages/Settings";
import MealHistory from "./pages/MealHistory";
import Analytics from "./pages/Analytics";
import Recipes from "./pages/Recipes";
import RecipeDetails from "./pages/RecipeDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import ErrorBoundary from "@/components/ErrorBoundary";

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MealProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/food-logger" element={<FoodLogger />} />
              <Route path="/food-details/:id" element={<FoodDetails />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/meal-history" element={<MealHistory />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/recipe/:id" element={<RecipeDetails />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </MealProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
