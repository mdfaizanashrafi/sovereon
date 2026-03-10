/**
 * ============================================================================
 * CORE WEB VITALS TRACKING
 * ============================================================================
 * Tracks and reports Core Web Vitals metrics for performance monitoring
 */

import { logger } from '../lib/sentry';

/**
 * Core Web Vitals metric names
 */
export type WebVitalName = 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'INP';

/**
 * Web Vitals rating thresholds (based on Google's recommended values)
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint (ms)
  FID: { good: 100, poor: 300 },        // First Input Delay (ms)
  CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift (unitless)
  FCP: { good: 1800, poor: 3000 },      // First Contentful Paint (ms)
  TTFB: { good: 800, poor: 1800 },      // Time to First Byte (ms)
  INP: { good: 200, poor: 500 },        // Interaction to Next Paint (ms)
};

/**
 * Web Vitals metric value
 */
interface WebVitalValue {
  name: WebVitalName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  entries: PerformanceEntry[];
  id: string;
  navigationType?: string;
}

/**
 * Web Vitals callback function type
 */
type WebVitalsCallback = (metric: WebVitalValue) => void;

/**
 * Performance observer for web vitals
 */
let observers: PerformanceObserver[] = [];

/**
 * Store for collected web vitals
 */
const webVitalsStore = new Map<WebVitalName, WebVitalValue>();

/**
 * Callbacks registered for web vitals
 */
const callbacks = new Set<WebVitalsCallback>();

/**
 * Generate unique ID for metric entries
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get rating based on threshold
 */
function getRating(name: WebVitalName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[name];
  if (!thresholds) return 'good';
  
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Report web vital to registered callbacks
 */
function reportWebVital(metric: WebVitalValue): void {
  webVitalsStore.set(metric.name, metric);
  
  // Call all registered callbacks
  callbacks.forEach(cb => {
    try {
      cb(metric);
    } catch (e) {
      console.error('Error in web vitals callback:', e);
    }
  });
  
  // Log poor metrics
  if (metric.rating === 'poor') {
    if (logger?.warn) {
      logger.warn(`Poor ${metric.name} detected`, {
        value: metric.value,
        rating: metric.rating,
      });
    } else {
      console.warn(`Poor ${metric.name}:`, metric.value);
    }
  }
}

// ============================================================================
// LCP (Largest Contentful Paint)
// ============================================================================

/**
 * Initialize LCP tracking
 */
export function trackLCP(): void {
  if (!('PerformanceObserver' in window)) return;
  
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
    
    if (lastEntry) {
      const value = lastEntry.renderTime || lastEntry.loadTime || 0;
      reportWebVital({
        name: 'LCP',
        value,
        rating: getRating('LCP', value),
        entries,
        id: generateId(),
      });
    }
  });
  
  observer.observe({ entryTypes: ['largest-contentful-paint'] });
  observers.push(observer);
}

// ============================================================================
// FID (First Input Delay)
// ============================================================================

/**
 * Initialize FID tracking
 */
export function trackFID(): void {
  if (!('PerformanceObserver' in window)) return;
  
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    
    entries.forEach((entry) => {
      const firstInputEntry = entry as PerformanceEntry & { processingStart: number; startTime: number };
      const value = firstInputEntry.processingStart - firstInputEntry.startTime;
      
      reportWebVital({
        name: 'FID',
        value,
        rating: getRating('FID', value),
        entries: [entry],
        id: generateId(),
      });
    });
  });
  
  observer.observe({ entryTypes: ['first-input'] });
  observers.push(observer);
}

// ============================================================================
// CLS (Cumulative Layout Shift)
// ============================================================================

/**
 * Initialize CLS tracking
 */
