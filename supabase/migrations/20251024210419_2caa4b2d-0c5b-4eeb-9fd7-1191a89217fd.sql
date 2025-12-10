-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'evaluator',
  institution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create children table
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT CHECK (gender IN ('M', 'F')),
  school TEXT,
  grade TEXT,
  evaluator_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create evaluations table
CREATE TABLE public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES public.profiles(id),
  evaluation_date DATE DEFAULT CURRENT_DATE,
  test_1_score INTEGER,
  test_2_score INTEGER,
  test_3_score INTEGER,
  test_4_score INTEGER,
  test_5_score INTEGER,
  test_6_score INTEGER,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create AI results table
CREATE TABLE public.ai_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID REFERENCES public.evaluations(id) ON DELETE CASCADE,
  classification TEXT CHECK (classification IN ('bajo', 'medio', 'alto')),
  confidence_score DECIMAL(5,2),
  recommendations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_results ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Children policies
CREATE POLICY "Evaluators can view children they created"
  ON public.children FOR SELECT
  USING (auth.uid() = evaluator_id);

CREATE POLICY "Evaluators can insert children"
  ON public.children FOR INSERT
  WITH CHECK (auth.uid() = evaluator_id);

CREATE POLICY "Evaluators can update their children"
  ON public.children FOR UPDATE
  USING (auth.uid() = evaluator_id);

CREATE POLICY "Evaluators can delete their children"
  ON public.children FOR DELETE
  USING (auth.uid() = evaluator_id);

-- Evaluations policies
CREATE POLICY "Evaluators can view their evaluations"
  ON public.evaluations FOR SELECT
  USING (auth.uid() = evaluator_id);

CREATE POLICY "Evaluators can insert evaluations"
  ON public.evaluations FOR INSERT
  WITH CHECK (auth.uid() = evaluator_id);

CREATE POLICY "Evaluators can update their evaluations"
  ON public.evaluations FOR UPDATE
  USING (auth.uid() = evaluator_id);

CREATE POLICY "Evaluators can delete their evaluations"
  ON public.evaluations FOR DELETE
  USING (auth.uid() = evaluator_id);

-- AI results policies
CREATE POLICY "Users can view AI results for their evaluations"
  ON public.ai_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.evaluations
      WHERE evaluations.id = ai_results.evaluation_id
      AND evaluations.evaluator_id = auth.uid()
    )
  );

CREATE POLICY "System can insert AI results"
  ON public.ai_results FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_children
  BEFORE UPDATE ON public.children
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_evaluations
  BEFORE UPDATE ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();