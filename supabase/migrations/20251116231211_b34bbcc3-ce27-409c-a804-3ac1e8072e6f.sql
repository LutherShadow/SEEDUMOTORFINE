-- Create enum for questionnaire types
CREATE TYPE public.questionnaire_type AS ENUM ('cornell', 'chaea', 'tam', 'custom');

-- Create questionnaires table (master table for questionnaire definitions)
CREATE TABLE public.questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type questionnaire_type NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create questionnaire dimensions/categories table
CREATE TABLE public.questionnaire_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID REFERENCES public.questionnaires(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL, -- e.g., 'active', 'reflective', 'theoretical', 'pragmatic' for CHAEA
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questionnaire_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID REFERENCES public.questionnaires(id) ON DELETE CASCADE NOT NULL,
  dimension_id UUID REFERENCES public.questionnaire_dimensions(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  question_number INTEGER NOT NULL,
  score_weight NUMERIC DEFAULT 1.0,
  is_reverse_scored BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create questionnaire responses table
CREATE TABLE public.questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID REFERENCES public.questionnaires(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  evaluator_id UUID REFERENCES auth.users(id) NOT NULL,
  response_date DATE DEFAULT CURRENT_DATE,
  responses JSONB NOT NULL, -- stores {question_id: answer_value}
  dimension_scores JSONB, -- stores calculated scores per dimension
  dominant_dimension TEXT,
  secondary_dimension TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questionnaires
CREATE POLICY "Anyone can view active questionnaires"
  ON public.questionnaires FOR SELECT
  USING (is_active = true OR auth.uid() = created_by OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert questionnaires"
  ON public.questionnaires FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update questionnaires"
  ON public.questionnaires FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete questionnaires"
  ON public.questionnaires FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for dimensions
CREATE POLICY "Anyone can view dimensions"
  ON public.questionnaire_dimensions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage dimensions"
  ON public.questionnaire_dimensions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for questions
CREATE POLICY "Anyone can view questions"
  ON public.questionnaire_questions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage questions"
  ON public.questionnaire_questions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for responses
CREATE POLICY "Evaluators can view their responses"
  ON public.questionnaire_responses FOR SELECT
  USING (auth.uid() = evaluator_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Evaluators can insert responses"
  ON public.questionnaire_responses FOR INSERT
  WITH CHECK (auth.uid() = evaluator_id);

CREATE POLICY "Evaluators can update their responses"
  ON public.questionnaire_responses FOR UPDATE
  USING (auth.uid() = evaluator_id);

CREATE POLICY "Evaluators can delete their responses"
  ON public.questionnaire_responses FOR DELETE
  USING (auth.uid() = evaluator_id);

-- Create indexes for better performance
CREATE INDEX idx_questionnaire_dimensions_questionnaire ON public.questionnaire_dimensions(questionnaire_id);
CREATE INDEX idx_questionnaire_questions_questionnaire ON public.questionnaire_questions(questionnaire_id);
CREATE INDEX idx_questionnaire_questions_dimension ON public.questionnaire_questions(dimension_id);
CREATE INDEX idx_questionnaire_responses_child ON public.questionnaire_responses(child_id);
CREATE INDEX idx_questionnaire_responses_evaluator ON public.questionnaire_responses(evaluator_id);
CREATE INDEX idx_questionnaire_responses_questionnaire ON public.questionnaire_responses(questionnaire_id);

-- Trigger for updated_at
CREATE TRIGGER update_questionnaires_updated_at
  BEFORE UPDATE ON public.questionnaires
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_questionnaire_responses_updated_at
  BEFORE UPDATE ON public.questionnaire_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();