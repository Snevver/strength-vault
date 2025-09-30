import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface WorkoutDay {
  date: string;
  worked_out: boolean;
  workout_type?: string | null;
}

export const useWorkoutCalendar = () => {
  const [workoutDays, setWorkoutDays] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch workouts for a specific month (year, month are 1-based month numbers).
  const fetchWorkouts = useCallback(async (yearArg?: number, monthArg?: number) => {
    if (!user) {
      setWorkoutDays(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const year = yearArg ?? now.getFullYear();
      const monthNumber = monthArg ?? (now.getMonth() + 1);
      const month = String(monthNumber).padStart(2, '0');

      // Query by date range to avoid type issues with `like` on a DATE column
      const firstDay = `${year}-${month}-01`;
      const lastDay = new Date(Number(year), Number(monthNumber), 0);
      const lastDayStr = `${year}-${month}-${String(lastDay.getDate()).padStart(2, '0')}`;

      const { data, error } = await supabase
        .from('daily_workouts')
        .select('date, worked_out')
        .eq('user_id', user.id)
        .gte('date', firstDay)
        .lte('date', lastDayStr);

      if (error) throw error;

      const set = new Set<string>();
      const rows = (data ?? []) as { date: string; worked_out: boolean }[];
      rows.forEach((r) => {
        // Treat rows with worked_out = false as if they don't exist
        if (r.worked_out) set.add(r.date);
      });
      setWorkoutDays(set);
    } catch (err) {
      console.error('Failed to load workouts', err);
      toast({
        title: 'Error',
        description: 'Failed to load workout calendar',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Load the user's workouts when the user changes (default to current month)
  useEffect(() => {
    fetchWorkouts();
  }, [user, fetchWorkouts]);

  // Toggle a workout day: if exists -> delete, else insert
  const toggleWorkoutDay = async (date: string) => {
    if (!user) return;

    const hasWorkout = workoutDays.has(date);
    try {
      if (hasWorkout) {
        // Instead of deleting the row, mark worked_out = false for reliability
        const { error } = await supabase
          .from('daily_workouts')
          .update({ worked_out: false })
          .match({ user_id: user.id, date });

        if (error) throw error;
        // Refresh from DB to ensure the stored state is authoritative (for the same month as the date)
        const [y, m] = date.split('-');
        await fetchWorkouts(Number(y), Number(m));
        toast({ title: 'Workout removed', description: `Removed workout for ${new Date(date).toLocaleDateString()}` });
      } else {
        // Upsert so we don't hit a unique constraint if an empty row exists
        const { error } = await supabase.from('daily_workouts').upsert([
          { user_id: user.id, date, worked_out: true }
        ], { onConflict: 'user_id,date' });

        if (error) throw error;
        // Refresh from DB so any server defaults/policies are applied and reflected (for the same month)
        const [y, m] = date.split('-');
        await fetchWorkouts(Number(y), Number(m));
        toast({ title: 'Workout logged', description: `Logged workout for ${new Date(date).toLocaleDateString()}` });
      }
    } catch (err) {
      console.error('Error toggling workout:', err);
      toast({ title: 'Error', description: 'Failed to update workout status', variant: 'destructive' });
    }
  };

  return {
    workoutDays,
    loading,
    toggleWorkoutDay,
    // Expose a stable function to load any month (year, month are 1-based)
    loadMonth: fetchWorkouts
  };
};