import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Zap, Flag, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface FeedEvent {
  id: string;
  type: "solve" | "first_blood" | "join";
  username: string;
  challenge?: string;
  points?: number;
  time: string;
}

const LiveFeed = () => {
  const [events, setEvents] = useState<FeedEvent[]>([]);

  useEffect(() => {
    // Load recent correct submissions as feed
    const load = async () => {
      const { data } = await supabase
        .from("submissions")
        .select("id, is_correct, is_first_blood, points_awarded, created_at, challenges(title)")
        .eq("is_correct", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (data) {
        setEvents(data.map(s => ({
          id: s.id,
          type: s.is_first_blood ? "first_blood" : "solve",
          username: "Player",
          challenge: (s.challenges as any)?.title || "Unknown",
          points: s.points_awarded || 0,
          time: s.created_at || "",
        })));
      }
    };
    load();
  }, []);

  const icons = {
    solve: <Zap className="h-3 w-3 text-primary" />,
    first_blood: <Flag className="h-3 w-3 text-rose-400" />,
    join: <UserPlus className="h-3 w-3 text-secondary" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65 }}
      className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5"
    >
      <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
        <Radio className="h-4 w-4 text-rose-400 animate-pulse" />
        Live Feed
      </h3>

      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground font-mono text-center py-6">
          No recent activity
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <AnimatePresence>
            {events.map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.04 }}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors"
              >
                <div className="p-1 rounded bg-muted/20">
                  {icons[ev.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono truncate text-foreground">
                    {ev.type === "first_blood" && <span className="text-rose-400">🩸 </span>}
                    <span className="text-muted-foreground">solved</span>{" "}
                    <span className="text-primary">{ev.challenge}</span>
                  </p>
                </div>
                {ev.points && (
                  <span className="text-[9px] font-mono text-primary flex-shrink-0">
                    +{ev.points}
                  </span>
                )}
                <span className="text-[8px] text-muted-foreground/50 flex-shrink-0">
                  {ev.time && formatDistanceToNow(new Date(ev.time), { addSuffix: true })}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default LiveFeed;
