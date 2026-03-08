import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe, Monitor, Cpu, Wifi, MousePointer, Search, RefreshCw, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface VisitorLog {
  id: string;
  session_id: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  browser: string | null;
  browser_version: string | null;
  os: string | null;
  platform: string | null;
  language: string | null;
  languages: string[] | null;
  timezone: string | null;
  tz_offset: number | null;
  cookies_enabled: boolean | null;
  online: boolean | null;
  pdf_viewer: boolean | null;
  screen_width: number | null;
  screen_height: number | null;
  available_width: number | null;
  available_height: number | null;
  viewport_width: number | null;
  viewport_height: number | null;
  pixel_ratio: number | null;
  color_depth: number | null;
  orientation: string | null;
  device_memory: number | null;
  cpu_cores: number | null;
  gpu_vendor: string | null;
  gpu_renderer: string | null;
  connection_type: string | null;
  downlink: number | null;
  rtt: number | null;
  battery_level: number | null;
  battery_charging: boolean | null;
  time_on_page: number | null;
  total_clicks: number | null;
  mouse_moves: number | null;
  scroll_distance: number | null;
  max_scroll_percent: number | null;
  sections_viewed: string[] | null;
  entry_url: string | null;
  page_load_ms: number | null;
  dom_loaded_ms: number | null;
  nav_type: string | null;
  country_code: string | null;
  country_name: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  username?: string | null;
}

