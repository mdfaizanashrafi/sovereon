/**
 * ============================================================================
 * SEO COMPONENT - Dynamic Page Metadata
 * ============================================================================
 * 
 * A reusable SEO component that manages page-specific metadata including:
 * - Dynamic title and meta descriptions
 * - Open Graph tags for social sharing
 * - Twitter Card tags
 * - Canonical URLs
 * - JSON-LD structured data
 * 
 * Usage:
 * <SEO 
 *   title="Service Name"
 *   description="Page description"
 *   keywords="keyword1, keyword2"
 *   canonical="/services/service-name"
 *   schema={serviceSchema}
 * />
 * 
 * @component
 * @since February 2026
 * @version 1.0.0
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ============================================================================
// TYPES
// ============================================================================

export interface SEOProps {
  /** Page title (without site name) */
  title: string;
  /** Meta description (150-160 chars recommended) */
  description: string;
  /** Comma-separated keywords */
  keywords?: string;
  /** Canonical path (e.g., /services/ai-seo) */
  canonical?: string;
  /** Open Graph image URL */
  ogImage?: string;
  /** Open Graph type */
  ogType?: 'website' | 'article' | 'service';
  /** Noindex directive */
  noindex?: boolean;
  /** JSON-LD schema object */
  schema?: Record<string, unknown>;
  /** Article published date (for blog posts) */
  publishedTime?: string;
  /** Article modified date (for blog posts) */
  modifiedTime?: string;
  /** Article author (for blog posts) */
  author?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SITE_NAME = 'Sovereon Inc.';
const SITE_URL = 'https://sovereon.online';
const DEFAULT_OG_IMAGE = '/android-chrome-512x512.png';
const DEFAULT_DESCRIPTION = 'We build AI systems, software, and marketing campaigns that drive real revenue. Based in Bhagalpur, Bihar.';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format full title with site name
 */
function formatTitle(title: string): string {
  if (title.includes(SITE_NAME)) return title;
  return `${title} | ${SITE_NAME}`;
}

/**
 * Get full canonical URL
 */
function getCanonicalUrl(path?: string): string {
  if (!path) return SITE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

/**
 * Get full OG image URL
 */
function getOgImageUrl(image?: string): string {
  if (!image) return `${SITE_URL}${DEFAULT_OG_IMAGE}`;
  if (image.startsWith('http')) return image;
  return `${SITE_URL}${image.startsWith('/') ? '' : '/'}${image}`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  noindex = false,
  schema,
  publishedTime,
  modifiedTime,
  author,
}: SEOProps) {
  const location = useLocation();
  const fullTitle = formatTitle(title);
  const canonicalUrl = canonical ? getCanonicalUrl(canonical) : `${SITE_URL}${location.pathname}`;
  const ogImageUrl = getOgImageUrl(ogImage);

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to set/update meta tag
    const setMetaTag = (selector: string, attribute: string, value: string, tagName?: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element && tagName) {
        element = document.createElement(tagName) as HTMLMetaElement;
        document.head.appendChild(element);
      }
      if (element) {
        if (attribute === 'innerHTML') {
          (element as unknown as HTMLElement).innerHTML = value;
        } else {
          element.setAttribute(attribute, value);
        }
      }
    };

    // Standard meta tags
    setMetaTag('meta[name="description"]', 'content', description, 'meta');
    if (keywords) {
      setMetaTag('meta[name="keywords"]', 'content', keywords, 'meta');
    }
    setMetaTag('meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow', 'meta');

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Open Graph tags
    setMetaTag('meta[property="og:title"]', 'content', fullTitle, 'meta');
    setMetaTag('meta[property="og:description"]', 'content', description, 'meta');
    setMetaTag('meta[property="og:url"]', 'content', canonicalUrl, 'meta');
    setMetaTag('meta[property="og:type"]', 'content', ogType, 'meta');
    setMetaTag('meta[property="og:image"]', 'content', ogImageUrl, 'meta');
    setMetaTag('meta[property="og:site_name"]', 'content', SITE_NAME, 'meta');

    // Twitter Card tags
    setMetaTag('meta[property="twitter:title"]', 'content', fullTitle, 'meta');
    setMetaTag('meta[property="twitter:description"]', 'content', description, 'meta');
    setMetaTag('meta[property="twitter:image"]', 'content', ogImageUrl, 'meta');

    // Article specific tags
    if (ogType === 'article') {
      if (publishedTime) {
        setMetaTag('meta[property="article:published_time"]', 'content', publishedTime, 'meta');
      }
      if (modifiedTime) {
        setMetaTag('meta[property="article:modified_time"]', 'content', modifiedTime, 'meta');
      }
      if (author) {
        setMetaTag('meta[property="article:author"]', 'content', author, 'meta');
      }
    }

    // JSON-LD Schema
    if (schema) {
      const schemaScriptId = 'page-schema';
      let schemaScript = document.getElementById(schemaScriptId) as HTMLScriptElement | null;
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = schemaScriptId;
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        ...schema,
      });
    }

    // Cleanup function
    return () => {
      // Schema is not removed on unmount to prevent hydration issues
      // It will be overwritten by the next page
    };
  }, [fullTitle, description, keywords, canonicalUrl, ogImageUrl, ogType, noindex, schema, publishedTime, modifiedTime, author]);

  // Component renders nothing visible
  return null;
}

// ============================================================================
// SCHEMA BUILDERS
// ============================================================================

/**
 * Build Service schema for service pages
 */
export function buildServiceSchema(
  name: string,
  description: string,
  url: string,
  provider = 'Sovereon Inc.'
): Record<string, unknown> {
  return {
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider,
    },
    url: `${SITE_URL}${url}`,
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
  };
}

/**
 * Build Article schema for blog posts
 */
export function buildArticleSchema(
  title: string,
  description: string,
  url: string,
  author: string,
  publishedDate: string,
  modifiedDate?: string,
  image?: string
): Record<string, unknown> {
  return {
    '@type': 'Article',
    headline: title,
    description,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
      },
    },
    datePublished: publishedDate,
    dateModified: modifiedDate || publishedDate,
    url: `${SITE_URL}${url}`,
    image: image ? getOgImageUrl(image) : `${SITE_URL}${DEFAULT_OG_IMAGE}`,
  };
}

/**
 * Build FAQPage schema
 */
export function buildFAQSchema(
  questions: Array<{ question: string; answer: string }>
): Record<string, unknown> {
  return {
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

/**
 * Build LocalBusiness schema
 */
export function buildLocalBusinessSchema(): Record<string, unknown> {
  return {
    '@type': 'LocalBusiness',
    name: SITE_NAME,
    image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    '@id': SITE_URL,
    url: SITE_URL,
    telephone: '+91-9113156083',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '',
      addressLocality: 'Bhagalpur',
      addressRegion: 'Bihar',
      postalCode: '812002',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 25.25,
      longitude: 87.0,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00',
    },
    priceRange: '₹₹',
  };
}

export default SEO;
