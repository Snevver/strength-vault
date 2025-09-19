import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExerciseCardProps {
  name: string;
  currentWeight: number;
  onWeightUpdate: (newWeight: number) => void;
  unit?: string;
}

export const ExerciseCard = ({ 
  name, 
  currentWeight, 
  onWeightUpdate, 
  unit = "kg" 
}: ExerciseCardProps) => {
  const [weight, setWeight] = useState(currentWeight);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleWeightChange = (newWeight: number) => {
    if (newWeight < 0) return;
    setWeight(newWeight);
  };

  const handleSave = () => {
    onWeightUpdate(weight);
    setIsEditing(false);
    toast({
      title: "Weight updated",
      description: `${name} weight saved: ${weight}${unit}`,
    });
  };

  const quickAdjust = (amount: number) => {
    const newWeight = Math.max(0, weight + amount);
    setWeight(newWeight);
    onWeightUpdate(newWeight);
    toast({
      title: "Quick adjustment",
      description: `${name}: ${newWeight}${unit} (${amount > 0 ? '+' : ''}${amount}${unit})`,
    });
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{name}</CardTitle>
        <Badge variant="outline" className="w-fit">
          Current: {currentWeight}{unit}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleWeightChange(weight - 0.5)}
            className="btn-touch"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          {isEditing ? (
            <Input
              type="number"
              value={weight}
              onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 0)}
              className="text-center font-bold text-xl btn-touch"
              step="0.5"
              min="0"
            />
          ) : (
            <div 
              className="flex-1 text-center font-bold text-2xl py-2 px-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {weight}{unit}
            </div>
          )}
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleWeightChange(weight + 0.5)}
            className="btn-touch"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {isEditing && (
          <Button onClick={handleSave} className="w-full btn-touch">
            <Save className="mr-2 h-4 w-4" />
            Save Weight
          </Button>
        )}

        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => quickAdjust(-5)}
            className="btn-touch text-destructive hover:text-destructive"
          >
            -5kg
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => quickAdjust(-2.5)}
            className="btn-touch text-destructive hover:text-destructive"
          >
            -2.5kg
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => quickAdjust(2.5)}
            className="btn-touch text-success hover:text-success"
          >
            +2.5kg
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => quickAdjust(5)}
            className="btn-touch text-success hover:text-success"
          >
            +5kg
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};