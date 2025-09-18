import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const timestamp = new Date().toISOString()
    
    // Simple health check response
    const response = {
      status: 'alive',
      timestamp,
      message: 'Supabase project is active',
      uptime: process.uptime ? Math.floor(process.uptime()) : null
    }

    console.log(`Keep-alive ping received at ${timestamp}`)

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Keep-alive error:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Keep-alive failed',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      },
    )
  }
})