import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, Trophy, Target, Flag, Clock, Edit2, 
  Camera, Users, MapPin, Calendar, Award
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProfileData {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  country: string | null;
  team_id: string | null;
  total_points: number;
  challenges_solved: number;
  rank: number | null;
  created_at: string;
}

interface SolvedChallenge {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  points: number;
  solved_at: string;
  is_first_blood: boolean;
}

interface Team {
  id: string;
  name: string;
  avatar_url: string | null;
}

const difficultyColors: Record<string, string> = {
  easy: "text-green-400 bg-green-500/10",
  medium: "text-yellow-400 bg-yellow-500/10",
  hard: "text-orange-400 bg-orange-500/10",
  insane: "text-red-400 bg-red-500/10",
};

const categoryColors: Record<string, string> = {
  web: "text-blue-400",
  crypto: "text-purple-400",
  reverse: "text-pink-400",
  forensics: "text-teal-400",
  pwn: "text-red-400",
  scripting: "text-yellow-400",
  misc: "text-gray-400",
};

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, profile: currentUserProfile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [solvedChallenges, setSolvedChallenges] = useState<SolvedChallenge[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [editForm, setEditForm] = useState({
    display_name: "",
    bio: "",
    country: "",
  });

  const isOwnProfile = user?.id === profileData?.user_id;
  const targetUserId = userId || user?.id;

  const fetchProfile = async () => {
    if (!targetUserId) return;

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (profile) {
      setProfileData(profile as ProfileData);
      setEditForm({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        country: profile.country || "",
      });

      // Fetch team if exists
      if (profile.team_id) {
        const { data: teamData } = await supabase
          .from("teams")
          .select("id, name, avatar_url")
          .eq("id", profile.team_id)
          .maybeSingle();
        if (teamData) setTeam(teamData);
      }
    }

    // Fetch solved challenges
    const { data: submissions } = await supabase
      .from("submissions")
      .select("challenge_id, created_at, is_first_blood, challenges(id, title, category, difficulty, points)")
      .eq("user_id", targetUserId)
      .eq("is_correct", true)
      .order("created_at", { ascending: false });

    if (submissions) {
      setSolvedChallenges(
        submissions.map((s: any) => ({
          id: s.challenges?.id || "",
          title: s.challenges?.title || "Unknown",
          category: s.challenges?.category || "misc",
          difficulty: s.challenges?.difficulty || "easy",
          points: s.challenges?.points || 0,
          solved_at: s.created_at,
          is_first_blood: s.is_first_blood || false,
        }))
      );
    }

    // Get total challenges count
    const { count } = await supabase
      .from("challenges")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);
    setTotalChallenges(count || 0);

    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [targetUserId, user]);

  const handleSave = async () => {
    if (!user || !isOwnProfile) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: editForm.display_name || null,
        bio: editForm.bio || null,
        country: editForm.country || null,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Profile updated!");
    setIsEditing(false);
    await refreshProfile();
    fetchProfile();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    setUploading(true);

    // Delete old avatar if exists
    await supabase.storage.from("avatars").remove([`${user.id}/avatar.png`, `${user.id}/avatar.jpg`, `${user.id}/avatar.jpeg`, `${user.id}/avatar.webp`]);

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error(uploadError.message);
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    // Update profile
    await supabase
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl })
      .eq("user_id", user.id);

    toast.success("Avatar updated!");
    setUploading(false);
    await refreshProfile();
    fetchProfile();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profileData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground font-mono">User not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/leaderboard")}>
            Back to Leaderboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const completionPercentage = totalChallenges > 0 
    ? Math.round((solvedChallenges.length / totalChallenges) * 100) 
    : 0;

  // Category breakdown
  const categoryStats = solvedChallenges.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Profile Header */}
          <div className="rounded-xl border border-border bg-card p-6 mb-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/50 flex items-center justify-center overflow-hidden">
                  {profileData.avatar_url ? (
                    <img 
                      src={profileData.avatar_url} 
                      alt={profileData.username} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-display font-bold text-primary">
                      {profileData.username[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                {isOwnProfile && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      disabled={uploading}
                    >
                      <Camera className="h-6 w-6 text-white" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                      {profileData.display_name || profileData.username}
                      {profileData.rank && profileData.rank <= 3 && (
                        <Trophy className={`h-5 w-5 ${
                          profileData.rank === 1 ? "text-yellow-400" :
                          profileData.rank === 2 ? "text-gray-400" : "text-amber-600"
                        }`} />
                      )}
                    </h1>
                    <p className="text-muted-foreground font-mono">@{profileData.username}</p>
                  </div>
                  {isOwnProfile && !isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label className="text-xs font-mono uppercase text-muted-foreground">Display Name</Label>
                      <Input
                        value={editForm.display_name}
                        onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-mono uppercase text-muted-foreground">Bio</Label>
                      <Textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className="mt-1"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-mono uppercase text-muted-foreground">Country</Label>
                      <Input
                        value={editForm.country}
                        onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                        className="mt-1"
                        placeholder="🇺🇸 USA"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="hero" onClick={handleSave}>Save</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {profileData.bio && (
                      <p className="mt-3 text-sm text-muted-foreground">{profileData.bio}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                      {profileData.country && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {profileData.country}
                        </span>
                      )}
                      {team && (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {team.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {new Date(profileData.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-primary">{profileData.total_points}</div>
                <div className="text-xs font-mono text-muted-foreground uppercase">Points</div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-foreground">{solvedChallenges.length}</div>
                <div className="text-xs font-mono text-muted-foreground uppercase">Solved</div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-foreground">#{profileData.rank || "—"}</div>
                <div className="text-xs font-mono text-muted-foreground uppercase">Rank</div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-yellow-400">
                  {solvedChallenges.filter(c => c.is_first_blood).length}
                </div>
                <div className="text-xs font-mono text-muted-foreground uppercase">First Bloods</div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="rounded-xl border border-border bg-card p-6 mb-6">
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Challenge Progress
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-mono">{solvedChallenges.length} / {totalChallenges} challenges</span>
                <span className="font-mono text-primary">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>

            {/* Category Breakdown */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(categoryStats).map(([category, count]) => (
                <div key={category} className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className={`text-xs font-mono uppercase ${categoryColors[category] || "text-foreground"}`}>
                    {category}
                  </div>
                  <div className="font-display text-xl font-bold text-foreground">{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Solved Challenges */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" />
              Solved Challenges
            </h2>
            {solvedChallenges.length === 0 ? (
              <p className="text-muted-foreground font-mono text-center py-8">No challenges solved yet</p>
            ) : (
              <div className="space-y-2">
                {solvedChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    onClick={() => navigate(`/challenges/${challenge.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {challenge.is_first_blood && (
                        <span title="First Blood">
                          <Award className="h-4 w-4 text-red-400" />
                        </span>
                      )}
                      <div>
                        <div className="font-mono font-semibold text-foreground">{challenge.title}</div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`uppercase ${categoryColors[challenge.category]}`}>
                            {challenge.category}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className={difficultyColors[challenge.difficulty]?.split(" ")[0]}>
                            {challenge.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-primary">+{challenge.points}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {new Date(challenge.solved_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