export function trackCLS(): void {
  if (!('PerformanceObserver' in window)) return;
  
  let clsValue = 0;
  let clsEntries: PerformanceEntry[] = [];
  
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries() as PerformanceEntry[];
    
    entries.forEach((entry) => {
      // Only count layout shifts without recent user input
      const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
      if (!layoutShiftEntry.hadRecentInput) {
        clsValue += layoutShiftEntry.value;
        clsEntries.push(entry);
      }
    });
    
    reportWebVital({
      name: 'CLS',
      value: clsValue,
      rating: getRating('CLS', clsValue),
      entries: clsEntries,
      id: generateId(),
    });
  });
  
  observer.observe({ entryTypes: ['layout-shift'] });
  observers.push(observer);
}

// ============================================================================
// FCP (First Contentful Paint)
// ============================================================================

/**
 * Initialize FCP tracking
 */
export function trackFCP(): void {
  if (!('PerformanceObserver' in window)) return;
  
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const fcpEntry = entries.find((entry) => {
      const paintEntry = entry as PerformanceEntry & { name: string };
      return paintEntry.name === 'first-contentful-paint';
    }) as PerformanceEntry & { startTime: number };
    
    if (fcpEntry) {
      const value = fcpEntry.startTime;
      reportWebVital({
        name: 'FCP',
        value,
        rating: getRating('FCP', value),
        entries,
        id: generateId(),
      });
    }
  });
  
  observer.observe({ entryTypes: ['paint'] });
  observers.push(observer);
}

// ============================================================================
// TTFB (Time to First Byte)
// ============================================================================

/**
 * Initialize TTFB tracking
 */
export function trackTTFB(): void {
  // Use navigation timing API
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (navigation) {
    const value = navigation.responseStart - navigation.startTime;
    reportWebVital({
      name: 'TTFB',
      value,
      rating: getRating('TTFB', value),
      entries: [navigation],
      id: generateId(),
    });
  }
}

// ============================================================================
// INP (Interaction to Next Paint) - Experimental
// ============================================================================

interface InteractionEntry extends PerformanceEntry {
  processingStart: number;
  startTime: number;
  duration: number;
}

let inpObserver: PerformanceObserver | null = null;
const interactionEntries: InteractionEntry[] = [];

/**
 * Initialize INP tracking (experimental)
 */
export function trackINP(): void {
  if (!('PerformanceObserver' in window)) return;
  
  inpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries() as InteractionEntry[];
    entries.forEach((entry) => {
      interactionEntries.push(entry);
    });
  });
  
  // Observe event timing entries
  try {
    inpObserver.observe({ entryTypes: ['event'] });
    observers.push(inpObserver);
    
    // Calculate INP on page hide
    const calculateINP = () => {
      if (interactionEntries.length === 0) return;
      
      // Sort by duration and get the 98th percentile
      const sorted = [...interactionEntries].sort((a, b) => b.duration - a.duration);
      const index = Math.floor(sorted.length * 0.02); // 98th percentile
      const inpEntry = sorted[Math.max(0, index)];
      
      if (inpEntry) {
        reportWebVital({
          name: 'INP',
          value: inpEntry.duration,
          rating: getRating('INP', inpEntry.duration),
          entries: interactionEntries,
          id: generateId(),
        });
      }
    };
    
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        calculateINP();
      }
    });
  } catch (e) {
    console.warn('INP tracking not supported');
  }
}

// ============================================================================
// RESOURCE TIMING
// ============================================================================

/**
 * Track resource loading performance
 */
export function trackResourceTiming(): void {
  if (!('PerformanceObserver' in window)) return;
  
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    
    entries.forEach((entry) => {
      const resourceEntry = entry as PerformanceResourceTiming;
      
      // Log slow resources
      const duration = resourceEntry.duration;
      if (duration > 1000) {
        if (logger?.warn) {
          logger.warn('Slow resource detected', {
            url: resourceEntry.name,
            duration,
            type: resourceEntry.initiatorType,
          });
        } else {
          console.warn('Slow resource:', resourceEntry.name, duration);
        }
      }
    });
  });
  
  observer.observe({ entryTypes: ['resource'] });
  observers.push(observer);
}

// ============================================================================
// LONG TASKS
// ============================================================================

