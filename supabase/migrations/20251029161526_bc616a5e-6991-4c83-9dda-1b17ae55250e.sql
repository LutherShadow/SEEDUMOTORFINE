-- Add observation columns for each activity
ALTER TABLE evaluations
ADD COLUMN test_1_observations TEXT,
ADD COLUMN test_2_observations TEXT,
ADD COLUMN test_3_observations TEXT,
ADD COLUMN test_4_observations TEXT,
ADD COLUMN test_5_observations TEXT,
ADD COLUMN test_6_observations TEXT,
ADD COLUMN test_7_observations TEXT,
ADD COLUMN test_8_observations TEXT;