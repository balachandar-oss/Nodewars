import { MissionEvaluator, EvaluationResult, CheckResult } from './MissionEvaluator';

export class Mission08Evaluator implements MissionEvaluator {
  async evaluate(code: string): Promise<EvaluationResult> {
    const checks: CheckResult[] = [];
    const terminalOutput: string[] = ['[Node Lab Simulator]', 'Checking deployment readiness (Signal Tower)...'];
    const feedback: string[] = [];

    const strippedCode = code.replace(/\/\/[^\n]*$/gm, (m) => m).replace(/\/\*[\s\S]*?\*\//g, '');
    // Note: we intentionally do NOT strip line comments entirely here because the
    // package.json block in the starter code lives inside comments - we check
    // that text directly for the "start" script fix.

    // Check 1: process.env.PORT used
    const usesEnvPort = /process\.env\.PORT/.test(code);
    checks.push({
      id: 'uses_env_port',
      label: 'Reads PORT from process.env',
      passed: usesEnvPort,
      message: usesEnvPort ? 'Server reads process.env.PORT.' : 'Server must read the port from process.env.PORT.'
    });

    // Check 2: fallback provided (|| 3000 or similar)
    const hasFallback = /process\.env\.PORT\s*\|\|\s*\d+/.test(code);
    checks.push({
      id: 'has_fallback',
      label: 'Local fallback port provided',
      passed: hasFallback,
      message: hasFallback ? 'A local fallback port is provided.' : 'Provide a fallback, e.g. process.env.PORT || 3000, so local runs still work.'
    });

    // Check 3: server.listen uses the PORT variable (not a hardcoded literal)
    const listensOnPortVar = /\.listen\s*\(\s*PORT\b/.test(code);
    checks.push({
      id: 'listens_on_port_var',
      label: 'Server listens on the PORT variable',
      passed: listensOnPortVar,
      message: listensOnPortVar ? 'server.listen(PORT, ...) detected.' : 'server.listen() must use the PORT variable, not a hardcoded number.'
    });

    // Check 4: "start" script fixed to run the server file
    const hasStartScript = /"start"\s*:\s*"node\s+[\w./-]+\.js"/.test(code);
    checks.push({
      id: 'start_script',
      label: 'package.json "start" script configured',
      passed: hasStartScript,
      message: hasStartScript ? 'The "start" script correctly runs the server with node.' : 'Fix the "start" script to something like "node server.js" so a host knows how to launch your app.'
    });

    const passedChecks = checks.filter(c => c.passed).length;
    const score = passedChecks;
    const success = passedChecks === checks.length;

    terminalOutput.push(`process.env.PORT ........ ${usesEnvPort ? 'OK' : 'FAIL'}`);
    terminalOutput.push(`Fallback port ............ ${hasFallback ? 'OK' : 'FAIL'}`);
    terminalOutput.push(`server.listen(PORT) ...... ${listensOnPortVar ? 'OK' : 'FAIL'}`);
    terminalOutput.push(`"start" script ........... ${hasStartScript ? 'OK' : 'FAIL'}`);

    terminalOutput.push(success ? 'Deployment checklist passed. Ready for a real host.' : 'Not deployment-ready yet.');

    checks.filter(c => !c.passed).forEach(c => feedback.push(c.message));

    return {
      success,
      score,
      checks,
      terminalOutput,
      feedback: success ? ['This app would boot correctly on a real hosting platform.'] : feedback,
      errors: []
    };
  }
}
