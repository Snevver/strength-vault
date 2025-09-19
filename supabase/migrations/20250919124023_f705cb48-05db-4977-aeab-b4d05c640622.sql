-- Create users table for single hardcoded user (simple auth)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercise weights table for current workout weights
CREATE TABLE public.exercise_weights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  current_weight DECIMAL(5,2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_name)
);

-- Create monthly progress table for tracking monthly max weights
CREATE TABLE public.monthly_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  exercise_name TEXT NOT NULL,
  max_weight DECIMAL(5,2) NOT NULL,
  auto_saved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, year, month, exercise_name)
);

-- Create daily workouts table for workout calendar
CREATE TABLE public.daily_workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  worked_out BOOLEAN NOT NULL DEFAULT false,
  workout_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for users table (only for login/auth)
CREATE POLICY "Users can view their own data" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Create policies for exercise_weights
CREATE POLICY "Users can view their own exercise weights" 
ON public.exercise_weights 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exercise weights" 
ON public.exercise_weights 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise weights" 
ON public.exercise_weights 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise weights" 
ON public.exercise_weights 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for monthly_progress
CREATE POLICY "Users can view their own monthly progress" 
ON public.monthly_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own monthly progress" 
ON public.monthly_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly progress" 
ON public.monthly_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for daily_workouts
CREATE POLICY "Users can view their own workout history" 
ON public.daily_workouts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout logs" 
ON public.daily_workouts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout logs" 
ON public.daily_workouts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update last_updated timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.last_updated = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for exercise_weights
CREATE TRIGGER update_exercise_weights_updated_at
BEFORE UPDATE ON public.exercise_weights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default user (username: admin, password: password123)
-- Note: In production, this would be properly hashed
INSERT INTO public.users (username, password_hash) 
VALUES ('admin', '$2b$10$rFiQbF5F5FpN1wG5Bv5wLu5r2KfJvK6L8MnXcVbN9PqR3StUvWxYm');