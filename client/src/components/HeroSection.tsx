import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@assets/generated_images/Hero_image_business_owner_3e33f279.png";

export function HeroSection() {
  return (
    <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-white mb-6">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Trusted by 500+ Small Businesses</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Automate Your Business<br />Without the Complexity
        </h1>
        
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Create powerful AI agents in minutes with our guided templates. No coding required.
          Perfect for small businesses ready to scale.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            size="lg"
            className="bg-white/90 backdrop-blur-sm text-foreground hover:bg-white border-2 border-white/20"
            data-testid="button-get-started"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/10"
            data-testid="button-view-templates"
          >
            View Templates
          </Button>
        </div>
      </div>
    </section>
  );
}
