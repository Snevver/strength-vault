import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

// Temporary mock data until Supabase client is properly configured
const mockWorkoutDays = new Set([
  "2024-09-01", "2024-09-03", "2024-09-05", "2024-09-08", 
  "2024-09-10", "2024-09-12", "2024-09-15", "2024-09-17", 
  "2024-09-19", "2024-09-22", "2024-09-24", "2024-09-26"
]);

export interface WorkoutDay {
  date: string;
  worked_out: boolean;
  workout_type?: string;
}

export const useWorkoutCalendar = () => {
  const [workoutDays, setWorkoutDays] = useState<Set<string>>(mockWorkoutDays);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const toggleWorkoutDay = async (date: string) => {
    if (!user) return;

    try {
      const hasWorkout = workoutDays.has(date);
      
      if (hasWorkout) {
        setWorkoutDays(prev => {
          const newSet = new Set(prev);
          newSet.delete(date);
          return newSet;
        });
      } else {
        setWorkoutDays(prev => new Set([...prev, date]));
      }

      toast({
        title: hasWorkout ? "Workout removed" : "Workout logged",
        description: hasWorkout 
          ? `Removed workout for ${new Date(date).toLocaleDateString()}`
          : `Logged workout for ${new Date(date).toLocaleDateString()}`,
      });

    } catch (error) {
      console.error('Error toggling workout:', error);
      toast({
        title: "Error",
        description: "Failed to update workout status",
        variant: "destructive",
      });
    }
  };

  return {
    workoutDays,
    loading,
    toggleWorkoutDay,
  };
};