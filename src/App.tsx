import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CompetitionProvider } from "@/contexts/CompetitionContext";
import { AnimatePresence, motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import ProtectedRoute from "@/components/ProtectedRoute";
import LiveNotifications from "@/components/LiveNotifications";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Challenges from "./pages/Challenges";
import ChallengeDetail from "./pages/ChallengeDetail";
import LeaderboardPage from "./pages/LeaderboardPage";
import Teams from "./pages/Teams";
import Writeups from "./pages/Writeups";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Categories from "./pages/Categories";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Rules from "./pages/Rules";
import Conduct from "./pages/Conduct";
import NotFound from "./pages/NotFound";
import Maintenance from "./pages/Maintenance";

const queryClient = new QueryClient();

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.2, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { settings, loading } = useSiteSettings();

  const maintenanceOn = settings.maintenance_mode.enabled && !isAdmin;
  const toggles = settings.feature_toggles;

  // Show maintenance page for non-admin users when enabled
  if (!loading && maintenanceOn && !["/login", "/admin"].includes(location.pathname)) {
    return <Maintenance message={settings.maintenance_mode.message} />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        {toggles.registration && (
          <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        )}
        <Route path="/dashboard" element={<PageTransition><ProtectedRoute><Dashboard /><LiveNotifications /></ProtectedRoute></PageTransition>} />
        <Route path="/challenges" element={<PageTransition><ProtectedRoute><Challenges /><LiveNotifications /></ProtectedRoute></PageTransition>} />
        <Route path="/challenges/:id" element={<PageTransition><ProtectedRoute><ChallengeDetail /><LiveNotifications /></ProtectedRoute></PageTransition>} />
        <Route path="/categories" element={<PageTransition><ProtectedRoute><Categories /><LiveNotifications /></ProtectedRoute></PageTransition>} />
        {toggles.leaderboard && (
          <Route path="/leaderboard" element={<PageTransition><ProtectedRoute><LeaderboardPage /><LiveNotifications /></ProtectedRoute></PageTransition>} />
        )}
        {toggles.teams && (
          <Route path="/teams" element={<PageTransition><ProtectedRoute><Teams /><LiveNotifications /></ProtectedRoute></PageTransition>} />
        )}
        {toggles.writeups && (
          <Route path="/writeups" element={<PageTransition><ProtectedRoute><Writeups /><LiveNotifications /></ProtectedRoute></PageTransition>} />
        )}
        <Route path="/settings" element={<PageTransition><ProtectedRoute><Settings /></ProtectedRoute></PageTransition>} />
        <Route path="/profile" element={<PageTransition><ProtectedRoute><Profile /><LiveNotifications /></ProtectedRoute></PageTransition>} />
        <Route path="/profile/:userId" element={<PageTransition><ProtectedRoute><Profile /><LiveNotifications /></ProtectedRoute></PageTransition>} />
        <Route path="/admin" element={<PageTransition><ProtectedRoute requireAdmin><Admin /></ProtectedRoute></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/rules" element={<PageTransition><Rules /></PageTransition>} />
        <Route path="/conduct" element={<PageTransition><Conduct /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CompetitionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </CompetitionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
