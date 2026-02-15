/**
 * ============================================================================
 * CAREERS PAGE
 * ============================================================================
 * 
 * Job openings and career information.
 * 
 * @page
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Clock, ArrowRight, Users, Sparkles } from 'lucide-react';

const openings = [
  {
    title: 'Digital Marketing Specialist',
    location: 'Bhagalpur, Bihar',
    type: 'Full-time',
    description: 'Join our marketing team to create and execute AI-powered campaigns for clients.',
  },
  {
    title: 'Full Stack Developer',
    location: 'Remote/Bhagalpur',
    type: 'Full-time',
    description: 'Build cutting-edge web applications using modern technologies.',
  },
  {
    title: 'Content Writer',
    location: 'Remote',
    type: 'Part-time',
    description: 'Create compelling content for blogs, social media, and marketing materials.',
  },
];

export function CareersPage() {
  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="badge-ai mb-4">Join Us</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Careers at <span className="text-gradient">Sovereon</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Be part of a team that's transforming businesses with AI-powered solutions.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="ai-card">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">AI-First Culture</h3>
              <p className="text-sm text-muted-foreground">
                Work with cutting-edge AI tools and technologies
              </p>
            </CardContent>
          </Card>
          <Card className="ai-card">
            <CardContent className="p-6 text-center">
              <Users className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Collaborative Team</h3>
              <p className="text-sm text-muted-foreground">
                Work with talented professionals who support your growth
              </p>
            </CardContent>
          </Card>
          <Card className="ai-card">
            <CardContent className="p-6 text-center">
              <Briefcase className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Career Growth</h3>
              <p className="text-sm text-muted-foreground">
                Clear progression paths and learning opportunities
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Openings */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Open Positions</h2>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {openings.map((job) => (
            <Card key={job.title} className="ai-card group">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{job.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" className="flex-shrink-0">
                    Apply Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Don't see a fit? Send your resume to{' '}
            <a href="mailto:careers@sovereoninc.com" className="text-primary hover:underline">
              careers@sovereoninc.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
