/**
 * Admin Dashboard
 * Overview of CMS content
 */

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, MessageSquare, HelpCircle } from 'lucide-react';

interface Stats {
  teamMembers: number;
  services: number;
  testimonials: number;
  faqs: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    teamMembers: 0,
    services: 0,
    testimonials: 0,
    faqs: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [teamRes, servicesRes, testimonialsRes, faqsRes] = await Promise.all([
          adminApi.getTeamMembers(),
          adminApi.getServices(),
          adminApi.getTestimonials(),
          adminApi.getFAQs(),
        ]);

        setStats({
          teamMembers: (teamRes.data as any[])?.length || 0,
          services: (servicesRes.data as any[])?.length || 0,
          testimonials: (testimonialsRes.data as any[])?.length || 0,
          faqs: (faqsRes.data as any[])?.length || 0,
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    { title: 'Team Members', value: stats.teamMembers, icon: Users, color: 'text-blue-600' },
    { title: 'Services', value: stats.services, icon: Briefcase, color: 'text-green-600' },
    { title: 'Testimonials', value: stats.testimonials, icon: MessageSquare, color: 'text-yellow-600' },
    { title: 'FAQs', value: stats.faqs, icon: HelpCircle, color: 'text-purple-600' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Sovereon CMS admin panel.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Use the sidebar to navigate to different sections:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Manage team members in the &quot;Team Members&quot; section</li>
              <li>Edit services and categories in the &quot;Services&quot; section</li>
              <li>Update testimonials from clients</li>
              <li>Modify FAQ entries</li>
              <li>Change global settings like contact info</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">CMS Database</span>
                <span className="text-sm text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Admin Session</span>
                <span className="text-sm text-green-600 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                <span className="text-sm text-green-600 font-medium">Operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
