import { motion } from "framer-motion";
import { Radar } from "lucide-react";

interface SkillRadarProps {
  skills: { category: string; solved: number; total: number }[];
}

const SkillRadar = ({ skills }: SkillRadarProps) => {
  const maxVal = Math.max(...skills.map(s => s.total), 1);

  const categoryColors: Record<string, string> = {
    web: "text-primary",
    crypto: "text-yellow-400",
    reverse: "text-violet-400",
    forensics: "text-secondary",
    pwn: "text-rose-400",
    scripting: "text-orange-400",
    misc: "text-muted-foreground",
  };

  const categoryBg: Record<string, string> = {
    web: "bg-primary/20",
    crypto: "bg-yellow-400/20",
    reverse: "bg-violet-400/20",
    forensics: "bg-secondary/20",
    pwn: "bg-rose-400/20",
    scripting: "bg-orange-400/20",
    misc: "bg-muted/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5"
    >
      <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
        <Radar className="h-4 w-4 text-secondary" />
        Skill Matrix
      </h3>

      <div className="space-y-3">
        {skills.map((skill, i) => {
          const pct = skill.total > 0 ? (skill.solved / skill.total) * 100 : 0;
          const color = categoryColors[skill.category] || "text-muted-foreground";
          const bg = categoryBg[skill.category] || "bg-muted/30";

          return (
            <motion.div
              key={skill.category}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.05 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-mono uppercase tracking-wider ${color}`}>
                  {skill.category}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {skill.solved}/{skill.total}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.8 + i * 0.05, duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full ${bg.replace("/20", "")} opacity-80`}
                  style={{ background: `linear-gradient(90deg, hsl(var(--primary) / 0.4), hsl(var(--secondary) / 0.6))` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SkillRadar;
