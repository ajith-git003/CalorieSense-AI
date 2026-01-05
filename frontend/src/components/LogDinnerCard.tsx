import { Plus } from "lucide-react";

interface LogDinnerCardProps {
  mealName: string;
  suggestion: string;
  onClick?: () => void;
}

const LogDinnerCard = ({ mealName, suggestion, onClick }: LogDinnerCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-muted cursor-pointer hover:border-muted-foreground/50 transition-colors duration-200 animate-slide-up"
    >
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
        <Plus className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground">{mealName}</h4>
        <p className="text-sm text-muted-foreground">{suggestion}</p>
      </div>
    </div>
  );
};

export default LogDinnerCard;
