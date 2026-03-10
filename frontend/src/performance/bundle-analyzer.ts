/**
 * ============================================================================
 * BUNDLE SIZE ANALYZER
 * ============================================================================
 * Tracks and analyzes bundle sizes, component-level metrics, and dependencies
 */

import { logger } from '../lib/sentry';

/**
 * Bundle size threshold configuration
 */
export const BUNDLE_THRESHOLDS = {
  total: { warning: 500 * 1024, critical: 1000 * 1024 },      // 500KB / 1MB
  initial: { warning: 250 * 1024, critical: 500 * 1024 },     // 250KB / 500KB
  async: { warning: 100 * 1024, critical: 200 * 1024 },       // 100KB / 200KB
  component: { warning: 50 * 1024, critical: 100 * 1024 },    // 50KB / 100KB
  dependency: { warning: 30 * 1024, critical: 50 * 1024 },    // 30KB / 50KB
};

/**
 * Bundle chunk information
 */
interface BundleChunk {
  name: string;
  size: number;
  gzipSize: number;
  type: 'initial' | 'async' | 'dynamic';
  modules?: string[];
  imports?: string[];
  isLazyLoaded?: boolean;
}

/**
 * Component bundle info
 */
interface ComponentBundle {
  name: string;
  path: string;
  size: number;
  gzipSize: number;
  importedBy: string[];
  dependencies: string[];
}

/**
 * Dependency info
 */
interface DependencyInfo {
  name: string;
  version: string;
  size: number;
  isDuplicate: boolean;
  importedBy: string[];
  usedExports: string[];
}

/**
 * Bundle analysis report
 */
interface BundleReport {
  timestamp: string;
  totalSize: number;
  totalGzipSize: number;
  chunks: BundleChunk[];
  components: ComponentBundle[];
  dependencies: DependencyInfo[];
  duplicateDependencies: string[];
  unusedExports: string[];
  recommendations: string[];
}

// Storage for bundle data
let currentReport: BundleReport | null = null;
const chunkSizes = new Map<string, { size: number; gzipSize: number }>();
const componentSizes = new Map<string, ComponentBundle>();
const loadedChunks = new Set<string>();

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check size against thresholds
 */
function checkThreshold(size: number, type: keyof typeof BUNDLE_THRESHOLDS): 'ok' | 'warning' | 'critical' {
  const thresholds = BUNDLE_THRESHOLDS[type];
  if (size >= thresholds.critical) return 'critical';
  if (size >= thresholds.warning) return 'warning';
  return 'ok';
}

// ============================================================================
// CHUNK TRACKING
// ============================================================================

/**
 * Register a chunk size (called during build or runtime)
 */
export function registerChunk(
  name: string,
  size: number,
  gzipSize: number,
  type: BundleChunk['type'] = 'async'
): void {
  chunkSizes.set(name, { size, gzipSize });
  
  const status = checkThreshold(gzipSize, type === 'initial' ? 'initial' : 'async');
  
  if (status === 'critical') {
    if (logger?.error) {
      logger.error(`Critical bundle size: ${name}`, { size: formatBytes(gzipSize) });
    } else {
      console.error(`Critical bundle size: ${name} (${formatBytes(gzipSize)})`);
    }
  } else if (status === 'warning') {
    if (logger?.warn) {
      logger.warn(`Large bundle size: ${name}`, { size: formatBytes(gzipSize) });
    } else {
      console.warn(`Large bundle size: ${name} (${formatBytes(gzipSize)})`);
    }
  }
}

/**
 * Track when a chunk is loaded
 */
export function trackChunkLoad(chunkName: string): void {
  loadedChunks.add(chunkName);
  
  // Report to analytics
  if (window.performance && 'mark' in window.performance) {
    performance.mark(`chunk-loaded-${chunkName}`);
  }
  
  console.log(`[Bundle] Chunk loaded: ${chunkName}`);
}

/**
 * Get chunk size information
 */
export function getChunkSize(chunkName: string): { size: number; gzipSize: number } | undefined {
  return chunkSizes.get(chunkName);
}

/**
 * Get all chunk sizes
 */
export function getAllChunkSizes(): Map<string, { size: number; gzipSize: number }> {
  return new Map(chunkSizes);
}

// ============================================================================
// COMPONENT TRACKING
// ============================================================================

/**
 * Register component bundle info
 */
export function registerComponent(component: ComponentBundle): void {
  componentSizes.set(component.name, component);
  
  const status = checkThreshold(component.gzipSize, 'component');
  
  if (status === 'critical') {
    logger?.error?.(`Critical component size: ${component.name}`, { 
      size: formatBytes(component.gzipSize) 
    });
  }
}

/**
 * Track component render with performance marking
 */
export function trackComponentRender(componentName: string): void {
  if (window.performance && 'mark' in window.performance) {
    performance.mark(`component-render-${componentName}`);
  }
}

