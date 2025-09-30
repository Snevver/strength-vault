import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  workoutsThisMonth: number;
  personalRecords: number;
  currentStreak: number;
  totalSessions: number;
}

export interface RecentWorkout {
  date: string;
  workout_type: string;
  exercises: number;
  duration: string;
}

export interface MonthlyProgress {
  exercise_name: string;
  current_weight: number;
  previous_weight: number;
  progress: number;
}

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    workoutsThisMonth: 0,
    personalRecords: 0,
    currentStreak: 0,
    totalSessions: 0,
  });
  
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [monthlyProgress, setMonthlyProgress] = useState<MonthlyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Get workouts this month
        const now = new Date();
        const currentMonth = now;
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        // Format as local YYYY-MM-DD to match stored 'date' values (avoid UTC shifts)
        const formatLocal = (d: Date) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        const firstDayStr = formatLocal(firstDay);
        const lastDayStr = formatLocal(lastDay);
        const todayStr = formatLocal(now);
        // For the 'this month' stat we only want to count up to today, not the end of the month
        const upperBound = todayStr < lastDayStr ? todayStr : lastDayStr;

        const { data: monthlyWorkouts } = await supabase
          .from('daily_workouts')
          .select('*')
          .eq('user_id', user.id)
          .eq('worked_out', true)
          .gte('date', firstDayStr)
          .lte('date', upperBound);

        // Get total sessions
        const { data: totalWorkouts } = await supabase
          .from('daily_workouts')
          .select('*')
          .eq('user_id', user.id)
          .eq('worked_out', true);

        // Get current streak
        const { data: allWorkouts } = await supabase
          .from('daily_workouts')
          .select('date, worked_out')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        let currentStreak = 0;
        if (allWorkouts) {
          for (const workout of allWorkouts) {
            if (workout.worked_out) {
              currentStreak++;
            } else {
              break;
            }
          }
        }

        // Get monthly progress comparison
        const { data: currentWeights } = await supabase
          .from('exercise_weights')
          .select('exercise_name, current_weight')
          .eq('user_id', user.id);

        const currentMonthProgress = await supabase
          .from('monthly_progress')
          .select('exercise_name, max_weight')
          .eq('user_id', user.id)
          .eq('year', currentMonth.getFullYear())
          .eq('month', currentMonth.getMonth() + 1);

        // Determine previous month (1-based) and correct year when rolling over Jan -> Dec
        const prevMonthIndex = currentMonth.getMonth() - 1; // 0-based
        const prevMonth = prevMonthIndex >= 0 ? prevMonthIndex + 1 : 12; // 1-based month
        const prevYear = prevMonthIndex >= 0 ? currentMonth.getFullYear() : currentMonth.getFullYear() - 1;

        const lastMonthProgress = await supabase
          .from('monthly_progress')
          .select('exercise_name, max_weight')
          .eq('user_id', user.id)
          .eq('year', prevYear)
          .eq('month', prevMonth);

        // Calculate progress
        const progressData: MonthlyProgress[] = [];
        if (currentWeights) {
          currentWeights.forEach(current => {
            const lastMonth = lastMonthProgress.data?.find(p => p.exercise_name === current.exercise_name);
            progressData.push({
              exercise_name: current.exercise_name,
              current_weight: current.current_weight,
              previous_weight: lastMonth?.max_weight || 0,
              progress: current.current_weight - (lastMonth?.max_weight || 0)
            });
          });
        }

        // Get recent workouts (last 4)
        const { data: recentWorkoutData } = await supabase
          .from('daily_workouts')
          .select('date, workout_type')
          .eq('user_id', user.id)
          .eq('worked_out', true)
          .order('date', { ascending: false })
          .limit(4);

        const formattedRecentWorkouts = recentWorkoutData?.map(w => ({
          date: w.date,
          workout_type: w.workout_type || 'Workout',
          exercises: 5, // Default number
          duration: '45 min' // Default duration
        })) || [];

        setStats({
          workoutsThisMonth: monthlyWorkouts?.length || 0,
          personalRecords: progressData.filter(p => p.progress > 0).length,
          currentStreak,
          totalSessions: totalWorkouts?.length || 0,
        });

        setMonthlyProgress(progressData);
        setRecentWorkouts(formattedRecentWorkouts);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return {
    stats,
    recentWorkouts,
    monthlyProgress,
    loading,
  };
};