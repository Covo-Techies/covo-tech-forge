import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client using the anon key for user authentication
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  // Create Supabase service client for database operations
  const supabaseService = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    // Authenticate the user
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { shippingAddress } = await req.json();
    logStep("Request body parsed", { shippingAddress });

    // Fetch user's cart items
    logStep("Fetching cart for user", { userId: user.id });
    const { data: cartItems, error: cartError } = await supabaseClient
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        product:products (
          id,
          name,
          price,
          stock_quantity
        )
      `)
      .eq('user_id', user.id);

    if (cartError) {
      logStep("Cart fetch error", { error: cartError });
      throw new Error(`Failed to fetch cart: ${cartError.message}`);
    }

    logStep("Raw cart query result", { cartItems, itemCount: cartItems?.length || 0 });

    if (!cartItems || cartItems.length === 0) {
      logStep("Cart is empty - checking cart table directly");
      
      // Additional debug query to see if there are any cart items for this user
      const { data: debugCartItems, error: debugError } = await supabaseClient
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);
      
      logStep("Debug cart query", { debugCartItems, debugError });
      
      throw new Error("Cart is empty");
    }
    logStep("Cart items fetched", { itemCount: cartItems.length });

    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
    logStep("Total amount calculated", { totalAmount });

    // Get Paystack secret key
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not set");
    }

    // Initialize Paystack transaction
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(totalAmount * 100), // Convert to kobo (Paystack uses kobo)
        currency: "KES",
        callback_url: `${req.headers.get("origin")}/payment-success`,
        cancel_action: `${req.headers.get("origin")}/payment-cancel`,
        metadata: {
          user_id: user.id,
          cart_items: cartItems.map(item => ({
            product_id: item.product_id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price
          }))
        }
      }),
    });

    const paystackData = await paystackResponse.json();
    logStep("Paystack response", { status: paystackResponse.status, data: paystackData });

    if (!paystackResponse.ok) {
      throw new Error(`Paystack error: ${paystackData.message || 'Failed to initialize payment'}`);
    }

    if (!paystackData.status || !paystackData.data?.authorization_url) {
      throw new Error("Failed to get payment URL from Paystack");
    }

    // Create order record in database
    const orderData = {
      user_id: user.id,
      total_amount: totalAmount,
      status: 'pending',
      shipping_address: shippingAddress,
      stripe_session_id: paystackData.data.reference, // Using this field for Paystack reference
      created_at: new Date().toISOString()
    };

    const { data: order, error: orderError } = await supabaseService
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      logStep("Order creation error", { error: orderError });
      throw new Error(`Failed to create order: ${orderError.message}`);
    }
    logStep("Order created", { orderId: order.id });

    // Create order items
    const orderItemsData = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product.price
    }));

    const { error: orderItemsError } = await supabaseService
      .from('order_items')
      .insert(orderItemsData);

    if (orderItemsError) {
      logStep("Order items creation error", { error: orderItemsError });
      throw new Error(`Failed to create order items: ${orderItemsError.message}`);
    }
    logStep("Order items created", { count: orderItemsData.length });

    // Return the payment URL
    return new Response(
      JSON.stringify({
        url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        order_id: order.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});