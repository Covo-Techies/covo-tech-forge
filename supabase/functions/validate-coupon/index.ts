import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, orderTotal } = await req.json();
    if (!code || typeof code !== "string") {
      return json({ error: "Coupon code is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .eq("active", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return json({ error: "This coupon code does not exist" }, 404);

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return json({ error: "This coupon has expired" }, 400);
    }
    if (data.usage_limit !== null && data.used_count >= data.usage_limit) {
      return json({ error: "This coupon has reached its usage limit" }, 400);
    }
    if (
      data.minimum_order_amount &&
      typeof orderTotal === "number" &&
      orderTotal < data.minimum_order_amount
    ) {
      return json(
        {
          error: `This coupon requires a minimum order of KSH ${Number(
            data.minimum_order_amount,
          ).toFixed(2)}`,
        },
        400,
      );
    }

    return json({ coupon: data });
  } catch (e) {
    console.error("validate-coupon error", e);
    return json({ error: "Failed to validate coupon" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
