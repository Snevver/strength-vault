import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [weight, setWeight] = useState<number>(currentWeight);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Keep internal state in sync when parent updates currentWeight
  // This prevents stale state when the prop changes after a save from elsewhere
  useEffect(() => {
    setWeight(currentWeight);
  }, [currentWeight]);

  const handleWeightChange = (newWeight: number) => {
    // Clamp to zero, but allow fractional values
    const clamped = isNaN(newWeight) ? 0 : Math.max(0, newWeight);
    setWeight(clamped);
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
    // Use the latest weight value and clamp to zero
    const base = typeof weight === 'number' && !isNaN(weight) ? weight : 0;
    const newWeight = Math.max(0, base + amount);
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
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">          
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
                {isEditing ? weight : currentWeight}{unit}
            </div>
          )}
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
            className="btn-touch text-destructive hover:text-black hover:bg-destructive"
          >
            -5kg
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => quickAdjust(-2.5)}
            className="btn-touch text-destructive hover:text-black hover:bg-destructive"
          >
            -2.5kg
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => quickAdjust(2.5)}
            className="btn-touch text-primary hover:text-black"
          >
            +2.5kg
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => quickAdjust(5)}
            className="btn-touch text-primary hover:text-black"
          >
            +5kg
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};