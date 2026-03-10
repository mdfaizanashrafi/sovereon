/**
 * ============================================================================
 * ROUTE CONFIGURATION
 * ============================================================================
 * Centralized route definitions for the application
 */

import { lazy } from 'react';

// Route type definitions
export interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  exact?: boolean;
  admin?: boolean;
  children?: RouteConfig[];
}

// Page component lazy loaders
const Pages = {
  // Main pages
  Services: lazy(() => import('@/pages/ServicesPage').then(m => ({ default: m.ServicesPage }))),
  WhoWeAre: lazy(() => import('@/pages/WhoWeArePage').then(m => ({ default: m.WhoWeArePage }))),
  WhyChooseUs: lazy(() => import('@/pages/WhyChooseUsPage').then(m => ({ default: m.WhyChooseUsPage }))),
  Testimonials: lazy(() => import('@/pages/TestimonialsPage').then(m => ({ default: m.TestimonialsPage }))),
  Contact: lazy(() => import('@/pages/ContactPage').then(m => ({ default: m.ContactPage }))),
  FAQ: lazy(() => import('@/pages/FAQPage').then(m => ({ default: m.FAQPage }))),
  Pricing: lazy(() => import('@/pages/PricingPage').then(m => ({ default: m.PricingPage }))),
  CaseStudies: lazy(() => import('@/pages/CaseStudiesPage').then(m => ({ default: m.CaseStudiesPage }))),
  Blog: lazy(() => import('@/pages/BlogPage').then(m => ({ default: m.BlogPage }))),
  Privacy: lazy(() => import('@/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage }))),
  Terms: lazy(() => import('@/pages/TermsPage').then(m => ({ default: m.TermsPage }))),
  Careers: lazy(() => import('@/pages/CareersPage').then(m => ({ default: m.CareersPage }))),
  Sitemap: lazy(() => import('@/pages/SitemapPage').then(m => ({ default: m.SitemapPage }))),

  // Service category pages
  AIServices: lazy(() => import('@/pages/services/AIServicesPage').then(m => ({ default: m.AIServicesPage }))),
  CommunicationMessaging: lazy(() => import('@/pages/services/CommunicationMessagingPage').then(m => ({ default: m.CommunicationMessagingPage }))),
  SoftwareAppDevelopment: lazy(() => import('@/pages/services/SoftwareAppDevelopmentPage').then(m => ({ default: m.SoftwareAppDevelopmentPage }))),
  MaintenanceSupport: lazy(() => import('@/pages/services/MaintenanceSupportPage').then(m => ({ default: m.MaintenanceSupportPage }))),
  CloudITSolutions: lazy(() => import('@/pages/services/CloudITSolutionsPage').then(m => ({ default: m.CloudITSolutionsPage }))),
  DigitalMarketingSEO: lazy(() => import('@/pages/services/DigitalMarketingSEOPage').then(m => ({ default: m.DigitalMarketingSEOPage }))),
  ContentMediaProduction: lazy(() => import('@/pages/services/ContentMediaProductionPage').then(m => ({ default: m.ContentMediaProductionPage }))),

  // AI Services subpages
  AISeoSearch: lazy(() => import('@/pages/services/AISeoSearchPage').then(m => ({ default: m.AISeoSearchPage }))),
  PersonalizedAIAgents: lazy(() => import('@/pages/services/PersonalizedAIAgentsPage').then(m => ({ default: m.PersonalizedAIAgentsPage }))),
  AIContentGeneration: lazy(() => import('@/pages/services/AIContentGenerationPage').then(m => ({ default: m.AIContentGenerationPage }))),
  AIDataAnalytics: lazy(() => import('@/pages/services/AIDataAnalyticsPage').then(m => ({ default: m.AIDataAnalyticsPage }))),

  // Communication & Messaging subpages
  BroadcastSMS: lazy(() => import('@/pages/services/BroadcastSMSPage').then(m => ({ default: m.BroadcastSMSPage }))),
  BulkSMS: lazy(() => import('@/pages/services/BulkSMSPage').then(m => ({ default: m.BulkSMSPage }))),
  IVRCalling: lazy(() => import('@/pages/services/IVRCallingPage').then(m => ({ default: m.IVRCallingPage }))),
  EmailSMSMarketing: lazy(() => import('@/pages/services/EmailSMSMarketingPage').then(m => ({ default: m.EmailSMSMarketingPage }))),

  // Software & App Development subpages
  WebsiteDesignDevelopment: lazy(() => import('@/pages/services/WebsiteDesignDevelopmentPage').then(m => ({ default: m.WebsiteDesignDevelopmentPage }))),
  MobileAppDevelopment: lazy(() => import('@/pages/services/MobileAppDevelopmentPage').then(m => ({ default: m.MobileAppDevelopmentPage }))),
  CustomSoftwareSolutions: lazy(() => import('@/pages/services/CustomSoftwareSolutionsPage').then(m => ({ default: m.CustomSoftwareSolutionsPage }))),
  UIUXDesign: lazy(() => import('@/pages/services/UIUXDesignPage').then(m => ({ default: m.UIUXDesignPage }))),

  // Maintenance & Support subpages
  WebAppMaintenance: lazy(() => import('@/pages/services/WebAppMaintenancePage').then(m => ({ default: m.WebAppMaintenancePage }))),

  // Cloud & IT Solutions subpages
  CloudSolutionsHosting: lazy(() => import('@/pages/services/CloudSolutionsHostingPage').then(m => ({ default: m.CloudSolutionsHostingPage }))),
  ITConsultingTransformation: lazy(() => import('@/pages/services/ITConsultingTransformationPage').then(m => ({ default: m.ITConsultingTransformationPage }))),

  // Digital Marketing & SEO subpages
  SEO: lazy(() => import('@/pages/services/SEOPage').then(m => ({ default: m.SEOPage }))),
  SocialMediaMarketing: lazy(() => import('@/pages/services/SocialMediaMarketingPage').then(m => ({ default: m.SocialMediaMarketingPage }))),
  PaidAds: lazy(() => import('@/pages/services/PaidAdsPage').then(m => ({ default: m.PaidAdsPage }))),
  InfluencerMarketing: lazy(() => import('@/pages/services/InfluencerMarketingPage').then(m => ({ default: m.InfluencerMarketingPage }))),
  LeadGeneration: lazy(() => import('@/pages/services/LeadGenerationPage').then(m => ({ default: m.LeadGenerationPage }))),

  // Content & Media Production subpages
  PodcastProductionOnly: lazy(() => import('@/pages/services/PodcastProductionOnlyPage').then(m => ({ default: m.PodcastProductionOnlyPage }))),
  PodcastProductionPromotion: lazy(() => import('@/pages/services/PodcastProductionPromotionPage').then(m => ({ default: m.PodcastProductionPromotionPage }))),
  OnlinePRReputation: lazy(() => import('@/pages/services/OnlinePRReputationPage').then(m => ({ default: m.OnlinePRReputationPage }))),
  AdShoot: lazy(() => import('@/pages/services/AdShootPage').then(m => ({ default: m.AdShootPage }))),
  PhotoShoot: lazy(() => import('@/pages/services/PhotoShootPage').then(m => ({ default: m.PhotoShootPage }))),

  // Admin pages
  AdminLogin: lazy(() => import('@/pages/admin/AdminLoginPage')),
  AdminLayout: lazy(() => import('@/pages/admin/AdminLayout')),
  AdminDashboard: lazy(() => import('@/pages/admin/AdminDashboard')),
  TeamCMS: lazy(() => import('@/pages/admin/CMSPages/TeamCMS')),
  ServicesCMS: lazy(() => import('@/pages/admin/CMSPages/ServicesCMS')),
  TestimonialsCMS: lazy(() => import('@/pages/admin/CMSPages/TestimonialsCMS')),
  FAQCMS: lazy(() => import('@/pages/admin/CMSPages/FAQCMS')),
  SettingsCMS: lazy(() => import('@/pages/admin/CMSPages/SettingsCMS')),
  CaseStudiesCMS: lazy(() => import('@/pages/admin/CMSPages/CaseStudiesCMS')),
  BlogCMS: lazy(() => import('@/pages/admin/CMSPages/BlogCMS')),
};

// Main website routes
export const mainRoutes: RouteConfig[] = [
  { path: 'services', component: Pages.Services },
  { path: 'who-we-are', component: Pages.WhoWeAre },
  { path: 'why-choose-us', component: Pages.WhyChooseUs },
  { path: 'testimonials', component: Pages.Testimonials },
  { path: 'contact-us', component: Pages.Contact },
  { path: 'faq', component: Pages.FAQ },
  { path: 'pricing', component: Pages.Pricing },
  { path: 'case-studies', component: Pages.CaseStudies },
  { path: 'blog', component: Pages.Blog },
  { path: 'privacy', component: Pages.Privacy },
  { path: 'terms', component: Pages.Terms },
  { path: 'careers', component: Pages.Careers },
  { path: 'sitemap', component: Pages.Sitemap },
];

// Service category routes
export const serviceRoutes: RouteConfig[] = [
  { path: 'services/ai-services', component: Pages.AIServices },
  { path: 'services/communication-messaging', component: Pages.CommunicationMessaging },
  { path: 'services/software-app-development', component: Pages.SoftwareAppDevelopment },
  { path: 'services/maintenance-support', component: Pages.MaintenanceSupport },
  { path: 'services/cloud-it-solutions', component: Pages.CloudITSolutions },
  { path: 'services/digital-marketing-seo', component: Pages.DigitalMarketingSEO },
  { path: 'services/content-media-production', component: Pages.ContentMediaProduction },
];

// AI Services subpage routes
export const aiServiceRoutes: RouteConfig[] = [
  { path: 'services/ai-seo-search', component: Pages.AISeoSearch },
  { path: 'services/personalized-ai-agents', component: Pages.PersonalizedAIAgents },
  { path: 'services/ai-content-generation', component: Pages.AIContentGeneration },
  { path: 'services/ai-data-analytics', component: Pages.AIDataAnalytics },
];

// Communication & Messaging subpage routes
export const communicationRoutes: RouteConfig[] = [
  { path: 'services/broadcast-sms', component: Pages.BroadcastSMS },
  { path: 'services/bulk-sms', component: Pages.BulkSMS },
  { path: 'services/ivr-calling', component: Pages.IVRCalling },
  { path: 'services/email-sms-marketing', component: Pages.EmailSMSMarketing },
];

// Software & App Development subpage routes
export const softwareRoutes: RouteConfig[] = [
  { path: 'services/website-design-development', component: Pages.WebsiteDesignDevelopment },
  { path: 'services/mobile-app-development', component: Pages.MobileAppDevelopment },
  { path: 'services/custom-software-solutions', component: Pages.CustomSoftwareSolutions },
  { path: 'services/ui-ux-design', component: Pages.UIUXDesign },
];

// Maintenance & Support subpage routes
export const maintenanceRoutes: RouteConfig[] = [
  { path: 'services/web-app-maintenance', component: Pages.WebAppMaintenance },
];

// Cloud & IT Solutions subpage routes
export const cloudRoutes: RouteConfig[] = [
  { path: 'services/cloud-solutions-hosting', component: Pages.CloudSolutionsHosting },
  { path: 'services/it-consulting-transformation', component: Pages.ITConsultingTransformation },
];

// Digital Marketing & SEO subpage routes
export const marketingRoutes: RouteConfig[] = [
  { path: 'services/seo', component: Pages.SEO },
  { path: 'services/social-media-marketing', component: Pages.SocialMediaMarketing },
  { path: 'services/paid-ads', component: Pages.PaidAds },
  { path: 'services/influencer-marketing', component: Pages.InfluencerMarketing },
  { path: 'services/lead-generation', component: Pages.LeadGeneration },
];

// Content & Media Production subpage routes
export const contentRoutes: RouteConfig[] = [
  { path: 'services/podcast-production-only', component: Pages.PodcastProductionOnly },
  { path: 'services/podcast-production-promotion', component: Pages.PodcastProductionPromotion },
  { path: 'services/online-pr-reputation', component: Pages.OnlinePRReputation },
  { path: 'services/ad-shoot', component: Pages.AdShoot },
  { path: 'services/photo-shoot', component: Pages.PhotoShoot },
];

// Admin routes
export const adminRoutes: RouteConfig[] = [
  { path: '/admin/login', component: Pages.AdminLogin, admin: true },
  { 
    path: '/admin', 
    component: Pages.AdminLayout, 
    admin: true,
    children: [
      { path: '', component: Pages.AdminDashboard },
      { path: 'team', component: Pages.TeamCMS },
      { path: 'services', component: Pages.ServicesCMS },
      { path: 'testimonials', component: Pages.TestimonialsCMS },
      { path: 'case-studies', component: Pages.CaseStudiesCMS },
      { path: 'blog', component: Pages.BlogCMS },
      { path: 'faqs', component: Pages.FAQCMS },
      { path: 'settings', component: Pages.SettingsCMS },
    ]
  },
];

// All routes combined
export const allRoutes: RouteConfig[] = [
  ...mainRoutes,
  ...serviceRoutes,
  ...aiServiceRoutes,
  ...communicationRoutes,
  ...softwareRoutes,
  ...maintenanceRoutes,
  ...cloudRoutes,
  ...marketingRoutes,
  ...contentRoutes,
];
