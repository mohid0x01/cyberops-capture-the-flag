import { motion } from "framer-motion";
import { Clock, CheckCircle, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface Submission {
  id: string;
  is_correct: boolean;
  points_awarded: number;
  created_at: string;
  is_first_blood?: boolean;
  challenges: {
    title: string;
    category: string;
  } | null;
}

interface RecentActivityProps {
  submissions: Submission[];
}

const RecentActivity = ({ submissions }: RecentActivityProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5"
    >
      <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        Recent Activity
        {submissions.length > 0 && (
          <span className="ml-auto text-[10px] font-mono text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
            {submissions.length} entries
          </span>
        )}
      </h3>

      {submissions.length === 0 ? (
        <div className="text-center py-10">
          <div className="inline-flex p-3 rounded-xl bg-muted/20 mb-3">
            <Target className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-mono text-xs">
            No submissions yet
          </p>
          <Link
            to="/challenges"
            className="inline-flex items-center gap-1 mt-3 text-primary hover:underline font-mono text-xs"
          >
            Start hacking <span className="text-xs">→</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((sub, i) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                sub.is_correct
                  ? "bg-primary/5 hover:bg-primary/10 border border-primary/10"
                  : "bg-destructive/5 hover:bg-destructive/10 border border-destructive/10"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                  sub.is_correct ? "bg-primary/10" : "bg-destructive/10"
                }`}>
                  {sub.is_correct ? (
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Target className="h-3.5 w-3.5 text-destructive" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs font-semibold truncate text-foreground">
                      {sub.challenges?.title || "Unknown"}
                    </p>
                    {sub.is_first_blood && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex-shrink-0">
                        🩸 FIRST
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      {sub.challenges?.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50">•</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              {sub.is_correct && (
                <span className="text-xs font-mono text-primary flex items-center gap-1 flex-shrink-0">
                  <Zap className="h-3 w-3" />
                  +{sub.points_awarded}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default RecentActivity;
