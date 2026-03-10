/**
 * ============================================================================
 * CHAOS ENGINEERING API ROUTES (Development Only)
 * ============================================================================
 * REST API for running chaos experiments, monitoring status,
 * and retrieving experiment history.
 * 
 * WARNING: These endpoints are DANGEROUS and should only be enabled
 * in development or dedicated chaos testing environments.
 */

import express, { Request, Response } from 'express';
import { 
  getChaosEngine, 
  parseDuration,
  ExperimentDefinition,
} from '../chaos/engine';
import { 
  runExperimentByName, 
  getAllExperimentsList,
  findExperiment,
  getExperimentCatalog,
} from '../chaos/experiments';
import { runAllProbes } from '../chaos/probes';
import { asyncHandler } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Environment check - only enable in non-production or with explicit override
const isChaosEnabled = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.CHAOS_ENABLED === 'true';
  }
  return process.env.CHAOS_ENABLED !== 'false';
};

// Middleware to check chaos is enabled
const checkChaosEnabled = (req: Request, res: Response, next: Function) => {
  if (!isChaosEnabled()) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'CHAOS_DISABLED',
        message: 'Chaos engineering endpoints are disabled in this environment',
      },
    });
  }
  next();
};

// Apply chaos check to all routes
router.use(checkChaosEnabled);

// ============================================================================
// EXPERIMENT CATALOG
// ============================================================================

/**
 * @swagger
 * /api/chaos/experiments:
 *   get:
 *     summary: Get available chaos experiments
 *     description: Returns list of all available chaos experiments by category
 *     tags: [Chaos Engineering]
 *     responses:
 *       200:
 *         description: List of experiments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 experiments:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: array
 *                       items:
 *                         type: string
 *                     cache:
 *                       type: array
 *                       items:
 *                         type: string
 *                     network:
 *                       type: array
 *                       items:
 *                         type: string
 *                     memory:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get('/experiments', (_req: Request, res: Response) => {
  const catalog = getExperimentCatalog();
  const experiments = getAllExperimentsList();

  res.json({
    success: true,
    catalog,
    experiments: experiments.map(exp => ({
      name: exp.name,
      description: exp.description,
      target: exp.target,
      fault: exp.fault,
      scope: exp.scope,
      defaultDuration: exp.duration,
      hypothesis: exp.hypothesis,
    })),
  });
});

/**
 * @swagger
 * /api/chaos/experiments/{name}:
 *   get:
 *     summary: Get experiment details
 *     tags: [Chaos Engineering]
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Experiment details
 *       404:
 *         description: Experiment not found
 */
router.get('/experiments/:name', (req: Request, res: Response) => {
  const experiment = findExperiment(req.params.name);
  
  if (!experiment) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'EXPERIMENT_NOT_FOUND',
        message: `Experiment '${req.params.name}' not found`,
      },
    });
  }

  res.json({
    success: true,
    experiment,
  });
});

// ============================================================================
// EXPERIMENT CONTROL
// ============================================================================

/**
 * @swagger
 * /api/chaos/start:
 *   post:
 *     summary: Start a chaos experiment
 *     description: |
 *       Starts a chaos experiment by name. Use with caution!
 *       Experiments have built-in safety mechanisms including:
 *       - Auto-rollback after duration
 *       - Abort conditions based on system metrics
 *       - Maximum duration limits
 *     tags: [Chaos Engineering]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - experiment
 *             properties:
 *               experiment:
 *                 type: string
 *                 description: Name of the experiment to run
 *               duration:
 *                 type: string
 *                 description: Duration override (e.g., '30s', '5m')
 *               intensity:
 *                 type: number
 *                 description: Intensity override (0.0 to 1.0)
 *               abortConditions:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Experiment started successfully
 *       400:
 *         description: Invalid experiment or parameters
 *       409:
 *         description: Conflict - experiment already running or safety check failed
 */
