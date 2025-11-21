import { Link } from "wouter";
import { Linkedin, Youtube } from "lucide-react";
import { SiX } from "react-icons/si";
import logoUrl from "@assets/IMG_0009_1763658765341.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-12">
        {/* Top section - Logo and Social */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-2 mb-6">
            <img 
              src={logoUrl} 
              alt="AgentCraft" 
              className="h-8 w-8" 
              data-testid="footer-logo"
            />
            <span className="text-2xl font-light tracking-tight text-foreground">
              Agent<span className="font-normal">Craft</span>
            </span>
          </div>
          
          {/* Social Icons */}
          <div className="flex items-center gap-4" data-testid="footer-social-links">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md hover-elevate active-elevate-2 transition-colors"
              aria-label="LinkedIn"
              data-testid="link-linkedin"
            >
              <Linkedin className="h-5 w-5 text-foreground" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md hover-elevate active-elevate-2 transition-colors"
              aria-label="X (Twitter)"
              data-testid="link-twitter"
            >
              <SiX className="h-5 w-5 text-foreground" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md hover-elevate active-elevate-2 transition-colors"
              aria-label="YouTube"
              data-testid="link-youtube"
            >
              <Youtube className="h-5 w-5 text-foreground" />
            </a>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
          {/* Product Column */}
          <div className="flex flex-col items-center md:items-start" data-testid="footer-product-section">
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <nav className="flex flex-col gap-3 items-center md:items-start">
              <a 
                href="/api/login" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors" 
                data-testid="footer-link-login"
              >
                Login
              </a>
              <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-start-building">
                Start building
              </Link>
            </nav>
          </div>

          {/* Resources Column */}
          <div className="flex flex-col items-center md:items-start" data-testid="footer-resources-section">
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <nav className="flex flex-col gap-3 items-center md:items-start">
              <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-docs">
                Docs
              </Link>
              <Link href="/subscription" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-pricing">
                Pricing
              </Link>
              <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-integrations">
                Integrations
              </Link>
            </nav>
          </div>

          {/* Company Column */}
          <div className="flex flex-col items-center md:items-start" data-testid="footer-company-section">
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <nav className="flex flex-col gap-3 items-center md:items-start">
              <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-blog">
                Blog
              </Link>
              <span 
                className="text-sm text-muted-foreground/50 cursor-not-allowed"
                data-testid="footer-link-careers"
              >
                Careers
              </span>
              <span 
                className="text-sm text-muted-foreground/50 cursor-not-allowed"
                data-testid="footer-link-privacy"
              >
                Privacy Policy
              </span>
              <span 
                className="text-sm text-muted-foreground/50 cursor-not-allowed"
                data-testid="footer-link-terms"
              >
                Terms of Service
              </span>
              <span 
                className="text-sm text-muted-foreground/50 cursor-not-allowed"
                data-testid="footer-link-contact"
              >
                Contact Us
              </span>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground" data-testid="footer-copyright">
            © {currentYear} AgentCraft
          </p>
        </div>
      </div>
    </footer>
  );
}
