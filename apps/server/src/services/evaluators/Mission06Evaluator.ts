import { MissionEvaluator, EvaluationResult, CheckResult } from './MissionEvaluator';

export class Mission06Evaluator implements MissionEvaluator {
  async evaluate(code: string): Promise<EvaluationResult> {
    const checks: CheckResult[] = [];
    const terminalOutput: string[] = ['[Node Lab Simulator]', 'Initializing Live Security Monitor (EventEmitter)...'];
    const feedback: string[] = [];

    const strippedCode = code.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

    // Check 1: EventEmitter required
    const requiresEvents = /require\s*\(\s*['"]events['"]\s*\)/.test(strippedCode);
    checks.push({
      id: 'require_events',
      label: 'events module required',
      passed: requiresEvents,
      message: requiresEvents ? 'Successfully imported the events module.' : 'Missing require("events").'
    });

    // Check 2: EventEmitter instantiated
    const hasEventEmitter = /new\s+EventEmitter\s*\(/.test(strippedCode);
    checks.push({
      id: 'event-emitter',
      label: 'EventEmitter instantiated',
      passed: hasEventEmitter,
      message: hasEventEmitter ? 'EventEmitter instance created.' : 'Could not find EventEmitter instantiation (e.g., new EventEmitter()).'
    });

    // Check 3: listener registered for door_opened
    const hasListener = /\.on\s*\(\s*['"]door_opened['"]\s*,/.test(strippedCode);
    checks.push({
      id: 'event-listener',
      label: '"door_opened" listener registered',
      passed: hasListener,
      message: hasListener ? 'Listener for "door_opened" found.' : 'Could not find .on("door_opened", ...) listener.'
    });

    // Check 4: event emitted
    const hasEmit = /\.emit\s*\(\s*['"]door_opened['"]\s*,/.test(strippedCode);
    checks.push({
      id: 'event-emission',
      label: '"door_opened" emitted',
      passed: hasEmit,
      message: hasEmit ? 'Emission of "door_opened" found.' : 'Could not find .emit("door_opened", ...) usage.'
    });

    // Check 5: listener registered before emit (order in source, rough heuristic)
    const listenerIndex = strippedCode.search(/\.on\s*\(\s*['"]door_opened['"]\s*,/);
    const emitIndex = strippedCode.search(/\.emit\s*\(\s*['"]door_opened['"]\s*,/);
    const correctOrder = listenerIndex !== -1 && emitIndex !== -1 && listenerIndex < emitIndex;
    checks.push({
      id: 'listener-before-emit',
      label: 'Listener registered before emit',
      passed: correctOrder,
      message: correctOrder ? 'Listener is registered before the event fires.' : '.on() must be called before .emit() or the listener will miss the event.'
    });

    const passedChecks = checks.filter(c => c.passed).length;
    const score = passedChecks;
    const success = passedChecks === checks.length;

    terminalOutput.push(`EventEmitter ............ ${hasEventEmitter ? 'OK' : 'FAIL'}`);
    terminalOutput.push(`Listener ("door_opened") . ${hasListener ? 'OK' : 'FAIL'}`);
    terminalOutput.push(`Event emission .......... ${hasEmit ? 'OK' : 'FAIL'}`);

    if (success) {
      terminalOutput.push('');
      terminalOutput.push('EVENT STREAM');
      terminalOutput.push('door_opened ............. RECEIVED { guard: "sentinel" }');
      terminalOutput.push('');
      terminalOutput.push('LIVE SECURITY MONITOR ONLINE');
    } else {
      terminalOutput.push('Simulation failed. Review your EventEmitter usage.');
    }

    checks.filter(c => !c.passed).forEach(c => feedback.push(c.message));

    return {
      success,
      score,
      checks,
      terminalOutput,
      feedback: success
        ? ['Excellent! Your event pipeline works - this is exactly the mechanism behind the real game.']
        : feedback,
      errors: []
    };
  }
}
