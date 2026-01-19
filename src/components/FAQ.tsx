import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is a CTF competition?",
    answer: "CTF (Capture The Flag) is a cybersecurity competition where participants solve security-related challenges to find hidden 'flags' - secret strings that prove you've completed the challenge. It's a hands-on way to learn and practice hacking skills in a legal environment."
  },
  {
    question: "Do I need prior experience to participate?",
    answer: "Not at all! We offer challenges for all skill levels, from beginner-friendly puzzles to advanced exploits. Our resources section has learning materials to help you get started, and our community is welcoming to newcomers."
  },
  {
    question: "How do I submit a flag?",
    answer: "Once you solve a challenge, you'll find a flag in the format CTF{...}. Navigate to the challenge page, enter the exact flag string in the submission box, and click submit. Points are awarded instantly for correct submissions."
  },
  {
    question: "Can I participate as a team?",
    answer: "Yes! You can create or join a team to collaborate with other hackers. Team members share points on the team leaderboard while also earning individual rankings. Team captains can manage members and invite codes."
  },
  {
    question: "What challenge categories are available?",
    answer: "We offer challenges across multiple categories: Web Exploitation, Cryptography, Reverse Engineering, Binary Exploitation (PWN), Forensics, Scripting, and Miscellaneous. Each category tests different security skills."
  },
  {
    question: "Are there prizes for winners?",
    answer: "Competition prizes vary by event. Check the announcements section for details about current competition rewards, which may include cash prizes, hardware, subscriptions to security tools, or other cybersecurity swag."
  },
  {
    question: "What tools do I need?",
    answer: "Basic challenges can be solved with just a web browser and text editor. For more advanced challenges, you might need tools like Burp Suite, Ghidra, pwntools, or Wireshark. We recommend a Linux environment (like Kali or Parrot OS) for the best experience."
  },
  {
    question: "Is there a time limit for challenges?",
    answer: "During live competitions, challenges are available until the event ends. After competition mode ends, challenges may remain available for practice. Check the countdown timer and announcements for specific event timings."
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-20 px-4 bg-card/30 relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)`,
        }} />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">FAQ_SECTION</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-mono text-foreground mb-4">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about participating in CyberOps CTF competitions
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card/50 border border-border/50 rounded-lg px-6 backdrop-blur-sm data-[state=open]:border-primary/50 transition-colors"
              >
                <AccordionTrigger className="text-left font-mono text-foreground hover:text-primary hover:no-underline py-4">
                  <span className="flex items-center gap-3">
                    <span className="text-primary font-bold text-sm">{String(index + 1).padStart(2, '0')}</span>
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 pl-8">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm font-mono">
            <span className="text-primary">$</span> Still have questions? Join our{" "}
            <a 
              href="https://discord.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Discord community
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
