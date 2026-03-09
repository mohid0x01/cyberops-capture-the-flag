import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp, Flame, Zap, Shield, Star, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StatsGridProps {
  profile: {
    total_points: number;
    challenges_solved: number;
    username: string;
  } | null;
  stats: {
    totalChallenges: number;
    solvedChallenges: number;
    rank: number;
    streak: number;
    accuracy: number;
    avgSolveTime: string;
    firstBloods: number;
    hintsUsed: number;
  };
}

const StatsGrid = ({ profile, stats }: StatsGridProps) => {
  const statCards = [
    {
      label: "Total Points",
      value: profile?.total_points || 0,
      icon: Trophy,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
      borderColor: "border-yellow-400/20",
      glowClass: "shadow-[0_0_20px_hsl(45_100%_60%/0.1)]",
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Challenges Solved",
      value: `${stats.solvedChallenges}/${stats.totalChallenges}`,
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      glowClass: "shadow-[0_0_20px_hsl(var(--neon-green)/0.1)]",
      progress: stats.totalChallenges > 0 ? (stats.solvedChallenges / stats.totalChallenges) * 100 : 0,
    },
    {
      label: "Global Rank",
      value: stats.rank > 0 ? `#${stats.rank}` : "-",
      icon: TrendingUp,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      borderColor: "border-secondary/20",
      glowClass: "shadow-[0_0_20px_hsl(var(--neon-cyan)/0.1)]",
      trend: "↑ 3",
      trendUp: true,
    },
    {
      label: "Day Streak",
      value: stats.streak,
      icon: Flame,
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
      borderColor: "border-orange-400/20",
      glowClass: "shadow-[0_0_20px_hsl(25_100%_55%/0.1)]",
      suffix: "🔥",
    },
    {
      label: "Accuracy",
      value: `${stats.accuracy}%`,
      icon: Zap,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      borderColor: "border-emerald-400/20",
      glowClass: "shadow-[0_0_20px_hsl(160_100%_40%/0.1)]",
      progress: stats.accuracy,
    },
    {
      label: "Avg Solve Time",
      value: stats.avgSolveTime,
      icon: Clock,
      color: "text-violet-400",
      bgColor: "bg-violet-400/10",
      borderColor: "border-violet-400/20",
      glowClass: "shadow-[0_0_20px_hsl(280_100%_60%/0.1)]",
    },
    {
      label: "First Bloods",
      value: stats.firstBloods,
      icon: Star,
      color: "text-rose-400",
      bgColor: "bg-rose-400/10",
      borderColor: "border-rose-400/20",
      glowClass: "shadow-[0_0_20px_hsl(330_100%_60%/0.1)]",
      suffix: "💉",
    },
    {
      label: "Security Rating",
      value: "A+",
      icon: Shield,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      glowClass: "shadow-[0_0_20px_hsl(var(--neon-green)/0.1)]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
          className={`relative overflow-hidden p-5 rounded-xl border ${stat.borderColor} bg-card/80 backdrop-blur-sm ${stat.glowClass} hover:scale-[1.02] transition-transform duration-300 group`}
        >
          {/* Subtle shimmer overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className={`inline-flex p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              {stat.trend && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${stat.trendUp ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"}`}>
                  {stat.trend}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-bold text-foreground">
                {stat.value}
              </span>
              {stat.suffix && <span className="text-sm">{stat.suffix}</span>}
            </div>

            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
              {stat.label}
            </div>

            {stat.progress !== undefined && (
              <div className="mt-3">
                <Progress value={stat.progress} className="h-1.5 bg-muted/30" />
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsGrid;
