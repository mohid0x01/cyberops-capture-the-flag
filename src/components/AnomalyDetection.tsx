import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Globe, MapPin, Shield, RefreshCw, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface Anomaly {
  session_id: string;
  user_id: string;
  username: string;
  ip_address: string | null;
  country_name: string | null;
  city: string | null;
  created_at: string;
  reason: string | null;
}

const AnomalyDetection = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnomalies = async () => {
    setLoading(true);
    
    const { data, error } = await supabase.rpc("get_all_login_anomalies");
    
    if (error) {
      console.error("Error fetching anomalies:", error);
      setLoading(false);
      return;
    }

    setAnomalies((data || []) as Anomaly[]);
    setLoading(false);
  };

  useEffect(() => { fetchAnomalies(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Login Anomaly Detection
          </h2>
          {anomalies.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {anomalies.length} anomalies detected
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={fetchAnomalies} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="bg-yellow-500/5 border-yellow-500/20">
        <CardContent className="p-4 text-sm text-muted-foreground">
          <Shield className="w-4 h-4 inline mr-2 text-yellow-400" />
          Anomalies are detected when users login from countries or cities that differ from their usual patterns.
          At least 3 login sessions are required before anomaly detection activates for a user.
        </CardContent>
      </Card>

      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[160px]">Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Anomaly Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Analyzing login patterns...</TableCell></TableRow>
            ) : anomalies.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                <Shield className="w-8 h-8 mx-auto mb-2 text-primary/40" />
                No login anomalies detected in the last 7 days
              </TableCell></TableRow>
            ) : (
              anomalies.map((anomaly, i) => (
                <motion.tr
                  key={anomaly.session_id}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 bg-yellow-500/5"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {format(new Date(anomaly.created_at), "MMM d, HH:mm:ss")}
                  </TableCell>
                  <TableCell className="font-mono text-sm font-medium">{anomaly.username}</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-destructive" />
                      {anomaly.city && anomaly.country_name ? `${anomaly.city}, ${anomaly.country_name}` : anomaly.country_name || "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{anomaly.ip_address || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-yellow-400 border-yellow-500/30 bg-yellow-500/10 text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {anomaly.reason}
                    </Badge>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AnomalyDetection;
