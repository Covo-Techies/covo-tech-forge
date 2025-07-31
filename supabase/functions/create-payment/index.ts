import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Get cart items for the user
    console.log('Fetching cart items for user:', user.id);
    const { data: cartItems, error: cartError } = await supabaseClient
      .from('cart_items')
      .select(`
        quantity,
        product:products(id, name, price)
      `)
      .eq('user_id', user.id);

    console.log('Cart items response:', { cartItems, cartError });
    if (cartError) throw cartError;
    if (!cartItems || cartItems.length === 0) {
      console.log('No cart items found for user:', user.id);
      throw new Error("Cart is empty");
    }

    // Initialize Paystack
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) throw new Error("PAYSTACK_SECRET_KEY is not set");

    // Calculate total amount in kobo (KSH smallest unit)
    const totalAmount = cartItems.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
    const amountInKobo = Math.round(totalAmount * 100);

    // Create Paystack transaction
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: amountInKobo,
        currency: "KES",
        callback_url: `${req.headers.get("origin")}/payment-success`,
        cancel_action: `${req.headers.get("origin")}/cart`,
        metadata: {
          user_id: user.id,
          total_amount: totalAmount.toString(),
        },
      }),
    });

    const paystackData = await paystackResponse.json();
    if (!paystackData.status) {
      throw new Error(paystackData.message || "Failed to initialize payment");
    }

    // Create order record in Supabase
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: order, error: orderError } = await supabaseService
      .from("orders")
      .insert({
        user_id: user.id,
        stripe_session_id: paystackData.data.reference,
        total_amount: totalAmount,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const { error: orderItemsError } = await supabaseService
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) throw orderItemsError;

    return new Response(JSON.stringify({ url: paystackData.data.authorization_url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});