interface MacroCardProps {
  name: string;
  current: number;
  goal: number;
  unit: string;
  type: "protein" | "carbs" | "fat";
}

const MacroCard = ({ name, current, goal, unit, type }: MacroCardProps) => {
  const progress = Math.min((current / goal) * 100, 100);

  const colorClasses = {
    protein: {
      dot: "bg-protein",
      bar: "bg-protein",
    },
    carbs: {
      dot: "bg-carbs",
      bar: "bg-carbs",
    },
    fat: {
      dot: "bg-fat",
      bar: "bg-fat",
    },
  };

  const colors = colorClasses[type];

  return (
    <div className="flex-1 rounded-2xl p-4 bg-card animate-scale-in">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{name}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-2xl font-bold text-foreground">{current}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      <div className="text-xs text-muted-foreground mb-2">/ {goal}{unit}</div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${colors.bar} transition-all duration-700 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default MacroCard;
