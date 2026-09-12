import { MissionEvaluator, EvaluationResult, CheckResult } from './MissionEvaluator';

export class Mission02Evaluator implements MissionEvaluator {
  async evaluate(code: string): Promise<EvaluationResult> {
    const checks: CheckResult[] = [];
    const terminalOutput: string[] = ['> node smart-door.js', '[Node Lab Simulator]', 'Checking Express configuration...'];
    const feedback: string[] = [];
    
    // Normalize code for static analysis
    const strippedCode = code.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Check 1: Express module imported
    const hasExpressImport = /(const|let|var)\s+\w+\s*=\s*require\s*\(\s*['"]express['"]\s*\)/.test(strippedCode);
    checks.push({
      id: 'import_express',
      label: 'Express module imported',
      passed: hasExpressImport,
      message: hasExpressImport ? 'Successfully imported Express.' : 'Missing require("express").'
    });

    // Check 2: App initialized
    // Looks for something like `const app = express()` or `let server = express()`
    const hasAppInit = /(const|let|var)\s+\w+\s*=\s*\w+\s*\(\s*\)/.test(strippedCode) && hasExpressImport;
    checks.push({
      id: 'app_init',
      label: 'Application initialized',
      passed: hasAppInit,
      message: hasAppInit ? 'Express application created.' : 'You need to initialize the Express app, e.g., const app = express();'
    });

    // We assume the variable name before `.get` or `.post` might vary, so we look for `.get(` and `.post(`.
    
    // Check 3: GET /door/status
    const hasGetStatus = /\.get\s*\(\s*['"]\/door\/status['"]\s*,/.test(strippedCode);
    checks.push({
      id: 'get_door_status',
      label: 'GET /door/status detected',
      passed: hasGetStatus,
      message: hasGetStatus ? 'Route /door/status configured.' : 'Missing GET route for /door/status.'
    });

    // Check 4: GET /door/open
    const hasGetOpen = /\.get\s*\(\s*['"]\/door\/open['"]\s*,/.test(strippedCode);
    checks.push({
      id: 'get_door_open',
      label: 'GET /door/open detected',
      passed: hasGetOpen,
      message: hasGetOpen ? 'Route /door/open configured.' : 'Missing GET route for /door/open.'
    });

    // Check 5: POST /door/access
    const hasPostAccess = /\.post\s*\(\s*['"]\/door\/access['"]\s*,/.test(strippedCode);
    checks.push({
      id: 'post_door_access',
      label: 'POST /door/access detected',
      passed: hasPostAccess,
      message: hasPostAccess ? 'Route /door/access configured.' : 'Missing POST route for /door/access.'
    });

    // Check 6: JSON response behavior
    const hasJsonResponse = /\.json\s*\(/.test(strippedCode) || /res\.send\s*\(\s*\{/.test(strippedCode);
    checks.push({
      id: 'json_response',
      label: 'JSON response detected',
      passed: hasJsonResponse,
      message: hasJsonResponse ? 'Proper JSON response format detected.' : 'Routes must return JSON, e.g., res.json({ status: "ok" }).'
    });

    const passedChecks = checks.filter(c => c.passed).length;
    const score = passedChecks;
    const success = passedChecks === checks.length;

    if (hasAppInit) terminalOutput.push('Express application detected.');
    terminalOutput.push('Checking Smart Door routes...');
    if (hasGetStatus) terminalOutput.push('GET /door/status ........ OK');
    if (hasGetOpen) terminalOutput.push('GET /door/open ......... OK');
    if (hasPostAccess) terminalOutput.push('POST /door/access ...... OK');
    if (hasJsonResponse) terminalOutput.push('JSON responses ........ OK');

    if (success) {
      terminalOutput.push('Smart Door systems online.');
    } else {
      terminalOutput.push('Simulation failed. Review your routing logic.');
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
