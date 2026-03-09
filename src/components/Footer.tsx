import { useState } from "react";
import { Shield, Github, Twitter, MessageCircle, Send, Linkedin, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const socialLinks = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: MessageCircle, href: "https://discord.com", label: "Discord" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    if (error) {
      toast.error(error.code === "23505" ? "You're already subscribed!" : "Failed to subscribe.");
    } else {
      toast.success("Welcome to the CyberOps newsletter!");
      setEmail("");
    }
    setLoading(false);
  };

  return (
    <footer className="relative pt-20 pb-8 overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-5" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/3 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Newsletter */}
        <div className="max-w-2xl mx-auto text-center mb-16 pb-16 border-b border-border/20">
          <h3 className="font-display text-2xl md:text-3xl font-black text-foreground mb-3">
            Stay in the <span className="text-gradient">Loop</span>
          </h3>
          <p className="text-muted-foreground text-sm mb-8">
            Get notified about new challenges, competitions, and cybersecurity tips.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md mx-auto">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hacker@example.com"
              className="bg-background/50 border-border/30 flex-1"
              required
            />
            <Button type="submit" variant="hero" disabled={loading} className="group">
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  Subscribe
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="grid md:grid-cols-4 gap-10 mb-16">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <Shield className="h-7 w-7 text-primary" />
              <span className="font-display text-lg font-bold tracking-wider text-gradient">
                CyberOps Official
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              The premier CTF platform for aspiring hackers and security professionals. 
              Test your skills, learn new techniques, and compete with the best.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Challenges", href: "/challenges" },
                { label: "Leaderboard", href: "/leaderboard" },
                { label: "Writeups", href: "/writeups" },
                { label: "Teams", href: "/teams" },
              ].map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 group">
                    <span className="w-0 group-hover:w-2 h-px bg-primary transition-all duration-300" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Terms of Service", to: "/terms" },
                { label: "Competition Rules", to: "/rules" },
                { label: "Code of Conduct", to: "/conduct" },
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 group">
                    <span className="w-0 group-hover:w-2 h-px bg-primary transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-border/20">
          <p className="text-xs font-mono text-muted-foreground">
            © 2025 CyberOps Official. Hack responsibly.{" "}
            <span className="text-primary animate-terminal-blink">▋</span>
          </p>

          <div className="flex items-center gap-2">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg border border-border/30 bg-background/30 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-300 hover:shadow-[0_0_12px_hsl(var(--neon-green)/0.15)]"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