const VisitorLogViewer = () => {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<VisitorLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("visitor_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Error fetching visitor logs:", error);
      setLoading(false);
      return;
    }

    // Enrich with usernames
    const userIds = [...new Set((data || []).map(l => l.user_id).filter(Boolean))] as string[];
    let profileMap = new Map<string, string>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, username").in("user_id", userIds);
      profileMap = new Map((profiles || []).map(p => [p.user_id, p.username]));
    }

    setLogs((data || []).map(l => ({
      ...l,
      username: l.user_id ? profileMap.get(l.user_id) || null : null,
    })) as VisitorLog[]);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter(log => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      log.ip_address?.toLowerCase().includes(s) ||
      log.browser?.toLowerCase().includes(s) ||
      log.os?.toLowerCase().includes(s) ||
      log.country_name?.toLowerCase().includes(s) ||
      log.city?.toLowerCase().includes(s) ||
      log.username?.toLowerCase().includes(s) ||
      log.entry_url?.toLowerCase().includes(s)
    );
  });

  const InfoRow = ({ label, value, color }: { label: string; value: string | number | null | undefined; color?: string }) => (
    value != null && value !== "" ? (
      <div className="flex justify-between py-1.5 border-b border-border/30">
        <span className="text-muted-foreground text-sm">{label}</span>
        <span className={`font-mono text-sm font-semibold ${color || "text-foreground"}`}>{String(value)}</span>
      </div>
    ) : null
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-display text-xl font-bold">Visitor Logs</h2>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by IP, browser, OS, location, username..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[140px]">Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>IP / Location</TableHead>
              <TableHead>Browser / OS</TableHead>
              <TableHead>Screen</TableHead>
              <TableHead>Behavior</TableHead>
              <TableHead className="w-[80px]">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading visitor logs...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No visitor logs found</TableCell></TableRow>
            ) : (
              filtered.map((log, i) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.015 }}
                  className="border-b border-border/50 hover:bg-muted/20"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {log.username || <span className="text-muted-foreground/50">anonymous</span>}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-mono">{log.ip_address || "—"}</div>
                    <div className="text-muted-foreground">
                      {log.city && log.country_code ? `${log.city}, ${log.country_code}` : log.country_name || "—"}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div>{log.browser_version || log.browser || "—"}</div>
                    <div className="text-muted-foreground">{log.os || "—"}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.screen_width && log.screen_height ? `${log.screen_width}×${log.screen_height}` : "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex gap-2">
                      {log.total_clicks != null && <Badge variant="outline" className="text-xs py-0">{log.total_clicks} clicks</Badge>}
                      {log.time_on_page != null && <Badge variant="outline" className="text-xs py-0">{log.time_on_page}s</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-7" onClick={() => setSelectedLog(log)}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Showing {filtered.length} of {logs.length} logs (last 200)
      </p>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Visitor Fingerprint Detail
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {selectedLog && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-1">
                {/* IP & Location */}
                <div className="space-y-1">
                  <h3 className="font-display text-sm font-bold text-yellow-400 flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4" /> IP & LOCATION
                  </h3>
                  <InfoRow label="IP Address" value={selectedLog.ip_address} color="text-foreground" />
                  <InfoRow label="Country" value={selectedLog.country_name} />
                  <InfoRow label="City" value={selectedLog.city} />
                  <InfoRow label="Lat/Lng" value={selectedLog.latitude != null ? `${selectedLog.latitude}, ${selectedLog.longitude}` : null} />
                  
                  <h3 className="font-display text-sm font-bold text-blue-400 flex items-center gap-2 mb-2 mt-4">
                    <Globe className="w-4 h-4" /> BROWSER & SYSTEM
                  </h3>
                  <InfoRow label="User Agent" value={selectedLog.user_agent} />
                  <InfoRow label="Browser" value={selectedLog.browser_version} color="text-foreground" />
                  <InfoRow label="OS" value={selectedLog.os} color="text-foreground" />
                  <InfoRow label="Platform" value={selectedLog.platform} color="text-foreground" />
                  <InfoRow label="Language" value={selectedLog.language} color="text-foreground" />
                  <InfoRow label="All Languages" value={selectedLog.languages?.join(", ")} />
                  <InfoRow label="Timezone" value={selectedLog.timezone} color="text-foreground" />
                  <InfoRow label="TZ Offset" value={selectedLog.tz_offset != null ? `${selectedLog.tz_offset} min` : null} />
                  <InfoRow label="Cookies" value={selectedLog.cookies_enabled != null ? (selectedLog.cookies_enabled ? "Yes" : "No") : null} color="text-foreground" />
                  <InfoRow label="Online" value={selectedLog.online != null ? (selectedLog.online ? "Yes" : "No") : null} color="text-foreground" />
                  <InfoRow label="PDF Viewer" value={selectedLog.pdf_viewer != null ? (selectedLog.pdf_viewer ? "Yes" : "No") : null} color="text-foreground" />
                </div>

                {/* Screen & Hardware */}
                <div className="space-y-1">
                  <h3 className="font-display text-sm font-bold text-cyan-400 flex items-center gap-2 mb-2">
                    <Monitor className="w-4 h-4" /> SCREEN & DISPLAY
                  </h3>
                  <InfoRow label="Screen" value={selectedLog.screen_width && selectedLog.screen_height ? `${selectedLog.screen_width} × ${selectedLog.screen_height}` : null} color="text-foreground" />
                  <InfoRow label="Available" value={selectedLog.available_width && selectedLog.available_height ? `${selectedLog.available_width} × ${selectedLog.available_height}` : null} color="text-foreground" />
                  <InfoRow label="Viewport" value={selectedLog.viewport_width && selectedLog.viewport_height ? `${selectedLog.viewport_width} × ${selectedLog.viewport_height}` : null} color="text-foreground" />
                  <InfoRow label="Pixel Ratio" value={selectedLog.pixel_ratio != null ? `${selectedLog.pixel_ratio}x` : null} color="text-foreground" />
                  <InfoRow label="Color Depth" value={selectedLog.color_depth != null ? `${selectedLog.color_depth}-bit` : null} color="text-foreground" />
                  <InfoRow label="Orientation" value={selectedLog.orientation} color="text-foreground" />

                  <h3 className="font-display text-sm font-bold text-green-400 flex items-center gap-2 mb-2 mt-4">
                    <Cpu className="w-4 h-4" /> HARDWARE
                  </h3>
                  <InfoRow label="Device Memory" value={selectedLog.device_memory != null ? `${selectedLog.device_memory} GB` : null} color="text-foreground" />
                  <InfoRow label="CPU Cores" value={selectedLog.cpu_cores} color="text-foreground" />
                  <InfoRow label="GPU Vendor" value={selectedLog.gpu_vendor} color="text-foreground" />
                  <InfoRow label="GPU Renderer" value={selectedLog.gpu_renderer} color="text-foreground" />
                </div>

                {/* Network & Behavior */}
                <div className="space-y-1">
                  <h3 className="font-display text-sm font-bold text-purple-400 flex items-center gap-2 mb-2">
                    <Wifi className="w-4 h-4" /> NETWORK & BATTERY
                  </h3>
                  <InfoRow label="Connection" value={selectedLog.connection_type} color="text-foreground" />
                  <InfoRow label="Downlink" value={selectedLog.downlink != null ? `${selectedLog.downlink} Mbps` : null} color="text-foreground" />
                  <InfoRow label="RTT" value={selectedLog.rtt != null ? `${selectedLog.rtt} ms` : null} color="text-foreground" />
                  <InfoRow label="Battery" value={selectedLog.battery_level != null ? `${selectedLog.battery_level}%` : null} color="text-foreground" />
                  <InfoRow label="Charging" value={selectedLog.battery_charging != null ? (selectedLog.battery_charging ? "Yes" : "No") : null} />

                  <h3 className="font-display text-sm font-bold text-red-400 flex items-center gap-2 mb-2 mt-4">
                    <MousePointer className="w-4 h-4" /> BEHAVIOR
                  </h3>
                  <InfoRow label="Time on Page" value={selectedLog.time_on_page != null ? `${selectedLog.time_on_page} seconds` : null} color="text-foreground" />
                  <InfoRow label="Total Clicks" value={selectedLog.total_clicks} color="text-foreground" />
                  <InfoRow label="Mouse Moves" value={selectedLog.mouse_moves} color="text-foreground" />
                  <InfoRow label="Scroll Distance" value={selectedLog.scroll_distance != null ? `${selectedLog.scroll_distance}px` : null} color="text-foreground" />
                  <InfoRow label="Max Scroll" value={selectedLog.max_scroll_percent != null ? `${selectedLog.max_scroll_percent}%` : null} color="text-foreground" />
                  <InfoRow label="Sections Viewed" value={selectedLog.sections_viewed?.join(", ")} />
                  <InfoRow label="Entry URL" value={selectedLog.entry_url} color="text-foreground" />
                  <InfoRow label="Page Load" value={selectedLog.page_load_ms != null ? `${selectedLog.page_load_ms} ms` : null} color="text-foreground" />
                  <InfoRow label="DOM Loaded" value={selectedLog.dom_loaded_ms != null ? `${selectedLog.dom_loaded_ms} ms` : null} color="text-foreground" />
                  <InfoRow label="Nav Type" value={selectedLog.nav_type} color="text-foreground" />
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisitorLogViewer;
