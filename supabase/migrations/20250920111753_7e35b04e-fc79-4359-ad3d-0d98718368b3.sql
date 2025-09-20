-- Enable pg_cron extension for scheduled functions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the monthly snapshot function to run on the 1st of every month at 02:00 Amsterdam time
-- This translates to 00:00 or 01:00 UTC depending on daylight saving time
SELECT cron.schedule(
  'monthly-exercise-snapshot',
  '0 1 1 * *', -- At 01:00 UTC on the 1st day of every month
  $$
  SELECT
    net.http_post(
        url:='https://uciupfsvlhvqcwvpqeei.supabase.co/functions/v1/monthly-snapshot',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaXVwZnN2bGh2cWN3dnBxZWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzcxOTcsImV4cCI6MjA3Mzg1MzE5N30.yPG911_OCv51OJVGd6vxHl1pzdLwkLMoKDwJiyASYTo"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);