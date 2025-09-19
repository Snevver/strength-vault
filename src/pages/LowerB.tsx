import { Layout } from "@/components/layout/Layout";
import { ExerciseCard } from "@/components/training/ExerciseCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import { useExerciseWeights } from "@/hooks/useExerciseWeights";

const exercises = [
  "RDLs",
  "Leg Curls",
  "Leg Extensions",
  "Weighted Crunch",
  "Russian Twists"
];

const LowerB = () => {
  const { weights, loading, updateWeight } = useExerciseWeights(exercises);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-success">
              <Target className="h-6 w-6 text-success-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Lower B</h1>
              <p className="text-muted-foreground">Hamstring Focus Training Day</p>
            </div>
          </div>
          <Badge variant="secondary" className="mt-2">
            5 Exercises
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Workout Overview</CardTitle>
            <CardDescription>
              Focus on hamstring and posterior chain development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="font-semibold">Primary</div>
                <div className="text-muted-foreground">Hamstrings</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="font-semibold">Secondary</div>
                <div className="text-muted-foreground">Glutes</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="font-semibold">Core</div>
                <div className="text-muted-foreground">Abs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exercises.map((exerciseName) => (
            <ExerciseCard
              key={exerciseName}
              name={exerciseName}
              currentWeight={weights[exerciseName] || 0}
              onWeightUpdate={(newWeight) => updateWeight(exerciseName, newWeight)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default LowerB;