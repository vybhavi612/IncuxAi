

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const EventEmitter = require('events');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const CONFIG = {
    PORT: 8080,
    MAX_WORKERS: 4,
    HEARTBEAT_INTERVAL: 2000,
    LOG_FILE: path.join(__dirname, 'aetherflow.log'),
    MAX_LOG_SIZE: 5 * 1024 * 1024, // 5MB
};

const TaskStatus = {
    PENDING: 'PENDING',
    QUEUED: 'QUEUED',
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    SKIPPED: 'SKIPPED'
};

const WorkflowStatus = {
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED'
};

class Logger {
    constructor(filePath) {
        this.filePath = filePath;
        this.stream = fs.createWriteStream(filePath, { flags: 'a', encoding: 'utf8' });
    }

    log(level, component, message, context = {}) {
        const timestamp = new Date().toISOString();
        const ctxString = Object.keys(context).length ? ` | Context: ${JSON.stringify(context)}` : '';
        const formatted = `[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}${ctxString}\n`;
        
        // Write to stdout with basic colors
        const colors = { info: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m', debug: '\x1b[36m' };
        const reset = '\x1b[0m';
        console.log(`${colors[level] || reset}${formatted.trim()}${reset}`);

        this.stream.write(formatted);
        this.rotateCheck();
    }

    info(comp, msg, ctx) { this.log('info', comp, msg, ctx); }
    warn(comp, msg, ctx) { this.log('warn', comp, msg, ctx); }
    error(comp, msg, ctx) { this.log('error', comp, msg, ctx); }
    debug(comp, msg, ctx) { this.log('debug', comp, msg, ctx); }

    rotateCheck() {
        try {
            const stats = fs.statSync(this.filePath);
            if (stats.size > CONFIG.MAX_LOG_SIZE) {
                fs.renameSync(this.filePath, `${this.filePath}.${Date.now()}.bak`);
                this.stream = fs.createWriteStream(this.filePath, { flags: 'w', encoding: 'utf8' });
            }
        } catch (err) {
            // Silently handle initial file missing errors
        }
    }
}

const logger = new Logger(CONFIG.LOG_FILE);

class MetricsEngine {
    constructor() {
        this.metrics = {
            totalWorkflowsRun: 0,
            totalTasksExecuted: 0,
            failedTasks: 0,
            successfulTasks: 0,
            executionTimes: []
        };
    }

    trackTask(status, duration) {
        this.metrics.totalTasksExecuted++;
        if (status === TaskStatus.COMPLETED) this.metrics.successfulTasks++;
        if (status === TaskStatus.FAILED) this.metrics.failedTasks++;
        this.metrics.executionTimes.push(duration);
        if (this.metrics.executionTimes.length > 500) this.metrics.executionTimes.shift();
    }

    trackWorkflow() {
        this.metrics.totalWorkflowsRun++;
    }

    getAverageExecutionTime() {
        if (!this.metrics.executionTimes.length) return 0;
        const sum = this.metrics.executionTimes.reduce((a, b) => a + b, 0);
        return parseFloat((sum / this.metrics.executionTimes.length).toFixed(2));
    }

    getSnapshot() {
        return {
            ...this.metrics,
            avgTaskDurationMs: this.getAverageExecutionTime(),
            memoryUsage: process.memoryUsage().heapUsed
        };
    }
}

const metrics = new MetricsEngine();

// ============================================================================
// 3. SANDBOXED TASK ENGINE (CUSTOM MINI-VM INTERPRETER)
// ============================================================================
/**
 * A safe alternative to eval/vm execution for domain-specific tasks.
 * Parses and executes localized instructions safely inside the system.
 */
class TaskSandboxInterpreter {
    static execute(script, inputs = {}) {
        const lines = script.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
        const variables = { ...inputs };
        
        for (const line of lines) {
            const parts = line.split(/\s+/);
            const command = parts[0].toUpperCase();

            switch (command) {
                case 'SET': {
                    const target = parts[1];
                    const value = parts.slice(2).join(' ');
                    variables[target] = this.resolveValue(value, variables);
                    break;
                }
                case 'ADD':
                case 'SUB':
                case 'MUL':
                case 'DIV': {
                    const target = parts[1];
                    const left = this.resolveValue(parts[2], variables);
                    const right = this.resolveValue(parts[3], variables);
                    if (command === 'ADD') variables[target] = left + right;
                    if (command === 'SUB') variables[target] = left - right;
                    if (command === 'MUL') variables[target] = left * right;
                    if (command === 'DIV') variables[target] = left / right;
                    break;
                }
                case 'CONCAT': {
                    const target = parts[1];
                    const args = parts.slice(2).map(p => this.resolveValue(p, variables));
                    variables[target] = args.join(' ');
                    break;
                }
                case 'SLEEP': {
                    const ms = parseInt(this.resolveValue(parts[1], variables), 10);
                    const start = Date.now();
                    while (Date.now() - start < ms) { /* Synchronous artificial block for worker emulation */ }
                    break;
                }
                case 'RANDOM': {
                    const target = parts[1];
                    const min = parseInt(parts[2], 10);
                    const max = parseInt(parts[3], 10);
                    variables[target] = Math.floor(Math.random() * (max - min + 1)) + min;
                    break;
                }
                case 'FAIL': {
                    const msg = parts.slice(1).join(' ') || 'Manual execution break';
                    throw new Error(this.resolveValue(msg, variables));
                }
                case 'IF_EQUAL': {
                    const val1 = String(this.resolveValue(parts[1], variables));
                    const val2 = String(this.resolveValue(parts[2], variables));
                    if (val1 === val2) {
                        const subCommand = parts[3].toUpperCase();
                        if (subCommand === 'FAIL') {
                            const msg = parts.slice(4).join(' ') || 'Conditional failure triggered';
                            throw new Error(this.resolveValue(msg, variables));
                        } else if (subCommand === 'SET') {
                            const target = parts[4];
                            const value = parts.slice(5).join(' ');
                            variables[target] = this.resolveValue(value, variables);
                        } else if (subCommand === 'RANDOM') {
                            const target = parts[4];
                            const min = parseInt(parts[5], 10);
                            const max = parseInt(parts[6], 10);
                            variables[target] = Math.floor(Math.random() * (max - min + 1)) + min;
                        }
                    }
                    break;
                }
                default:
                    throw new Error(`Unknown Sandbox Instruction: ${command}`);
            }
        }
        return variables;
    }

    static resolveValue(token, variables) {
        if (token.startsWith('$')) {
            const varName = token.substring(1);
            return variables[varName] !== undefined ? variables[varName] : null;
        }
        if (!isNaN(token)) return Number(token);
        if (token === 'true') return true;
        if (token === 'false') return false;
        return token.replace(/['"]/g, ''); // String stripping
    }
}

// ============================================================================
// WORKER THREAD CODE (SELF-CONTAINED ENTRY POINT)
// ============================================================================
if (!isMainThread) {
    parentPort.on('message', async (taskData) => {
        const { id, script, inputs } = taskData;
        const startTime = Date.now();
        logger.debug('WorkerThread', `Executing sub-task payload [${id}]`);

        try {
            // Heavy/Blocking sandboxed runtime operations isolated in threads
            const result = TaskSandboxInterpreter.execute(script, inputs);
            
            parentPort.postMessage({
                success: true,
                taskId: id,
                output: result,
                duration: Date.now() - startTime
            });
        } catch (error) {
            parentPort.postMessage({
                success: false,
                taskId: id,
                error: error.message,
                duration: Date.now() - startTime
            });
        }
    });
}

// ============================================================================
// 4. WORKER POOL RESILIENCY LAYER
// ============================================================================
class WorkerThreadPool extends EventEmitter {
    constructor(maxWorkers) {
        super();
        this.maxWorkers = maxWorkers;
        this.workers = []; // Array of { worker, isBusy, currentTaskId }
        this.queue = [];
        this.initPool();
    }

    initPool() {
        logger.info('WorkerPool', `Initializing worker thread pool with size: ${this.maxWorkers}`);
        for (let i = 0; i < this.maxWorkers; i++) {
            this.createNewWorker();
        }
    }

    createNewWorker() {
        const worker = new Worker(__filename);
        const workerObj = { worker, isBusy: false, currentTaskId: null };

        worker.on('message', (response) => {
            this.handleWorkerResponse(workerObj, response);
        });

        worker.on('error', (err) => {
            logger.error('WorkerPool', `Critical error in worker thread`, { err: err.message });
            this.replaceWorker(workerObj);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                logger.warn('WorkerPool', `Worker stopped unexpectedly with exit code ${code}`);
                this.replaceWorker(workerObj);
            }
        });

        this.workers.push(workerObj);
    }

    replaceWorker(oldWorkerObj) {
        this.workers = this.workers.filter(w => w !== oldWorkerObj);
        try { oldWorkerObj.worker.terminate(); } catch(e) {}
        this.createNewWorker();
        this.processQueue();
    }

    submit(taskPayload, callback) {
        this.queue.push({ taskPayload, callback });
        this.processQueue();
    }

    processQueue() {
        if (this.queue.length === 0) return;

        const availableWorker = this.workers.find(w => !w.isBusy);
        if (!availableWorker) return;

        const { taskPayload, callback } = this.queue.shift();
        availableWorker.isBusy = true;
        availableWorker.currentTaskId = taskPayload.id;
        availableWorker.callback = callback;

        availableWorker.worker.postMessage(taskPayload);
    }

    handleWorkerResponse(workerObj, response) {
        const callback = workerObj.callback;
        
        // Free up worker immediately
        workerObj.isBusy = false;
        workerObj.currentTaskId = null;
        workerObj.callback = null;

        if (callback) {
            callback(response);
        }

        this.processQueue();
    }

    getPoolState() {
        return this.workers.map((w, idx) => ({
            id: idx,
            isBusy: w.isBusy,
            taskId: w.currentTaskId
        }));
    }

    shutdown() {
        for (const w of this.workers) {
            w.worker.terminate();
        }
    }
}

// ============================================================================
// 5. DAG CORE ENGINE (DIRECTED ACYCLIC GRAPH VALIDATOR & ENGINE)
// ============================================================================
class TaskNode {
    constructor({ id, script, inputs = {}, retries = 3, backoffMs = 1000 }) {
        this.id = id;
        this.script = script;
        this.inputs = inputs;
        this.maxRetries = retries;
        this.retryCount = 0;
        this.backoffMs = backoffMs;
        this.status = TaskStatus.PENDING;
        this.dependencies = [];
        this.dependents = [];
        this.output = null;
        this.error = null;
        this.startedAt = null;
        this.endedAt = null;
    }
}

class WorkflowDAG {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.tasks = new Map();
        this.status = WorkflowStatus.IDLE;
        this.globalContext = {};
    }

    addTask(taskOptions) {
        const task = new TaskNode(taskOptions);
        this.tasks.set(task.id, task);
        return this;
    }

    addDependency(parentTaskId, childTaskId) {
        const parent = this.tasks.get(parentTaskId);
        const child = this.tasks.get(childTaskId);

        if (!parent || !child) {
            throw new Error(`Invalid dependency mapping from [${parentTaskId}] -> [${childTaskId}]`);
        }

        if (!parent.dependents.includes(childTaskId)) parent.dependents.push(childTaskId);
        if (!child.dependencies.includes(parentTaskId)) child.dependencies.push(parentTaskId);
        return this;
    }

    /**
     * Cycle validation algorithm (Depth First Search + Graph Coloring back-edge detection)
     */
    validate() {
        const visited = new Map(); // id -> color (1 = visiting, 2 = visited)

        const hasCycle = (taskId) => {
            visited.set(taskId, 1);
            const task = this.tasks.get(taskId);

            for (const depId of task.dependents) {
                const color = visited.get(depId);
                if (color === 1) return true; // Found Loop Back-edge
                if (!color && hasCycle(depId)) return true;
            }

            visited.set(taskId, 2);
            return false;
        };

        for (const taskId of this.tasks.keys()) {
            if (!visited.get(taskId)) {
                if (hasCycle(taskId)) {
                    throw new Error(`Cycle Validation Error: Loop found in Workflow DAG Architecture!`);
                }
            }
        }
        return true;
    }
}

// ============================================================================
// 6. CENTRAL ORCHESTRATION ENGINE
// ============================================================================
class Orchestrator extends EventEmitter {
    constructor(workerPool) {
        super();
        this.workerPool = workerPool;
        this.workflows = new Map();
        this.activeExecutions = new Map();
        
        // Begin system state auditing
        this.startHeartbeatLoop();
    }

    registerWorkflow(workflow) {
        workflow.validate();
        this.workflows.set(workflow.id, workflow);
        logger.info('Orchestrator', `Registered workflow schema: "${workflow.name}" [${workflow.id}]`);
    }

    async executeWorkflow(workflowId, externalInputs = {}) {
        const schema = this.workflows.get(workflowId);
        if (!schema) throw new Error(`Workflow structure [${workflowId}] doesn't exist.`);

        // Deep clone architecture schema to allow safe concurrently running duplicates
        const instance = this.cloneWorkflowStructure(schema);
        instance.globalContext = { ...externalInputs };
        instance.status = WorkflowStatus.RUNNING;
        
        this.activeExecutions.set(instance.id, instance);
        metrics.trackWorkflow();
        logger.info('Orchestrator', `Executing workflow execution tracking instantiation: [${instance.id}]`);

        this.evaluateNextExecutionStep(instance);
        return instance.id;
    }

    cloneWorkflowStructure(schema) {
        const uniqueId = crypto.randomUUID();
        const clone = new WorkflowDAG(uniqueId, schema.name);
        
        for (const [id, t] of schema.tasks.entries()) {
            clone.addTask({ id: t.id, script: t.script, inputs: { ...t.inputs }, retries: t.maxRetries, backoffMs: t.backoffMs });
        }
        for (const [id, t] of schema.tasks.entries()) {
            for (const dep of t.dependents) clone.addDependency(id, dep);
        }
        return clone;
    }

    evaluateNextExecutionStep(wf) {
        if (wf.status !== WorkflowStatus.RUNNING) return;

        let activelyRunning = 0;
        let completeCount = 0;
        let failedCount = 0;

        for (const task of wf.tasks.values()) {
            if (task.status === TaskStatus.RUNNING || task.status === TaskStatus.QUEUED) {
                activelyRunning++;
            } else if (task.status === TaskStatus.COMPLETED) {
                completeCount++;
            } else if (task.status === TaskStatus.FAILED) {
                failedCount++;
            } else if (task.status === TaskStatus.PENDING) {
                // Check if all prerequisites are fulfilled
                const readiness = task.dependencies.every(depId => wf.tasks.get(depId).status === TaskStatus.COMPLETED);
                const upstreamFailure = task.dependencies.some(depId => wf.tasks.get(depId).status === TaskStatus.FAILED || wf.tasks.get(depId).status === TaskStatus.SKIPPED);

                if (upstreamFailure) {
                    task.status = TaskStatus.SKIPPED;
                    logger.warn('Orchestrator', `Cascading skip on Task [${task.id}] due to upstream dependencies crash.`);
                } else if (readiness) {
                    this.dispatchTaskToExecutionPool(wf, task);
                    activelyRunning++;
                }
            }
        }

        // Check Evaluation Terminal Conditions
        if (completeCount + failedCount === wf.tasks.size) {
            wf.status = failedCount > 0 ? WorkflowStatus.FAILED : WorkflowStatus.SUCCESS;
            logger.info('Orchestrator', `Workflow [${wf.id}] finished with status code: ${wf.status}`);
            this.emit('workflowFinished', wf);
        } else if (activelyRunning === 0 && failedCount > 0) {
            wf.status = WorkflowStatus.FAILED;
            this.emit('workflowFinished', wf);
        }
    }

    dispatchTaskToExecutionPool(wf, task) {
        task.status = TaskStatus.QUEUED;
        task.startedAt = Date.now();

        // Stitch dependency data scopes into execution inputs
        const compiledInputs = { ...task.inputs, ...wf.globalContext };
        for (const depId of task.dependencies) {
            const parent = wf.tasks.get(depId);
            if (parent.output) {
                compiledInputs[`upstream_${depId}`] = parent.output;
            }
        }

        const payload = { id: task.id, script: task.script, inputs: compiledInputs };

        this.workerPool.submit(payload, (res) => {
            this.handleTaskWorkerResponse(wf.id, task.id, res);
        });
    }

    handleTaskWorkerResponse(wfId, taskId, response) {
        const wf = this.activeExecutions.get(wfId);
        if (!wf) return;

        const task = wf.tasks.get(taskId);
        const duration = Date.now() - task.startedAt;
        metrics.trackTask(response.success ? TaskStatus.COMPLETED : TaskStatus.FAILED, duration);

        if (response.success) {
            task.status = TaskStatus.COMPLETED;
            task.output = response.output;
            task.endedAt = Date.now();
            logger.info('Orchestrator', `Task Execution Match Success: [${taskId}] in Workflow [${wfId}]`);
            this.evaluateNextExecutionStep(wf);
        } else {
            task.error = response.error;
            if (task.retryCount < task.maxRetries) {
                task.retryCount++;
                task.status = TaskStatus.PENDING;
                const delay = task.backoffMs * Math.pow(2, task.retryCount);
                logger.warn('Orchestrator', `Task [${taskId}] crashed. Scheduling exponential backoff retry #${task.retryCount} in ${delay}ms`, { error: response.error });
                setTimeout(() => this.evaluateNextExecutionStep(wf), delay);
            } else {
                task.status = TaskStatus.FAILED;
                task.endedAt = Date.now();
                logger.error('Orchestrator', `Task [${taskId}] definitively failed after exhausting retries limit.`, { error: response.error });
                this.evaluateNextExecutionStep(wf);
            }
        }
    }

    startHeartbeatLoop() {
        setInterval(() => {
            logger.debug('SystemClock', 'Orchestration structural heartbeat execution check active.');
            // Scrape and purge stale records out of dynamic active state space if older than 5 mins
            const now = Date.now();
            for (const [id, wf] of this.activeExecutions.entries()) {
                if (wf.status !== WorkflowStatus.RUNNING) {
                    // Let records persist for observation visibility, clean eventually if memory threshold drops
                }
            }
        }, CONFIG.HEARTBEAT_INTERVAL);
    }

    getExecutionStateDump() {
        const array = [];
        for (const [id, wf] of this.activeExecutions.entries()) {
            const taskArr = [];
            for (const t of wf.tasks.values()) {
                taskArr.push({
                    id: t.id,
                    status: t.status,
                    retryCount: t.retryCount,
                    dependencies: t.dependencies,
                    output: t.output,
                    error: t.error
                });
            }
            array.push({
                id: wf.id,
                name: wf.name,
                status: wf.status,
                tasks: taskArr
            });
        }
        return array;
    }
}

// ============================================================================
// 7. WEB UI GRAPHICAL DASHBOARD & REST API HTTP SERVER
// ============================================================================
class WebDashboardServer {
    constructor(orchestrator, workerPool) {
        this.orchestrator = orchestrator;
        this.workerPool = workerPool;
        this.server = http.createServer((req, res) => this.handleRouting(req, res));
    }

    start() {
        this.server.listen(CONFIG.PORT, () => {
            logger.info('HTTPServer', `AetherFlow Realtime Control Dashboard initialized at: http://localhost:${CONFIG.PORT}`);
        });
    }

    handleRouting(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        
        // REST API: GET System State Metrics Metrics
        if (url.pathname === '/api/metrics' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(metrics.getSnapshot()));
        }

        // REST API: GET Execution Engines State Dump
        if (url.pathname === '/api/executions' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(this.orchestrator.getExecutionStateDump()));
        }

        // REST API: GET Thread Pool Active Processing Layout Status
        if (url.pathname === '/api/workers' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(this.workerPool.getPoolState()));
        }