router.post('/start', asyncHandler(async (req: Request, res: Response) => {
  const { experiment: experimentName, duration, intensity, abortConditions } = req.body;

  if (!experimentName) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_PARAMETER',
        message: 'Experiment name is required',
      },
    });
  }

  const engine = getChaosEngine();

  // Check if any experiment is already running
  if (engine.getRunningCount() > 0) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'EXPERIMENT_RUNNING',
        message: 'An experiment is already running. Stop it first or wait for completion.',
        running: engine.getRunningExperiments().map(e => ({
          id: e.definition.id,
          name: e.definition.name,
          startedAt: e.startTime,
        })),
      },
    });
  }

  // Find the experiment
  const experiment = findExperiment(experimentName);
  if (!experiment) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'UNKNOWN_EXPERIMENT',
        message: `Unknown experiment: ${experimentName}`,
        available: getExperimentCatalog(),
      },
    });
  }

  // Build custom definition if overrides provided
  let definition: ExperimentDefinition = { ...experiment };
  
  if (duration) {
    definition.duration = parseDuration(duration);
  }
  
  if (typeof intensity === 'number') {
    definition.intensity = Math.max(0, Math.min(1, intensity));
  }
  
  if (abortConditions) {
    definition.abortConditions = abortConditions;
  }

  // Start the experiment (don't await - run in background)
  runExperimentByName(experimentName, duration)
    .then(result => {
      logger.info('[Chaos] Experiment completed', { result });
    })
    .catch(error => {
      logger.error('[Chaos] Experiment failed', error);
    });

  res.json({
    success: true,
    message: `Experiment '${experimentName}' started`,
    experiment: {
      name: definition.name,
      duration: definition.duration,
      intensity: definition.intensity,
      hypothesis: definition.hypothesis,
    },
  });
}));

/**
 * @swagger
 * /api/chaos/stop:
 *   post:
 *     summary: Stop all running experiments
 *     description: Immediately stops all running chaos experiments and triggers rollback
 *     tags: [Chaos Engineering]
 *     responses:
 *       200:
 *         description: Experiments stopped
 */
router.post('/stop', asyncHandler(async (_req: Request, res: Response) => {
  const engine = getChaosEngine();
  const stopped = await engine.stopAll();

  res.json({
    success: true,
    message: `${stopped} experiment(s) stopped`,
    stopped,
  });
}));

/**
 * @swagger
 * /api/chaos/stop/{id}:
 *   post:
 *     summary: Stop a specific experiment
 *     tags: [Chaos Engineering]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Experiment stopped
 *       404:
 *         description: Experiment not found
 */
router.post('/stop/:id', asyncHandler(async (req: Request, res: Response) => {
  const engine = getChaosEngine();
  const stopped = await engine.stop(req.params.id);

  if (!stopped) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'EXPERIMENT_NOT_FOUND',
        message: `No running experiment with ID: ${req.params.id}`,
      },
    });
  }

  res.json({
    success: true,
    message: 'Experiment stopped',
  });
}));

// ============================================================================
// STATUS & MONITORING
// ============================================================================

/**
 * @swagger
 * /api/chaos/status:
 *   get:
 *     summary: Get running experiments status
 *     description: Returns status of all currently running chaos experiments
 *     tags: [Chaos Engineering]
 *     responses:
 *       200:
 *         description: Current chaos status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 running:
 *                   type: boolean
 *                 experiments:
 *                   type: array
 *                   items:
 *                     type: object
 *                 safetyEnabled:
 *                   type: boolean
 */
router.get('/status', (_req: Request, res: Response) => {
  const engine = getChaosEngine();
  const running = engine.getRunningExperiments();

  res.json({
    success: true,
    running: running.length > 0,
    count: running.length,
    safetyEnabled: engine.isSafetyEnabled(),
    experiments: running.map(exp => ({
      id: exp.definition.id,
      name: exp.definition.name,
      status: exp.status,
      startedAt: exp.startTime,
      duration: Date.now() - exp.startTime.getTime(),
      metrics: exp.metrics,
      hypothesis: exp.definition.hypothesis,
    })),
  });
});

/**
 * @swagger
 * /api/chaos/history:
 *   get:
 *     summary: Get experiment history
 *     description: Returns history of completed chaos experiments
 *     tags: [Chaos Engineering]
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [completed, failed, rolled_back]
 *     responses:
 *       200:
 *         description: Experiment history
 */
