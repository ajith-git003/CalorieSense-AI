import { Home, BarChart3, ClipboardList, Settings, UtensilsCrossed } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItemProps {
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, activeIcon, label, active, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 py-3 px-4 transition-colors duration-200 ${
      active
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground"
    }`}
  >
    {active ? activeIcon : icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabClick = (tab: string) => {
    onTabChange(tab);
    if (tab === "home") {
      navigate("/");
    } else if (tab === "history") {
      navigate("/meal-history");
    } else if (tab === "analytics") {
      navigate("/analytics");
    } else if (tab === "recipes") {
      navigate("/recipes");
    } else if (tab === "settings") {
      navigate("/settings");
    }
  };

  const currentTab = location.pathname === "/meal-history" ? "history" : 
                     location.pathname === "/settings" ? "settings" :
                     location.pathname === "/analytics" ? "analytics" :
                     location.pathname === "/recipes" ? "recipes" :
                     location.pathname === "/" ? "home" : activeTab;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border pb-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        <NavItem
          icon={<Home className="w-5 h-5" />}
          activeIcon={<Home className="w-5 h-5 fill-current" />}
          label="Home"
          active={currentTab === "home"}
          onClick={() => handleTabClick("home")}
        />
        <NavItem
          icon={<ClipboardList className="w-5 h-5" />}
          activeIcon={<ClipboardList className="w-5 h-5" />}
          label="History"
          active={currentTab === "history"}
          onClick={() => handleTabClick("history")}
        />
        <NavItem
          icon={<BarChart3 className="w-5 h-5" />}
          activeIcon={<BarChart3 className="w-5 h-5" />}
          label="Analytics"
          active={currentTab === "analytics"}
          onClick={() => handleTabClick("analytics")}
        />
        <NavItem
          icon={<UtensilsCrossed className="w-5 h-5" />}
          activeIcon={<UtensilsCrossed className="w-5 h-5" />}
          label="Recipes"
          active={currentTab === "recipes"}
          onClick={() => handleTabClick("recipes")}
        />
        <NavItem
          icon={<Settings className="w-5 h-5" />}
          activeIcon={<Settings className="w-5 h-5" />}
          label="Settings"
          active={currentTab === "settings"}
          onClick={() => handleTabClick("settings")}
        />
      </div>
    </nav>
  );
};

export default BottomNav;
