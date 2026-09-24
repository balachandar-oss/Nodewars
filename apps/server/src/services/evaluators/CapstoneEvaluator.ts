import { MissionEvaluator, EvaluationResult, CheckResult } from './MissionEvaluator';

export class CapstoneEvaluator implements MissionEvaluator {
  async evaluate(code: string): Promise<EvaluationResult> {
    const checks: CheckResult[] = [];
    const terminalOutput: string[] = ['> node gatehouse.js', '[Node Lab Simulator]', 'Checking every system...'];
    const feedback: string[] = [];

    const strippedCode = code.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

    // Check 1: MODULE - lever exported
    const hasModuleExports = /module\.exports\s*=/.test(strippedCode);
    checks.push({
      id: 'module_exports',
      label: 'Module: lever exported via module.exports',
      passed: hasModuleExports,
      message: hasModuleExports ? 'Module correctly exports the lever.' : 'Missing module.exports = ... for the lever.'
    });

    // Check 2: PACKAGE - an NPM-style (non-relative) require
    const hasPackageImport = /(const|let|var)\s+\w+\s*=\s*require\s*\(\s*['"](?!\.\.?\/)([^'"]+)['"]\s*\)/.test(strippedCode);
    checks.push({
      id: 'package_import',
      label: 'Package: NPM capability imported',
      passed: hasPackageImport,
      message: hasPackageImport ? 'Successfully imported an NPM package.' : 'Missing require("capability-package") for the external dependency.'
    });

    // Check 3: EVENT - both listener and emission wired
    const hasOn = /\.on\s*\(\s*['"]lever_pulled['"]/.test(strippedCode);
    const hasEmit = /\.emit\s*\(\s*['"]lever_pulled['"]/.test(strippedCode);
    const eventWired = hasOn && hasEmit;
    checks.push({
      id: 'event_wiring',
      label: 'Event: lever wired to the gate',
      passed: eventWired,
      message: eventWired ? 'Gate listens for and reacts to the lever.' : 'Missing gate.on("lever_pulled", ...) - make sure the gate is listening.'
    });

    // Check 4: DEPLOY - dynamic port with a local fallback
    const hasProcessEnvPort = /process\.env\.PORT/.test(strippedCode);
    const hasFallback = /\|\|\s*\d+/.test(strippedCode);
    const deployReady = hasProcessEnvPort && hasFallback;
    checks.push({
      id: 'deploy_port',
      label: 'Deploy: reads process.env.PORT with a fallback',
      passed: deployReady,
      message: deployReady ? 'Ready to deploy - dynamic port with a local fallback.' : 'Missing const PORT = process.env.PORT || 3000; (or similar).'
    });

    const passedChecks = checks.filter(c => c.passed).length;
    const score = passedChecks;
    const success = passedChecks === checks.length;

    checks.filter(c => c.passed).forEach(c => terminalOutput.push(`${c.label}: OK`));
    terminalOutput.push(success ? 'GATEHOUSE ONLINE - pull the lever!' : 'Simulation failed. Review the checklist below.');

    checks.filter(c => !c.passed).forEach(c => feedback.push(c.message));

    return { success, score, checks, terminalOutput, feedback, errors: [] };
  }
}
