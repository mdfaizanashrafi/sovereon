/**
 * ============================================================================
 * HOMEPAGE - Main Landing Page
 * ============================================================================
 * 
 * This page contains all the main sections of the Sovereon Inc. homepage:
 * - Hero Section with AI results expectations
 * - Catchy Results Section with metrics
 * - Client Growth Sections
 * - Why Choose Us Section
 * - Services Header/Preview
 * - Reviews Section
 * - Current Projects Section
 * - Future Quests Section
 * - Contact Form Section
 * 
 * PLACEHOLDERS:
 * - [PLACEHOLDER_HERO_IMAGE]: Hero background image
 * - [PLACEHOLDER_CLIENT_LOGO_*]: Client company logos
 * - [PLACEHOLDER_PROJECT_IMAGE_*]: Project showcase images
 * 
 * @page
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  TrendingUp,
  Users,
  Clock,
  Target,
  Zap,
  ArrowRight,
  Star,
  CheckCircle,
  Mic,
  Building,
  GraduationCap,
  MapPin,
  Send,
  ChevronRight,
} from 'lucide-react';
import {
  serviceCategories,
  testimonials,
  currentProjects,
  futureQuests,
} from '@/data/siteData';

// ============================================================================
// HERO SECTION
// ============================================================================

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
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
            <span className="text-sm font-medium">AI-Powered Digital Solutions</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up animation-delay-100">
            <span className="text-gradient">Sovereon Inc.</span>
            <br />
            <span className="text-foreground">AI-Powered Growth</span>
            <br />
            <span className="text-muted-foreground text-3xl sm:text-4xl md:text-5xl">
              in a Competitive Market
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in-up animation-delay-200">
            Established February 2026 in Bhagalpur, Bihar — Delivering AI-Advanced 
            Services for Unmatched ROI. We help businesses outpace 5+ year market 
            leaders with cutting-edge technology.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
            <Button
              asChild
              size="lg"
              className="btn-ai text-lg px-8 py-6 relative z-10"
            >
              <Link to="/pricing">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10"
            >
              <Link to="/services">Learn More</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in-up animation-delay-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>AI-Enhanced</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>ROI-Focused</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CATCHY RESULTS SECTION
// ============================================================================

function ResultsSection() {
  const stats = [
    { label: 'Average Growth', value: '30%', icon: TrendingUp, description: 'Faster than traditional methods' },
    { label: 'Client Satisfaction', value: '95%', icon: Star, description: 'Based on post-project surveys' },
    { label: 'Projects Delivered', value: '50+', icon: CheckCircle, description: 'Across various industries' },
    { label: 'Support Response', value: '<2hr', icon: Clock, description: 'Average response time' },
  ];

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <Badge className="badge-ai mb-4">Expected Results</Badge>
            <h2 className="text-responsive-section font-bold mb-4">
              Expect <span className="text-gradient">30% Faster Growth</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AI Analyzes Data for Personalized Strategies — Outpace 5-Year Market Leaders
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <Card
                key={stat.label}
                className="ai-card group animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                  <div className="text-3xl lg:text-4xl font-bold text-gradient mb-1">
                    {stat.value}
                  </div>
                  <div className="font-medium mb-1">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Before/After Comparison */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Card className="ai-card border-destructive/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="font-medium text-destructive">Before AI</span>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-destructive">✗</span> Stagnant lead generation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-destructive">✗</span> Manual, time-consuming processes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-destructive">✗</span> Limited data insights
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-destructive">✗</span> Slow market response
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="ai-card border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="font-medium text-primary">With Sovereon AI</span>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span> 40% increase in qualified leads
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span> Automated, efficient workflows
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span> Real-time AI-powered analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span> Instant market adaptation
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CLIENT GROWTH SECTION
// ============================================================================

