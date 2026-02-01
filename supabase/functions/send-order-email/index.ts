import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface OrderEmailRequest {
  to: string;
  customerName: string;
  orderId: string;
  orderItems: OrderItem[];
  totalAmount: number;
  shippingAddress?: {
    address?: string;
    city?: string;
    state?: string;
  };
  type: "confirmation" | "shipped" | "delivered";
  trackingNumber?: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};

const generateOrderItemsHtml = (items: OrderItem[]): string => {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.product_name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `
    )
    .join("");
};

const getEmailContent = (data: OrderEmailRequest) => {
  const { type, customerName, orderId, orderItems, totalAmount, shippingAddress, trackingNumber } = data;

  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
      .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #f3f4f6; padding: 12px; text-align: left; }
    </style>
  `;

  if (type === "confirmation") {
    return {
      subject: `Order Confirmed - #${orderId.slice(0, 8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Order Confirmed! ✓</h1>
            </div>
            <div class="content">
              <p>Hi ${customerName || "Valued Customer"},</p>
              <p>Thank you for your order! We're getting it ready for you.</p>
              
              <h3 style="margin-top: 24px;">Order Details</h3>
              <p style="color: #6b7280;">Order ID: <strong>#${orderId.slice(0, 8).toUpperCase()}</strong></p>
              
              <table style="margin: 20px 0;">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${generateOrderItemsHtml(orderItems)}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 12px; font-weight: bold;">Total</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; color: #10b981;">${formatCurrency(totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
              
              ${shippingAddress ? `
              <h3 style="margin-top: 24px;">Shipping Address</h3>
              <p style="color: #6b7280;">
                ${shippingAddress.address || ""}<br>
                ${shippingAddress.city || ""}, ${shippingAddress.state || ""}
              </p>
              ` : ""}
              
              <p style="margin-top: 24px;">We'll send you another email when your order ships.</p>
            </div>
            <div class="footer">
              <p style="margin: 0; color: #6b7280;">Questions? Reply to this email or contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }

  if (type === "shipped") {
    return {
      subject: `Your Order Has Shipped! - #${orderId.slice(0, 8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">
              <h1 style="margin: 0;">Your Order is On Its Way! 📦</h1>
            </div>
            <div class="content">
              <p>Hi ${customerName || "Valued Customer"},</p>
              <p>Great news! Your order has been shipped.</p>
              
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Order ID:</strong> #${orderId.slice(0, 8).toUpperCase()}</p>
                ${trackingNumber ? `<p style="margin: 8px 0 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ""}
              </div>
              
              <p>You'll receive your package soon!</p>
            </div>
            <div class="footer">
              <p style="margin: 0; color: #6b7280;">Thank you for shopping with us!</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }

  // type === "delivered"
  return {
    subject: `Order Delivered! - #${orderId.slice(0, 8).toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
            <h1 style="margin: 0;">Your Order Has Been Delivered! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${customerName || "Valued Customer"},</p>
            <p>Your order <strong>#${orderId.slice(0, 8).toUpperCase()}</strong> has been delivered!</p>
            
            <p style="margin-top: 20px;">We hope you love your purchase. If you have any questions or concerns, don't hesitate to reach out.</p>
            
            <p style="margin-top: 20px;">Consider leaving a review to help other customers!</p>
          </div>
          <div class="footer">
            <p style="margin: 0; color: #6b7280;">Thank you for choosing us! 💚</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-ORDER-EMAIL] ${step}${detailsStr}`);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: OrderEmailRequest = await req.json();
    logStep("Email request received", { to: data.to, type: data.type, orderId: data.orderId });

    if (!data.to || !data.orderId || !data.type) {
      throw new Error("Missing required fields: to, orderId, or type");
    }

    const { subject, html } = getEmailContent(data);

    const emailResponse = await resend.emails.send({
      from: "Orders <onboarding@resend.dev>",
      to: [data.to],
      subject,
      html,
    });

    logStep("Email sent successfully", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    logStep("ERROR sending email", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
