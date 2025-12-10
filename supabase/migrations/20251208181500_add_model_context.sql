-- Add model_context column to ai_training_models table
-- This column will store the "learned" context (rules, few-shot examples) generated during training
ALTER TABLE public.ai_training_models
ADD COLUMN IF NOT EXISTS model_context TEXT;
