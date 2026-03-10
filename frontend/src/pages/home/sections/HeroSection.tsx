/**
 * ============================================================================
 * HERO SECTION
 * ============================================================================
 * Main landing hero with CTA buttons and trust indicators
 */

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, ArrowRight, CheckCircle } from 'lucide-react';

export function HeroSection() {
  return (
    <section 
      className="relative min-h-[600px] min-h-screen flex items-center justify-center overflow-hidden pt-20" 
      aria-label="Hero section"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }} 
        />
      </div>
      
      {/* Floating AI Nodes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/40 animate-neural-pulse"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6 animate-fade-in-up">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Built by engineers. Designed for growth.</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up animation-delay-100">
            <span className="text-gradient">AI Systems That</span>
            <br />
            <span className="text-foreground">Drive Real Revenue</span>
            <br />
            <span className="text-muted-foreground text-3xl sm:text-4xl md:text-5xl">
              Not Just Traffic
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in-up animation-delay-200">
            Founded February 2026 in Bhagalpur, Bihar. We build software, run marketing campaigns, 
            and deploy AI systems that actually make you money. Technical founders who understand business.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
            <Button
              asChild
              size="lg"
              className="btn-ai text-lg px-8 py-6 relative z-10"
            >
              <Link to="/contact-us">
                Book a Free Strategy Call
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10"
            >
              <Link to="/case-studies">See Our Results</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in-up animation-delay-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Revenue-Focused</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Technical Founders</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
