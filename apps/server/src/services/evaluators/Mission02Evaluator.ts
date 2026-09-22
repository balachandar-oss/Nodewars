import { MissionEvaluator, EvaluationResult, CheckResult } from './MissionEvaluator';

export class Mission02Evaluator implements MissionEvaluator {
  async evaluate(code: string): Promise<EvaluationResult> {
    const checks: CheckResult[] = [];
    const terminalOutput: string[] = ['> node smart-door.js', '[Node Lab Simulator]', 'Checking Express (NPM package) usage...'];
    const feedback: string[] = [];

    const strippedCode = code.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

    // Check 1: Express module imported (an NPM package, not built-in)
    const hasExpressImport = /(const|let|var)\s+\w+\s*=\s*require\s*\(\s*['"]express['"]\s*\)/.test(strippedCode);
    checks.push({
      id: 'import_express',
      label: 'Express (NPM package) imported',
      passed: hasExpressImport,
      message: hasExpressImport ? 'Successfully imported Express from NPM.' : 'Missing require("express").'
    });

    // Check 2: App initialized
    const hasAppInit = /(const|let|var)\s+\w+\s*=\s*\w+\s*\(\s*\)/.test(strippedCode) && hasExpressImport;
    checks.push({
      id: 'app_init',
      label: 'Application initialized',
      passed: hasAppInit,
      message: hasAppInit ? 'Express application created.' : 'You need to initialize the Express app, e.g., const app = express();'
    });

    // Check 3: GET /door/status
    const hasGetStatus = /\.get\s*\(\s*['"]\/door\/status['"]\s*,/.test(strippedCode);
    checks.push({
      id: 'get_door_status',
      label: 'GET /door/status detected',
      passed: hasGetStatus,
      message: hasGetStatus ? 'Route /door/status configured.' : 'Missing GET route for /door/status.'
    });

    // Check 4: JSON response
    const hasJsonResponse = /\.json\s*\(/.test(strippedCode) || /res\.send\s*\(\s*\{/.test(strippedCode);
    checks.push({
      id: 'json_response',
      label: 'JSON response detected',
      passed: hasJsonResponse,
      message: hasJsonResponse ? 'Proper JSON response format detected.' : 'The route must return JSON, e.g., res.json({ status: "locked" }).'
    });

    // Check 5: app.listen present
    const hasListen = /\.listen\s*\(/.test(strippedCode);
    checks.push({
      id: 'app_listen',
      label: 'App listening',
      passed: hasListen,
      message: hasListen ? 'App is listening for connections.' : 'Missing app.listen().'
    });

    const passedChecks = checks.filter(c => c.passed).length;
    const score = passedChecks;
    const success = passedChecks === checks.length;

    if (hasAppInit) terminalOutput.push('Express application detected.');
    terminalOutput.push('Checking Smart Door route...');
    if (hasGetStatus) terminalOutput.push('GET /door/status ........ OK');
    if (hasJsonResponse) terminalOutput.push('JSON responses ........ OK');

    terminalOutput.push(success ? 'Smart Door systems online.' : 'Simulation failed. Review your Express route.');

    checks.filter(c => !c.passed).forEach(c => feedback.push(c.message));

    return { success, score, checks, terminalOutput, feedback, errors: [] };
  }
}
