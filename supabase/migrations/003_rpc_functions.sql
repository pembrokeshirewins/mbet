-- 003_rpc_functions.sql
-- Run in Supabase SQL Editor after 002

CREATE OR REPLACE FUNCTION get_pain_point_counts()
RETURNS TABLE(pain_point TEXT, count BIGINT) AS $$
  SELECT primary_pain_point AS pain_point, COUNT(*) AS count
  FROM intel_records
  WHERE primary_pain_point IS NOT NULL
    AND enrichment_status = 'success'
  GROUP BY primary_pain_point
  ORDER BY count DESC
  LIMIT 15
$$ LANGUAGE SQL SECURITY DEFINER;
