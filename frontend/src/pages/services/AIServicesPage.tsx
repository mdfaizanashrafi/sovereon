/**
 * ============================================================================
 * AI SERVICES PAGE
 * ============================================================================
 * 
 * Overview page for AI Services category
 */

import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, ArrowRight, Sparkles, Bot, FileText, BarChart3 } from 'lucide-react';
import { serviceCategories } from '@/data/siteData';

const iconMap: Record<string, React.ElementType> = {
  'ai-seo-search': Sparkles,
  'personalized-ai-agents': Bot,
  'ai-content-generation': FileText,
  'ai-data-analytics': BarChart3,
};

export function AIServicesPage() {
  const category = serviceCategories.find(c => c.id === 'ai-services');
  const services = category?.services || [];

  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center max-w-3xl mx-auto">
          <Badge className="badge-ai mb-4">
            <Brain className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            AI <span className="text-gradient">Services</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            {category?.description || 'Cutting-edge AI solutions to transform your business with intelligent automation and insights.'}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {services.map((service) => {
            const Icon = iconMap[service.id] || Brain;
            return (
              <Link key={service.id} to={service.href}>
                <Card className="ai-card group h-full hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {service.shortDescription}
                    </p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Why AI Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <Card className="ai-card">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Why Choose Our AI Services?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Stay ahead of the competition with cutting-edge AI solutions that drive real business results.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Future-Ready', desc: 'Stay ahead with the latest AI technologies' },
                { title: 'Custom Solutions', desc: 'Tailored AI implementations for your needs' },
                { title: 'Expert Team', desc: 'Led by AI specialists with proven experience' },
                { title: 'Measurable ROI', desc: 'Trackable results and performance metrics' },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default AIServicesPage;
