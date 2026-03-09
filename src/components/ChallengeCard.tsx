import { motion } from "framer-motion";
import { LucideIcon, Users, Flame } from "lucide-react";

interface ChallengeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  difficulty: "Easy" | "Medium" | "Hard" | "Insane";
  points: number;
  solves: number;
  index: number;
}

const difficultyConfig = {
  Easy: { color: "text-primary", border: "border-primary/30", bg: "bg-primary/10", glow: "group-hover:shadow-[0_0_30px_hsl(var(--neon-green)/0.15)]" },
  Medium: { color: "text-secondary", border: "border-secondary/30", bg: "bg-secondary/10", glow: "group-hover:shadow-[0_0_30px_hsl(var(--neon-cyan)/0.15)]" },
  Hard: { color: "text-neon-orange", border: "border-neon-orange/30", bg: "bg-neon-orange/10", glow: "group-hover:shadow-[0_0_30px_hsl(var(--neon-orange)/0.15)]" },
  Insane: { color: "text-destructive", border: "border-destructive/30", bg: "bg-destructive/10", glow: "group-hover:shadow-[0_0_30px_hsl(var(--destructive)/0.15)]" },
};

const ChallengeCard = ({ title, description, icon: Icon, difficulty, points, solves, index }: ChallengeCardProps) => {
  const config = difficultyConfig[difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className={`group relative overflow-hidden rounded-xl glass-card p-6 transition-all duration-500 hover:border-primary/40 ${config.glow} cursor-pointer`}
    >
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      
      {/* Gradient accent top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <motion.div 
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
            className={`p-3 rounded-xl ${config.bg} border ${config.border} group-hover:animate-glow-pulse transition-all`}
          >
            <Icon className={`h-6 w-6 ${config.color}`} />
          </motion.div>
          <span className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-[0.15em] border ${config.border} ${config.bg} ${config.color} font-bold`}>
            {difficulty}
          </span>
        </div>

        {/* Content */}
        <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-gradient transition-all duration-300">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">
                <span className="text-primary font-bold">{points}</span> pts
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-secondary" />
              <span className="text-xs font-mono text-muted-foreground">
                <span className="text-secondary font-bold">{solves}</span> solves
              </span>
            </div>
          </div>
          <span className="text-xs font-mono uppercase tracking-wider text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            Attempt →
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ChallengeCard;
