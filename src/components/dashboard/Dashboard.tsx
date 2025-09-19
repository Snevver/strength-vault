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
  Flame
} from "lucide-react";
import { Link } from "react-router-dom";

const quickStats = [
  { label: "Workouts This Month", value: "12", icon: Calendar, trend: "+3" },
  { label: "Personal Records", value: "8", icon: Trophy, trend: "+2" },
  { label: "Current Streak", value: "5 days", icon: Flame, trend: "🔥" },
  { label: "Total Sessions", value: "147", icon: BarChart3, trend: "+12" },
];

const recentWorkouts = [
  { day: "Today", type: "Upper A", exercises: 7, duration: "45min" },
  { day: "Yesterday", type: "Lower B", exercises: 5, duration: "38min" },
  { day: "2 days ago", type: "Upper B", exercises: 7, duration: "42min" },
  { day: "3 days ago", type: "Lower A", exercises: 5, duration: "40min" },
];

const quickActions = [
  { name: "Upper A", href: "/upper-a", icon: Zap, description: "Chest Focus", color: "bg-primary" },
  { name: "Upper B", href: "/upper-b", icon: Target, description: "Back Focus", color: "bg-primary" },
  { name: "Lower A", href: "/lower-a", icon: Zap, description: "Quad Focus", color: "bg-success" },
  { name: "Lower B", href: "/lower-b", icon: Target, description: "Hamstring Focus", color: "bg-success" },
];

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your 4-day Upper/Lower split progress
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <Badge variant="secondary" className="mt-1">
                {stat.trend}
              </Badge>
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
                  className="w-full h-auto p-4 flex flex-col items-center gap-2 btn-touch" 
                  variant="outline"
                >
                  <div className={`p-2 rounded-lg ${action.color}`}>
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

      {/* Progress Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress Overview
            </CardTitle>
            <CardDescription>
              Your strength gains this month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Chest Press</span>
                <span className="text-success">+5kg</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Squats</span>
                <span className="text-success">+7.5kg</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pulldown</span>
                <span className="text-success">+2.5kg</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>RDLs</span>
                <span className="text-success">+5kg</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your last 4 workout sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentWorkouts.map((workout, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium">{workout.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {workout.day} • {workout.exercises} exercises
                    </div>
                  </div>
                  <Badge variant="outline">
                    {workout.duration}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};