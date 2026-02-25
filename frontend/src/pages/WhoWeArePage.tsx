/**
 * ============================================================================
 * WHO WE ARE PAGE
 * ============================================================================
 * 
 * Company information page with dynamic team members from CMS
 */

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, MapPin, Calendar, Users, Target, Lightbulb } from 'lucide-react';
import { cmsApi } from '@/services/cmsApi';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO, buildLocalBusinessSchema } from '@/components/SEO';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  description: string;
  image: string | null;
}

interface GlobalSetting {
  key: string;
  value: string;
}

export function WhoWeArePage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [teamRes, settingsRes] = await Promise.all([
          cmsApi.getTeamMembers(),
          cmsApi.getSettings(),
        ]);

        if (teamRes.success) {
          setTeamMembers((teamRes.data as TeamMember[]) || []);
        }

        if (settingsRes.success && settingsRes.data) {
          const settingsMap: Record<string, string> = {};
          const settingsArray = (settingsRes.data as unknown as GlobalSetting[]) || [];
          settingsArray.forEach((s) => {
            settingsMap[s.key] = s.value;
          });
          setSettings(settingsMap);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const companyName = settings['companyName'] || 'Sovereon Inc.';
  const phone = settings['contactPhone'] || '8789109928';
  const email = settings['contactEmail'] || 'sovereon@sovereon.online';
  const address = `${settings['addressCity'] || 'Bhagalpur'}, ${settings['addressState'] || 'Bihar'} - ${settings['addressPincode'] || '812002'}, ${settings['addressCountry'] || 'India'}`;

  if (isLoading) {
    return (
      <div className="pt-24 pb-16 space-y-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-full max-w-2xl mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Who We Are"
        description="Sovereon Inc. was founded in 2026 by engineers who believe technology should drive revenue. Based in Bhagalpur, Bihar."
        canonical="/who-we-are"
        schema={buildLocalBusinessSchema()}
      />
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="badge-ai mb-4">Our Story</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Engineers Who <span className="text-gradient">Understand Business</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            {companyName} was founded in February 2026 because we saw too many technical projects 
            that looked good but did not move the revenue needle. We fix that.
          </p>
        </div>
      </section>

      {/* Company Overview */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Why We Exist</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                {companyName} started with a simple observation: too many businesses were spending 
                money on technology and marketing without seeing real returns. Fancy dashboards, 
                vanity metrics, but no revenue impact.
              </p>
              <p>
                We built Sovereon to fix this. Our approach is simple: every line of code, every 
                marketing campaign, every AI system we deploy must either reduce costs or increase 
                revenue. If it does not do one of those two things, we do not build it.
              </p>
              <p>
                Led by Md Faizan (Technical Lead) and Altamash Khan (CRM Manager), we are a team 
                of engineers, analysts, and creators who believe technology is only valuable 
                when it solves real business problems.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="ai-card">
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold">Feb 2026</div>
                <div className="text-sm text-muted-foreground">Established</div>
              </CardContent>
            </Card>
            <Card className="ai-card">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm text-muted-foreground">Projects</div>
              </CardContent>
            </Card>
            <Card className="ai-card">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </CardContent>
            </Card>
            <Card className="ai-card">
              <CardContent className="p-6 text-center">
                <Lightbulb className="w-8 h-8 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold">AI-First</div>
                <div className="text-sm text-muted-foreground">Approach</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="ai-card">
            <CardContent className="p-8">
              <Brain className="w-10 h-10 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                Build technology that actually works for business. No fluff, no vanity metrics. 
                Just systems that reduce costs, increase revenue, or both.
              </p>
            </CardContent>
          </Card>
          <Card className="ai-card">
            <CardContent className="p-8">
              <Target className="w-10 h-10 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground">
                Become the go-to technical partner for businesses in Eastern India that want 
                results, not just deliverables. Known for shipping on time and building systems 
                that make money.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-12">
          <Badge className="badge-ai mb-4">The Team</Badge>
          <h2 className="text-3xl font-bold">People Behind the Code</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {teamMembers.map((member) => (
            <Card key={member.id} className="ai-card">
              <CardContent className="p-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-center">{member.name}</h3>
                <p className="text-primary text-center text-sm mb-2">{member.role}</p>
                <p className="text-xs text-muted-foreground text-center uppercase tracking-wider mb-4">
                  {member.department}
                </p>
                <p className="text-muted-foreground text-center text-sm">
                  {member.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Location Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="ai-card">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Our Location</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-muted-foreground mb-4">
                  We&apos;re proud to be based in Bhagalpur, Bihar, serving clients locally 
                  and across India with world-class digital solutions.
                </p>
                <div className="space-y-2">
                  <p className="font-medium">{companyName}</p>
                  <p className="text-muted-foreground">{address}</p>
                  <p className="text-muted-foreground">Phone: {phone}</p>
                  <p className="text-muted-foreground">Email: {email}</p>
                </div>
              </div>
              <div className="h-48 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-primary/50" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
    </>
  );
}
