-- Migration: Canonicalize exercise names
-- This migration destructively normalizes exercise names across
-- exercise_weights and monthly_progress so historical variants are
-- replaced with canonical display names.
--
-- IMPORTANT: This is destructive for exercise name values. Back up
-- your database before running this migration in production.

BEGIN;

-- Build canonicalized exercise_weights aggregated by user and exercise
CREATE TEMP TABLE tmp_ex_weights AS
SELECT
  user_id,
  canonical AS exercise_name,
  MAX(current_weight) AS current_weight,
  MAX(last_updated) AS last_updated
FROM (
  SELECT
    user_id,
    current_weight,
    last_updated,
    CASE LOWER(TRIM(exercise_name))
      WHEN 'squats/legpress' THEN 'Legpress'
      WHEN 'squats/leg press' THEN 'Legpress'
      WHEN 'lat raises cable' THEN 'Lateral Raises Cable'
  WHEN 'lat raises' THEN 'Lateral Raises Cable'
      WHEN 'flys' THEN 'Pec Flyes'
      WHEN 'pec flys' THEN 'Pec Flyes'
  WHEN 'rdls' THEN 'Back Extension'
  WHEN 'rdl' THEN 'Back Extension'
  WHEN 'romanian deadlift' THEN 'Back Extension'
  WHEN 'romanian deadlifts' THEN 'Back Extension'
  WHEN 'russian twists' THEN 'Torso Rotation'
  WHEN 'russian twist' THEN 'Torso Rotation'
      WHEN 'pulldown beneden' THEN 'Lat Pulldown'
      WHEN 'pulldown lat' THEN 'Lat Pulldown'
      WHEN 'pulldown' THEN 'Lat Pulldown'
      WHEN 'row cable' THEN 'Cable Row'
      WHEN 'cable row' THEN 'Cable Row'
      ELSE exercise_name
    END AS canonical
  FROM exercise_weights
) s
GROUP BY user_id, canonical;

-- Build canonicalized monthly_progress aggregated to max per month
CREATE TEMP TABLE tmp_monthly_progress AS
SELECT
  user_id,
  year,
  month,
  canonical AS exercise_name,
  MAX(max_weight) AS max_weight,
  BOOL_OR(auto_saved) AS auto_saved
FROM (
  SELECT
    user_id,
    year,
    month,
    max_weight,
    auto_saved,
    CASE LOWER(TRIM(exercise_name))
      WHEN 'squats/legpress' THEN 'Legpress'
      WHEN 'squats/leg press' THEN 'Legpress'
      WHEN 'lat raises cable' THEN 'Lateral Raises Cable'
  WHEN 'lat raises' THEN 'Lateral Raises Cable'
      WHEN 'flys' THEN 'Pec Flyes'
      WHEN 'pec flys' THEN 'Pec Flyes'
  WHEN 'rdls' THEN 'Back Extension'
  WHEN 'rdl' THEN 'Back Extension'
  WHEN 'romanian deadlift' THEN 'Back Extension'
  WHEN 'romanian deadlifts' THEN 'Back Extension'
  WHEN 'russian twists' THEN 'Torso Rotation'
  WHEN 'russian twist' THEN 'Torso Rotation'
      WHEN 'pulldown beneden' THEN 'Lat Pulldown'
      WHEN 'pulldown lat' THEN 'Lat Pulldown'
      WHEN 'pulldown' THEN 'Lat Pulldown'
      WHEN 'row cable' THEN 'Cable Row'
      WHEN 'cable row' THEN 'Cable Row'
      ELSE exercise_name
    END AS canonical
  FROM monthly_progress
) s
GROUP BY user_id, year, month, canonical;

-- Replace exercise_weights with canonicalized aggregated rows
DELETE FROM exercise_weights;

INSERT INTO exercise_weights (user_id, exercise_name, current_weight, last_updated)
SELECT user_id, exercise_name, current_weight, last_updated FROM tmp_ex_weights;

-- Replace monthly_progress with canonicalized aggregated rows
DELETE FROM monthly_progress;

INSERT INTO monthly_progress (user_id, year, month, exercise_name, max_weight, auto_saved)
SELECT user_id, year, month, exercise_name, max_weight, auto_saved FROM tmp_monthly_progress;

-- Clean up
DROP TABLE tmp_ex_weights;
DROP TABLE tmp_monthly_progress;

COMMIT;
