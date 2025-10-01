import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Zap,
  BarChart3,
  Trophy,
  Flame,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardData } from "@/hooks/useDashboardData";

export const Dashboard = () => {
  const { stats, recentWorkouts, monthlyProgress, loading } = useDashboardData();

  const quickStats = [
    { label: "Workouts This Month", value: stats.workoutsThisMonth.toString(), icon: Calendar },
    { label: "Total Sessions", value: stats.totalSessions.toString(), icon: BarChart3 },
  ];

  const quickActions = [
    { name: "Upper A", href: "/upper-a", icon: Zap, description: "Chest Focus", color: "bg-primary" },
    { name: "Upper B", href: "/upper-b", icon: Target, description: "Back Focus", color: "bg-primary" },
    { name: "Lower A", href: "/lower-a", icon: Zap, description: "Quad Focus", color: "bg-primary" },
    { name: "Lower B", href: "/lower-b", icon: Target, description: "Hamstring Focus", color: "bg-primary" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Loading your training data...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your 4-day Upper/Lower split progress
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Workout</CardTitle>
          <CardDescription>
            Jump into today's training session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.name} to={action.href}>
                <Button 
                  className="group w-full h-auto p-4 flex flex-col items-center gap-2 btn-touch hover:bg-primary hover:text-primary-foreground" 
                  variant="outline"
                >
                  <div className={`p-2 rounded-lg border-2 border-transparent group-hover:border-black transition-colors ${action.color}`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{action.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Gains & Heaviest Lifts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Gains (since last month)</CardTitle>
            <CardDescription>Exercises with the biggest increase</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyProgress.length === 0 ? (
              <div className="text-sm text-muted-foreground">No progress data</div>
            ) : (
              <ul className="space-y-2">
                {monthlyProgress
                  .sort((a, b) => b.progress - a.progress)
                  .slice(0, 5)
                  .map(p => (
                    <li key={p.exercise_name} className="flex items-center justify-between">
                      <div className="font-medium">{p.exercise_name}</div>
                      <div className={`text-sm ${p.progress > 0 ? 'text-primary' : 'text-muted-foreground'}`}>{p.progress > 0 ? `+${p.progress}kg` : `${p.progress}kg`}</div>
                    </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Heaviest Lifts (current)</CardTitle>
            <CardDescription>Top 5 heaviest current weights</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyProgress.length === 0 ? (
              <div className="text-sm text-muted-foreground">No weight data</div>
            ) : (
              <ul className="space-y-2">
                {monthlyProgress
                  .sort((a, b) => b.current_weight - a.current_weight)
                  .slice(0, 5)
                  .map(p => (
                    <li key={p.exercise_name} className="flex items-center justify-between">
                      <div className="font-medium">{p.exercise_name}</div>
                      <div className="text-sm">{p.current_weight}kg</div>
                    </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};