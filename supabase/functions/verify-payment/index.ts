import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseService = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Webhook received");

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not set");
    }

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Verify webhook signature
    if (signature) {
      const hash = createHmac("sha512", paystackSecretKey)
        .update(body)
        .digest("hex");

      if (hash !== signature) {
        logStep("Invalid signature", { expected: hash, received: signature });
        throw new Error("Invalid webhook signature");
      }
      logStep("Signature verified");
    } else {
      logStep("No signature provided - this may be a direct verification call");
    }

    const payload = JSON.parse(body);
    logStep("Payload parsed", { event: payload.event });

    // Handle different Paystack events
    if (payload.event === "charge.success") {
      const { reference, status, amount, customer, metadata } = payload.data;
      
      logStep("Processing successful charge", { reference, status, amount });

      // Find the order by reference (stored in stripe_session_id field)
      const { data: order, error: orderFetchError } = await supabaseService
        .from("orders")
        .select("*, order_items(*, products(*))")
        .eq("stripe_session_id", reference)
        .single();

      if (orderFetchError) {
        logStep("Order fetch error", { error: orderFetchError, reference });
        throw new Error(`Order not found: ${orderFetchError.message}`);
      }

      if (!order) {
        throw new Error(`No order found with reference: ${reference}`);
      }

      logStep("Order found", { orderId: order.id, currentStatus: order.status });

      // Only process if order is still pending
      if (order.status === "pending") {
        // Update order status to completed
        const { error: updateError } = await supabaseService
          .from("orders")
          .update({ 
            status: "completed",
            updated_at: new Date().toISOString()
          })
          .eq("id", order.id);

        if (updateError) {
          logStep("Order update error", { error: updateError });
          throw new Error(`Failed to update order: ${updateError.message}`);
        }
        logStep("Order status updated to completed");

        // Update product stock quantities
        for (const item of order.order_items) {
          const newStock = Math.max(0, item.products.stock_quantity - item.quantity);
          
          const { error: stockError } = await supabaseService
            .from("products")
            .update({ stock_quantity: newStock })
            .eq("id", item.product_id);

          if (stockError) {
            logStep("Stock update warning", { 
              productId: item.product_id, 
              error: stockError 
            });
          } else {
            logStep("Stock updated", { 
              productId: item.product_id, 
              oldStock: item.products.stock_quantity,
              newStock 
            });
          }
        }

        // Clear user's cart
        const { error: cartClearError } = await supabaseService
          .from("cart_items")
          .delete()
          .eq("user_id", order.user_id);

        if (cartClearError) {
          logStep("Cart clear warning", { error: cartClearError });
        } else {
          logStep("Cart cleared for user", { userId: order.user_id });
        }

        logStep("Payment verification complete", { 
          orderId: order.id, 
          amount: amount / 100,
          reference 
        });
      } else {
        logStep("Order already processed", { orderId: order.id, status: order.status });
      }
    } else if (payload.event === "charge.failed") {
      const { reference, gateway_response } = payload.data;
      
      logStep("Processing failed charge", { reference, reason: gateway_response });

      // Update order status to failed
      const { error: updateError } = await supabaseService
        .from("orders")
        .update({ 
          status: "failed",
          updated_at: new Date().toISOString()
        })
        .eq("stripe_session_id", reference);

      if (updateError) {
        logStep("Failed to update order status", { error: updateError });
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});