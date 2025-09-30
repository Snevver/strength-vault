import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Dumbbell, 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  LogOut,
  Home,
  Zap,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Profile", href: "/profile", icon: Dumbbell },
  { name: "Upper A", href: "/upper-a", icon: Zap, description: "Chest Focus" },
  { name: "Upper B", href: "/upper-b", icon: Target, description: "Back Focus" },
  { name: "Lower A", href: "/lower-a", icon: Zap, description: "Quad Focus" },
  { name: "Lower B", href: "/lower-b", icon: Target, description: "Hamstring Focus" },
  { name: "Progress", href: "/progress", icon: TrendingUp },
  { name: "Calendar", href: "/calendar", icon: Calendar },
];

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      navigate("/");
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-6">
        <Dumbbell className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">Training Tracker</h1>
      </div>
      
      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors btn-touch ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            <div className="flex flex-col">
              <span>{item.name}</span>
              {item.description && (
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              )}
            </div>
          </NavLink>
        ))}
      </nav>

      <Separator className="my-4" />

      <Button
        onClick={handleLogout}
        variant="ghost"
        className="w-full justify-start gap-3 btn-touch hover:bg-primary hover:text-primary-foreground"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </Card>
  );
};