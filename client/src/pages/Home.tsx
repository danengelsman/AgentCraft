import { HeroSection } from "@/components/HeroSection";
import { TemplateCard } from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Users, Zap, Shield } from "lucide-react";
import { useLocation } from "wouter";
import faqIcon from "@assets/generated_images/FAQ_chatbot_template_icon_85fc1675.png";
import leadIcon from "@assets/generated_images/Lead_qualifier_template_icon_45379e5b.png";
import schedulerIcon from "@assets/generated_images/Scheduler_template_icon_dab45b38.png";

export default function Home() {
  const [, setLocation] = useLocation();

  // todo: remove mock functionality
  const templates = [
    {
      title: "Website FAQ Chatbot",
      description: "Answer common customer questions instantly with an intelligent chatbot trained on your website content.",
      icon: faqIcon,
      tier: "free" as const,
    },
    {
      title: "Lead Qualification Agent",
      description: "Automatically qualify leads in HubSpot by asking the right questions and scoring prospects.",
      icon: leadIcon,
      tier: "pro" as const,
    },
    {
      title: "Appointment Scheduler",
      description: "Let customers book appointments directly through chat with calendar integration.",
      icon: schedulerIcon,
      tier: "pro" as const,
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Set Up in Minutes",
      description: "Our guided templates get you from zero to automation in under 10 minutes.",
    },
    {
      icon: Users,
      title: "Built for Small Business",
      description: "Designed with simplicity in mind. No technical expertise required.",
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description: "Your data is encrypted and secure. We never share your information.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">A</span>
            </div>
            <span className="text-xl font-bold">AgentCraft</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#templates" className="text-sm hover:text-primary transition-colors">
              Templates
            </a>
            <a href="#pricing" className="text-sm hover:text-primary transition-colors">
              Pricing
            </a>
            <Button variant="ghost" size="sm" onClick={() => setLocation('/dashboard')} data-testid="button-login">
              Log In
            </Button>
            <Button size="sm" onClick={() => setLocation('/dashboard')} data-testid="button-signup">
              Sign Up
            </Button>
          </nav>
        </div>
      </header>

      <HeroSection />

      <section id="templates" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Solution Templates</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Pre-built automation templates designed for common small business needs. 
              Just customize and deploy.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <TemplateCard
                key={template.title}
                {...template}
                onStart={() => {
                  console.log('Start building:', template.title);
                  setLocation('/dashboard');
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Small Businesses Choose AgentCraft</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">
              Start free, upgrade when you're ready
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="border-2 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-muted-foreground mb-6">Perfect for testing the waters</p>
              <div className="mb-8">
                <span className="text-5xl font-bold">Free</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">1 basic agent</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">100 messages per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Basic templates</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Community support</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline" onClick={() => setLocation('/dashboard')} data-testid="button-get-started-free">
                Get Started Free
              </Button>
            </div>

            <div className="border-2 border-primary rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-muted-foreground mb-6">For growing businesses</p>
              <div className="mb-8">
                <span className="text-5xl font-bold">$49</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Up to 10 active agents</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited messages</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">HubSpot integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Advanced templates</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Priority support</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Custom branding</span>
                </li>
              </ul>
              <Button className="w-full" onClick={() => setLocation('/dashboard')} data-testid="button-upgrade-pro">
                Upgrade to Pro
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground text-sm">
          <p>&copy; 2024 AgentCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
