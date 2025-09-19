import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

// Temporary mock data until Supabase client is properly configured
const mockWeights: Record<string, number> = {};

export interface ExerciseWeight {
  id: string;
  exercise_name: string;
  current_weight: number;
  last_updated: string;
}

export const useExerciseWeights = (exerciseNames: string[]) => {
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize all exercises with 0 (starting from scratch as requested)
    const initialWeights: Record<string, number> = {};
    exerciseNames.forEach(name => {
      initialWeights[name] = mockWeights[name] || 0;
    });
    setWeights(initialWeights);
  }, [exerciseNames]);

  const updateWeight = async (exerciseName: string, newWeight: number) => {
    if (!user) return;

    try {
      setWeights(prev => ({
        ...prev,
        [exerciseName]: newWeight
      }));

      // Store in mock data for persistence during session
      mockWeights[exerciseName] = newWeight;

      toast({
        title: "Weight updated",
        description: `${exerciseName} weight saved: ${newWeight}kg`,
      });

    } catch (error) {
      console.error('Error updating exercise weight:', error);
      toast({
        title: "Error",
        description: "Failed to update exercise weight",
        variant: "destructive",
      });
    }
  };

  return {
    weights,
    loading,
    updateWeight,
  };
};