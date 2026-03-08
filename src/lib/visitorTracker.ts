import { supabase } from "@/integrations/supabase/client";

function generateSessionId(): string {
  return crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  let version = "";

  if (ua.includes("Firefox/")) {
    browser = "Firefox";
    version = ua.split("Firefox/")[1]?.split(" ")[0] || "";
  } else if (ua.includes("Edg/")) {
    browser = "Edge";
    version = ua.split("Edg/")[1]?.split(" ")[0] || "";
  } else if (ua.includes("Chrome/")) {
    browser = "Chrome";
    version = ua.split("Chrome/")[1]?.split(" ")[0] || "";
  } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
    browser = "Safari";
    version = ua.split("Version/")[1]?.split(" ")[0] || "";
  }

  let os = "Unknown";
  if (ua.includes("Windows")) os = ua.match(/Windows NT [\d.]+/)?.[0]?.replace("Windows NT 10.0", "Windows 10/11") || "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return { browser, browser_version: `${browser} ${version}`, os };
}

function getGPUInfo(): { gpu_vendor: string; gpu_renderer: string } {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl && gl instanceof WebGLRenderingContext) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      if (ext) {
        return {
          gpu_vendor: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || "Unknown",
          gpu_renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || "Unknown",
        };
      }
    }
  } catch {}
  return { gpu_vendor: "Unknown", gpu_renderer: "Unknown" };
}

async function getBatteryInfo(): Promise<{ battery_level: number | null; battery_charging: boolean | null }> {
  try {
    if ("getBattery" in navigator) {
      const battery = await (navigator as any).getBattery();
      return {
        battery_level: Math.round(battery.level * 100),
        battery_charging: battery.charging,
      };
    }
  } catch {}
  return { battery_level: null, battery_charging: null };
}

function getConnectionInfo() {
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (conn) {
    return {
      connection_type: conn.effectiveType || conn.type || "unknown",
      downlink: conn.downlink || null,
      rtt: conn.rtt || null,
    };
  }
  return { connection_type: null, downlink: null, rtt: null };
}

function getPerformanceInfo() {
  const perf = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (perf) {
    return {
      page_load_ms: Math.round(perf.loadEventEnd - perf.startTime) || null,
      dom_loaded_ms: Math.round(perf.domContentLoadedEventEnd - perf.startTime) || null,
      nav_type: perf.type || "navigate",
    };
  }
  return { page_load_ms: null, dom_loaded_ms: null, nav_type: "navigate" };
}

// Behavior tracking state
let clickCount = 0;
let mouseMoveCount = 0;
let maxScrollY = 0;
let totalScrollDist = 0;
let lastScrollY = 0;
const sectionsViewed = new Set<string>();
const startTime = Date.now();
let trackingInitialized = false;

function initBehaviorTracking() {
  if (trackingInitialized) return;
  trackingInitialized = true;

  document.addEventListener("click", () => clickCount++);
  document.addEventListener("mousemove", () => mouseMoveCount++);
  document.addEventListener("scroll", () => {
    const sy = window.scrollY;
    totalScrollDist += Math.abs(sy - lastScrollY);
    lastScrollY = sy;
    if (sy > maxScrollY) maxScrollY = sy;

    // Track visible sections
    document.querySelectorAll("section[id], [data-section]").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        sectionsViewed.add(el.id || el.getAttribute("data-section") || "unknown");
      }
    });
  });
}

export function collectVisitorData() {
  const { browser, browser_version, os } = getBrowserInfo();
  const gpu = getGPUInfo();
  const conn = getConnectionInfo();
  const perf = getPerformanceInfo();
  const screen = window.screen;
  const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  const maxScrollPercent = docHeight > window.innerHeight
    ? Math.round((maxScrollY / (docHeight - window.innerHeight)) * 100)
    : 100;

  return {
    session_id: generateSessionId(),
    user_agent: navigator.userAgent,
    browser,
    browser_version,
    os,
    platform: navigator.platform || "Unknown",
    language: navigator.language,
    languages: navigator.languages ? Array.from(navigator.languages) : [navigator.language],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    tz_offset: new Date().getTimezoneOffset(),
    cookies_enabled: navigator.cookieEnabled,
    online: navigator.onLine,
    pdf_viewer: !!(navigator as any).pdfViewerEnabled,
    screen_width: screen.width,
    screen_height: screen.height,
    available_width: screen.availWidth,
    available_height: screen.availHeight,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    pixel_ratio: window.devicePixelRatio,
    color_depth: screen.colorDepth,
    orientation: screen.orientation?.type || "unknown",
    device_memory: (navigator as any).deviceMemory || null,
    cpu_cores: navigator.hardwareConcurrency || null,
    ...gpu,
    ...conn,
    time_on_page: Math.round((Date.now() - startTime) / 1000),
    total_clicks: clickCount,
    mouse_moves: mouseMoveCount,
    scroll_distance: Math.round(totalScrollDist),
    max_scroll_percent: maxScrollPercent,
    sections_viewed: Array.from(sectionsViewed),
    entry_url: window.location.href,
    ...perf,
  };
}

export async function sendVisitorLog() {
  try {
    const data = collectVisitorData();
    const battery = await getBatteryInfo();
    
    const { data: session } = await supabase.auth.getSession();
    const headers: Record<string, string> = {};
    if (session?.session?.access_token) {
      headers["Authorization"] = `Bearer ${session.session.access_token}`;
    }

    await supabase.functions.invoke("track-visitor", {
      body: { ...data, ...battery },
      headers,
    });
  } catch (err) {
    console.error("Failed to send visitor log:", err);
  }
}

export function initVisitorTracking() {
  initBehaviorTracking();
  
  // Send initial data after page load
  if (document.readyState === "complete") {
    setTimeout(() => sendVisitorLog(), 2000);
  } else {
    window.addEventListener("load", () => setTimeout(() => sendVisitorLog(), 2000));
  }

  // Send again before leaving (with behavior data)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      sendVisitorLog();
    }
  });
}
