import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface MonthlyProgressData {
  exercise_name: string;
  months: { [key: string]: number | undefined }; // key format: "YYYY-MM"
}

export const useMonthlyProgress = () => {
  const [progressData, setProgressData] = useState<MonthlyProgressData[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const allExercises = [
    // Upper A
    'Incline Smith',
    'Pec Flyes',
    'Shoulder Press',
    'Lat Pulldown',
    'Cable Row',
    'Bicep Curl',
    'Tricep Overhead',
    // Upper B
    'Lat Pulldown',
    'Wide Row',
    'Chest Press',
    'Lateral Raises Cable',
    'Preacher Curl',
    'Tricep Pushdown',
    // Lower A
    'Legpress',
    'Leg Extensions',
    'Leg Curls',
    'Bulgarians',
    'Calf Raises',
    // Lower B
    'Back Extension',
    'Weighted Crunch',
    'Torso Rotation'
  ];

  // Map known synonyms or variants to a canonical display name
  const canonicalMapLookup: Record<string, string> = {
    // Pulldowns - normalize variants to a single canonical name
    'pulldown lat': 'Lat Pulldown',
    'pulldown beneden': 'Lat Pulldown',
    'lat pulldown': 'Lat Pulldown',
    // Fly variations
    'flys': 'Pec Flys',
    'pec flys': 'Pec Flys',
    // Cable row / row cable
    'row cable': 'Cable Row',
    'cable row': 'Cable Row',
    // other small normalizations
    'pulldown': 'Lat Pulldown',
    // RDL / Romanian Deadlift variants -> Back Extension
    'rdls': 'Back Extension',
    'rdl': 'Back Extension',
    'romanian deadlift': 'Back Extension',
    'romanian deadlifts': 'Back Extension',
    // Russian twist variants -> Torso Rotation
    'russian twists': 'Torso Rotation',
    'russian twist': 'Torso Rotation'
  };

  const toCanonical = (name: string) => {
    const key = name.trim().toLowerCase();
    return canonicalMapLookup[key] ?? name;
  };

  type MonthlyRecord = { user_id: string; year: number; month: number; exercise_name: string; max_weight: string | number };

  // Refreshes data for a specific year (Jan-Dec columns)
  const refreshProgress = async (yearOverride?: number) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: monthlyData, error } = await supabase
        .from('monthly_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: true })
        .order('month', { ascending: true });

      if (error) throw error;

      const yearToUse = yearOverride ?? selectedYear;
      const monthKeys: string[] = [];
      for (let m = 1; m <= 12; m++) monthKeys.push(`${yearToUse}-${String(m).padStart(2, '0')}`);
      setAvailableMonths(monthKeys);

      // Aggregate monthly records by canonical exercise name and take the max per month
      const aggregated: Record<string, Record<string, number>> = {};
      (monthlyData as MonthlyRecord[] | undefined)?.forEach((record) => {
        if (!record) return;
        // Only consider records for the requested year
        if (record.year !== yearToUse) return;
        const canonical = toCanonical(record.exercise_name);
        const monthKey = `${record.year}-${String(record.month).padStart(2, '0')}`;
        const valNum = record.max_weight != null ? Number(record.max_weight) : NaN;
        if (Number.isNaN(valNum)) return;
        aggregated[canonical] = aggregated[canonical] ?? {};
        const prev = aggregated[canonical][monthKey];
        aggregated[canonical][monthKey] = prev == null ? valNum : Math.max(prev, valNum);
      });

      // Preserve order from allExercises but map to canonical and dedupe while preserving first-seen order
      const canonicalOrder: string[] = [];
      allExercises.forEach(e => {
        const c = toCanonical(e);
        if (!canonicalOrder.includes(c)) canonicalOrder.push(c);
      });

      // Also include any remaining canonical names that exist in aggregated but weren't in the base list
      Object.keys(aggregated).forEach(c => { if (!canonicalOrder.includes(c)) canonicalOrder.push(c); });

      const exerciseData: MonthlyProgressData[] = canonicalOrder.map(exercise => {
        const monthsData: { [key: string]: number | undefined } = {};
        monthKeys.forEach(k => {
          const v = aggregated[exercise]?.[k];
          monthsData[k] = v == null ? undefined : v;
        });
        return { exercise_name: exercise, months: monthsData };
      });
      // Sort exercises alphabetically by display name
      exerciseData.sort((a, b) => a.exercise_name.localeCompare(b.exercise_name));
      setProgressData(exerciseData);
    } catch (error) {
      console.error('Error refreshing monthly progress:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    void refreshProgress(selectedYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedYear]);

  const getMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return {
    progressData,
    availableMonths,
    loading,
    getMonthLabel,
    refreshProgress,
    selectedYear,
    setSelectedYear
  };
};