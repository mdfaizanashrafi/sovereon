/**
 * ============================================================================
 * DISTRIBUTED TRACING
 * ============================================================================
 * Request tracing with spans for performance bottleneck identification
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger, createRequestLogger, LogContext } from './logger';
import { observabilityConfig, isTracingEnabled } from '../config/observability';

/**
 * Span kind
 */
export type SpanKind = 'server' | 'client' | 'internal' | 'producer' | 'consumer';

/**
 * Span status
 */
export type SpanStatus = 'ok' | 'error' | 'unset';

/**
 * Span attributes
 */
export interface SpanAttributes {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Trace span
 */
export interface Span {
  id: string;
  traceId: string;
  parentId?: string;
  name: string;
  kind: SpanKind;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: SpanStatus;
  attributes: SpanAttributes;
  events: SpanEvent[];
  links?: SpanLink[];
}

/**
 * Span event
 */
export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: SpanAttributes;
}

/**
 * Span link (for distributed tracing)
 */
export interface SpanLink {
  traceId: string;
  spanId: string;
  attributes?: SpanAttributes;
}

/**
 * Active trace context
 */
export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  sampled: boolean;
}

// AsyncLocalStorage for trace context (Node 14.8+)
let asyncLocalStorage: any;
try {
  const asyncHooks = require('async_hooks');
  if (asyncHooks.AsyncLocalStorage) {
    asyncLocalStorage = new asyncHooks.AsyncLocalStorage();
  }
} catch (e) {
  // Fallback for older Node versions
}

// In-memory trace storage (for development/debugging)
const traceStore = new Map<string, Span[]>();
const MAX_STORED_TRACES = 100;

/**
 * Generate unique IDs
 */
function generateTraceId(): string {
  return uuidv4().replace(/-/g, '');
}

function generateSpanId(): string {
  return uuidv4().replace(/-/g, '').substring(0, 16);
}

/**
 * Check if request should be sampled
 */
function shouldSample(): boolean {
  const rate = observabilityConfig.tracing.samplingRate;
  if (rate >= 1) return true;
  if (rate <= 0) return false;
  return Math.random() < rate;
}

/**
 * Extract trace context from request headers
 */
export function extractTraceContext(req: Request): Partial<TraceContext> | null {
  // Support W3C Trace Context
  const traceParent = req.get('traceparent');
  if (traceParent) {
    const parts = traceParent.split('-');
    if (parts.length >= 3) {
      return {
        traceId: parts[1],
        parentSpanId: parts[2],
        sampled: parts[3] === '01',
      };
    }
  }
  
  // Support X-Request-ID for simple tracing
  const requestId = req.get('x-request-id');
  if (requestId) {
    return {
      traceId: requestId,
      sampled: true,
    };
  }
  
  return null;
}

/**
 * Build traceparent header for outgoing requests
 */
export function buildTraceparent(context: TraceContext): string {
  const flags = context.sampled ? '01' : '00';
  return `00-${context.traceId}-${context.spanId}-${flags}`;
}

/**
 * Tracer class for creating and managing spans
 */
class Tracer {
  private activeSpans = new Map<string, Span>();
  private completedSpans: Span[] = [];
  private traceId: string;
  private sampled: boolean;

  constructor(traceId?: string, sampled?: boolean) {
    this.traceId = traceId || generateTraceId();
    this.sampled = sampled !== undefined ? sampled : shouldSample();
  }

  /**
   * Get trace context
   */
  getContext(): TraceContext {
    const currentSpan = this.getCurrentSpan();
    return {
      traceId: this.traceId,
      spanId: currentSpan?.id || generateSpanId(),
      parentSpanId: currentSpan?.parentId,
      sampled: this.sampled,
    };
  }

  /**
   * Start a new span
   */
  startSpan(
    name: string,
    options: {
      kind?: SpanKind;
      parentId?: string;
      attributes?: SpanAttributes;
      links?: SpanLink[];
    } = {}
  ): Span {
    if (!this.sampled) {
      return this.createNoopSpan(name);
    }

    const span: Span = {
      id: generateSpanId(),
      traceId: this.traceId,
      parentId: options.parentId || this.getCurrentSpan()?.id,
      name,
      kind: options.kind || 'internal',
      startTime: Date.now(),
      status: 'unset',
      attributes: options.attributes || {},
      events: [],
      links: options.links,
    };

    this.activeSpans.set(span.id, span);
    
    // Store in async context if available
    if (asyncLocalStorage) {
      const store = asyncLocalStorage.getStore() || new Map();
      store.set('currentSpanId', span.id);
    }

    return span;
  }

  /**
   * End a span
   */
  endSpan(span: Span, status: SpanStatus = 'ok'): void {
    if (span.startTime === -1) return; // No-op span

    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;

    this.activeSpans.delete(span.id);
    this.completedSpans.push(span);

    // Check if we've reached max spans
    if (this.completedSpans.length >= observabilityConfig.tracing.maxSpans) {
      this.flush();
    }
  }

