import { MissionEvaluator, EvaluationResult, CheckResult } from './MissionEvaluator';

export class Mission02Evaluator implements MissionEvaluator {
  async evaluate(code: string): Promise<EvaluationResult> {
    const checks: CheckResult[] = [];
    const terminalOutput: string[] = ['> node capabilities.js', '[Node Lab Simulator]', 'Checking NPM dependency usage...'];
    const feedback: string[] = [];

    const strippedCode = code.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

    // Check 1: require() used with a package (no ./ or ../ prefix)
    const hasPackageImport = /(const|let|var)\s+\w+\s*=\s*require\s*\(\s*['"](?!\.\.?\/)([^'"]+)['"]\s*\)/.test(strippedCode);
    checks.push({
      id: 'import_package',
      label: 'Capability package imported',
      passed: hasPackageImport,
      message: hasPackageImport ? 'Successfully imported an NPM package.' : 'Missing require("capability-package") for the external dependency.'
    });

    const passedChecks = checks.filter(c => c.passed).length;
    const score = passedChecks;
    const success = passedChecks === checks.length;

    if (hasPackageImport) terminalOutput.push('NPM package detected: OK');

    terminalOutput.push(success ? 'CAPABILITY SUPPLIED' : 'Simulation failed. Review your NPM imports.');

    checks.filter(c => !c.passed).forEach(c => feedback.push(c.message));

    return { success, score, checks, terminalOutput, feedback, errors: [] };
  }
}
