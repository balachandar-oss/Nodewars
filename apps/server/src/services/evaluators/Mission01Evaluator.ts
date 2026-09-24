import { MissionEvaluator, EvaluationResult, CheckResult } from './MissionEvaluator';

export class Mission01Evaluator implements MissionEvaluator {
  async evaluate(code: string): Promise<EvaluationResult> {
    const checks: CheckResult[] = [];
    const terminalOutput: string[] = ['> node castle.js', '[Node Lab Simulator]', 'Checking module connections...'];
    const feedback: string[] = [];

    const strippedCode = code.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

    // Check 1: module.exports used
    const hasModuleExports = /module\.exports\s*=/.test(strippedCode);
    checks.push({
      id: 'module_exports',
      label: 'Lever exported via module.exports',
      passed: hasModuleExports,
      message: hasModuleExports ? 'Module correctly exports a value.' : 'Missing module.exports = ... in the lever code.'
    });

    // Check 2: require() used
    const hasRequire = /(const|let|var)\s+\w+\s*=\s*require\s*\(\s*['"]\.\/[^'"]+['"]\s*\)/.test(strippedCode);
    checks.push({
      id: 'import_module',
      label: 'Lever imported via require()',
      passed: hasRequire,
      message: hasRequire ? 'Successfully imported a local module.' : 'Missing require("./lever") in the gate code.'
    });

    const passedChecks = checks.filter(c => c.passed).length;
    const score = passedChecks;
    const success = passedChecks === checks.length;

    if (hasModuleExports) terminalOutput.push('Lever exported: OK');
    if (hasRequire) terminalOutput.push('Lever imported: OK');

    terminalOutput.push(success ? 'NODE CORE ONLINE' : 'Simulation failed. Review your module connections.');

    checks.filter(c => !c.passed).forEach(c => feedback.push(c.message));

    return { success, score, checks, terminalOutput, feedback, errors: [] };
  }
}
