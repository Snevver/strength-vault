import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Calendar, Loader2 } from "lucide-react";
import { useMonthlyProgress } from "@/hooks/useMonthlyProgress";

const Progress = () => {
  const { progressData, availableMonths, loading, getMonthLabel } = useMonthlyProgress();

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
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Exercise Progress Table
            </CardTitle>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Exercise</TableHead>
                      {availableMonths.map(month => (
                        <TableHead key={month} className="text-center min-w-[100px]">
                          {getMonthLabel(month)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {progressData.map((exercise) => {
                      // Only show exercises that have some data
                      const hasData = Object.values(exercise.months).some(weight => weight > 0);
                      if (!hasData) return null;

                      return (
                        <TableRow key={exercise.exercise_name}>
                          <TableCell className="font-medium">
                            {exercise.exercise_name}
                          </TableCell>
                          {availableMonths.map(month => {
                            const weight = exercise.months[month];
                            const prevMonthIndex = availableMonths.indexOf(month) - 1;
                            const prevWeight = prevMonthIndex >= 0 ? 
                              exercise.months[availableMonths[prevMonthIndex]] : undefined;
                            
                            let progressBadge = null;
                            if (weight && prevWeight) {
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
                              <TableCell key={month} className="text-center">
                                {weight ? (
                                  <div className="flex items-center justify-center">
                                    <span>{weight}kg</span>
                                    {progressBadge}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Every 1st of the month, your current exercise weights are automatically saved</p>
            <p>• This creates a monthly snapshot of your progress</p>
            <p>• Green badges show weight increases, red badges show decreases</p>
            <p>• Keep updating your weights on the training pages to track progress</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Progress;