  /**
   * Add event to span
   */
  addEvent(span: Span, name: string, attributes?: SpanAttributes): void {
    if (span.startTime === -1) return; // No-op span

    span.events.push({
      name,
      timestamp: Date.now(),
      attributes,
    });
  }

  /**
   * Set span attributes
   */
  setAttributes(span: Span, attributes: SpanAttributes): void {
    if (span.startTime === -1) return; // No-op span
    Object.assign(span.attributes, attributes);
  }

  /**
   * Record exception in span
   */
  recordException(span: Span, error: Error | unknown): void {
    if (span.startTime === -1) return; // No-op span

    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    this.addEvent(span, 'exception', {
      'exception.type': errorObj.name,
      'exception.message': errorObj.message,
      'exception.stack': errorObj.stack,
    });
    
    span.status = 'error';
  }

  /**
   * Get current active span
   */
  private getCurrentSpan(): Span | undefined {
    if (asyncLocalStorage) {
      const store = asyncLocalStorage.getStore();
      if (store) {
        const spanId = store.get('currentSpanId');
        if (spanId) {
          return this.activeSpans.get(spanId);
        }
      }
    }
    
    // Fallback: return most recent active span
    const activeIds = Array.from(this.activeSpans.keys());
    if (activeIds.length > 0) {
      return this.activeSpans.get(activeIds[activeIds.length - 1]);
    }
    
    return undefined;
  }

  /**
   * Create a no-op span for unsampled traces
   */
  private createNoopSpan(name: string): Span {
    return {
      id: '',
      traceId: this.traceId,
      name,
      kind: 'internal',
      startTime: -1, // Marker for no-op
      status: 'unset',
      attributes: {},
      events: [],
    };
  }

  /**
   * Flush completed spans
   */
  flush(): void {
    if (this.completedSpans.length === 0) return;

    // Store in trace store
    const existing = traceStore.get(this.traceId) || [];
    traceStore.set(this.traceId, [...existing, ...this.completedSpans]);
    
    // Clean up old traces
    if (traceStore.size > MAX_STORED_TRACES) {
      const oldestKey = traceStore.keys().next().value;
      if (oldestKey) {
        traceStore.delete(oldestKey);
      }
    }

    // Log trace summary if enabled
    if (observabilityConfig.logLevel === 'debug') {
      logger.debug('Trace completed', {
        traceId: this.traceId,
        spanCount: this.completedSpans.length,
        spans: this.completedSpans.map(s => ({
          name: s.name,
          duration: s.duration,
          status: s.status,
        })),
      });
    }

    this.completedSpans = [];
  }

  /**
   * Get all spans for this trace
   */
  getSpans(): Span[] {
    return [
      ...this.completedSpans,
      ...Array.from(this.activeSpans.values()),
    ];
  }
}

// Global tracer instance per request
const tracers = new Map<string, Tracer>();

/**
 * Create or get tracer for a request
 */
export function getTracer(traceId?: string): Tracer {
  const id = traceId || generateTraceId();
  
  if (!tracers.has(id)) {
    tracers.set(id, new Tracer(id));
  }
  
  return tracers.get(id)!;
}

/**
 * Remove tracer
 */
export function removeTracer(traceId: string): void {
  const tracer = tracers.get(traceId);
  if (tracer) {
    tracer.flush();
    tracers.delete(traceId);
  }
}

/**
 * Execute function within a span
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  options: {
    tracer?: Tracer;
    kind?: SpanKind;
    attributes?: SpanAttributes;
  } = {}
): Promise<T> {
  const tracer = options.tracer || new Tracer();
  const span = tracer.startSpan(name, {
    kind: options.kind || 'internal',
    attributes: options.attributes,
  });

  try {
    const result = await fn(span);
    tracer.endSpan(span, 'ok');
    return result;
  } catch (error) {
    tracer.recordException(span, error);
    tracer.endSpan(span, 'error');
    throw error;
  }
}

/**
 * Execute synchronous function within a span
 */
export function withSpanSync<T>(
  name: string,
  fn: (span: Span) => T,
  options: {
    tracer?: Tracer;
    kind?: SpanKind;
    attributes?: SpanAttributes;
  } = {}
): T {
  const tracer = options.tracer || new Tracer();
  const span = tracer.startSpan(name, {
    kind: options.kind || 'internal',
    attributes: options.attributes,
  });

  try {
    const result = fn(span);
    tracer.endSpan(span, 'ok');
    return result;
  } catch (error) {
    tracer.recordException(span, error);
    tracer.endSpan(span, 'error');
    throw error;
  }
}

/**
 * Tracing middleware for Express
 */
