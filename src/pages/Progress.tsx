import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Calendar, Loader2 } from "lucide-react";
import { useMonthlyProgress } from "@/hooks/useMonthlyProgress";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const Progress = () => {
  const { progressData, availableMonths, loading, getMonthLabel, refreshProgress, selectedYear, setSelectedYear } = useMonthlyProgress();

  const { toast } = useToast();

  const [snapshotRunning, setSnapshotRunning] = useState(false);

  const triggerSnapshotNow = async () => {
    try {
      setSnapshotRunning(true);
      // Call the new edge function that supports overwriting existing month data
      const res = await supabase.functions.invoke('monthly-progress-save', {
        method: 'POST',
        body: JSON.stringify({ overwrite: true })
      }) as unknown;

      // supabase.functions.invoke may return a Response-like object; attempt to coerce
      if (res && typeof res === 'object' && 'status' in res) {
        const r = res as Response;
        if (r.status >= 400) {
          const body = await r.text();
          throw new Error(body || 'Snapshot function failed');
        }
      }

      toast({ title: 'Snapshot started', description: 'Monthly snapshot ran successfully', });
      // refresh for the currently selected year
      await refreshProgress(selectedYear);
    } catch (err) {
      const e = err as Error | undefined;
      console.error('Error triggering snapshot:', e);
      toast({ title: 'Snapshot failed', description: e?.message ?? String(e), variant: 'destructive' });
    }
    finally {
      setSnapshotRunning(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Monthly Progress</h1>
            <p className="text-muted-foreground">Loading your progress data...</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Progress</h1>
          <p className="text-muted-foreground">
            Track your strength gains month by month. Weights are automatically saved on the 1st of each month.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <CardTitle>Exercise Progress Table</CardTitle>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button size="sm" onClick={() => { setSelectedYear(selectedYear - 1); void refreshProgress(selectedYear - 1); }}>
                  ←
                </Button>
                <div className="text-sm font-medium">{selectedYear}</div>
                <Button size="sm" onClick={() => { setSelectedYear(selectedYear + 1); void refreshProgress(selectedYear + 1); }}>
                  →
                </Button>
                <Button size="sm" onClick={triggerSnapshotNow} className="btn-touch" disabled={snapshotRunning}>
                  {snapshotRunning ? (
                    <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Running</span>
                  ) : (
                    'Run snapshot now'
                  )}
                </Button>
              </div>
            </div>
            <CardDescription>
              Maximum weights recorded at the start of each month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableMonths.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No monthly progress data available yet.</p>
                <p className="text-sm mt-2">Progress will be automatically recorded on the 1st of each month.</p>
              </div>
            ) : (
                <div>
                  <Table className="table-fixed text-sm">
                  <TableHeader>
                    <TableRow>
                        <TableHead className="w-40">Exercise</TableHead>
                        {availableMonths.map(month => {
                          const [yr, mo] = month.split('-');
                          const monthName = new Date(Number(yr), Number(mo) - 1).toLocaleString('en-US', { month: 'short' });
                          return (
                            <TableHead key={month} className="text-center w-20">
                              <div className="flex flex-col items-center">
                                <div className="text-sm font-medium">{monthName}</div>
                                <div className="text-xs text-muted-foreground">{yr}</div>
                              </div>
                            </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {progressData.map((exercise) => (
                        <TableRow key={exercise.exercise_name}>
                          <TableCell className="font-medium text-sm py-2 px-2">
                            {exercise.exercise_name}
                          </TableCell>
                          {availableMonths.map((month, idx) => {
                            const weight = exercise.months[month];
                          const prevWeight = idx > 0 ? exercise.months[availableMonths[idx - 1]] : undefined;

                          let progressBadge = null;
                          if (typeof weight === 'number' && typeof prevWeight === 'number') {
                            const diff = weight - prevWeight;
                            if (diff > 0) {
                              progressBadge = (
                                <Badge variant="secondary" className="ml-1 text-xs bg-green-100 text-green-800">
                                  +{diff}kg
                                </Badge>
                              );
                            } else if (diff < 0) {
                              progressBadge = (
                                <Badge variant="secondary" className="ml-1 text-xs bg-red-100 text-red-800">
                                  {diff}kg
                                </Badge>
                              );
                            }
                          }

                          return (
                            <TableCell key={month} className="text-center text-sm py-1 px-1">
                              {typeof weight === 'number' ? (
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-sm">{weight}kg</span>
                                  {progressBadge}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                          );
                        })}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Progress;