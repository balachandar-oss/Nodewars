import { MissionEvaluator, EvaluationResult, CheckResult } from './MissionEvaluator';

export class Mission04Evaluator implements MissionEvaluator {
  async evaluate(code: string): Promise<EvaluationResult> {
    const checks: CheckResult[] = [];
    const terminalOutput: string[] = ['> node signal-tower.js', '[Node Lab Simulator]', 'Checking deployment config...'];
    const feedback: string[] = [];

    const strippedCode = code.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

    const hasProcessEnvPort = /process\.env\.PORT/.test(strippedCode);
    checks.push({
      id: 'process_env_port',
      label: 'Reads process.env.PORT',
      passed: hasProcessEnvPort,
      message: hasProcessEnvPort ? 'Dynamic port assigned.' : 'Missing process.env.PORT.'
    });

    const hasFallback = /\|\|\s*\d+/.test(strippedCode);
    checks.push({
      id: 'port_fallback',
      label: 'Provides a local fallback',
      passed: hasFallback,
      message: hasFallback ? 'Local fallback (|| 3000) exists.' : 'Missing local fallback like || 3000.'
    });

    const passedChecks = checks.filter(c => c.passed).length;
    const score = passedChecks;
    const success = passedChecks === checks.length;

    if (hasProcessEnvPort) terminalOutput.push('Dynamic port: OK');
    if (hasFallback) terminalOutput.push('Fallback: OK');

    terminalOutput.push(success ? 'CASTLE ONLINE' : 'Simulation failed. Ensure you are using environment variables correctly.');

    checks.filter(c => !c.passed).forEach(c => feedback.push(c.message));

    return { success, score, checks, terminalOutput, feedback, errors: [] };
  }
}
