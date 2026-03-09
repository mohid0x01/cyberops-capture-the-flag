import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, User, MessageSquare, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => { if (err.path[0]) fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_submissions").insert({
      name: result.data.name,
      email: result.data.email,
      subject: result.data.subject,
      message: result.data.message,
    });
    if (error) toast.error("Failed to submit. Please try again.");
    else { toast.success("Message sent! We'll get back to you soon."); setFormData({ name: "", email: "", subject: "", message: "" }); }
    setLoading(false);
  };

  const inputClass = (field: string) =>
    `bg-background/50 border-border/30 focus:border-primary/50 transition-all ${errors[field] ? 'border-destructive/50' : ''}`;

  return (
    <section id="contact" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      {/* Decorative */}
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-neon-cyan/3 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-xs font-mono uppercase tracking-[0.2em] text-primary mb-6">
              <Mail className="w-3.5 h-3.5" />
              Contact Us
            </span>
            <h2 className="font-display text-4xl md:text-6xl font-black text-foreground mb-5 tracking-tight">
              Get in <span className="text-gradient">Touch</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Have questions, feedback, or need to report an issue? We're here to help.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass-card rounded-2xl p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Name
                  </Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" className={inputClass('name')} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="hacker@example.com" className={inputClass('email')} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Subject
                </Label>
                <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="What's this about?" className={inputClass('subject')} />
                {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Message
                </Label>
                <Textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="Tell us what's on your mind..." rows={5} className={`resize-none ${inputClass('message')}`} />
                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
              </div>

              <div className="flex justify-center pt-2">
                <Button type="submit" variant="hero" size="lg" disabled={loading} className="min-w-[200px] group">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-muted-foreground text-sm font-mono">
                Prefer real-time chat?{" "}
                <a href="https://discord.gg/lovable-dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Join Discord
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
