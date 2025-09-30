-- Non-destructive Migration: Canonicalize exercise names (safe)
-- This script:
-- 1) Adds `canonical_exercise_name` columns to both tables and populates them using CASE mapping.
-- 2) Creates canonicalized views that the app can use immediately (no destructive DELETE/INSERT).
-- 3) Provides an optional dedupe/merge section (commented) that you can run manually after review.
--
-- IMPORTANT: This is non-destructive by default. If you choose to run the dedupe section, that part will merge duplicates into new rows and remove old ones — run only after backup and after confirming behavior.

BEGIN;

-- 1) Add canonical_exercise_name columns if they don't exist
ALTER TABLE IF EXISTS exercise_weights
  ADD COLUMN IF NOT EXISTS canonical_exercise_name text;

ALTER TABLE IF EXISTS monthly_progress
  ADD COLUMN IF NOT EXISTS canonical_exercise_name text;

-- 2) Populate canonical_exercise_name using a CASE mapping
UPDATE exercise_weights SET canonical_exercise_name = (
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
  END
) WHERE canonical_exercise_name IS NULL;

UPDATE monthly_progress SET canonical_exercise_name = (
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
  END
) WHERE canonical_exercise_name IS NULL;

-- 3) Create canonicalized views for immediate use
CREATE OR REPLACE VIEW v_exercise_weights_canonical AS
SELECT
  id,
  user_id,
  COALESCE(canonical_exercise_name, exercise_name) AS exercise_name,
  current_weight,
  last_updated
FROM exercise_weights;

CREATE OR REPLACE VIEW v_monthly_progress_canonical AS
SELECT
  id,
  user_id,
  year,
  month,
  COALESCE(canonical_exercise_name, exercise_name) AS exercise_name,
  max_weight,
  auto_saved
FROM monthly_progress;

-- 4) Optional dedupe/merge helpers (COMMENTED). Run manually after reviewing the views.
-- The following block demonstrates a safe approach to merge duplicates per-user into a single canonical row
-- for monthly_progress. It creates a new table with aggregated rows, verifies counts, and then (optionally)
-- swaps. This block is commented out to keep the migration non-destructive by default.

--
-- -- Example dedupe for monthly_progress (uncomment to run manually)
-- CREATE TABLE tmp_monthly_progress_merge AS
-- SELECT
--   MIN(id) AS id_keep,
--   user_id,
--   year,
--   month,
--   COALESCE(canonical_exercise_name, exercise_name) AS canonical_exercise_name,
--   MAX(max_weight) AS max_weight,
--   BOOL_OR(auto_saved) AS auto_saved
-- FROM monthly_progress
-- GROUP BY user_id, year, month, COALESCE(canonical_exercise_name, exercise_name);
--
-- -- Check how many rows will be kept vs removed
-- SELECT COUNT(*) AS before_rows FROM monthly_progress;
-- SELECT COUNT(*) AS after_rows FROM tmp_monthly_progress_merge;
--
-- -- After manual review, you can replace monthly_progress with the merged table:
-- -- BEGIN; -- run in a transaction manually
-- -- DELETE FROM monthly_progress;
-- -- INSERT INTO monthly_progress (user_id, year, month, exercise_name, max_weight, auto_saved)
-- -- SELECT user_id, year, month, canonical_exercise_name, max_weight, auto_saved FROM tmp_monthly_progress_merge;
-- -- DROP TABLE tmp_monthly_progress_merge;
-- -- COMMIT;
--

COMMIT;
