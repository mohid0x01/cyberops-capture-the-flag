import { useState } from "react";
import { Mail, Send, User, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
});

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("contact_submissions")
      .insert({
        name: result.data.name,
        email: result.data.email,
        subject: result.data.subject,
        message: result.data.message,
      });

    if (error) {
      toast.error("Failed to submit. Please try again.");
    } else {
      toast.success("Message sent! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }
    setLoading(false);
  };

  return (
    <section id="contact" className="py-20 px-4 bg-background relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">CONTACT_US</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-mono text-foreground mb-4">
            Get in <span className="text-primary">Touch</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have questions, feedback, or need to report an issue? We're here to help.
          </p>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className={`bg-card/50 border-border/50 focus:border-primary ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hacker@example.com"
                  className={`bg-card/50 border-border/50 focus:border-primary ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Subject
              </Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What's this about?"
                className={`bg-card/50 border-border/50 focus:border-primary ${errors.subject ? 'border-red-500' : ''}`}
              />
              {errors.subject && <p className="text-xs text-red-400">{errors.subject}</p>}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Message
              </Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us what's on your mind..."
                rows={5}
                className={`bg-card/50 border-border/50 focus:border-primary resize-none ${errors.message ? 'border-red-500' : ''}`}
              />
              {errors.message && <p className="text-xs text-red-400">{errors.message}</p>}
            </div>

            {/* Submit */}
            <div className="flex justify-center">
              <Button type="submit" variant="hero" size="lg" disabled={loading} className="min-w-[200px]">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Alternative contact */}
          <div className="text-center mt-8 pt-8 border-t border-border/50">
            <p className="text-muted-foreground text-sm font-mono">
              <span className="text-primary">$</span> Prefer real-time chat? Join our{" "}
              <a 
                href="https://discord.gg/lovable-dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Discord server
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
