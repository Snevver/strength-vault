import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

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

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    workoutsThisMonth: 0,
    personalRecords: 0,
    currentStreak: 0,
    totalSessions: 0,
  });
  
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Starting from 0 as requested - no mock data initially
    setStats({
      workoutsThisMonth: 0,
      personalRecords: 0,
      currentStreak: 0,
      totalSessions: 0,
    });

    setRecentWorkouts([]);
  }, [user]);

  return {
    stats,
    recentWorkouts,
    loading,
  };
};