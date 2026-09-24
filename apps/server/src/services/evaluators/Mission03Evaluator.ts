import { MissionEvaluator, EvaluationResult, CheckResult } from './MissionEvaluator';

export class Mission03Evaluator implements MissionEvaluator {
  async evaluate(code: string): Promise<EvaluationResult> {
    const checks: CheckResult[] = [];
    const terminalOutput: string[] = ['> node event-circuit.js', '[Node Lab Simulator]', 'Checking event connections...'];
    const feedback: string[] = [];

    const strippedCode = code.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

    const hasOn = /\.on\s*\(\s*['"]lever_pulled['"]/.test(strippedCode);
    checks.push({
      id: 'event_on',
      label: 'Gate listens for lever_pulled',
      passed: hasOn,
      message: hasOn ? 'Listener configured correctly.' : 'Missing castle.on("lever_pulled", ...)'
    });

    const hasEmit = /\.emit\s*\(\s*['"]lever_pulled['"]/.test(strippedCode);
    checks.push({
      id: 'event_emit',
      label: 'Lever emits lever_pulled',
      passed: hasEmit,
      message: hasEmit ? 'Emission configured correctly.' : 'Missing castle.emit("lever_pulled")'
    });

    const passedChecks = checks.filter(c => c.passed).length;
    const score = passedChecks;
    const success = passedChecks === checks.length;

    if (hasOn) terminalOutput.push('Listener: OK');
    if (hasEmit) terminalOutput.push('Emitter: OK');

    terminalOutput.push(success ? 'CIRCUIT REPAIRED' : 'Simulation failed. Check your event string names.');

    checks.filter(c => !c.passed).forEach(c => feedback.push(c.message));

    return { success, score, checks, terminalOutput, feedback, errors: [] };
  }
}
