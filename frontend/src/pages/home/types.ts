/**
 * ============================================================================
 * HOME PAGE TYPES
 * ============================================================================
 * Shared types for homepage sections
 */

export interface ServiceCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  content: string;
  rating: number;
  beforeMetric: string | null;
  afterMetric: string | null;
}

export interface CurrentProject {
  id: string;
  title: string;
  description: string;
  progress: number;
  technologies: string;
}

export interface FutureQuest {
  id: string;
  title: string;
  description: string;
  timeline: string;
  icon: string;
}

export interface StatItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export interface ReasonItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}
