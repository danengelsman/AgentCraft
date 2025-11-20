import { HeroSection } from "@/components/HeroSection";
import { TemplateCard } from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Users, Zap, Shield, Menu } from "lucide-react";
import { useLocation } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import faqIcon from "@assets/generated_images/FAQ_chatbot_template_icon_85fc1675.png";
import leadIcon from "@assets/generated_images/Lead_qualifier_template_icon_45379e5b.png";
import schedulerIcon from "@assets/generated_images/Scheduler_template_icon_dab45b38.png";
import acLogo from "@assets/generated_images/Neural_A_letterform_icon_b6a3b7e8.png";

export default function Home() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={acLogo} alt="AgentCraft" className="w-10 h-10" />
            <span className="text-lg sm:text-xl font-semibold tracking-tight">AgentCraft</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#templates" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors" data-testid="link-templates">
              Templates
            </a>
            <a href="#pricing" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors" data-testid="link-pricing">
              Pricing
            </a>
            <ThemeToggle />
            <Button variant="ghost" onClick={() => setLocation('/dashboard')} data-testid="button-login">
              Log In
            </Button>
            <Button onClick={() => setLocation('/dashboard')} data-testid="button-signup">
              Sign Up
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu" aria-label="Open navigation menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-6 mt-8">
                  <a 
                    href="#templates" 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="link-templates-mobile"
                  >
                    Templates
                  </a>
                  <a 
                    href="#pricing" 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="link-pricing-mobile"
                  >
                    Pricing
                  </a>
                  <div className="pt-6 border-t border-border space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full justify-center" 
                      size="lg"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setLocation('/dashboard');
                      }}
                      data-testid="button-login-mobile"
                    >
                      Log In
                    </Button>
                    <Button 
                      className="w-full justify-center" 
                      size="lg"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setLocation('/dashboard');
                      }}
                      data-testid="button-signup-mobile"
                    >
                      Sign Up
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <HeroSection />

      <section id="templates" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4 sm:mb-6 tracking-tight">Solution Templates</h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              Pre-built automation templates designed for common small business needs. 
              Just customize and deploy.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4 sm:mb-6 tracking-tight px-4">Why Small Businesses Choose AgentCraft</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            {features.map((feature) => (
              <div key={feature.title} className="text-center px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <feature.icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4 sm:mb-6 tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed px-4">
              Start free, upgrade when you're ready
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="border border-card-border rounded-2xl p-6 sm:p-8 lg:p-10 bg-card shadow-sm">
              <h3 className="text-2xl sm:text-3xl font-semibold mb-2 sm:mb-3 tracking-tight">Free</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">Perfect for testing the waters</p>
              <div className="mb-8 sm:mb-10">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">Free</span>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span>1 basic agent</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span>100 messages per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span>Basic templates</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span>Community support</span>
                </li>
              </ul>
              <Button className="w-full" size="lg" variant="outline" onClick={() => setLocation('/dashboard')} data-testid="button-get-started-free">
                Get Started Free
              </Button>
            </div>

            <div className="border-2 border-primary rounded-2xl p-6 sm:p-8 lg:p-10 bg-card shadow-lg relative">
              <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 sm:px-5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-semibold mb-2 sm:mb-3 tracking-tight">Pro</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">For growing businesses</p>
              <div className="mb-8 sm:mb-10">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">$49</span>
                <span className="text-lg sm:text-xl text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span>Up to 10 active agents</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span>Unlimited messages</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span>HubSpot integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span>Advanced templates</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span>Custom branding</span>
                </li>
              </ul>
              <Button className="w-full" size="lg" onClick={() => setLocation('/dashboard')} data-testid="button-upgrade-pro">
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
