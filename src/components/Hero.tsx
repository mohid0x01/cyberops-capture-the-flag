import { motion, useMotionValue, useTransform } from "framer-motion";
import { ChevronRight, Terminal, Zap, Shield, Cpu, Wifi, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import CountdownTimer from "./CountdownTimer";

const floatingIcons = [
  { icon: Shield, x: "10%", y: "20%", delay: 0, size: 20 },
  { icon: Cpu, x: "85%", y: "15%", delay: 1.5, size: 16 },
  { icon: Wifi, x: "75%", y: "70%", delay: 0.8, size: 18 },
  { icon: Lock, x: "15%", y: "75%", delay: 2, size: 14 },
  { icon: Terminal, x: "90%", y: "45%", delay: 0.5, size: 16 },
];

const MatrixColumn = ({ delay, left }: { delay: number; left: string }) => {
  const chars = "01アイウエオカキクケコ";
  const [text, setText] = useState("");
  
  useEffect(() => {
    const interval = setInterval(() => {
      setText(prev => {
        const newChar = chars[Math.floor(Math.random() * chars.length)];
        const next = prev + newChar;
        return next.length > 20 ? next.slice(-20) : next;
      });
    }, 100 + delay * 50);
    return () => clearInterval(interval);
  }, [delay]);

  return (
    <div 
      className="absolute top-0 font-mono text-xs text-primary/20 leading-none whitespace-pre-wrap w-3 overflow-hidden pointer-events-none select-none"
      style={{ left, animationDelay: `${delay}s` }}
    >
      {text.split('').map((char, i) => (
        <span key={i} className="block" style={{ opacity: (i + 1) / text.length }}>{char}</span>
      ))}
    </div>
  );
};

const Hero = () => {
  const [stats, setStats] = useState({ activeHackers: 0, challenges: 0, prizes: "$50K" });
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
    });
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: hackersCount }, { count: challengesCount }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("challenges_public").select("*", { count: "exact", head: true }).eq("is_active", true),
      ]);
      setStats({ activeHackers: hackersCount || 0, challenges: challengesCount || 0, prizes: "$50K" });
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid"
      onMouseMove={handleMouseMove}
    >
      {/* Layered background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Hero gradient */}
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        
        {/* Animated orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.05, 0.08, 0.05] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'hsl(var(--neon-cyan) / 0.08)' }}
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full blur-[80px]"
          style={{ background: 'hsl(var(--neon-purple) / 0.06)' }}
        />

        {/* Matrix rain columns */}
        {Array.from({ length: 8 }).map((_, i) => (
          <MatrixColumn key={i} delay={i * 0.5} left={`${10 + i * 11}%`} />
        ))}
      </div>

      {/* Scanlines overlay */}
      <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-30" />

      {/* Floating icons */}
      {floatingIcons.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{ left: item.x, top: item.y }}
            animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: item.delay }}
          >
            <Icon 
              size={item.size} 
              className="text-primary/10" 
              style={{ filter: 'drop-shadow(0 0 4px hsl(var(--neon-green) / 0.2))' }}
            />
          </motion.div>
        );
      })}

      {/* Mouse-reactive spotlight */}
      <div 
        className="absolute pointer-events-none w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle, hsl(var(--neon-green) / 0.04) 0%, transparent 70%)',
          left: `calc(50% + ${mousePos.x * 3}px - 300px)`,
          top: `calc(50% + ${mousePos.y * 3}px - 300px)`,
        }}
      />

      <div className="container mx-auto px-4 pt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Terminal badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass mb-8"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Season 2 Now Live
            </span>
          </motion.div>

          {/* Main heading with glitch effect */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-black mb-6 leading-[1.1] tracking-tight">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-foreground inline-block"
            >
              Hack.
            </motion.span>{" "}
            <motion.span
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gradient glow-text animate-flicker inline-block"
            >
              Learn.
            </motion.span>{" "}
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="text-foreground inline-block"
            >
              Dominate.
            </motion.span>
          </h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Join the elite ranks of{" "}
            <span className="text-primary font-semibold glow-text">CyberOps Official</span>.
            Test your skills across web exploitation, cryptography, reverse engineering, and forensics.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="hero" size="xl" asChild className="relative group">
              <Link to="/signup">
                <span className="absolute inset-0 rounded-md bg-primary/20 blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
                <Zap className="mr-2 h-5 w-5 relative z-10" />
                <span className="relative z-10">Start Hacking</span>
                <ChevronRight className="ml-2 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild className="relative group overflow-hidden">
              <Link to="/login?redirect=/challenges">
                <span className="absolute inset-0 bg-primary/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                <Terminal className="mr-2 h-5 w-5 relative z-10" />
                <span className="relative z-10">View Challenges</span>
              </Link>
            </Button>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-12"
          >
            <CountdownTimer />
          </motion.div>

          {/* Stats bar with glass cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-16 pb-20 grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto"
          >
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-5 text-center">
                  <Skeleton className="h-10 w-20 mx-auto mb-2 bg-primary/10" />
                  <Skeleton className="h-4 w-24 mx-auto bg-muted/20" />
                </div>
              ))
            ) : (
              [
                { value: stats.activeHackers.toLocaleString(), label: "Active Hackers", color: "text-primary" },
                { value: stats.challenges.toLocaleString(), label: "Challenges", color: "text-neon-cyan" },
                { value: stats.prizes, label: "In Prizes", color: "text-neon-purple" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="glass-card rounded-xl p-5 text-center group cursor-default animate-glow-pulse"
                  style={{ animationDelay: `${index * 0.5}s` }}
                >
                  <div className={`font-display text-3xl md:text-4xl font-black ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] md:text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground mt-2">
                    {stat.label}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Terminal decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-muted-foreground z-10"
      >
        <span className="text-primary font-mono text-sm">root@cyberops:~$</span>
        <span className="font-mono text-sm">scroll_down</span>
        <span className="w-2 h-4 bg-primary animate-terminal-blink" />
      </motion.div>

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: ['-100%', '200%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary/10 to-transparent"
        />
      </div>
    </section>
  );
};

export default Hero;
