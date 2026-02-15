/**
 * ============================================================================
 * SOVEREON INC. - MAIN APPLICATION ROUTER
 * ============================================================================
 * 
 * This file contains the main routing configuration for the Sovereon Inc.
 * website. It defines all routes for the multi-page application including:
 * - Homepage
 * - Services (main and all 21 subpages)
 * - Company pages (Who We Are, Why Choose Us, Testimonials)
 * - Contact and FAQ pages
 * - Pricing, Case Studies, Blog
 * - Footer pages (Privacy, Terms, Careers, Sitemap)
 * 
 * @author Sovereon Inc. Development Team
 * @since February 2026
 * @version 1.0.0
 */

import { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import PortalLayout from './components/portal/PortalLayout';
import { HomePage } from './pages/HomePage';

// Lazy load portal pages for better code splitting
const DashboardPage = lazy(() => import('./pages/portal/DashboardPage'));
const OrdersPage = lazy(() => import('./pages/portal/OrdersPage'));
const SubscriptionsPage = lazy(() => import('./pages/portal/SubscriptionsPage'));
const InvoicesPage = lazy(() => import('./pages/portal/InvoicesPage'));
const ProfilePage = lazy(() => import('./pages/portal/ProfilePage'));

// Lazy load auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const OAuthCallbackPage = lazy(() => import('./pages/auth/OAuthCallbackPage'));

// Lazy load main pages
const ServicesPage = lazy(() => import('./pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const WhoWeArePage = lazy(() => import('./pages/WhoWeArePage').then(m => ({ default: m.WhoWeArePage })));
const WhyChooseUsPage = lazy(() => import('./pages/WhyChooseUsPage').then(m => ({ default: m.WhyChooseUsPage })));
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage').then(m => ({ default: m.TestimonialsPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const FAQPage = lazy(() => import('./pages/FAQPage').then(m => ({ default: m.FAQPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));
const CaseStudiesPage = lazy(() => import('./pages/CaseStudiesPage').then(m => ({ default: m.CaseStudiesPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const CareersPage = lazy(() => import('./pages/CareersPage').then(m => ({ default: m.CareersPage })));
const SitemapPage = lazy(() => import('./pages/SitemapPage').then(m => ({ default: m.SitemapPage })));

// Lazy load service pages
const CommunicationMessagingPage = lazy(() => import('./pages/services/CommunicationMessagingPage').then(m => ({ default: m.CommunicationMessagingPage })));
const SoftwareAppDevelopmentPage = lazy(() => import('./pages/services/SoftwareAppDevelopmentPage').then(m => ({ default: m.SoftwareAppDevelopmentPage })));
const MaintenanceSupportPage = lazy(() => import('./pages/services/MaintenanceSupportPage').then(m => ({ default: m.MaintenanceSupportPage })));
const CloudITSolutionsPage = lazy(() => import('./pages/services/CloudITSolutionsPage').then(m => ({ default: m.CloudITSolutionsPage })));
const DigitalMarketingSEOPage = lazy(() => import('./pages/services/DigitalMarketingSEOPage').then(m => ({ default: m.DigitalMarketingSEOPage })));
const ContentMediaProductionPage = lazy(() => import('./pages/services/ContentMediaProductionPage').then(m => ({ default: m.ContentMediaProductionPage })));

// Lazy load service subpages
const BroadcastSMSPage = lazy(() => import('./pages/services/BroadcastSMSPage').then(m => ({ default: m.BroadcastSMSPage })));
const BulkSMSPage = lazy(() => import('./pages/services/BulkSMSPage').then(m => ({ default: m.BulkSMSPage })));
const IVRCallingPage = lazy(() => import('./pages/services/IVRCallingPage').then(m => ({ default: m.IVRCallingPage })));
const EmailSMSMarketingPage = lazy(() => import('./pages/services/EmailSMSMarketingPage').then(m => ({ default: m.EmailSMSMarketingPage })));
const WebsiteDesignDevelopmentPage = lazy(() => import('./pages/services/WebsiteDesignDevelopmentPage').then(m => ({ default: m.WebsiteDesignDevelopmentPage })));
const MobileAppDevelopmentPage = lazy(() => import('./pages/services/MobileAppDevelopmentPage').then(m => ({ default: m.MobileAppDevelopmentPage })));
const CustomSoftwareSolutionsPage = lazy(() => import('./pages/services/CustomSoftwareSolutionsPage').then(m => ({ default: m.CustomSoftwareSolutionsPage })));
const UIUXDesignPage = lazy(() => import('./pages/services/UIUXDesignPage').then(m => ({ default: m.UIUXDesignPage })));
const WebAppMaintenancePage = lazy(() => import('./pages/services/WebAppMaintenancePage').then(m => ({ default: m.WebAppMaintenancePage })));
const CloudSolutionsHostingPage = lazy(() => import('./pages/services/CloudSolutionsHostingPage').then(m => ({ default: m.CloudSolutionsHostingPage })));
const ITConsultingTransformationPage = lazy(() => import('./pages/services/ITConsultingTransformationPage').then(m => ({ default: m.ITConsultingTransformationPage })));
const SEOPage = lazy(() => import('./pages/services/SEOPage').then(m => ({ default: m.SEOPage })));
const SocialMediaMarketingPage = lazy(() => import('./pages/services/SocialMediaMarketingPage').then(m => ({ default: m.SocialMediaMarketingPage })));
const PaidAdsPage = lazy(() => import('./pages/services/PaidAdsPage').then(m => ({ default: m.PaidAdsPage })));
const InfluencerMarketingPage = lazy(() => import('./pages/services/InfluencerMarketingPage').then(m => ({ default: m.InfluencerMarketingPage })));
const LeadGenerationPage = lazy(() => import('./pages/services/LeadGenerationPage').then(m => ({ default: m.LeadGenerationPage })));
const PodcastProductionOnlyPage = lazy(() => import('./pages/services/PodcastProductionOnlyPage').then(m => ({ default: m.PodcastProductionOnlyPage })));
const PodcastProductionPromotionPage = lazy(() => import('./pages/services/PodcastProductionPromotionPage').then(m => ({ default: m.PodcastProductionPromotionPage })));
const OnlinePRReputationPage = lazy(() => import('./pages/services/OnlinePRReputationPage').then(m => ({ default: m.OnlinePRReputationPage })));
const AdShootPage = lazy(() => import('./pages/services/AdShootPage').then(m => ({ default: m.AdShootPage })));
const PhotoShootPage = lazy(() => import('./pages/services/PhotoShootPage').then(m => ({ default: m.PhotoShootPage })));

// Loading component for suspended routes
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-pulse space-y-4">
      <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
      <p className="text-center text-muted-foreground">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth Routes (no Layout) */}
          <Route path="/auth/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
          <Route path="/auth/register" element={<Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>} />
          <Route path="/auth/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPasswordPage /></Suspense>} />
          <Route path="/auth/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPasswordPage /></Suspense>} />
          <Route path="/auth/verify-email" element={<Suspense fallback={<PageLoader />}><VerifyEmailPage /></Suspense>} />
          <Route path="/auth/callback" element={<Suspense fallback={<PageLoader />}><OAuthCallbackPage /></Suspense>} />
          
          {/* Portal Routes (with PortalLayout) */}
          <Route path="/portal" element={<PortalLayout />}>
            <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
            <Route path="orders" element={<Suspense fallback={<PageLoader />}><OrdersPage /></Suspense>} />
            <Route path="subscriptions" element={<Suspense fallback={<PageLoader />}><SubscriptionsPage /></Suspense>} />
            <Route path="invoices" element={<Suspense fallback={<PageLoader />}><InvoicesPage /></Suspense>} />
            <Route path="profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
          </Route>
          
          {/* Main Website Routes (with Layout) */}
          <Route path="/" element={<Layout />}>
            {/* Main Pages */}
            <Route index element={<HomePage />} />
            <Route path="services" element={<Suspense fallback={<PageLoader />}><ServicesPage /></Suspense>} />
            <Route path="who-we-are" element={<Suspense fallback={<PageLoader />}><WhoWeArePage /></Suspense>} />
            <Route path="why-choose-us" element={<Suspense fallback={<PageLoader />}><WhyChooseUsPage /></Suspense>} />
            <Route path="testimonials" element={<Suspense fallback={<PageLoader />}><TestimonialsPage /></Suspense>} />
            <Route path="contact-us" element={<Suspense fallback={<PageLoader />}><ContactPage /></Suspense>} />
            <Route path="faq" element={<Suspense fallback={<PageLoader />}><FAQPage /></Suspense>} />
            <Route path="pricing" element={<Suspense fallback={<PageLoader />}><PricingPage /></Suspense>} />
            <Route path="case-studies" element={<Suspense fallback={<PageLoader />}><CaseStudiesPage /></Suspense>} />
            <Route path="blog" element={<Suspense fallback={<PageLoader />}><BlogPage /></Suspense>} />
            
            {/* Service Category Pages */}
            <Route path="services/communication-messaging" element={<Suspense fallback={<PageLoader />}><CommunicationMessagingPage /></Suspense>} />
            <Route path="services/software-app-development" element={<Suspense fallback={<PageLoader />}><SoftwareAppDevelopmentPage /></Suspense>} />
            <Route path="services/maintenance-support" element={<Suspense fallback={<PageLoader />}><MaintenanceSupportPage /></Suspense>} />
            <Route path="services/cloud-it-solutions" element={<Suspense fallback={<PageLoader />}><CloudITSolutionsPage /></Suspense>} />
            <Route path="services/digital-marketing-seo" element={<Suspense fallback={<PageLoader />}><DigitalMarketingSEOPage /></Suspense>} />
            <Route path="services/content-media-production" element={<Suspense fallback={<PageLoader />}><ContentMediaProductionPage /></Suspense>} />
            
            {/* Communication & Messaging Subpages */}
            <Route path="services/broadcast-sms" element={<Suspense fallback={<PageLoader />}><BroadcastSMSPage /></Suspense>} />
            <Route path="services/bulk-sms" element={<Suspense fallback={<PageLoader />}><BulkSMSPage /></Suspense>} />
            <Route path="services/ivr-calling" element={<Suspense fallback={<PageLoader />}><IVRCallingPage /></Suspense>} />
            <Route path="services/email-sms-marketing" element={<Suspense fallback={<PageLoader />}><EmailSMSMarketingPage /></Suspense>} />
            
            {/* Software & App Development Subpages */}
            <Route path="services/website-design-development" element={<Suspense fallback={<PageLoader />}><WebsiteDesignDevelopmentPage /></Suspense>} />
            <Route path="services/mobile-app-development" element={<Suspense fallback={<PageLoader />}><MobileAppDevelopmentPage /></Suspense>} />
            <Route path="services/custom-software-solutions" element={<Suspense fallback={<PageLoader />}><CustomSoftwareSolutionsPage /></Suspense>} />
            <Route path="services/ui-ux-design" element={<Suspense fallback={<PageLoader />}><UIUXDesignPage /></Suspense>} />
            
            {/* Maintenance & Support Subpages */}
            <Route path="services/web-app-maintenance" element={<Suspense fallback={<PageLoader />}><WebAppMaintenancePage /></Suspense>} />
            
            {/* Cloud & IT Solutions Subpages */}
            <Route path="services/cloud-solutions-hosting" element={<Suspense fallback={<PageLoader />}><CloudSolutionsHostingPage /></Suspense>} />
            <Route path="services/it-consulting-transformation" element={<Suspense fallback={<PageLoader />}><ITConsultingTransformationPage /></Suspense>} />
            
            {/* Digital Marketing & SEO Subpages */}
            <Route path="services/seo" element={<Suspense fallback={<PageLoader />}><SEOPage /></Suspense>} />
            <Route path="services/social-media-marketing" element={<Suspense fallback={<PageLoader />}><SocialMediaMarketingPage /></Suspense>} />
            <Route path="services/paid-ads" element={<Suspense fallback={<PageLoader />}><PaidAdsPage /></Suspense>} />
            <Route path="services/influencer-marketing" element={<Suspense fallback={<PageLoader />}><InfluencerMarketingPage /></Suspense>} />
            <Route path="services/lead-generation" element={<Suspense fallback={<PageLoader />}><LeadGenerationPage /></Suspense>} />
            
            {/* Content & Media Production Subpages */}
            <Route path="services/podcast-production-only" element={<Suspense fallback={<PageLoader />}><PodcastProductionOnlyPage /></Suspense>} />
            <Route path="services/podcast-production-promotion" element={<Suspense fallback={<PageLoader />}><PodcastProductionPromotionPage /></Suspense>} />
            <Route path="services/online-pr-reputation" element={<Suspense fallback={<PageLoader />}><OnlinePRReputationPage /></Suspense>} />
            <Route path="services/ad-shoot" element={<Suspense fallback={<PageLoader />}><AdShootPage /></Suspense>} />
            <Route path="services/photo-shoot" element={<Suspense fallback={<PageLoader />}><PhotoShootPage /></Suspense>} />
            
            {/* Footer Pages */}
            <Route path="privacy" element={<Suspense fallback={<PageLoader />}><PrivacyPage /></Suspense>} />
            <Route path="terms" element={<Suspense fallback={<PageLoader />}><TermsPage /></Suspense>} />
            <Route path="careers" element={<Suspense fallback={<PageLoader />}><CareersPage /></Suspense>} />
            <Route path="sitemap" element={<Suspense fallback={<PageLoader />}><SitemapPage /></Suspense>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
