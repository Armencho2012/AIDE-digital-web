import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting map (in-memory, resets on cold starts)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // Max requests per window
const RATE_WINDOW_MS = 60000; // 1 minute window

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return false;
  }
  
  record.count++;
  return record.count > RATE_LIMIT;
}

// Verify sale with Gumroad API
async function verifySaleWithGumroad(saleId: string, accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.gumroad.com/v2/sales/${saleId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      console.error(`Gumroad API returned status ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    return data.success === true && data.sale != null;
  } catch (error) {
    console.error("Error verifying sale with Gumroad:", error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "text/plain" }
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const gumroadProductId = Deno.env.get("GUMROAD_PRODUCT_ID");
    const gumroadAccessToken = Deno.env.get("GUMROAD_ACCESS_TOKEN");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase configuration missing");
      return new Response("Server configuration error", {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/plain" }
      });
    }

    if (!gumroadProductId) {
      console.error("GUMROAD_PRODUCT_ID not configured");
      return new Response("Server configuration error", {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/plain" }
      });
    }

    if (!gumroadAccessToken) {
      console.error("GUMROAD_ACCESS_TOKEN not configured");
      return new Response("Server configuration error", {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/plain" }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Gumroad sends webhook data as form-encoded
    const formData = await req.formData();
    const webhookData: Record<string, string> = {};
    
    for (const [key, value] of formData.entries()) {
      webhookData[key] = value.toString();
    }

    const email = webhookData.email?.toLowerCase().trim();
    const saleId = webhookData.sale_id;
    const productId = webhookData.product_id;
    const event = webhookData.event;

    // Rate limiting by IP or email
    const clientIdentifier = email || req.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(clientIdentifier)) {
      console.warn(`Rate limit exceeded for: ${clientIdentifier}`);
      return new Response("Rate limit exceeded", {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "text/plain" }
      });
    }

    // Log webhook attempt (excluding sensitive data)
    console.log("Gumroad webhook received:", {
      product_id: productId,
      sale_id: saleId,
      event: event,
      has_email: !!email
    });

    // Input validation
    if (!saleId || typeof saleId !== 'string' || saleId.length > 100) {
      console.warn("Invalid sale_id in webhook");
      return new Response("Invalid request data", {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain" }
      });
    }

    if (!productId || typeof productId !== 'string') {
      console.warn("Invalid product_id in webhook");
      return new Response("Invalid request data", {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain" }
      });
    }

    // Verify product ID matches our Aide Pro plan
    if (productId !== gumroadProductId) {
      console.log("Product ID mismatch, ignoring webhook");
      return new Response("OK", {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/plain" }
      });
    }

    // CRITICAL: Verify the sale is legitimate by checking with Gumroad API
    const isValidSale = await verifySaleWithGumroad(saleId, gumroadAccessToken);
    if (!isValidSale) {
      console.error(`Sale verification failed for sale_id: ${saleId}`);
      return new Response("Sale verification failed", {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "text/plain" }
      });
    }

    console.log(`Sale ${saleId} verified successfully with Gumroad API`);

    // Handle sale event
    if (event === 'sale' || event === 'subscription_payment_succeeded') {
      if (!email) {
        console.error("No email in webhook data");
        return new Response("Missing email", {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "text/plain" }
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) || email.length > 255) {
        console.error("Invalid email format");
        return new Response("Invalid email format", {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "text/plain" }
        });
      }

      // Find user by email
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("Error fetching users");
        return new Response("Internal server error", {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "text/plain" }
        });
      }

      const user = authUsers.users.find(u => u.email?.toLowerCase() === email);

      if (!user) {
        console.log("User not found for provided email, recording sale for later");
        // Store the sale for later when user signs up
        await supabase
          .from('subscriptions')
          .insert({
            gumroad_sale_id: saleId,
            gumroad_email: email,
            status: 'pending',
            plan_type: 'pro',
            purchased_at: new Date().toISOString(),
          });
        
        return new Response("OK", {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "text/plain" }
        });
      }

      // Calculate expiration (1 month subscription)
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      // Update or create subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          gumroad_sale_id: saleId,
          gumroad_email: email,
          status: 'active',
          plan_type: 'pro',
          purchased_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (subError) {
        console.error("Error updating subscription");
        return new Response("Internal server error", {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "text/plain" }
        });
      }

      console.log(`Successfully upgraded user to Pro`);
    }

    // Handle refund/cancellation
    if (event === 'refund' || event === 'subscription_cancelled') {
      if (email) {
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const user = authUsers?.users.find(u => u.email?.toLowerCase() === email);

        if (user) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
            })
            .eq('user_id', user.id);
        }
      }
    }

    return new Response("OK", {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" }
    });
  } catch (error) {
    console.error("Webhook processing error");
    return new Response("Internal server error", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" }
    });
  }
});
