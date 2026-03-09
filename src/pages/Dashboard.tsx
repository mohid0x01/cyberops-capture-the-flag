import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Shield, Activity } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Announcements from "@/components/Announcements";
import StatsGrid from "@/components/dashboard/StatsGrid";
import SkillRadar from "@/components/dashboard/SkillRadar";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import PointsChart from "@/components/dashboard/PointsChart";
import AchievementBadges from "@/components/dashboard/AchievementBadges";
import LiveFeed from "@/components/dashboard/LiveFeed";

interface Submission {
  id: string;
  is_correct: boolean;
  points_awarded: number;
  created_at: string;
  is_first_blood?: boolean;
  challenges: { title: string; category: string } | null;
}

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState({
    totalChallenges: 0,
    solvedChallenges: 0,
    rank: 0,
    streak: 7,
    accuracy: 0,
    avgSolveTime: "~15m",
    firstBloods: 0,
    hintsUsed: 0,
  });
  const [skills, setSkills] = useState<{ category: string; solved: number; total: number }[]>([]);
  const [pointsHistory, setPointsHistory] = useState<{ date: string; points: number }[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Recent submissions
      const { data: submissions } = await supabase
        .from("submissions")
        .select("id, is_correct, points_awarded, created_at, is_first_blood, challenges(title, category)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8);

      if (submissions) setRecentSubmissions(submissions as Submission[]);

      // All user submissions for accuracy
      const { data: allSubs } = await supabase
        .from("submissions")
        .select("is_correct, points_awarded, created_at, is_first_blood, challenges(category)")
        .eq("user_id", user.id);

      const totalAttempts = allSubs?.length || 0;
      const correctAttempts = allSubs?.filter(s => s.is_correct).length || 0;
      const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
      const firstBloods = allSubs?.filter(s => s.is_first_blood).length || 0;

      // Challenge counts
      const { count: totalCount } = await supabase
        .from("challenges")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Rank
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("id, total_points")
        .order("total_points", { ascending: false });

      const userRank = allProfiles?.findIndex(p => p.id === profile?.id) ?? -1;

      // Skills by category
      const { data: challengeList } = await supabase
        .from("challenges_public")
        .select("id, category")
        .eq("is_active", true);

      const categoryCounts: Record<string, { total: number; solved: number }> = {};
      challengeList?.forEach(c => {
        if (!c.category) return;
        if (!categoryCounts[c.category]) categoryCounts[c.category] = { total: 0, solved: 0 };
        categoryCounts[c.category].total++;
      });

      const solvedChallengeIds = new Set(
        allSubs?.filter(s => s.is_correct).map(s => {
          const cat = (s.challenges as any)?.category;
          return cat;
        })
      );

      // Count solved per category from correct submissions
      allSubs?.filter(s => s.is_correct).forEach(s => {
        const cat = (s.challenges as any)?.category;
        if (cat && categoryCounts[cat]) categoryCounts[cat].solved++;
      });

      setSkills(
        Object.entries(categoryCounts).map(([category, v]) => ({ category, ...v }))
      );

      // Points history (last 14 days aggregation)
      const now = new Date();
      const history: { date: string; points: number }[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const dayPoints = allSubs
          ?.filter(s => s.is_correct && s.created_at?.startsWith(dateStr))
          .reduce((sum, s) => sum + (s.points_awarded || 0), 0) || 0;
        history.push({ date: dateStr, points: dayPoints });
      }
      setPointsHistory(history);

      // Hints used
      const { count: hintsCount } = await supabase
        .from("hint_unlocks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setStats({
        totalChallenges: totalCount || 0,
        solvedChallenges: profile?.challenges_solved || 0,
        rank: userRank + 1,
        streak: 7,
        accuracy,
        avgSolveTime: "~15m",
        firstBloods,
        hintsUsed: hintsCount || 0,
      });
    };

    fetchData();
  }, [user, profile]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
                System Online
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Welcome back, <span className="text-gradient">{profile?.username || "Operator"}</span>
            </h1>
            <p className="text-muted-foreground font-mono text-xs mt-1 flex items-center gap-2">
              <Terminal className="h-3 w-3" />
              <span>~/dashboard</span>
              <span className="text-primary animate-terminal-blink">▋</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/30 bg-card/50">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-mono text-muted-foreground">SEC LEVEL</span>
              <span className="text-xs font-mono font-bold text-primary">A+</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/30 bg-card/50">
              <Activity className="h-3.5 w-3.5 text-secondary" />
              <span className="text-[10px] font-mono text-muted-foreground">UPTIME</span>
              <span className="text-xs font-mono font-bold text-secondary">99.9%</span>
            </div>
          </div>
        </motion.div>

        {/* Announcements */}
        <Announcements />

        {/* Stats Grid - 8 cards */}
        <StatsGrid profile={profile} stats={stats} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left column - 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            <RecentActivity submissions={recentSubmissions} />
            <PointsChart data={pointsHistory} />
            <AchievementBadges
              solvedCount={stats.solvedChallenges}
              totalPoints={profile?.total_points || 0}
              firstBloods={stats.firstBloods}
            />
          </div>

          {/* Right column - 1/3 */}
          <div className="space-y-4">
            <QuickActions />
            <SkillRadar skills={skills} />
            <LiveFeed />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
