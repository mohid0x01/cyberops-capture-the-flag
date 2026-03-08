import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Search, Clock, MapPin, Shield, Target, AlertTriangle, CheckCircle, XCircle, Ban, Globe, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface TimelineEvent {
  id: string;
  type: "audit" | "session" | "submission";
  event_type?: string;
  timestamp: string;
  details: Record<string, any>;
}

interface UserProfile {
  user_id: string;
  username: string;
  display_name: string | null;
  total_points: number | null;
  challenges_solved: number | null;
  is_banned: boolean;
  ban_reason: string | null;
  country: string | null;
  created_at: string | null;
}

const EVENT_ICONS: Record<string, typeof Shield> = {
  FLAG_CORRECT: CheckCircle,
  FLAG_INCORRECT: XCircle,
  RATE_LIMIT_HIT: Clock,
  SCORE_MANIPULATION_BLOCKED: AlertTriangle,
  USER_BANNED: Ban,
  USER_UNBANNED: Shield,
  BANNED_USER_ATTEMPT: AlertTriangle,
  session: Globe,
  submission: Target,
};

const EVENT_COLORS: Record<string, string> = {
  FLAG_CORRECT: "text-primary border-primary/30 bg-primary/10",
  FLAG_INCORRECT: "text-muted-foreground border-muted/30 bg-muted/10",
  RATE_LIMIT_HIT: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  SCORE_MANIPULATION_BLOCKED: "text-destructive border-destructive/30 bg-destructive/10",
  USER_BANNED: "text-destructive border-destructive/30 bg-destructive/10",
  USER_UNBANNED: "text-primary border-primary/30 bg-primary/10",
  BANNED_USER_ATTEMPT: "text-destructive border-destructive/30 bg-destructive/10",
  session: "text-secondary border-secondary/30 bg-secondary/10",
  submission_correct: "text-primary border-primary/30 bg-primary/10",
  submission_incorrect: "text-muted-foreground border-muted/30 bg-muted/10",
};

