/**
 * ============================================================================
 * FUTURE QUESTS SECTION
 * ============================================================================
 * Company roadmap and future plans with CMS integration
 */

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Rocket, Target, Zap, Globe, Code } from 'lucide-react';
import { cmsApi } from '@/services/cmsApi';
import type { FutureQuest } from '../types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  Rocket,
  Target,
  Zap,
  Globe,
  Code,
};

function getIcon(iconName: string) {
  return iconMap[iconName] || Target;
}

export function FutureQuestsSection() {
  const [quests, setQuests] = useState<FutureQuest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuests = async () => {
      try {
        const response = await cmsApi.getFutureQuests();
        if (response.success) {
          setQuests((response.data as FutureQuest[]) || []);
        }
      } catch (error) {
        console.error('Failed to load quests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuests();
  }, []);

  if (isLoading) {
    return (
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-6 w-32 mx-auto mb-4" />
            <Skeleton className="h-10 w-64 mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (quests.length === 0) {
    return null;
  }

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="badge-ai mb-4">Roadmap</Badge>
          <h2 className="text-responsive-section font-bold mb-4">
            Future <span className="text-gradient">Quests</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Where we&apos;re headed next
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {quests.map((quest, index) => {
            const Icon = getIcon(quest.icon);
            return (
              <Card
                key={quest.id}
                className="ai-card animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{quest.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {quest.description}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {quest.timeline}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FutureQuestsSection;
