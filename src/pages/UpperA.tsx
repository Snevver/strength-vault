import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ExerciseCard } from "@/components/training/ExerciseCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

const exercises = [
  { name: "Incline Smith", weight: 70 },
  { name: "Flys", weight: 15 },
  { name: "Shoulder Press", weight: 40 },
  { name: "Pulldown Lat", weight: 55 },
  { name: "Row Cable", weight: 45 },
  { name: "Bicep Curl", weight: 25 },
  { name: "Tricep Overhead", weight: 30 },
];

const UpperA = () => {
  const [exerciseWeights, setExerciseWeights] = useState(
    exercises.reduce((acc, exercise) => ({
      ...acc,
      [exercise.name]: exercise.weight
    }), {} as Record<string, number>)
  );

  const handleWeightUpdate = (exerciseName: string, newWeight: number) => {
    setExerciseWeights(prev => ({
      ...prev,
      [exerciseName]: newWeight
    }));
    // In a real app, this would save to the database
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Upper A</h1>
              <p className="text-muted-foreground">Chest Focus Training Day</p>
            </div>
          </div>
          <Badge variant="secondary" className="mt-2">
            7 Exercises
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Workout Overview</CardTitle>
            <CardDescription>
              Focus on chest development with supporting muscle groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="font-semibold">Primary</div>
                <div className="text-muted-foreground">Chest</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="font-semibold">Secondary</div>
                <div className="text-muted-foreground">Shoulders</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="font-semibold">Back</div>
                <div className="text-muted-foreground">Lats & Rows</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="font-semibold">Arms</div>
                <div className="text-muted-foreground">Bi & Tri</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.name}
              name={exercise.name}
              currentWeight={exerciseWeights[exercise.name]}
              onWeightUpdate={(newWeight) => handleWeightUpdate(exercise.name, newWeight)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default UpperA;