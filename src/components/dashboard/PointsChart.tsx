import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

interface PointsChartProps {
  data: { date: string; points: number }[];
}

const PointsChart = ({ data }: PointsChartProps) => {
  const maxPoints = Math.max(...data.map(d => d.points), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
      className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5"
    >
      <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        Points Over Time
      </h3>

      <div className="flex items-end gap-1 h-32">
        {data.map((d, i) => {
          const height = (d.points / maxPoints) * 100;
          return (
            <motion.div
              key={d.date}
              className="flex-1 flex flex-col items-center gap-1"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.7 + i * 0.04, duration: 0.4 }}
              style={{ transformOrigin: "bottom" }}
            >
              <div className="relative w-full group">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-primary/40 to-primary/80 group-hover:from-primary/60 group-hover:to-primary transition-colors min-h-[2px]"
                  style={{ height: `${Math.max(height, 2)}%`, minHeight: height > 0 ? "4px" : "2px" }}
                />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono text-primary bg-card border border-primary/20 px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                  {d.points} pts
                </div>
              </div>
              <span className="text-[8px] font-mono text-muted-foreground/60 truncate w-full text-center">
                {d.date.slice(5)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PointsChart;
