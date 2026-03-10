/**
 * ============================================================================
 * FRONTEND PERFORMANCE MODULE - Index
 * ============================================================================
 * Central export point for all frontend performance utilities
 */

// Web Vitals
export {
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
} from './web-vitals';
export type { WebVitalName } from './web-vitals';

// Bundle Analyzer
export {
  formatBytes,
  registerChunk,
  trackChunkLoad,
  getChunkSize,
  getAllChunkSizes,
  registerComponent,
  trackComponentRender,
  getComponentInfo,
  getAllComponents,
  analyzeLazyLoading,
  measureLazyLoad,
  registerDependency,
  findDuplicateDependencies,
  getDependencyTree,
  analyzeUnusedExports,
  generateBundleReport,
  getCurrentReport,
  monitorBundleLoading,
  measureInitialLoadTime,
  checkBudgets,
  initializeBundleAnalyzer,
  BUNDLE_THRESHOLDS,
} from './bundle-analyzer';
