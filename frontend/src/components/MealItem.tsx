import { ChevronRight } from "lucide-react";

interface MealItemProps {
  name: string;
  calories: number;
  description: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  onClick?: () => void;
}

const MealItem = ({ name, calories, description, icon, iconBgColor = "bg-primary/20", onClick }: MealItemProps) => {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-card rounded-2xl cursor-pointer hover:bg-accent/50 transition-colors duration-200 animate-slide-up"
    >
      <div className={`w-12 h-12 rounded-xl ${iconBgColor} flex items-center justify-center text-primary`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground">{name}</h4>
        <p className="text-sm text-muted-foreground truncate">{description}</p>
      </div>
      <div className="text-right flex items-center gap-2">
        <span className="font-semibold text-foreground">{calories} kcal</span>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  );
};

export default MealItem;
