import { MissionEvaluator, EvaluationResult, CheckResult } from './MissionEvaluator';

export class Mission05Evaluator implements MissionEvaluator {
  async evaluate(code: string): Promise<EvaluationResult> {
    const checks: CheckResult[] = [];
    const terminalOutput: string[] = [
      '[Node Lab Simulator]',
      'Power Grid Startup',
      '',
      'Initializing...',
      ''
    ];
    const feedback: string[] = [];
    
    // Normalize code for static analysis
    const strippedCode = code.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Check 1: Async function detected
    const hasAsyncFunction = /async\s+function/.test(strippedCode) || /async\s*\([^)]*\)\s*=>/.test(strippedCode);
    checks.push({
      id: 'async_function',
      label: 'Async function detected',
      passed: hasAsyncFunction,
      message: hasAsyncFunction ? 'Asynchronous function declared.' : 'Missing an async function declaration.'
    });

    // Check 2: Promise detected
    const hasPromise = /new\s+Promise/.test(strippedCode) || /\.then\s*\(/.test(strippedCode) || /Promise\./.test(strippedCode) || hasAsyncFunction;
    checks.push({
      id: 'promise_usage',
      label: 'Promise detected',
      passed: hasPromise,
      message: hasPromise ? 'Promise usage identified.' : 'Expected Promise-based structure.'
    });

    // Check 3: Await detected
    const hasAwait = /\s+await\s+/.test(strippedCode);
    checks.push({
      id: 'await_usage',
      label: 'await detected',
      passed: hasAwait,
      message: hasAwait ? 'Await keyword utilized.' : 'Use the await keyword to pause execution until the Promise resolves.'
    });

    // Check 4: Sequential async flow detected
    // Needs to look for multiple awaits, ideally calling the functions in the starter code:
    // authenticatePower, loadResources, activateSystems
    const matches = strippedCode.match(/await\s+\w+\s*\(/g);
    const hasSequentialFlow = matches && matches.length >= 3;
    checks.push({
      id: 'sequential_flow',
      label: 'Sequential async flow detected',
      passed: hasSequentialFlow || false,
      message: hasSequentialFlow ? 'Multiple asynchronous operations coordinated in order.' : 'Missing sequential flow. Ensure you await authenticatePower, loadResources, and activateSystems.'
    });

    // Check 5: Error handling detected
    const hasErrorHandling = /try\s*\{/.test(strippedCode) && /catch\s*\(/.test(strippedCode) || /\.catch\s*\(/.test(strippedCode);
    checks.push({
      id: 'error_handling',
      label: 'Error handling detected',
      passed: hasErrorHandling,
      message: hasErrorHandling ? 'Async error boundary configured.' : 'Wrap your async flow in a try/catch block to handle rejected Promises.'
    });

    const passedChecks = checks.filter(c => c.passed).length;
    const score = passedChecks;
    const success = passedChecks === checks.length;

    if (hasSequentialFlow) {
      terminalOutput.push('Authentication ........ COMPLETE');
      terminalOutput.push('Resource loading ...... COMPLETE');
      terminalOutput.push('System activation .... COMPLETE');
      terminalOutput.push('');
    }

    terminalOutput.push('Async workflow:');
    if (hasPromise) terminalOutput.push('Promise detected ........ OK');
    if (hasSequentialFlow) terminalOutput.push('await sequencing ........ OK');
    if (hasErrorHandling) terminalOutput.push('Error handling .......... OK');
    
    terminalOutput.push('');

    if (success) {
      terminalOutput.push('Node.js remains responsive while operations complete.');
      terminalOutput.push('POWER GRID ONLINE');
    } else {
      terminalOutput.push('POWER GRID STARTUP FAILED');
      terminalOutput.push('Review your asynchronous sequence.');
    }

    checks.filter(c => !c.passed).forEach(c => feedback.push(c.message));

    return {
      success,
      score,
      checks,
      terminalOutput,
      feedback,
      errors: []
    };
  }
}