/**
 * Get component bundle info
 */
export function getComponentInfo(name: string): ComponentBundle | undefined {
  return componentSizes.get(name);
}

/**
 * Get all component bundle info
 */
export function getAllComponents(): ComponentBundle[] {
  return Array.from(componentSizes.values());
}

// ============================================================================
// LAZY LOADING EFFECTIVENESS
// ============================================================================

/**
 * Analyze lazy loading effectiveness
 */
export function analyzeLazyLoading(): {
  lazyLoadedChunks: string[];
  eagerLoadedChunks: string[];
  unusedChunks: string[];
  effectiveness: number;
} {
  const allChunks = Array.from(chunkSizes.keys());
  const lazyLoaded = Array.from(loadedChunks).filter(name => 
    chunkSizes.get(name) && !allChunks.includes(name + '-initial')
  );
  const eagerLoaded = allChunks.filter(name => 
    !lazyLoaded.includes(name) && name.includes('initial')
  );
  const unused = allChunks.filter(name => 
    !loadedChunks.has(name) && !name.includes('vendor')
  );
  
  const effectiveness = eagerLoaded.length > 0 
    ? lazyLoaded.length / (lazyLoaded.length + eagerLoaded.length) 
    : 0;
  
  return {
    lazyLoadedChunks: lazyLoaded,
    eagerLoadedChunks: eagerLoaded,
    unusedChunks: unused,
    effectiveness,
  };
}

/**
 * Measure lazy load timing
 */
export function measureLazyLoad(chunkName: string): Promise<number> {
  return new Promise((resolve) => {
    const start = performance.now();
    
    // Create a performance observer to detect when the chunk is loaded
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          const resourceEntry = entry as PerformanceResourceTiming;
          if (resourceEntry.name.includes(chunkName)) {
            observer.disconnect();
            resolve(resourceEntry.duration);
            return;
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        observer.disconnect();
        resolve(performance.now() - start);
      }, 30000);
    } else {
      // Fallback
      resolve(0);
    }
  });
}

// ============================================================================
// DEPENDENCY ANALYSIS
// ============================================================================

const dependencyMap = new Map<string, DependencyInfo>();
const duplicateDependencies = new Set<string>();

/**
 * Register a dependency
 */
export function registerDependency(dep: DependencyInfo): void {
  if (dependencyMap.has(dep.name)) {
    duplicateDependencies.add(dep.name);
    const existing = dependencyMap.get(dep.name)!;
    existing.isDuplicate = true;
    existing.importedBy = [...new Set([...existing.importedBy, ...dep.importedBy])];
  } else {
    dependencyMap.set(dep.name, dep);
  }
}

/**
 * Find duplicate dependencies
 */
export function findDuplicateDependencies(): DependencyInfo[] {
  return Array.from(dependencyMap.values()).filter(dep => dep.isDuplicate);
}

/**
 * Get dependency tree
 */
export function getDependencyTree(): Record<string, DependencyInfo> {
  return Object.fromEntries(dependencyMap);
}

/**
 * Analyze unused exports
 */
export function analyzeUnusedExports(): string[] {
  const unused: string[] = [];
  
  dependencyMap.forEach((dep) => {
    if (dep.usedExports.length === 0) {
      unused.push(dep.name);
    }
  });
  
  return unused;
}

// ============================================================================
// BUNDLE REPORT GENERATION
// ============================================================================

/**
 * Generate comprehensive bundle report
 */
export function generateBundleReport(): BundleReport {
  const chunks: BundleChunk[] = Array.from(chunkSizes.entries()).map(([name, sizes]) => ({
    name,
    size: sizes.size,
    gzipSize: sizes.gzipSize,
    type: name.includes('vendor') ? 'initial' : name.includes('lazy') ? 'dynamic' : 'async',
    isLazyLoaded: !name.includes('vendor') && !name.includes('main'),
  }));
  
  const components = Array.from(componentSizes.values());
  const dependencies = Array.from(dependencyMap.values());
  const duplicates = Array.from(duplicateDependencies);
  const unused = analyzeUnusedExports();
  
  const totalSize = chunks.reduce((sum, c) => sum + c.size, 0);
  const totalGzipSize = chunks.reduce((sum, c) => sum + c.gzipSize, 0);
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (totalGzipSize > BUNDLE_THRESHOLDS.total.warning) {
    recommendations.push(`Total bundle size (${formatBytes(totalGzipSize)}) exceeds recommended limit (${formatBytes(BUNDLE_THRESHOLDS.total.warning)})`);
  }
  
  if (duplicates.length > 0) {
    recommendations.push(`Remove duplicate dependencies: ${duplicates.join(', ')}`);
  }
  
  const largeChunks = chunks.filter(c => c.gzipSize > BUNDLE_THRESHOLDS.async.warning);
  if (largeChunks.length > 0) {
    recommendations.push(`Consider code splitting for large chunks: ${largeChunks.map(c => c.name).join(', ')}`);
  }
  
  const lazyAnalysis = analyzeLazyLoading();
  if (lazyAnalysis.effectiveness < 0.5) {
    recommendations.push('Lazy loading effectiveness is low. Consider implementing more code splitting.');
  }
  
  currentReport = {
    timestamp: new Date().toISOString(),
    totalSize,
    totalGzipSize,
    chunks,
    components,
    dependencies,
    duplicateDependencies: duplicates,
    unusedExports: unused,
    recommendations,
  };
  
  return currentReport;
}