router.get('/history', (req: Request, res: Response) => {
  const engine = getChaosEngine();
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;

  let history = engine.getExperimentHistory();

  if (status) {
    history = history.filter(h => h.status === status);
  }

  history = history.slice(-limit);

  res.json({
    success: true,
    count: history.length,
    history: history.map(h => ({
      experimentId: h.experimentId,
      status: h.status,
      startTime: h.startTime,
      endTime: h.endTime,
      duration: h.duration,
      metrics: h.metrics,
      hypothesisValidated: h.hypothesisValidated,
      violations: h.violations,
    })),
  });
});

// ============================================================================
// SYSTEM PROBES
// ============================================================================

/**
 * @swagger
 * /api/chaos/probes:
 *   get:
 *     summary: Run system health probes
 *     description: Runs all registered health probes to check system state
 *     tags: [Chaos Engineering]
 *     responses:
 *       200:
 *         description: Probe results
 */
router.get('/probes', asyncHandler(async (_req: Request, res: Response) => {
  const results = await runAllProbes();

  const overall = Object.values(results).every(r => r.status === 'healthy')
    ? 'healthy'
    : Object.values(results).some(r => r.status === 'unhealthy')
    ? 'degraded'
    : 'unhealthy';

  res.json({
    success: true,
    overall,
    results,
  });
}));

// ============================================================================
// SAFETY CONTROLS
// ============================================================================

/**
 * @swagger
 * /api/chaos/safety:
 *   get:
 *     summary: Get safety status
 *     tags: [Chaos Engineering]
 *     responses:
 *       200:
 *         description: Safety configuration
 */
router.get('/safety', (_req: Request, res: Response) => {
  const engine = getChaosEngine();
  
  res.json({
    success: true,
    safetyEnabled: engine.isSafetyEnabled(),
    environment: process.env.NODE_ENV,
    chaosEnabled: isChaosEnabled(),
  });
});

/**
 * @swagger
 * /api/chaos/safety:
 *   post:
 *     summary: Toggle safety checks
 *     description: |
 *       Enable or disable safety checks. 
 *       WARNING: Disabling safety checks is dangerous!
 *     tags: [Chaos Engineering]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enabled
 *             properties:
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Safety status updated
 */
router.post('/safety', (req: Request, res: Response) => {
  const { enabled } = req.body;
  
  if (typeof enabled !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_PARAMETER',
        message: 'enabled must be a boolean',
      },
    });
  }

  const engine = getChaosEngine();
  engine.setSafetyEnabled(enabled);

  res.json({
    success: true,
    safetyEnabled: enabled,
    message: `Safety checks ${enabled ? 'enabled' : 'disabled'}`,
  });
});

// ============================================================================
// QUICK EXPERIMENTS
// ============================================================================

/**
 * @swagger
 * /api/chaos/quick/{type}:
 *   post:
 *     summary: Run a quick chaos experiment
 *     description: Shortcut to run common experiments with defaults
 *     tags: [Chaos Engineering]
 *     parameters:
 *       - name: type
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [database, cache, network, memory]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               duration:
 *                 type: string
 *                 default: 30s
 *     responses:
 *       200:
 *         description: Experiment started
 */
router.post('/quick/:type', asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.params;
  const { duration = '30s' } = req.body;

  const quickExperiments: Record<string, string> = {
    database: 'connectionLoss',
    cache: 'connectionFailure',
    network: 'externalTimeout',
    memory: 'gcPressure',
  };

  const experimentName = quickExperiments[type];
  if (!experimentName) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_TYPE',
        message: `Unknown quick experiment type: ${type}`,
        available: Object.keys(quickExperiments),
      },
    });
  }

  // Start experiment in background
  runExperimentByName(experimentName, duration)
    .catch(error => logger.error('[Chaos] Quick experiment failed', error));

  res.json({
    success: true,
    message: `Quick '${type}' experiment started`,
    duration,
  });
}));

export default router;
