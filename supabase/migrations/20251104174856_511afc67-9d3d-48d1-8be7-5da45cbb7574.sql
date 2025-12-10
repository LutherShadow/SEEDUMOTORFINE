-- Create table for learning style assessments (TAM - Test de Análisis de Modalidades)
CREATE TABLE public.learning_style_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  evaluator_id UUID NOT NULL,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Responses stored as JSONB for flexibility (80+ questions)
  responses JSONB NOT NULL,
  
  -- Calculated learning style scores
  visual_score NUMERIC,
  auditory_score NUMERIC,
  kinesthetic_score NUMERIC,
  logical_score NUMERIC,
  social_score NUMERIC,
  solitary_score NUMERIC,
  
  -- Dominant learning style
  dominant_style TEXT,
  secondary_style TEXT,
  
  -- Overall analysis
  analysis_notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.learning_style_assessments ENABLE ROW LEVEL SECURITY;

-- Policies for learning_style_assessments
CREATE POLICY "Evaluators can insert assessments"
ON public.learning_style_assessments
FOR INSERT
WITH CHECK (auth.uid() = evaluator_id);

CREATE POLICY "Evaluators can view their assessments"
ON public.learning_style_assessments
FOR SELECT
USING (auth.uid() = evaluator_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Evaluators can update their assessments"
ON public.learning_style_assessments
FOR UPDATE
USING (auth.uid() = evaluator_id);

CREATE POLICY "Evaluators can delete their assessments"
ON public.learning_style_assessments
FOR DELETE
USING (auth.uid() = evaluator_id);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_learning_style_assessments_updated_at
BEFORE UPDATE ON public.learning_style_assessments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add index for faster queries
CREATE INDEX idx_learning_style_child ON public.learning_style_assessments(child_id);
CREATE INDEX idx_learning_style_evaluator ON public.learning_style_assessments(evaluator_id);