export function tracingMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!isTracingEnabled()) {
    return next();
  }

  // Extract or create trace context
  const extracted = extractTraceContext(req);
  const traceId = extracted?.traceId || generateTraceId();
  const sampled = extracted?.sampled ?? shouldSample();
  
  // Create tracer for this request
  const tracer = new Tracer(traceId, sampled);
  tracers.set(traceId, tracer);

  // Start root span
  const span = tracer.startSpan(`${req.method} ${req.route?.path || req.path}`, {
    kind: 'server',
    attributes: {
      'http.method': req.method,
      'http.url': req.originalUrl,
      'http.path': req.path,
      'http.route': req.route?.path,
      'http.host': req.get('host'),
      'http.user_agent': req.get('user-agent'),
      'http.request_id': (req as any).requestId,
      'http.client_ip': req.ip,
    },
  });

  // Add trace context to request
  (req as any).traceContext = tracer.getContext();
  (req as any).currentSpan = span;

  // Set trace headers
  res.set('X-Trace-Id', traceId);
  res.set('X-Span-Id', span.id);
  if (extracted?.parentSpanId) {
    res.set('X-Parent-Span-Id', extracted.parentSpanId);
  }
  res.set('Traceparent', buildTraceparent(tracer.getContext()));

  // Track response
  res.on('finish', () => {
    tracer.setAttributes(span, {
      'http.status_code': res.statusCode,
      'http.content_length': res.get('content-length'),
      'http.content_type': res.get('content-type'),
    });

    if (res.statusCode >= 400) {
      span.status = 'error';
    }

    tracer.endSpan(span);
    tracer.flush();
    removeTracer(traceId);
  });

  res.on('error', (error) => {
    tracer.recordException(span, error);
    tracer.endSpan(span, 'error');
    tracer.flush();
    removeTracer(traceId);
  });

  next();
}

/**
 * Create child span from request context
 */
export function createChildSpan(
  req: Request,
  name: string,
  attributes?: SpanAttributes
): Span | null {
  const context = (req as any).traceContext as TraceContext | undefined;
  if (!context) return null;

  const tracer = getTracer(context.traceId);
  return tracer.startSpan(name, {
    parentId: context.spanId,
    attributes,
  });
}

/**
 * End child span
 */
export function endChildSpan(req: Request, span: Span, status: SpanStatus = 'ok'): void {
  const context = (req as any).traceContext as TraceContext | undefined;
  if (!context) return;

  const tracer = getTracer(context.traceId);
  tracer.endSpan(span, status);
}

/**
 * Get trace by ID
 */
export function getTrace(traceId: string): Span[] | undefined {
  return traceStore.get(traceId);
}

/**
 * Get all stored traces
 */
export function getAllTraces(): Map<string, Span[]> {
  return new Map(traceStore);
}

/**
 * Clear trace store
 */
export function clearTraces(): void {
  traceStore.clear();
}

/**
 * Tracing endpoint to view recent traces
 */
export function tracesEndpoint(req: Request, res: Response): void {
  const traces = Array.from(traceStore.entries()).map(([traceId, spans]) => ({
    traceId,
    spanCount: spans.length,
    duration: spans.reduce((sum, s) => sum + (s.duration || 0), 0),
    rootSpan: spans.find(s => !s.parentId)?.name,
    status: spans.some(s => s.status === 'error') ? 'error' : 'ok',
    timestamp: spans[0]?.startTime,
  }));

  res.json({
    traces: traces.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 50),
    totalStored: traceStore.size,
  });
}

/**
 * Get trace details endpoint
 */
export function traceDetailsEndpoint(req: Request, res: Response): void {
  const { traceId } = req.params;
  const spans = traceStore.get(traceId);
  
  if (!spans) {
    res.status(404).json({ error: 'Trace not found' });
    return;
  }

  res.json({
    traceId,
    spans: spans.map(s => ({
      id: s.id,
      parentId: s.parentId,
      name: s.name,
      kind: s.kind,
      duration: s.duration,
      status: s.status,
      attributes: s.attributes,
      events: s.events,
      startTime: s.startTime,
    })),
  });
}

/**
 * Get current span from request
 */
export function getCurrentSpan(req: Request): Span | undefined {
  return (req as any).currentSpan;
}

/**
 * Add event to current span
 */
export function addSpanEvent(
  req: Request,
  name: string,
  attributes?: SpanAttributes
): void {
  const span = getCurrentSpan(req);
  if (!span) return;

  const context = (req as any).traceContext as TraceContext | undefined;
  if (!context) return;

  const tracer = getTracer(context.traceId);
  tracer.addEvent(span, name, attributes);
}

/**
 * Set span attributes on current span
 */
export function setSpanAttributes(req: Request, attributes: SpanAttributes): void {
  const span = getCurrentSpan(req);
  if (!span) return;

  const context = (req as any).traceContext as TraceContext | undefined;
  if (!context) return;

  const tracer = getTracer(context.traceId);
  tracer.setAttributes(span, attributes);
}

export default {
  tracingMiddleware,
  createChildSpan,
  endChildSpan,
  getTrace,
  getAllTraces,
  withSpan,
  withSpanSync,
  addSpanEvent,
  setSpanAttributes,
};
