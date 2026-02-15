/**
 * ============================================================================
 * BROADCAST SMS SERVICE PAGE
 * ============================================================================
 * 
 * Individual service page for Broadcast SMS with:
 * - Service overview and description
 * - Feature list with bullet points
 * - Strategy section (how we accomplish)
 * - Benefits
 * - CTA
 * 
 * @page
 */

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, TrendingUp, MessageSquare } from 'lucide-react';
import { serviceCategories } from '@/data/siteData';

export function BroadcastSMSPage() {
  const service = serviceCategories
    .find(c => c.id === 'communication-messaging')
    ?.services.find(s => s.id === 'broadcast-sms')!;

  return (
    <div className="pt-24 pb-16">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/services" className="hover:text-primary transition-colors">Services</Link>
          <ArrowRight className="w-4 h-4" />
          <Link to="/services/communication-messaging" className="hover:text-primary transition-colors">Communication</Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-foreground">{service.title}</span>
        </div>

        {/* Hero Section */}
        <div className="max-w-4xl mb-12">
          <Badge className="badge-ai mb-4">AI-Enhanced Service</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {service.title} <span className="text-gradient">– AI-Advanced</span>
          </h1>
          <p className="text-xl text-muted-foreground">{service.fullDescription}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card className="ai-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our Broadcast SMS service leverages advanced AI algorithms to deliver personalized 
                  messages to thousands of recipients simultaneously. With intelligent audience 
                  segmentation, optimal send-time prediction, and real-time delivery tracking, 
                  we ensure your messages reach the right people at the right time for maximum impact.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Whether you're announcing a sale, sending appointment reminders, or running 
                  a marketing campaign, our AI-powered platform optimizes every aspect of your 
                  SMS strategy for better engagement and higher conversion rates.
                </p>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="ai-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Features & Benefits</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {service.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strategy Section */}
            <Card className="ai-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">How We Accomplish</h2>
                <div className="space-y-4">
                  {service.strategy.map((step) => (
                    <div key={step.step} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary-foreground">{step.step}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Benefits Card */}
            <Card className="ai-card">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Key Benefits</h3>
                <ul className="space-y-3">
                  {service.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* CTA Card */}
            <Card className="ai-card bg-gradient-to-br from-primary/10 to-accent/10">
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-10 h-10 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Ready to Get Started?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Launch your first SMS campaign today
                </p>
                <Button asChild className="w-full btn-ai">
                  <Link to="/pricing">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Related Services */}
            <Card className="ai-card">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Related Services</h3>
                <div className="space-y-2">
                  <Link to="/services/bulk-sms" className="block p-2 rounded hover:bg-accent text-sm transition-colors">
                    Bulk SMS
                  </Link>
                  <Link to="/services/ivr-calling" className="block p-2 rounded hover:bg-accent text-sm transition-colors">
                    IVR Calling
                  </Link>
                  <Link to="/services/email-sms-marketing" className="block p-2 rounded hover:bg-accent text-sm transition-colors">
                    Email & SMS Marketing
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
