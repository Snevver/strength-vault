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

    console.log(`Running monthly snapshot for ${currentYear}-${currentMonth}`);

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
    const monthlyProgressRecords = exerciseWeights.map(weight => ({
      user_id: weight.user_id,
      year: currentYear,
      month: currentMonth,
      exercise_name: weight.exercise_name,
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
        year: currentYear,
        month: currentMonth
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in monthly snapshot:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});