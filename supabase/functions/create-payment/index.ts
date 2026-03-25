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
    const { shippingAddress, couponCode } = await req.json();
    logStep("Request body parsed", { shippingAddress, couponCode });

    // Fetch user's cart items
    logStep("Fetching cart for user", { userId: user.id });
    const { data: cartItems, error: cartError } = await supabaseService
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        variant_id,
        product:products (
          id,
          name,
          price,
          stock_quantity
        )
      `)
      .eq('user_id', user.id);

    // Fetch variant details for items with variant_id
    const variantMap: Record<string, { price_adjustment: number; stock_quantity: number; size: string; color: string }> = {};
    if (cartItems) {
      const variantIds = cartItems.filter(i => i.variant_id).map(i => i.variant_id);
      if (variantIds.length > 0) {
        const { data: variantsData } = await supabaseService
          .from('product_variants')
          .select('id, price_adjustment, stock_quantity, size, color')
          .in('id', variantIds);
        if (variantsData) {
          for (const v of variantsData) {
            variantMap[v.id] = v;
          }
        }
      }
    }

    if (cartError) {
      logStep("Cart fetch error", { error: cartError });
      throw new Error(`Failed to fetch cart: ${cartError.message}`);
    }

    logStep("Raw cart query result", { cartItems, itemCount: cartItems?.length || 0 });

    if (!cartItems || cartItems.length === 0) {
      logStep("Cart is empty - checking cart table directly");
      
      // Additional debug query to see if there are any cart items for this user
      const { data: debugCartItems, error: debugError } = await supabaseService
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);
      
      logStep("Debug cart query", { debugCartItems, debugError });
      
      throw new Error("Cart is empty");
    }
    logStep("Cart items fetched", { itemCount: cartItems.length });

    // Stock validation - check all items before proceeding
    const outOfStockItems: string[] = [];
    const insufficientStockItems: { name: string; available: number; requested: number }[] = [];

    for (const item of cartItems) {
      const variant = item.variant_id ? variantMap[item.variant_id] : null;
      const stockQty = variant ? variant.stock_quantity : item.product.stock_quantity;
      const itemName = variant 
        ? `${item.product.name} (${[variant.size, variant.color].filter(Boolean).join(', ')})`
        : item.product.name;

      if (!stockQty || stockQty <= 0) {
        outOfStockItems.push(itemName);
      } else if (item.quantity > stockQty) {
        insufficientStockItems.push({
          name: itemName,
          available: stockQty,
          requested: item.quantity
        });
      }
    }

    if (outOfStockItems.length > 0) {
      const itemsList = outOfStockItems.join(", ");
      throw new Error(`The following items are out of stock: ${itemsList}. Please remove them from your cart to continue.`);
    }

    if (insufficientStockItems.length > 0) {
      const itemDetails = insufficientStockItems
        .map(item => `${item.name} (only ${item.available} available, you requested ${item.requested})`)
        .join("; ");
      throw new Error(`Insufficient stock for: ${itemDetails}. Please reduce quantities.`);
    }

    logStep("Stock validation passed");

    // Calculate total amount
    let totalAmount = cartItems.reduce((total, item) => {
      const priceAdj = item.variant_id && variantMap[item.variant_id] ? variantMap[item.variant_id].price_adjustment : 0;
      return total + ((item.product.price + priceAdj) * item.quantity);
    }, 0);
    logStep("Total amount calculated", { totalAmount });

    // Apply coupon if provided
    let couponId = null;
    let discountAmount = 0;
    
    if (couponCode) {
      logStep("Validating coupon", { couponCode });
      
      const { data: coupon, error: couponError } = await supabaseService
        .from('coupons')
        .select('*')
        .eq('code', couponCode)
        .eq('active', true)
        .maybeSingle();

      if (couponError) {
        logStep("Coupon validation error", { error: couponError });
        throw new Error(`Coupon validation failed: ${couponError.message}`);
      }

      if (!coupon) {
        throw new Error("Invalid or expired coupon code");
      }

      // Check if coupon has expired
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        throw new Error("This coupon has expired");
      }

      // Check usage limit
      if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
        throw new Error("This coupon has reached its usage limit");
      }

      // Check minimum order amount
      if (coupon.minimum_order_amount && totalAmount < coupon.minimum_order_amount) {
        throw new Error(`Minimum order amount of KSH ${coupon.minimum_order_amount} not met`);
      }

      // Calculate discount
      if (coupon.discount_type === 'percentage') {
        discountAmount = (totalAmount * coupon.discount_value) / 100;
      } else {
        discountAmount = Math.min(coupon.discount_value, totalAmount);
      }

      totalAmount -= discountAmount;
      couponId = coupon.id;
      
      logStep("Coupon applied", { 
        couponCode, 
        discountAmount, 
        newTotal: totalAmount 
      });

      // Increment coupon usage count
      const { error: updateError } = await supabaseService
        .from('coupons')
        .update({ used_count: coupon.used_count + 1 })
        .eq('id', coupon.id);

      if (updateError) {
        logStep("Warning: Failed to update coupon usage", { error: updateError });
      }
    }

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
          cart_items: cartItems.map(item => {
            const priceAdj = item.variant_id && variantMap[item.variant_id] ? variantMap[item.variant_id].price_adjustment : 0;
            return {
              product_id: item.product_id,
              variant_id: item.variant_id,
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price + priceAdj
            };
          })
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
      coupon_id: couponId,
      discount_amount: discountAmount,
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
    const orderItemsData = cartItems.map(item => {
      const priceAdj = item.variant_id && variantMap[item.variant_id] ? variantMap[item.variant_id].price_adjustment : 0;
      return {
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.product.price + priceAdj
      };
    });

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