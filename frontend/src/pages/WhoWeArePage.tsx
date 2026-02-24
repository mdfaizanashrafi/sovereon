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
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="badge-ai mb-4">About Us</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Who <span className="text-gradient">We Are</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            {companyName} is a forward-thinking digital solutions company based in 
            Bhagalpur, Bihar, leveraging AI technology to help businesses grow.
          </p>
        </div>
      </section>

      {/* Company Overview */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded in February 2026, {companyName} emerged from a vision to bring 
                world-class digital solutions to businesses in Bihar and beyond. We recognized 
                that local businesses needed access to cutting-edge technology and AI-powered 
                strategies to compete in an increasingly digital marketplace.
              </p>
              <p>
                Our name, &quot;Sovereon,&quot; reflects our commitment to sovereignty in the digital 
                space — empowering businesses to take control of their online presence and 
                achieve independence through technology.
              </p>
              <p>
                Led by Md Faizan (Technical Lead) and Altamash Khan (CRM Manager), our team 
                combines technical expertise with exceptional customer service to deliver 
                results that matter.
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
                To democratize access to advanced digital technology for businesses of all sizes, 
                enabling them to compete effectively in the global marketplace through AI-powered 
                solutions and exceptional service.
              </p>
            </CardContent>
          </Card>
          <Card className="ai-card">
            <CardContent className="p-8">
              <Target className="w-10 h-10 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground">
                To become the leading digital transformation partner for businesses in Eastern 
                India, known for innovation, reliability, and measurable results that drive 
                sustainable growth.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-12">
          <Badge className="badge-ai mb-4">Our Team</Badge>
          <h2 className="text-3xl font-bold">Meet the Leaders</h2>
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
  );
}
