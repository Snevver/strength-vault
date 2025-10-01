import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Flame, Target, Loader2 } from "lucide-react";
import { useWorkoutCalendar } from "@/hooks/useWorkoutCalendar";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { workoutDays, loading, toggleWorkoutDay, loadMonth } = useWorkoutCalendar();
  const [pendingDates, setPendingDates] = useState<Set<string>>(new Set());

  const today = new Date();
  const [displayYear, setDisplayYear] = useState<number>(today.getFullYear());
  const [displayMonth, setDisplayMonth] = useState<number>(today.getMonth() + 1); // 1-based

  const workoutCount = workoutDays.size;
  const currentStreak = 5; // This would be calculated from actual data

  const generateCalendarDays = () => {
    const currentMonth = displayMonth - 1; // Date expects 0-based
    const currentYear = displayYear;
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Saturday=6, Monday=0
    
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
        isToday: (currentYear === today.getFullYear() && (currentMonth + 1) === (today.getMonth() + 1) && day === today.getDate())
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
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => {
                        // previous month
                        const prev = new Date(displayYear, displayMonth - 2);
                        setDisplayYear(prev.getFullYear());
                        setDisplayMonth(prev.getMonth() + 1);
                        void loadMonth(prev.getFullYear(), prev.getMonth() + 1);
                      }}>←</Button>
                      <div className="text-sm font-medium">{new Date(displayYear, displayMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}</div>
                      <Button size="sm" onClick={() => {
                        // next month
                        const next = new Date(displayYear, displayMonth);
                        setDisplayYear(next.getFullYear());
                        setDisplayMonth(next.getMonth() + 1);
                        void loadMonth(next.getFullYear(), next.getMonth() + 1);
                      }}>→</Button>
                    </div>
                  </div>
                </CardTitle>
                <CardDescription>
                  Click any day to toggle workout status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Calendar Header */}
                  <div className="grid grid-cols-7 gap-2 text-sm font-medium text-muted-foreground text-center">
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                    <div>Sun</div>
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
                              ? "bg-primary text-primary-foreground hover:bg-primary/80"
                                : "hover:bg-muted"
                            } ${
                              day.isToday
                                ? "ring-2 ring-primary"
                                : ""
                            }`}
                            onClick={async () => {
                              if (pendingDates.has(day.dateString)) return;
                              // mark pending
                              setPendingDates(prev => new Set(prev).add(day.dateString));
                              try {
                                await toggleWorkoutDay(day.dateString);
                              } finally {
                                setPendingDates(prev => {
                                  const next = new Set(prev);
                                  next.delete(day.dateString);
                                  return next;
                                });
                              }
                            }}
                            disabled={pendingDates.has(day.dateString)}
                          >
                            <div className="flex items-center justify-center w-full">
                              {pendingDates.has(day.dateString) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                day.day
                              )}
                            </div>
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
                      <div className="w-4 h-4 rounded bg-primary" />
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
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;