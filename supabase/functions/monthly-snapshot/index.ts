import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get current date in Amsterdam timezone
    const now = new Date();
    const amsterdamTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Amsterdam" }));
    const currentYear = amsterdamTime.getFullYear();
    const currentMonth = amsterdamTime.getMonth() + 1;

    // Snapshot should represent the month that just finished.
    // If we run this on the 1st of a month (e.g. Oct 1), we want to save data for the previous month (Sep).
    let snapshotYear = currentYear;
    let snapshotMonth = currentMonth - 1; // previous month
    if (snapshotMonth === 0) {
      snapshotMonth = 12;
      snapshotYear -= 1;
    }

    console.log(`Running monthly snapshot for ${snapshotYear}-${snapshotMonth} (previous month)`);

    // Get all users' current exercise weights
    const { data: exerciseWeights, error: weightsError } = await supabaseClient
      .from('exercise_weights')
      .select('user_id, exercise_name, current_weight');

    if (weightsError) {
      console.error('Error fetching exercise weights:', weightsError);
      throw weightsError;
    }

    if (!exerciseWeights || exerciseWeights.length === 0) {
      console.log('No exercise weights found to snapshot');
      return new Response(
        JSON.stringify({ message: "No exercise weights found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare monthly progress records
    // small canonicalization map to replace legacy / variant names
    const canonicalMap: Record<string, string> = {
      'squats/legpress': 'Legpress',
      'lat raises cable': 'Lateral Raises Cable',
      // keep common variants as defensive defaults
      'pulldown beneden': 'Lat Pulldown',
      'pulldown lat': 'Lat Pulldown',
      'flys': 'Pec Flyes'
      ,
      // RDL / Romanian Deadlift -> Back Extension
      'rdls': 'Back Extension',
      'rdl': 'Back Extension',
      'romanian deadlift': 'Back Extension',
      'romanian deadlifts': 'Back Extension',
      // Russian twists -> Torso Rotation
      'russian twists': 'Torso Rotation',
      'russian twist': 'Torso Rotation'
    };

    const toCanonical = (name: string) => {
      const key = (name ?? '').trim().toLowerCase();
      return canonicalMap[key] ?? name;
    };

    type WeightRow = { user_id: string; exercise_name: string; current_weight: number };

    const monthlyProgressRecords = (exerciseWeights as WeightRow[]).map(weight => ({
      user_id: weight.user_id,
      year: snapshotYear,
      month: snapshotMonth,
      exercise_name: toCanonical(weight.exercise_name),
      max_weight: weight.current_weight,
      auto_saved: true
    }));

    // Insert or update monthly progress records
    const { error: insertError } = await supabaseClient
      .from('monthly_progress')
      .upsert(monthlyProgressRecords, {
        onConflict: 'user_id,year,month,exercise_name'
      });

    if (insertError) {
      console.error('Error inserting monthly progress:', insertError);
      throw insertError;
    }

    console.log(`Successfully saved ${monthlyProgressRecords.length} monthly progress records`);

    return new Response(
      JSON.stringify({ 
        message: "Monthly snapshot completed successfully",
        recordsProcessed: monthlyProgressRecords.length,
        year: snapshotYear,
        month: snapshotMonth
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in monthly snapshot:', error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});