/**
 * Get current bundle report
 */
export function getCurrentReport(): BundleReport | null {
  return currentReport;
}

// ============================================================================
// RUNTIME BUNDLE MONITORING
// ============================================================================

/**
 * Monitor runtime bundle loading
 */
export function monitorBundleLoading(): void {
  if (!('PerformanceObserver' in window)) return;
  
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    
    entries.forEach((entry) => {
      const resourceEntry = entry as PerformanceResourceTiming;
      const url = resourceEntry.name;
      
      // Check if this is a JS chunk
      if (url.endsWith('.js') && url.includes('/assets/')) {
        const chunkName = url.split('/').pop() || 'unknown';
        const duration = resourceEntry.duration;
        const size = resourceEntry.transferSize || 0;
        
        // Warn about slow loading chunks
        if (duration > 1000) {
          if (logger?.warn) {
            logger.warn(`Slow chunk loading: ${chunkName}`, { duration, size });
          } else {
            console.warn(`Slow chunk loading: ${chunkName} (${duration}ms)`);
          }
        }
        
        trackChunkLoad(chunkName);
      }
    });
  });
  
  observer.observe({ entryTypes: ['resource'] });
}

/**
 * Measure initial bundle load time
 */
export function measureInitialLoadTime(): Promise<number> {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve(getInitialLoadTime());
    } else {
      window.addEventListener('load', () => {
        resolve(getInitialLoadTime());
      });
    }
  });
}

/**
 * Get initial load time from navigation timing
 */
function getInitialLoadTime(): number {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    return navigation.loadEventEnd - navigation.startTime;
  }
  return 0;
}

// ============================================================================
// BUDGET CHECKING
// ============================================================================

/**
 * Check if bundle meets performance budgets
 */
export function checkBudgets(): {
  passed: boolean;
  violations: { type: string; current: string; limit: string }[];
} {
  const violations: { type: string; current: string; limit: string }[] = [];
  
  // Check total size
  const totalGzip = Array.from(chunkSizes.values()).reduce((sum, c) => sum + c.gzipSize, 0);
  if (totalGzip > BUNDLE_THRESHOLDS.total.warning) {
    violations.push({
      type: 'Total Bundle Size',
      current: formatBytes(totalGzip),
      limit: formatBytes(BUNDLE_THRESHOLDS.total.warning),
    });
  }
  
  // Check initial chunk size
  const initialChunks = Array.from(chunkSizes.entries())
    .filter(([name]) => name.includes('vendor') || name.includes('main'));
  const initialGzip = initialChunks.reduce((sum, [, c]) => sum + c.gzipSize, 0);
  if (initialGzip > BUNDLE_THRESHOLDS.initial.warning) {
    violations.push({
      type: 'Initial Bundle Size',
      current: formatBytes(initialGzip),
      limit: formatBytes(BUNDLE_THRESHOLDS.initial.warning),
    });
  }
  
  // Check individual chunks
  chunkSizes.forEach((sizes, name) => {
    if (sizes.gzipSize > BUNDLE_THRESHOLDS.async.critical) {
      violations.push({
        type: `Chunk: ${name}`,
        current: formatBytes(sizes.gzipSize),
        limit: formatBytes(BUNDLE_THRESHOLDS.async.critical),
      });
    }
  });
  
  return {
    passed: violations.length === 0,
    violations,
  };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize bundle analyzer
 */
export function initializeBundleAnalyzer(config?: {
  monitorLoading?: boolean;
  trackRuntime?: boolean;
}): void {
  const opts = {
    monitorLoading: true,
    trackRuntime: true,
    ...config,
  };
  
  if (opts.monitorLoading) {
    monitorBundleLoading();
  }
  
  if (opts.trackRuntime) {
    // Log bundle info on load
    window.addEventListener('load', () => {
      setTimeout(() => {
        const loadTime = getInitialLoadTime();
        console.log(`[Bundle] Initial load time: ${loadTime.toFixed(2)}ms`);
        
        const budget = checkBudgets();
        if (!budget.passed) {
          console.warn('[Bundle] Performance budget violations:', budget.violations);
        }
      }, 0);
    });
  }
  
  console.log('Bundle analyzer initialized');
}

export default {
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
};
