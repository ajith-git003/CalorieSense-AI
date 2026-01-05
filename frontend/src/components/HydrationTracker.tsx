import { Droplets, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HydrationTrackerProps {
  glasses: number;
  goal: number;
  onAdd: () => void;
}

const HydrationTracker = ({ glasses, goal, onAdd }: HydrationTrackerProps) => {
  return (
    <div className="bg-card rounded-2xl p-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-water/20 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-water" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Hydration</h4>
            <p className="text-sm text-muted-foreground">{glasses} / {goal} Cups</p>
          </div>
        </div>
        <Button
          size="icon"
          className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onAdd}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default HydrationTracker;
