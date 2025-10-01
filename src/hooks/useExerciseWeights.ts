import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ExerciseWeight {
  id: string;
  exercise_name: string;
  current_weight: number;
  last_updated: string;
}

// Canonicalization map to ensure singular exercise keys in DB
const canonicalMap: Record<string, string> = {
  'pulldown lat': 'Lat Pulldown',
  'lat pulldown': 'Lat Pulldown',
  'pulldown beneden': 'Lat Pulldown',
  'pulldown': 'Lat Pulldown',
  'flys': 'Pec Flyes',
  'Pec Flys': 'Pec Flyes',
  'row cable': 'Cable Row',
  'cable row': 'Cable Row'
  ,
  // RDL / Romanian Deadlift -> Back Extension
  'rdls': 'Back Extension',
  'rdl': 'Back Extension',
  'romanian deadlift': 'Back Extension',
  'romanian deadlifts': 'Back Extension',
  // Russian twist variants -> Torso Rotation
  'russian twists': 'Torso Rotation',
  'russian twist': 'Torso Rotation'
};

const toCanonical = (name: string) => canonicalMap[name.trim().toLowerCase()] ?? name;

export const useExerciseWeights = (exerciseNames: string[]) => {
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize and load persisted weights for user
  useEffect(() => {
    const init = async () => {
      // initialize to zeros first using canonical names
      const initialWeights: Record<string, number> = {};
      exerciseNames.forEach(name => {
        initialWeights[toCanonical(name)] = 0;
      });
      setWeights(initialWeights);

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // query by canonical names (build from canonicalMap to avoid hook dep issues)
          const canonicalNames = Array.from(new Set(exerciseNames.map(n => canonicalMap[n.trim().toLowerCase()] ?? n)));
          const { data, error } = await supabase
          .from('exercise_weights')
          .select('exercise_name, current_weight')
          .eq('user_id', user.id)
          .in('exercise_name', canonicalNames);

        if (error) throw error;

        if (data) {
          const loaded: Record<string, number> = { ...initialWeights };
          (data as { exercise_name: string; current_weight: number }[]).forEach(r => {
            loaded[r.exercise_name] = Number(r.current_weight) || 0;
          });
          setWeights(loaded);
        }
      } catch (err) {
        console.error('Failed to load exercise weights', err);
        toast({ title: 'Error', description: 'Failed to load exercise weights', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user, exerciseNames, toast]);

  const updateWeight = async (exerciseName: string, newWeight: number) => {
    if (!user) return;

  const canonical = toCanonical(exerciseName);
  // Optimistic update on canonical key
  setWeights(prev => ({ ...prev, [canonical]: newWeight }));

    try {
      const { error } = await supabase.from('exercise_weights').upsert([
        {
          user_id: user.id,
          exercise_name: canonical,
          current_weight: newWeight,
        }
      ], { onConflict: 'user_id,exercise_name' });

      if (error) throw error;

  toast({ title: 'Weight updated', description: `${canonical} weight saved: ${newWeight}kg` });
    } catch (err) {
      console.error('Error updating exercise weight:', err);
      toast({ title: 'Error', description: 'Failed to update exercise weight', variant: 'destructive' });
    }
  };

  return {
    weights,
    loading,
    updateWeight,
  };
};