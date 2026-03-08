import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getGeoLocation(ip: string) {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,lat,lon`);
    const data = await response.json();
    if (data.status === "success") {
      return {
        country_code: data.countryCode,
        country_name: data.country,
        city: data.city,
        latitude: data.lat,
        longitude: data.lon,
      };
    }
  } catch (e) {
    console.error("Geo lookup failed:", e);
  }
  return {};
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip")
      || req.headers.get("x-real-ip")
      || "unknown";

    const isPrivateIp = clientIp === "unknown"
      || clientIp.startsWith("10.")
      || clientIp.startsWith("192.168.")
      || clientIp.startsWith("172.")
      || clientIp === "127.0.0.1"
      || clientIp === "::1";

    let geo = {};
    if (!isPrivateIp) {
      geo = await getGeoLocation(clientIp);
    }

    // Get auth token if present
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Use service role to insert (visitor may not be authenticated)
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Extract user_id from token if present
    let userId = null;
    if (authHeader) {
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      userId = user?.id || null;
    }

    const { error } = await supabase.from("visitor_logs").insert({
      session_id: body.session_id,
      user_id: userId,
      ip_address: clientIp,
      user_agent: body.user_agent,
      browser: body.browser,
      browser_version: body.browser_version,
      os: body.os,
      platform: body.platform,
      language: body.language,
      languages: body.languages,
      timezone: body.timezone,
      tz_offset: body.tz_offset,
      cookies_enabled: body.cookies_enabled,
      online: body.online,
      pdf_viewer: body.pdf_viewer,
      screen_width: body.screen_width,
      screen_height: body.screen_height,
      available_width: body.available_width,
      available_height: body.available_height,
      viewport_width: body.viewport_width,
      viewport_height: body.viewport_height,
      pixel_ratio: body.pixel_ratio,
      color_depth: body.color_depth,
      orientation: body.orientation,
      device_memory: body.device_memory,
      cpu_cores: body.cpu_cores,
      gpu_vendor: body.gpu_vendor,
      gpu_renderer: body.gpu_renderer,
      connection_type: body.connection_type,
      downlink: body.downlink,
      rtt: body.rtt,
      battery_level: body.battery_level,
      battery_charging: body.battery_charging,
      time_on_page: body.time_on_page,
      total_clicks: body.total_clicks,
      mouse_moves: body.mouse_moves,
      scroll_distance: body.scroll_distance,
      max_scroll_percent: body.max_scroll_percent,
      sections_viewed: body.sections_viewed,
      entry_url: body.entry_url,
      page_load_ms: body.page_load_ms,
      dom_loaded_ms: body.dom_loaded_ms,
      nav_type: body.nav_type,
      ...geo,
    });

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