        // REST API: POST Inject New Active Trigger Execution
        if (url.pathname === '/api/trigger' && req.method === 'POST') {
            let dataBuffer = '';
            req.on('data', chunk => dataBuffer += chunk);
            req.on('end', async () => {
                try {
                    const payload = JSON.parse(dataBuffer || '{}');
                    const wfId = payload.workflowId || 'data-pipeline-demo';
                    const inputs = payload.inputs || { dataVolume: 1500 };
                    
                    const instId = await this.orchestrator.executeWorkflow(wfId, inputs);
                    res.writeHead(202, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Workflow dispatched successfully', executionId: instId }));
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: e.message }));
                }
            });
            return;
        }

        // UI Dashboard View Serving Block
        if (url.pathname === '/' || url.pathname === '/index.html') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            return res.end(this.getDashboardHTML());
        }

        // Catch All Fallback Handler Route 404 Error
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Endpoint Route context mapping not found." }));
    }

    getDashboardHTML() {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>🌌 AetherFlow Engine Workspace</title>
            <style>
                body {
                    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
                    background: radial-gradient(circle at top, #1e1b4b, #09090b);
                    color: #fafafa;
                    margin: 0;
                    padding: 24px;
                    min-height: 100vh;
                }
                header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    padding-bottom: 20px;
                    margin-bottom: 24px;
                }
                .logo-section h1 {
                    background: linear-gradient(135deg, #60a5fa, #a78bfa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin: 0;
                    font-size: 28px;
                    font-weight: 800;
                    letter-spacing: -0.025em;
                }
                .control-panel {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    padding: 8px 16px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(8px);
                }
                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .input-group label {
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #a1a1aa;
                }
                .control-panel input, .control-panel select {
                    background: #18181b;
                    color: #fafafa;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .control-panel input:focus, .control-panel select:focus {
                    border-color: #818cf8;
                }
                .btn {
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }
                .btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
                }
                .btn:active {
                    transform: translateY(0);
                }
                .grid {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 24px;
                }
                .card {
                    background: rgba(30, 41, 59, 0.4);
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(12px);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                    transition: transform 0.2s;
                }
                .card h2 {
                    margin-top: 0;
                    font-size: 18px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    padding-bottom: 12px;
                    color: #e4e4e7;
                    font-weight: 600;
                }
                .metric {
                    display: flex;
                    justify-content: space-between;
                    margin: 14px 0;
                    font-size: 14px;
                    border-bottom: 1px dashed rgba(255, 255, 255, 0.03);
                    padding-bottom: 8px;
                }
                .metric span.val {
                    font-weight: 700;
                    color: #ffffff;
                }
                .execution-block {
                    background: rgba(15, 23, 42, 0.6);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 16px;
                    border-left: 5px solid #64748b;
                    transition: all 0.3s;
                }
                .execution-block:hover {
                    transform: translateX(4px);
                }
                .execution-block.RUNNING { border-left-color: #3b82f6; box-shadow: 0 0 12px rgba(59, 130, 246, 0.15); }
                .execution-block.SUCCESS { border-left-color: #10b981; box-shadow: 0 0 12px rgba(16, 185, 129, 0.15); }
                .execution-block.FAILED { border-left-color: #ef4444; box-shadow: 0 0 12px rgba(239, 68, 68, 0.15); }
                
                .task-badge {
                    display: inline-block;
                    padding: 6px 10px;
                    font-size: 12px;
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                    border-radius: 6px;
                    margin: 4px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    cursor: help;
                    transition: all 0.2s;
                }
                .task-badge:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: scale(1.05);
                }
                .task-badge.PENDING { color: #a1a1aa; }
                .task-badge.QUEUED { color: #f59e0b; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.2); }
                .task-badge.RUNNING { color: #3b82f6; background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.3); animation: pulse 1.5s infinite; }
                .task-badge.COMPLETED { color: #10b981; background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); }
                .task-badge.FAILED { color: #ef4444; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); }
                .task-badge.SKIPPED { color: #71717a; background: rgba(113, 113, 122, 0.1); }
                
                .worker-dot {
                    display: inline-block;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    margin-right: 8px;
                    box-shadow: 0 0 8px currentColor;
                }
                .worker-item {
                    display: flex;
                    align-items: center;
                    margin: 12px 0;
                    font-size: 13px;
                    background: rgba(0, 0, 0, 0.2);
                    padding: 8px 12px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.02);
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
            </style>
        </head>
        <body>
            <header>
                <div class="logo-section">
                    <h1>🌌 AetherFlow Orchestration Engine</h1>
                    <p style="margin: 4px 0 0 0; color: #a1a1aa; font-size: 13px;">Realtime Micro-Kernel Architecture Analytics State Visualizer</p>
                </div>
                <div class="control-panel">
                    <div class="input-group">
                        <label for="param-scale">Scale Factor</label>
                        <input type="number" id="param-scale" value="4" min="1" max="50" style="width: 60px;">
                    </div>
                    <div class="input-group">
                        <label for="param-stability">Network Resilience Mode</label>
                        <select id="param-stability">
                            <option value="stable">Stable Network (No Failures)</option>
                            <option value="unstable">Unstable Network (Random Retries)</option>
                            <option value="critical">Critical Failure (Break Pipeline)</option>
                        </select>
                    </div>
                    <button class="btn" onclick="triggerWorkflow()">⚡ Trigger Pipeline</button>
                </div>
            </header>

            <div class="grid">
                <div>
                    <div class="card" style="margin-bottom: 24px;">
                        <h2>Telemetry Records</h2>
                        <div class="metric"><span>Total Workflows:</span><span class="val" id="m-wf">0</span></div>
                        <div class="metric"><span>Tasks Processed:</span><span class="val" id="m-tasks">0</span></div>
                        <div class="metric"><span>Successful Steps:</span><span class="val" id="m-success" style="color:#10b981;">0</span></div>
                        <div class="metric"><span>Failures Caught:</span><span class="val" id="m-fail" style="color:#ef4444;">0</span></div>
                        <div class="metric"><span>Avg Task Time:</span><span class="val" id="m-time">0ms</span></div>
                    </div>
                    
                    <div class="card">
                        <h2>Worker Threads Pool</h2>
                        <div id="workers-container"></div>
                    </div>
                </div>

                <div class="card">
                    <h2>Live Active DAG Structural Executions Track Instantiations</h2>
                    <div id="executions-container">
                        <p style="color: #a1a1aa; text-align: center; margin-top: 40px;">No workflows registered or currently moving. Use trigger button to initialize load engine framework.</p>
                    </div>
                </div>
            </div>

            <script>
                async function updateDashboard() {
                    try {
                        const resMetrics = await fetch('/api/metrics');
                        const dataMetrics = await resMetrics.json();
                        document.getElementById('m-wf').innerText = dataMetrics.totalWorkflowsRun;
                        document.getElementById('m-tasks').innerText = dataMetrics.totalTasksExecuted;
                        document.getElementById('m-success').innerText = dataMetrics.successfulTasks;
                        document.getElementById('m-fail').innerText = dataMetrics.failedTasks;
                        document.getElementById('m-time').innerText = dataMetrics.avgTaskDurationMs + 'ms';

                        const resWorkers = await fetch('/api/workers');
                        const dataWorkers = await resWorkers.json();
                        const wContainer = document.getElementById('workers-container');
                        wContainer.innerHTML = '';
                        dataWorkers.forEach(w => {
                            const div = document.createElement('div');
                            div.className = 'worker-item';
                            const color = w.isBusy ? '#eab308' : '#10b981';
                            const stateText = w.isBusy ? 'Processing Task: ' + w.taskId : 'Idling (Awaiting Load)';
                            div.innerHTML = \`<span class="worker-dot" style="background:\${color}; color:\${color}"></span> <b>Thread #\${w.id + 1}:</b> &nbsp; \&nbsp;\${stateText}\`;
                            wContainer.appendChild(div);
                        });

                        const resExecs = await fetch('/api/executions');
                        const dataExecs = await resExecs.json();
                        const eContainer = document.getElementById('executions-container');
                        if(dataExecs.length > 0) eContainer.innerHTML = '';
                        
                        // Sort executions backwards to preserve recent focus prioritization mapping
                        dataExecs.reverse().forEach(ex => {
                            const block = document.createElement('div');
                            block.className = 'execution-block ' + ex.status;
                            
                            let taskBadgesHtml = '';
                            ex.tasks.forEach(t => {
                                let titleAttr = t.error ? 'Error: ' + t.error : (t.output ? 'Output: ' + JSON.stringify(t.output) : 'No output');
                                taskBadgesHtml += \`<span class="task-badge \${t.status}" title="\${titleAttr}">\${t.id} (\${t.retryCount}r)</span>\`;
                            });

                            block.innerHTML = \`
                                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                    <span style="font-weight:bold; color:#f4f4f5;">\${ex.name} <span style="font-size:11px; font-weight:normal; color:#71717a;">[\${ex.id}]</span></span>
                                    <span style="font-size:12px; font-weight:bold; color:\${ex.status==='SUCCESS'?'#10b981':ex.status==='FAILED'?'#ef4444':'#3b82f6'}">\${ex.status}</span>
                                </div>
                                <div style="margin-top:6px;">\${taskBadgesHtml}</div>
                            \`;
                            eContainer.appendChild(block);
                        });
                    } catch (e) {
                        console.error("Dashboard looping sync rendering exception context crash: ", e);
                    }
                }

                function triggerWorkflow() {
                    const scaleFactor = parseInt(document.getElementById('param-scale').value, 10) || 4;
                    const stabilityMode = document.getElementById('param-stability').value;
                    fetch('/api/trigger', {
                        method: 'POST',
                        body: JSON.stringify({
                            workflowId: 'demo-pipeline',
                            inputs: {
                                scaleFactor: scaleFactor,
                                stabilityMode: stabilityMode
                            }
                        })
                    });
                }

                setInterval(updateDashboard, 800);
                updateDashboard();
            </script>
        </body>
        </html>
        `;
    }
}

// ============================================================================
// 8. INITIALIZATION ENGINE APPLICATION SETUP ENTRY POINT
// ============================================================================
function createDemoPipelineStructure() {
    const pipeline = new WorkflowDAG('demo-pipeline', 'Enterprise Ingestion & Analytics Pipeline Blueprint');

    // High Density Custom Virtual Machine Language Task Mappings Definitions
    pipeline.addTask({
        id: 'Ingest_Data_Source',
        script: `
            SET source "CloudBucket-Alpha"
            RANDOM count 100 500
            MUL dataVolume $count $scaleFactor
            CONCAT msg "Ingested" $dataVolume "records from" $source
            SLEEP 800
        `,
        retries: 2
    });

    pipeline.addTask({
        id: 'Sanitize_Inputs',
        script: `
            SET errorThreshold 0.05
            RANDOM noise 1 5
            DIV cleanFactor $upstream_Ingest_Data_Source_dataVolume $noise
            SLEEP 400
        `
    });

    pipeline.addTask({
        id: 'AI_Feature_Extraction',
        script: `
            RANDOM vectorWeight 12 85
            MUL modelScore $upstream_Sanitize_Inputs_cleanFactor $vectorWeight
            SLEEP 1500
        `
    });

    pipeline.addTask({
        id: 'SQL_Transactional_Write',
        script: `
            CONCAT targetTable "metrics_cluster_" $upstream_Ingest_Data_Source_count
            SET dbStatus "COMMIT_SUCCESS"
            SLEEP 600
        `
    });

    pipeline.addTask({
        id: 'Faulty_Resilience_Check',
        script: `
            # Emulate an unpredictable network break that triggers the retry engine dynamically
            IF_EQUAL $stabilityMode critical FAIL Critical_Network_Resilience_Failure
            IF_EQUAL $stabilityMode unstable RANDOM risk 1 4
            IF_EQUAL $risk 1 SET failChance "yes"
            IF_EQUAL $risk 2 SET failChance "yes"
            IF_EQUAL $failChance "yes" FAIL Simulated_Unstable_Network_Timeout
            SLEEP 300
        `,
        retries: 3,
        backoffMs: 200 // Faster backoff for rapid UX tracking demonstration
    });

    pipeline.addTask({
        id: 'Generate_Report_Artifact',
        script: `
            CONCAT status "Pipeline Completed With Token Score" $upstream_AI_Feature_Extraction_modelScore
            SET compileSuccess true
        `
    });

    // Wire Up Topologies Architectural Mappings Graph Layout Directionalities
    pipeline.addDependency('Ingest_Data_Source', 'Sanitize_Inputs');
    pipeline.addDependency('Sanitize_Inputs', 'AI_Feature_Extraction');
    pipeline.addDependency('Sanitize_Inputs', 'SQL_Transactional_Write');
    pipeline.addDependency('AI_Feature_Extraction', 'Generate_Report_Artifact');
    pipeline.addDependency('SQL_Transactional_Write', 'Faulty_Resilience_Check');
    pipeline.addDependency('Faulty_Resilience_Check', 'Generate_Report_Artifact');

    return pipeline;
}

// Master Main Bootstrap Gateway Thread Execution Lock Guard
if (isMainThread) {
    logger.info('SystemCore', '=== STARTING AETHERFLOW TASK ORCHESTRATION ENGINE ENGINE SYSTEM INTERNALS ===');
    
    // Allocate shared structures
    const pool = new WorkerThreadPool(CONFIG.MAX_WORKERS);
    const engine = new Orchestrator(pool);

    // Register blueprints
    const pipelineDemoBlueprint = createDemoPipelineStructure();
    engine.registerWorkflow(pipelineDemoBlueprint);

    // Instantiate and boot http network layer dashboard
    const webDashboard = new WebDashboardServer(engine, pool);
    webDashboard.start();

    // Auto trigger one initial process stream right off the bat to populate runtime UI charts instantly
    setTimeout(() => {
        engine.executeWorkflow('demo-pipeline', { scaleFactor: 4 }).catch(err => {
            logger.error('SystemCore', 'Initialization engine auto-fire pipeline breakdown sequence exception caught', { message: err.message });
        });
    }, 1000);

    // Graceful Termination Process Handlers Infrastructure Hooks
    const closeGracefully = (signal) => {
        logger.warn('SystemCore', `OS Termination Event Received via [${signal}]. Sweeping engine allocations cleanly.`);
        pool.shutdown();
        process.exit(0);
    };
    process.on('SIGINT', () => closeGracefully('SIGINT'));
    process.on('SIGTERM', () => closeGracefully('SIGTERM'));
}