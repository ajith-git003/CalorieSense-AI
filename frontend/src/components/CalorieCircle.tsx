import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

interface CalorieCircleProps {
  consumed: number;
  goal: number;
}

const CalorieCircle = ({ consumed, goal }: CalorieCircleProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const remaining = Math.max(0, goal - consumed);
  const progress = Math.min((consumed / goal) * 100, 100);
  
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="relative flex flex-col items-center justify-center py-8">
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Background circle */}
        <svg className="w-56 h-56 transform -rotate-90 absolute inset-0">
          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth="14"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke="url(#calorieGradient)"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: "stroke-dashoffset 1s ease-out",
            }}
          />
          <defs>
            <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(145 80% 50%)" />
              <stop offset="100%" stopColor="hsl(145 80% 40%)" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Flame className="w-8 h-8 text-primary mb-1" />
          <span className="text-5xl font-bold text-foreground">{consumed.toLocaleString()}</span>
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">KCAL Eaten</span>
          <div className="mt-2 px-4 py-1 rounded-full bg-muted/50">
            <span className="text-xs text-muted-foreground">{remaining.toLocaleString()} left of {goal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalorieCircle;
