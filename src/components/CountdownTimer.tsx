import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Flame, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number; }
interface CompetitionSettings { name: string; start_time: string | null; end_time: string | null; is_active: boolean | null; }

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [status, setStatus] = useState<"upcoming" | "active" | "ended">("upcoming");
  const [settings, setSettings] = useState<CompetitionSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("competition_settings").select("name, start_time, end_time, is_active").limit(1).single();
      if (data) setSettings(data);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!settings) return;
    const calculateTimeLeft = () => {
      const now = Date.now();
      const startTime = settings.start_time ? new Date(settings.start_time).getTime() : null;
      const endTime = settings.end_time ? new Date(settings.end_time).getTime() : null;
      if (startTime && now < startTime) { setStatus("upcoming"); const d = startTime - now; return { days: Math.floor(d / 86400000), hours: Math.floor((d % 86400000) / 3600000), minutes: Math.floor((d % 3600000) / 60000), seconds: Math.floor((d % 60000) / 1000) }; }
      else if (endTime && now < endTime) { setStatus("active"); const d = endTime - now; return { days: Math.floor(d / 86400000), hours: Math.floor((d % 86400000) / 3600000), minutes: Math.floor((d % 3600000) / 60000), seconds: Math.floor((d % 60000) / 1000) }; }
      else { setStatus("ended"); return null; }
    };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [settings]);

  if (loading) return (
    <div className="flex items-center justify-center gap-2 text-muted-foreground">
      <Clock className="h-4 w-4 animate-pulse" />
      <span className="font-mono text-sm">Loading...</span>
    </div>
  );

  if (!settings) return null;

  const config = {
    upcoming: { icon: Clock, label: "Competition Starts In", color: "text-secondary", borderColor: "border-secondary/20", bg: "bg-secondary/5" },
    active: { icon: Flame, label: "Competition Ends In", color: "text-primary", borderColor: "border-primary/20", bg: "bg-primary/5" },
    ended: { icon: CheckCircle, label: "Competition Ended", color: "text-muted-foreground", borderColor: "border-border/30", bg: "bg-muted/5" },
  }[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`inline-flex flex-col items-center gap-4 px-8 py-6 rounded-2xl glass border ${config.borderColor}`}
    >
      <div className={`flex items-center gap-2 ${config.color}`}>
        <Icon className="h-4 w-4" />
        <span className="text-[10px] font-mono uppercase tracking-[0.2em]">{config.label}</span>
      </div>

      {timeLeft ? (
        <div className="flex items-center gap-3 md:gap-5">
          {[
            { value: timeLeft.days, label: "Days" },
            { value: timeLeft.hours, label: "Hrs" },
            { value: timeLeft.minutes, label: "Min" },
            { value: timeLeft.seconds, label: "Sec" },
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`glass-card rounded-xl px-3 py-2 min-w-[56px] text-center mb-1.5 ${status === 'active' ? 'animate-glow-pulse' : ''}`}>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={item.value}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`font-display text-2xl md:text-3xl font-black ${config.color} block`}
                  >
                    {String(item.value).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-[9px] font-mono uppercase text-muted-foreground tracking-wider">{item.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="font-display text-xl font-bold text-muted-foreground">Thank you for participating!</div>
      )}

      {settings.name && (
        <div className="text-[10px] font-mono text-muted-foreground/60 tracking-wider">{settings.name}</div>
      )}
    </motion.div>
  );
};

export default CountdownTimer;