const UserActivityTimeline = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from("profiles").select("user_id, username, display_name, total_points, challenges_solved, is_banned, ban_reason, country, created_at").order("username");
      if (data) setUsers(data as UserProfile[]);
    };
    fetchUsers();
  }, []);

  const fetchTimeline = async (userId: string) => {
    setLoading(true);
    const profile = users.find(u => u.user_id === userId) || null;
    setSelectedProfile(profile);

    const [auditResult, sessionResult, submissionResult] = await Promise.all([
      supabase.from("audit_logs").select("*").or(`user_id.eq.${userId},target_user_id.eq.${userId}`).order("created_at", { ascending: false }).limit(200),
      supabase.from("user_sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
      supabase.from("submissions").select("*, challenges:challenge_id(title)").eq("user_id", userId).order("created_at", { ascending: false }).limit(200),
    ]);

    // Get challenge titles for audit logs
    const challengeIds = [...new Set((auditResult.data || []).map(l => l.challenge_id).filter(Boolean))];
    let challengeMap = new Map<string, string>();
    if (challengeIds.length > 0) {
      const { data: challenges } = await supabase.from("challenges").select("id, title").in("id", challengeIds);
      challengeMap = new Map((challenges || []).map(c => [c.id, c.title]));
    }

    const events: TimelineEvent[] = [];

    (auditResult.data || []).forEach(log => {
      events.push({
        id: `audit-${log.id}`,
        type: "audit",
        event_type: log.event_type,
        timestamp: log.created_at || new Date().toISOString(),
        details: {
          ...(log.details as Record<string, any> || {}),
          challenge_title: log.challenge_id ? challengeMap.get(log.challenge_id) : null,
          ip_address: log.ip_address,
        },
      });
    });

    (sessionResult.data || []).forEach(session => {
      events.push({
        id: `session-${session.id}`,
        type: "session",
        event_type: "session",
        timestamp: session.created_at,
        details: {
          ip_address: session.ip_address,
          country_name: session.country_name,
          city: session.city,
          country_code: session.country_code,
        },
      });
    });

    (submissionResult.data || []).forEach(sub => {
      events.push({
        id: `sub-${sub.id}`,
        type: "submission",
        event_type: sub.is_correct ? "FLAG_CORRECT" : "FLAG_INCORRECT",
        timestamp: sub.created_at || new Date().toISOString(),
        details: {
          challenge_title: (sub as any).challenges?.title || "Unknown",
          points_awarded: sub.points_awarded,
          is_first_blood: sub.is_first_blood,
          submitted_flag: sub.is_correct ? null : sub.submitted_flag?.substring(0, 20) + "...",
        },
      });
    });

    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setTimeline(events);
    setLoading(false);
  };

  const filteredUsers = users.filter(u =>
    !searchTerm || u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventDescription = (event: TimelineEvent): string => {
    const d = event.details;
    switch (event.event_type) {
      case "FLAG_CORRECT": return `Solved "${d.challenge_title}" (+${d.points_awarded} pts)${d.is_first_blood ? " 🩸 FIRST BLOOD" : ""}`;
      case "FLAG_INCORRECT": return `Wrong flag for "${d.challenge_title}"`;
      case "RATE_LIMIT_HIT": return `Rate limited (${d.attempts} attempts)`;
      case "SCORE_MANIPULATION_BLOCKED": return `Score manipulation blocked (${d.attempted_points} pts attempted)`;
      case "USER_BANNED": return `Banned: ${d.reason || "No reason"}`;
      case "USER_UNBANNED": return "Unbanned";
      case "BANNED_USER_ATTEMPT": return `Attempted action while banned`;
      case "session": return `Login from ${d.city || ""} ${d.country_name || "Unknown location"} (${d.ip_address || "?"})`;
      default: return event.event_type || "Unknown event";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" /> User Investigation Timeline
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        {/* User Selector */}
        <div className="space-y-3">
          <Input placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="mb-2" />
          <ScrollArea className="h-[500px] border border-border rounded-lg">
            {filteredUsers.map(user => (
              <button
                key={user.user_id}
                onClick={() => { setSelectedUserId(user.user_id); fetchTimeline(user.user_id); }}
                className={`w-full text-left p-3 border-b border-border/30 hover:bg-muted/30 transition-colors flex items-center justify-between ${selectedUserId === user.user_id ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}
              >
                <div>
                  <div className="font-mono text-sm font-medium flex items-center gap-2">
                    {user.username}
                    {user.is_banned && <Badge variant="destructive" className="text-[10px] py-0 px-1"><Ban className="w-2.5 h-2.5" /></Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">{user.total_points || 0} pts · {user.challenges_solved || 0} solves</div>
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Timeline */}
        <div className="md:col-span-2 space-y-3">
          {selectedProfile && (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-display font-bold flex items-center gap-2">
                        {selectedProfile.username}
                        {selectedProfile.is_banned && <Badge variant="destructive">BANNED</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {selectedProfile.total_points || 0} pts · {selectedProfile.challenges_solved || 0} solves · Joined {selectedProfile.created_at ? format(new Date(selectedProfile.created_at), "MMM d, yyyy") : "Unknown"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {timeline.length} events loaded
                  </div>
                </div>
                {selectedProfile.ban_reason && (
                  <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                    Ban reason: {selectedProfile.ban_reason}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <ScrollArea className="h-[450px]">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading timeline...</div>
            ) : timeline.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {selectedUserId ? "No activity found for this user" : "Select a user to view their activity timeline"}
              </div>
            ) : (
              <div className="relative pl-6 space-y-0">
                <div className="absolute left-2.5 top-0 bottom-0 w-px bg-border" />
                {timeline.map((event, i) => {
                  const Icon = EVENT_ICONS[event.event_type || ""] || Shield;
                  const colorKey = event.type === "submission" ? (event.event_type === "FLAG_CORRECT" ? "submission_correct" : "submission_incorrect") : (event.event_type || "session");
                  const colors = EVENT_COLORS[colorKey] || "text-muted-foreground border-border/30 bg-muted/10";

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.01 }}
                      className="relative flex items-start gap-3 pb-3"
                    >
                      <div className={`absolute -left-3.5 w-5 h-5 rounded-full border flex items-center justify-center ${colors}`}>
                        <Icon className="w-2.5 h-2.5" />
                      </div>
                      <div className="flex-1 min-w-0 pl-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">
                            {format(new Date(event.timestamp), "MMM d, HH:mm:ss")}
                          </span>
                          <Badge variant="outline" className={`text-[10px] py-0 ${colors}`}>
                            {event.type}
                          </Badge>
                        </div>
                        <p className="text-sm mt-0.5">{getEventDescription(event)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default UserActivityTimeline;
