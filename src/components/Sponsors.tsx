import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Handshake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  tier: "platinum" | "gold" | "silver" | "bronze";
  display_order: number;
}

const tierConfig = {
  platinum: { label: "Platinum Sponsors", size: "w-48 h-24", glow: "hover:shadow-[0_0_30px_hsl(var(--neon-green)/0.2)]" },
  gold: { label: "Gold Sponsors", size: "w-40 h-20", glow: "hover:shadow-[0_0_20px_hsl(var(--neon-orange)/0.2)]" },
  silver: { label: "Silver Sponsors", size: "w-32 h-16", glow: "hover:shadow-[0_0_15px_hsl(var(--neon-cyan)/0.2)]" },
  bronze: { label: "Bronze Sponsors", size: "w-28 h-14", glow: "hover:shadow-[0_0_10px_hsl(var(--neon-purple)/0.2)]" },
};

const Sponsors = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsors = async () => {
      const { data } = await supabase.from("sponsors").select("*").eq("is_active", true).order("display_order", { ascending: true });
      if (data) setSponsors(data as Sponsor[]);
      setLoading(false);
    };
    fetchSponsors();
  }, []);

  const groupedSponsors = sponsors.reduce((acc, s) => { (acc[s.tier] = acc[s.tier] || []).push(s); return acc; }, {} as Record<string, Sponsor[]>);
  const tierOrder: Array<"platinum" | "gold" | "silver" | "bronze"> = ["platinum", "gold", "silver", "bronze"];
  const hasSponsors = sponsors.length > 0;

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-primary/3 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] bg-secondary/3 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-xs font-mono uppercase tracking-[0.2em] text-secondary mb-6">
            <Handshake className="w-3.5 h-3.5" />
            Our Partners
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-black text-foreground mb-5 tracking-tight">
            Powered by <span className="text-gradient">Industry Leaders</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            CyberOps is made possible by the generous support of our sponsors.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="font-mono text-sm">Loading sponsors...</span>
            </div>
          </div>
        ) : hasSponsors ? (
          <div className="space-y-12">
            {tierOrder.map(tier => {
              const tierSponsors = groupedSponsors[tier];
              if (!tierSponsors?.length) return null;
              const config = tierConfig[tier];
              return (
                <div key={tier} className="text-center">
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-6">{config.label}</h3>
                  <div className="flex flex-wrap justify-center items-center gap-5">
                    {tierSponsors.map((sponsor, i) => (
                      <motion.a
                        key={sponsor.id}
                        href={sponsor.website_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.05, y: -4 }}
                        className={`relative group ${config.size} rounded-xl glass-card overflow-hidden transition-all duration-300 ${config.glow} flex items-center justify-center p-3`}
                      >
                        <img src={sponsor.logo_url} alt={sponsor.name} className="max-w-full max-h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                          <span className="text-xs font-mono text-foreground flex items-center gap-1">
                            {sponsor.name}
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-mono text-sm">Sponsor spots available! Get in touch to support CyberOps.</p>
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-16">
          <a
            href="mailto:sponsors@cyberops.io"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl glass border-primary/20 text-primary font-mono text-sm hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--neon-green)/0.15)]"
          >
            Become a Sponsor
            <ExternalLink className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Sponsors;
