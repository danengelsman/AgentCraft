import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import heroImage from "@assets/generated_images/Hero_image_business_owner_3e33f279.png";

export function HeroSection() {
  const [, setLocation] = useLocation();
  
  return (
    <section className="relative min-h-[600px] h-[85vh] pt-16 flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/40" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-6 sm:mb-8">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs sm:text-sm font-medium">Trusted by 500+ Small Businesses</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6 sm:mb-8 leading-tight tracking-tight px-2">
          Automate Your Business<br />Without the Complexity
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed font-light px-4">
          Create powerful AI agents in minutes with our guided templates. No coding required.
          Perfect for small businesses ready to scale.
        </p>
        
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center px-4">
          <Button
            size="lg"
            className="h-12 px-6 sm:px-8 text-base shadow-xl w-full sm:w-auto"
            onClick={() => setLocation('/dashboard')}
            data-testid="button-get-started"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-white/5 backdrop-blur-md text-white border-2 border-white/30 hover:bg-white/15 h-12 px-6 sm:px-8 text-base w-full sm:w-auto"
            onClick={() => {
              document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });
            }}
            data-testid="button-view-templates"
          >
            View Templates
          </Button>
        </div>
      </div>
    </section>
  );
}
