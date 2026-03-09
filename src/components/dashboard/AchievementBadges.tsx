import { motion } from "framer-motion";
import { Award } from "lucide-react";

interface AchievementBadgesProps {
  solvedCount: number;
  totalPoints: number;
  firstBloods: number;
}

const AchievementBadges = ({ solvedCount, totalPoints, firstBloods }: AchievementBadgesProps) => {
  const badges = [
    { name: "First Step", desc: "Solve 1 challenge", earned: solvedCount >= 1, icon: "🏁" },
    { name: "Pentester", desc: "Solve 5 challenges", earned: solvedCount >= 5, icon: "🔓" },
    { name: "Hacker", desc: "Solve 10 challenges", earned: solvedCount >= 10, icon: "💻" },
    { name: "Elite", desc: "Solve 25 challenges", earned: solvedCount >= 25, icon: "⚡" },
    { name: "Legend", desc: "Solve 50 challenges", earned: solvedCount >= 50, icon: "👑" },
    { name: "Centurion", desc: "Earn 1000 points", earned: totalPoints >= 1000, icon: "🏛️" },
    { name: "First Blood", desc: "Get a first blood", earned: firstBloods >= 1, icon: "🩸" },
    { name: "Serial Killer", desc: "5 first bloods", earned: firstBloods >= 5, icon: "💀" },
    { name: "Polyglot", desc: "Solve all categories", earned: false, icon: "🌐" },
    { name: "Streak Master", desc: "7-day streak", earned: false, icon: "🔥" },
    { name: "Night Owl", desc: "Solve after midnight", earned: false, icon: "🦉" },
    { name: "Speed Demon", desc: "Solve in <2 min", earned: false, icon: "⏱️" },
  ];

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
          <Award className="h-4 w-4 text-yellow-400" />
          Achievements
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
          {earnedCount}/{badges.length}
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + i * 0.03 }}
            className={`group relative flex flex-col items-center p-2 rounded-lg border transition-all cursor-default ${
              badge.earned
                ? "border-yellow-400/30 bg-yellow-400/5 hover:bg-yellow-400/10"
                : "border-border/20 bg-muted/5 opacity-40 grayscale"
            }`}
          >
            <span className="text-xl mb-0.5">{badge.icon}</span>
            <span className="text-[8px] font-mono text-center leading-tight text-foreground">
              {badge.name}
            </span>

            {/* Tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
              <div className="text-[9px] font-mono text-foreground bg-card border border-border px-2 py-1 rounded whitespace-nowrap shadow-lg">
                {badge.desc}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AchievementBadges;
