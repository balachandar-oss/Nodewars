import { MissionEvaluator, EvaluationResult, CheckResult } from './MissionEvaluator';

export class Mission01Evaluator implements MissionEvaluator {
  async evaluate(code: string): Promise<EvaluationResult> {
    const checks: CheckResult[] = [];
    const terminalOutput: string[] = ['> node server.js', '[Node Lab Simulator]', 'Checking server configuration...'];
    const feedback: string[] = [];
    
    // Normalize code for easier static analysis
    const strippedCode = code.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Check 1: HTTP module imported
    const hasHttpImport = /(const|let|var)\s+\w+\s*=\s*require\s*\(\s*['"]http['"]\s*\)/.test(strippedCode);
    checks.push({
      id: 'import_http',
      label: 'HTTP module imported',
      passed: hasHttpImport,
      message: hasHttpImport ? 'Successfully imported HTTP module.' : 'Missing require("http").'
    });

    // Check 2: createServer called
    const hasCreateServer = /\.createServer\s*\(/ .test(strippedCode);
    checks.push({
      id: 'create_server',
      label: 'HTTP server created',
      passed: hasCreateServer,
      message: hasCreateServer ? 'Server creation logic detected.' : 'Missing http.createServer().'
    });

    // Check 3: Request/Response callback exists
    const hasReqRes = /\.createServer\s*\(\s*(function\s*\([^,]+,\s*[^)]+\)|\([^,]+,\s*[^)]+\)\s*=>|[^,]+,\s*[^)]+\s*=>)/.test(strippedCode);
    checks.push({
      id: 'req_res_callback',
      label: 'Request/response handler detected',
      passed: hasReqRes || hasCreateServer, // If they created it, give partial pass or strict regex
      message: hasReqRes ? 'Valid request/response handler found.' : 'Make sure your createServer callback accepts (req, res).'
    });
    // Relaxed check 3 for prototype: if they just have function(req,res) or (req,res)=>
    const relaxedReqRes = /function\s*\(\s*\w+\s*,\s*\w+\s*\)/.test(strippedCode) || /\(\s*\w+\s*,\s*\w+\s*\)\s*=>/.test(strippedCode);
    if (!hasReqRes && relaxedReqRes) {
      checks[2].passed = true;
      checks[2].message = 'Valid request/response handler found.';
    }

    // Check 4: Port 3000 used
    const usesPort3000 = /3000/.test(strippedCode);
    checks.push({
      id: 'port_3000',
      label: 'Port 3000 detected',
      passed: usesPort3000,
      message: usesPort3000 ? 'Port 3000 configured.' : 'Server must use port 3000.'
    });

    // Check 5: server.listen
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
    if (usesPort3000) terminalOutput.push('Port: 3000');
    if (hasListen) terminalOutput.push('Server startup: OK');

    if (success) {
      terminalOutput.push('Waiting for requests...');
    } else {
      terminalOutput.push('Simulation failed. Review your architecture.');
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