/**
 * Track long tasks that block the main thread
 */
export function trackLongTasks(): void {
  if (!('PerformanceObserver' in window)) return;
  
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        const longTaskEntry = entry as PerformanceEntry & { duration: number; attribution: unknown[] };
        
        if (logger?.warn) {
          logger.warn('Long task detected', {
            duration: longTaskEntry.duration,
            attribution: longTaskEntry.attribution,
          });
        } else {
          console.warn('Long task:', longTaskEntry.duration);
        }
      });
    });
    
    observer.observe({ entryTypes: ['longtask'] });
    observers.push(observer);
  } catch (e) {
    console.warn('Long task tracking not supported');
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Register a callback for web vitals updates
 */
export function onWebVital(callback: WebVitalsCallback): () => void {
  callbacks.add(callback);
  
  // Return unsubscribe function
  return () => {
    callbacks.delete(callback);
  };
}

/**
 * Get current web vitals snapshot
 */
export function getWebVitals(): Map<WebVitalName, WebVitalValue> {
  return new Map(webVitalsStore);
}

/**
 * Get specific web vital value
 */
export function getWebVital(name: WebVitalName): WebVitalValue | undefined {
  return webVitalsStore.get(name);
}

/**
 * Get web vitals report for analytics
 */
export function getWebVitalsReport(): Record<string, unknown> {
  const vitals = Array.from(webVitalsStore.entries());
  
  return {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    vitals: vitals.reduce((acc, [name, metric]) => {
      acc[name] = {
        value: metric.value,
        rating: metric.rating,
      };
      return acc;
    }, {} as Record<string, { value: number; rating: string }>),
    summary: {
      good: vitals.filter(([, m]) => m.rating === 'good').length,
      needsImprovement: vitals.filter(([, m]) => m.rating === 'needs-improvement').length,
      poor: vitals.filter(([, m]) => m.rating === 'poor').length,
    },
  };
}

/**
 * Send web vitals to analytics endpoint
 */
export function sendWebVitalsToAnalytics(endpoint: string): void {
  const report = getWebVitalsReport();
  
  // Use sendBeacon if available, otherwise fetch
  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, JSON.stringify(report));
  } else {
    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(report),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {
      // Silently fail
    });
  }
}

/**
 * Clear all web vitals data
 */
export function clearWebVitals(): void {
  webVitalsStore.clear();
}

/**
 * Disconnect all observers
 */
export function disconnectObservers(): void {
  observers.forEach(observer => observer.disconnect());
  observers = [];
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize all web vitals tracking
 */
export function initializeWebVitals(config?: {
  lcp?: boolean;
  fid?: boolean;
  cls?: boolean;
  fcp?: boolean;
  ttfb?: boolean;
  inp?: boolean;
  resourceTiming?: boolean;
  longTasks?: boolean;
}): void {
  const opts = {
    lcp: true,
    fid: true,
    cls: true,
    fcp: true,
    ttfb: true,
    inp: false, // Experimental, opt-in
    resourceTiming: true,
    longTasks: true,
    ...config,
  };
  
  if (opts.lcp) trackLCP();
  if (opts.fid) trackFID();
  if (opts.cls) trackCLS();
  if (opts.fcp) trackFCP();
  if (opts.ttfb) trackTTFB();
  if (opts.inp) trackINP();
  if (opts.resourceTiming) trackResourceTiming();
  if (opts.longTasks) trackLongTasks();
  
  console.log('Web Vitals tracking initialized');
}

export default {
  initializeWebVitals,
  trackLCP,
  trackFID,
  trackCLS,
  trackFCP,
  trackTTFB,
  trackINP,
  trackResourceTiming,
  trackLongTasks,
  onWebVital,
  getWebVitals,
  getWebVital,
  getWebVitalsReport,
  sendWebVitalsToAnalytics,
  clearWebVitals,
  disconnectObservers,
  WEB_VITALS_THRESHOLDS,
};
