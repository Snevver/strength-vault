import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface MonthlyProgressData {
  exercise_name: string;
  months: { [key: string]: number }; // key format: "YYYY-MM"
}

export const useMonthlyProgress = () => {
  const [progressData, setProgressData] = useState<MonthlyProgressData[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const allExercises = [
    // Upper A
    'Incline Smith',
    'Flys',
    'Shoulder Press',
    'Pulldown Lat',
    'Row Cable',
    'Bicep Curl',
    'Tricep Overhead',
    // Upper B
    'Pulldown Beneden',
    'Wide Row',
    'Chest Press',
    'Lat Raises Cable',
    'Preacher Curl',
    'Tricep Pushdown',
    // Lower A
    'Squats/Legpress',
    'Leg Extensions',
    'Leg Curls',
    'Bulgarians',
    'Calf Raises',
    // Lower B
    'RDLs',
    'Weighted Crunch',
    'Russian Twists'
  ];

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProgressData = async () => {
      try {
        // Get all monthly progress data for the user
        const { data: monthlyData } = await supabase
          .from('monthly_progress')
          .select('*')
          .eq('user_id', user.id)
          .order('year', { ascending: true })
          .order('month', { ascending: true });

        // Create list of available months
        const months = new Set<string>();
        monthlyData?.forEach(record => {
          const monthKey = `${record.year}-${String(record.month).padStart(2, '0')}`;
          months.add(monthKey);
        });

        const sortedMonths = Array.from(months).sort();
        setAvailableMonths(sortedMonths);

        // Group data by exercise
        const exerciseData: MonthlyProgressData[] = allExercises.map(exercise => {
          const monthsData: { [key: string]: number } = {};
          
          monthlyData?.forEach(record => {
            if (record.exercise_name === exercise) {
              const monthKey = `${record.year}-${String(record.month).padStart(2, '0')}`;
              monthsData[monthKey] = record.max_weight;
            }
          });

          return {
            exercise_name: exercise,
            months: monthsData
          };
        });

        setProgressData(exerciseData);
      } catch (error) {
        console.error('Error fetching monthly progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [user]);

  const getMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return {
    progressData,
    availableMonths,
    loading,
    getMonthLabel
  };
};