function ClientGrowthSection() {
  const clients = [
    { name: 'Bihar Tech Solutions', growth: '+150%', metric: 'Organic Traffic' },
    { name: 'Wellness Hub', growth: '+40%', metric: 'Online Sales' },
    { name: 'Patel Enterprises', growth: '+60%', metric: 'Operational Efficiency' },
    { name: 'Fashion Forward', growth: '+1000%', metric: 'Social Followers' },
  ];

  return (
    <section className="section-padding bg-muted/20 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="badge-ai mb-4">Success Stories</Badge>
          <h2 className="text-responsive-section font-bold mb-4">
            Companies We've <span className="text-gradient">Transformed</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real results from real businesses in Bihar and beyond
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clients.map((client, index) => (
            <Card
              key={client.name}
              className="ai-card group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {client.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-semibold text-center mb-2">{client.name}</h3>
                <div className="text-center">
                  <span className="text-3xl font-bold text-gradient">{client.growth}</span>
                  <p className="text-sm text-muted-foreground">{client.metric}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link to="/case-studies">
              View All Case Studies
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// WHY CHOOSE US SECTION
// ============================================================================

function WhyChooseUsSection() {
  const reasons = [
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock assistance with AI monitoring to catch and resolve issues before they impact your business.',
    },
    {
      icon: Target,
      title: 'ROI-Focused Approach',
      description: 'Every strategy is designed with your bottom line in mind. We measure success by your growth, not vanity metrics.',
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Led by Md Faizan (Technical) and Altamash Khan (CRM), our team brings fresh innovation since February 2026.',
    },
    {
      icon: Zap,
      title: 'AI-First Strategy',
      description: 'We leverage cutting-edge AI to deliver faster, smarter, and more effective solutions than traditional agencies.',
    },
    {
      icon: TrendingUp,
      title: 'Proven Results',
      description: 'Our clients see an average of 30% faster growth compared to traditional digital marketing approaches.',
    },
    {
      icon: Brain,
      title: 'Local Expertise',
      description: 'Based in Bhagalpur, Bihar, we understand the local market while delivering world-class solutions.',
    },
  ];

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="badge-ai mb-4">Our Advantages</Badge>
          <h2 className="text-responsive-section font-bold mb-4">
            Why <span className="text-gradient">Choose Us</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            What sets Sovereon apart in a competitive digital landscape
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <Card
              key={reason.title}
              className="ai-card group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <reason.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{reason.title}</h3>
                <p className="text-sm text-muted-foreground">{reason.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SERVICES PREVIEW SECTION
// ============================================================================

function ServicesPreviewSection() {
  return (
    <section className="section-padding bg-muted/20 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="badge-ai mb-4">Our Services</Badge>
          <h2 className="text-responsive-section font-bold mb-4">
            Solutions for <span className="text-gradient">Every Need</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive digital services powered by advanced AI technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCategories.map((category, index) => (
            <Link key={category.id} to={category.href}>
              <Card
                className="ai-card group h-full animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    Explore Services
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button asChild className="btn-ai">
            <Link to="/services">
              View All Services
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// REVIEWS SECTION
// ============================================================================

function ReviewsSection() {
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="badge-ai mb-4">Testimonials</Badge>
          <h2 className="text-responsive-section font-bold mb-4">
            What Our <span className="text-gradient">Clients Say</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real feedback from businesses we've helped grow
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="ai-card animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
                {testimonial.beforeMetric && testimonial.afterMetric && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Before: {testimonial.beforeMetric}
                      </span>
                      <ArrowRight className="w-3 h-3 text-primary" />
                      <span className="text-primary font-medium">
                        After: {testimonial.afterMetric}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link to="/testimonials">
              View All Testimonials
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CURRENT PROJECTS SECTION
// ============================================================================

function CurrentProjectsSection() {
  return (
    <section className="section-padding bg-muted/20 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="badge-ai mb-4">In Progress</Badge>
          <h2 className="text-responsive-section font-bold mb-4">
            Our <span className="text-gradient">Current Projects</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what we're building right now
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProjects.map((project, index) => (
            <Card
              key={project.id}
              className="ai-card animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="w-full h-32 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-12 h-12 text-primary/50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {project.description}
                </p>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FUTURE QUESTS SECTION
// ============================================================================

function FutureQuestsSection() {
  const iconMap: Record<string, React.ElementType> = {
    Mic,
    Building,
    GraduationCap,
    MapPin,
  };

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="badge-ai mb-4">Roadmap</Badge>
          <h2 className="text-responsive-section font-bold mb-4">
            Our <span className="text-gradient">Future Quests</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expanding AI in Podcasts & Marketing — Join Our Journey
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2" />

            {/* Timeline Items */}
            <div className="space-y-8">
              {futureQuests.map((quest, index) => {
                const Icon = iconMap[quest.icon] || Zap;
                return (
                  <div
                    key={quest.id}
                    className={`relative flex items-start gap-4 md:gap-8 animate-fade-in-up`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center md:-translate-x-1/2 z-10">
                      <Icon className="w-4 h-4 text-primary-foreground" />
                    </div>

                    {/* Content */}
                    <div
                      className={`ml-16 md:ml-0 md:w-1/2 ${
                        index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:ml-auto md:pl-12'
                      }`}
                    >
                      <Card className="ai-card">
                        <CardContent className="p-4">
                          <span className="text-xs font-medium text-primary">
                            {quest.timeline}
                          </span>
                          <h3 className="font-semibold mt-1">{quest.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {quest.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CONTACT FORM SECTION
// ============================================================================

function ContactFormSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <section className="section-padding bg-muted/20 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="badge-ai mb-4">Get Started</Badge>
            <h2 className="text-responsive-section font-bold mb-4">
              Get Your Free <span className="text-gradient">AI Consultation</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Tell us about your project and we'll get back to you within 24 hours
            </p>
          </div>

          <Card className="ai-card">
            <CardContent className="p-6 md:p-8">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                  <p className="text-muted-foreground">
                    We've received your inquiry and will contact you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Umakant Kumar"
                        required
                        className="input-ai"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        className="input-ai"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="9876543210"
                        className="input-ai"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service">Service Interest</Label>
                      <Select>
                        <SelectTrigger className="input-ai">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Project Details</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your project and goals..."
                      rows={4}
                      className="input-ai resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full btn-ai"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Inquiry
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN HOMEPAGE COMPONENT
// ============================================================================

export function HomePage() {
  return (
    <div className="space-y-0">
      <HeroSection />
      <ResultsSection />
      <ClientGrowthSection />
      <WhyChooseUsSection />
      <ServicesPreviewSection />
      <ReviewsSection />
      <CurrentProjectsSection />
      <FutureQuestsSection />
      <ContactFormSection />
    </div>
  );
}
