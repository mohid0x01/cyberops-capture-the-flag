import { motion } from "framer-motion";
import { Target, Trophy, Users, FileText, BookOpen, Flag, Layers, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  { label: "Challenges", desc: "Solve CTF challenges", href: "/challenges", icon: Target, color: "text-primary", hoverBorder: "hover:border-primary/40", hoverBg: "hover:bg-primary/5" },
  { label: "Leaderboard", desc: "Global rankings", href: "/leaderboard", icon: Trophy, color: "text-secondary", hoverBorder: "hover:border-secondary/40", hoverBg: "hover:bg-secondary/5" },
  { label: "Teams", desc: "Join or create", href: "/teams", icon: Users, color: "text-violet-400", hoverBorder: "hover:border-violet-400/40", hoverBg: "hover:bg-violet-400/5" },
  { label: "Writeups", desc: "Share solutions", href: "/writeups", icon: FileText, color: "text-orange-400", hoverBorder: "hover:border-orange-400/40", hoverBg: "hover:bg-orange-400/5" },
  { label: "Categories", desc: "Browse by type", href: "/categories", icon: Layers, color: "text-emerald-400", hoverBorder: "hover:border-emerald-400/40", hoverBg: "hover:bg-emerald-400/5" },
  { label: "Rules", desc: "Competition rules", href: "/rules", icon: BookOpen, color: "text-yellow-400", hoverBorder: "hover:border-yellow-400/40", hoverBg: "hover:bg-yellow-400/5" },
  { label: "Report Flag", desc: "Submit issues", href: "/conduct", icon: Flag, color: "text-rose-400", hoverBorder: "hover:border-rose-400/40", hoverBg: "hover:bg-rose-400/5" },
  { label: "Settings", desc: "Account config", href: "/settings", icon: Settings, color: "text-muted-foreground", hoverBorder: "hover:border-muted-foreground/40", hoverBg: "hover:bg-muted/10" },
];

const QuickActions = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5"
    >
      <h3 className="font-display text-sm font-bold text-foreground mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, i) => (
          <Link
            key={action.href}
            to={action.href}
            className={`p-3 rounded-lg border border-border/30 bg-muted/10 ${action.hoverBorder} ${action.hoverBg} transition-all duration-200 group`}
          >
            <action.icon className={`h-5 w-5 ${action.color} mb-1.5 group-hover:scale-110 transition-transform`} />
            <h4 className="font-display text-xs font-bold text-foreground">{action.label}</h4>
            <p className="text-[10px] text-muted-foreground leading-tight">{action.desc}</p>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;
