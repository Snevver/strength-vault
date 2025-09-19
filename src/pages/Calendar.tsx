import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Flame, Target, Loader2 } from "lucide-react";
import { useWorkoutCalendar } from "@/hooks/useWorkoutCalendar";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { workoutDays, loading, toggleWorkoutDay } = useWorkoutCalendar();

  const workoutCount = workoutDays.size;
  const currentStreak = 5; // This would be calculated from actual data

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        dateString,
        hasWorkout: workoutDays.has(dateString),
        isToday: day === today.getDate()
      });
    }
    
    return days;
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workout Calendar</h1>
            <p className="text-muted-foreground">Loading your workout history...</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  const calendarDays = generateCalendarDays();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workout Calendar</h1>
          <p className="text-muted-foreground">
            Track your workout consistency and build streaks
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  September 2024
                </CardTitle>
                <CardDescription>
                  Click any day to toggle workout status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Calendar Header */}
                  <div className="grid grid-cols-7 gap-2 text-sm font-medium text-muted-foreground text-center">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => (
                      <div key={index} className="aspect-square">
                        {day ? (
                          <Button
                            variant="ghost"
                            className={`w-full h-full p-0 text-sm font-medium ${
                              day.hasWorkout
                                ? "bg-success text-success-foreground hover:bg-success/80"
                                : "hover:bg-muted"
                            } ${
                              day.isToday
                                ? "ring-2 ring-primary"
                                : ""
                            }`}
                            onClick={() => toggleWorkoutDay(day.dateString)}
                          >
                            {day.day}
                          </Button>
                        ) : (
                          <div />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Legend */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-success" />
                      <span>Workout completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-muted" />
                      <span>Rest day</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-success">
                    {currentStreak}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Days in a row
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    Keep it up! 🔥
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Monthly Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-3 rounded bg-muted/50">
                    <div className="font-bold text-lg">{workoutCount}</div>
                    <div className="text-muted-foreground">Workouts</div>
                  </div>
                  <div className="text-center p-3 rounded bg-muted/50">
                    <div className="font-bold text-lg">15</div>
                    <div className="text-muted-foreground">Goal</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round((workoutCount / 15) * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((workoutCount / 15) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workout Pattern</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Best day</span>
                  <Badge variant="outline">Monday</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Avg per week</span>
                  <Badge variant="outline">3.5</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Longest streak</span>
                  <Badge variant="outline">8 days</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;