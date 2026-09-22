import { MissionEvaluator, EvaluationResult, CheckResult } from './MissionEvaluator';

export class Mission01Evaluator implements MissionEvaluator {
  async evaluate(code: string): Promise<EvaluationResult> {
    const checks: CheckResult[] = [];
    const terminalOutput: string[] = ['> node server.js', '[Node Lab Simulator]', 'Checking module + server setup...'];
    const feedback: string[] = [];

    const strippedCode = code.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

    // Check 1: http module required
    const hasHttpImport = /(const|let|var)\s+\w+\s*=\s*require\s*\(\s*['"]http['"]\s*\)/.test(strippedCode);
    checks.push({
      id: 'import_http',
      label: 'HTTP module imported',
      passed: hasHttpImport,
      message: hasHttpImport ? 'Successfully imported HTTP module.' : 'Missing require("http").'
    });

    // Check 2: module.exports used
    const hasModuleExports = /module\.exports\s*=/.test(strippedCode);
    checks.push({
      id: 'module_exports',
      label: 'module.exports used',
      passed: hasModuleExports,
      message: hasModuleExports ? 'Module correctly exports a value.' : 'Missing module.exports = ... (this is how a file shares code with others).'
    });

    // Check 3: greet() returns non-empty string
    const greetMatch = strippedCode.match(/greet\s*\(\s*\)\s*\{\s*return\s+(["'`])([\s\S]*?)\1/);
    const hasGreetReturn = !!greetMatch && greetMatch[2].trim().length > 0;
    checks.push({
      id: 'greet_returns_value',
      label: 'greet() returns a value',
      passed: hasGreetReturn,
      message: hasGreetReturn ? 'greet() returns a non-empty string.' : 'greet() must return a non-empty string.'
    });

    // Check 4: createServer called
    const hasCreateServer = /\.createServer\s*\(/.test(strippedCode);
    checks.push({
      id: 'create_server',
      label: 'HTTP server created',
      passed: hasCreateServer,
      message: hasCreateServer ? 'Server creation logic detected.' : 'Missing http.createServer().'
    });

    // Check 5: response uses greet()
    const usesGreetInResponse = /res\.end\s*\(\s*greeter\.greet\s*\(\s*\)\s*\)/.test(strippedCode) || /res\.end\s*\(\s*greet\s*\(\s*\)\s*\)/.test(strippedCode);
    checks.push({
      id: 'response_uses_module',
      label: 'Response uses the module',
      passed: usesGreetInResponse,
      message: usesGreetInResponse ? 'Server response is wired to the module you exported.' : 'The response should use greeter.greet() as its body.'
    });

    // Check 6: server.listen
    const hasListen = /\.listen\s*\(\s*[^)]+\s*\)/.test(strippedCode);
    checks.push({
      id: 'server_listen',
      label: 'Server startup logic complete',
      passed: hasListen,
      message: hasListen ? 'Server is listening for connections.' : 'Missing server.listen().'
    });

    const passedChecks = checks.filter(c => c.passed).length;
    const score = passedChecks;
    const success = passedChecks === checks.length;

    if (hasHttpImport) terminalOutput.push('HTTP module detected.');
    if (hasModuleExports) terminalOutput.push('module.exports: OK');
    if (hasGreetReturn) terminalOutput.push('greet() returns: OK');
    if (hasListen) terminalOutput.push('Server startup: OK');

    terminalOutput.push(success ? 'Waiting for requests...' : 'Simulation failed. Review your module + server wiring.');

    checks.filter(c => !c.passed).forEach(c => feedback.push(c.message));

    return { success, score, checks, terminalOutput, feedback, errors: [] };
  }
}
