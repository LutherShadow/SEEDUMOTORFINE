-- Tabla para almacenar el índice de competencia de cada aprendiente
CREATE TABLE IF NOT EXISTS public.competency_indices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  evaluation_id UUID REFERENCES public.evaluations(id) ON DELETE SET NULL,
  overall_index NUMERIC NOT NULL CHECK (overall_index >= 0 AND overall_index <= 100),
  visual_motor_index NUMERIC CHECK (visual_motor_index >= 0 AND visual_motor_index <= 100),
  precision_index NUMERIC CHECK (precision_index >= 0 AND precision_index <= 100),
  coordination_index NUMERIC CHECK (coordination_index >= 0 AND coordination_index <= 100),
  strength_index NUMERIC CHECK (strength_index >= 0 AND strength_index <= 100),
  learning_velocity NUMERIC,
  trend TEXT CHECK (trend IN ('ascending', 'stable', 'descending')),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(child_id, evaluation_id)
);

-- Tabla para almacenar actividades personalizadas por aprendiente
CREATE TABLE IF NOT EXISTS public.personalized_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('basic', 'intermediate', 'advanced', 'expert')),
  target_skills JSONB,
  materials_needed TEXT[],
  duration_minutes INTEGER,
  repetitions_recommended INTEGER,
  success_criteria TEXT,
  progression_notes TEXT,
  replaces_activity_id INTEGER CHECK (replaces_activity_id >= 1 AND replaces_activity_id <= 8),
  ai_confidence NUMERIC CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  applied_at TIMESTAMP WITH TIME ZONE,
  applied_by UUID REFERENCES auth.users(id),
  results_notes TEXT
);

-- Tabla para registrar las sugerencias aplicadas
CREATE TABLE IF NOT EXISTS public.applied_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL,
  suggestion_content JSONB NOT NULL,
  competency_index_id UUID REFERENCES public.competency_indices(id) ON DELETE SET NULL,
  applied_by UUID NOT NULL REFERENCES auth.users(id),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'in_progress', 'completed', 'discontinued')),
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX idx_competency_indices_child ON public.competency_indices(child_id);
CREATE INDEX idx_competency_indices_calculated_at ON public.competency_indices(calculated_at DESC);
CREATE INDEX idx_personalized_activities_child ON public.personalized_activities(child_id);
CREATE INDEX idx_personalized_activities_active ON public.personalized_activities(is_active) WHERE is_active = true;
CREATE INDEX idx_applied_suggestions_child ON public.applied_suggestions(child_id);
CREATE INDEX idx_applied_suggestions_status ON public.applied_suggestions(status);

-- RLS Policies para competency_indices
ALTER TABLE public.competency_indices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Evaluators can view competency indices for their children"
  ON public.competency_indices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = competency_indices.child_id
      AND children.evaluator_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "System can insert competency indices"
  ON public.competency_indices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Evaluators can update their children's competency indices"
  ON public.competency_indices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = competency_indices.child_id
      AND children.evaluator_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- RLS Policies para personalized_activities
ALTER TABLE public.personalized_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Evaluators can view personalized activities for their children"
  ON public.personalized_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = personalized_activities.child_id
      AND children.evaluator_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "System can insert personalized activities"
  ON public.personalized_activities FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Evaluators can update personalized activities for their children"
  ON public.personalized_activities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = personalized_activities.child_id
      AND children.evaluator_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Evaluators can delete personalized activities for their children"
  ON public.personalized_activities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = personalized_activities.child_id
      AND children.evaluator_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- RLS Policies para applied_suggestions
ALTER TABLE public.applied_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Evaluators can view applied suggestions for their children"
  ON public.applied_suggestions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = applied_suggestions.child_id
      AND children.evaluator_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Evaluators can insert applied suggestions for their children"
  ON public.applied_suggestions FOR INSERT
  WITH CHECK (
    auth.uid() = applied_by AND
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = applied_suggestions.child_id
      AND children.evaluator_id = auth.uid()
    )
  );

CREATE POLICY "Evaluators can update applied suggestions for their children"
  ON public.applied_suggestions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = applied_suggestions.child_id
      AND children.evaluator_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Comentarios para documentación
COMMENT ON TABLE public.competency_indices IS 'Almacena el índice de competencia calculado para cada aprendiente basado en sus evaluaciones y cuestionarios';
COMMENT ON TABLE public.personalized_activities IS 'Almacena actividades personalizadas generadas por IA específicas para cada aprendiente';
COMMENT ON TABLE public.applied_suggestions IS 'Registra las sugerencias de IA que han sido aplicadas por los docentes';