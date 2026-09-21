import { MissionEvaluator, EvaluationResult, CheckResult } from './MissionEvaluator';

export class Mission03Evaluator implements MissionEvaluator {
  async evaluate(code: string): Promise<EvaluationResult> {
    const checks: CheckResult[] = [];
    const terminalOutput: string[] = [
      '> node security-gate.js', 
      '[Node Lab Simulator]', 
      'Initializing Security Gate...',
      ''
    ];
    const feedback: string[] = [];
    
    // Normalize code for static analysis
    const strippedCode = code.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Check 1: Express App
    const hasExpress = /(const|let|var)\s+\w+\s*=\s*require\s*\(\s*['"]express['"]\s*\)/.test(strippedCode) && 
                       /(const|let|var)\s+\w+\s*=\s*\w+\s*\(\s*\)/.test(strippedCode);
    checks.push({
      id: 'express_app',
      label: 'Express application detected',
      passed: hasExpress,
      message: hasExpress ? 'Express framework loaded.' : 'Missing Express initialization.'
    });

    // Check 2: Middleware & next() usage
    // Look for a function with (req, res, next)
    const hasMiddleware = /function\s*\(\s*\w+\s*,\s*\w+\s*,\s*\w+\s*\)/.test(strippedCode) || 
                          /\(\s*\w+\s*,\s*\w+\s*,\s*\w+\s*\)\s*=>/.test(strippedCode);
    const hasNext = /\.next\s*\(\s*\)/.test(strippedCode) || /next\s*\(\s*\)/.test(strippedCode);
    const middlewarePassed = hasMiddleware && hasNext;
    
    checks.push({
      id: 'middleware_next',
      label: 'Middleware pipeline with next()',
      passed: middlewarePassed,
      message: middlewarePassed ? 'Request pipeline configured correctly.' : 'Missing middleware structure (req, res, next) or next() call.'
    });

    // Check 3: Authentication concept (checking if user exists)
    // Very loose: checks if they look at req.user or something similar and return 401
    const hasAuthCheck = /401/.test(strippedCode) || /req\.\w+/.test(strippedCode);
    checks.push({
      id: 'authentication',
      label: 'Authentication check detected (Who are you?)',
      passed: hasAuthCheck,
      message: hasAuthCheck ? 'Identity verification present.' : 'Missing authentication logic (e.g. checking if a user is provided and returning 401).'
    });

    // Check 4: Authorization concept (checking role)
    // Checks for 'admin' or role comparison and 403
    const hasAuthZCheck = /403/.test(strippedCode) || /role/.test(strippedCode.toLowerCase()) || /admin/.test(strippedCode.toLowerCase());
    checks.push({
      id: 'authorization',
      label: 'Authorization check detected (Are you allowed?)',
      passed: hasAuthZCheck,
      message: hasAuthZCheck ? 'Permission verification present.' : 'Missing authorization logic (e.g. checking if role is ADMIN and returning 403 otherwise).'
    });

    // Check 5: Roles logic (PLAYER denied, ADMIN allowed)
    // We check if code contains logic that differentiates ADMIN from others
    const hasAdminAllowed = /===?\s*['"]ADMIN['"]/.test(strippedCode.toUpperCase()) || /!==?\s*['"]ADMIN['"]/.test(strippedCode.toUpperCase());
    checks.push({
      id: 'role_logic',
      label: 'Role logic: PLAYER denied, ADMIN allowed',
      passed: hasAdminAllowed,
      message: hasAdminAllowed ? 'Role-based access control configured.' : 'Security gate does not distinguish ADMIN from PLAYER.'
    });

    // Check 6: Protected operation
    const hasProtectedRoute = /\.get\s*\(\s*['"]\/(admin|secure|vault|protected)['"]/.test(strippedCode) || 
                              /\.post\s*\(\s*['"]\/(admin|secure|vault|protected)['"]/.test(strippedCode) ||
                              /res\.(json|send)/.test(strippedCode); // If they at least respond somewhere
    checks.push({
      id: 'protected_route',
      label: 'Protected operation detected',
      passed: hasProtectedRoute,
      message: hasProtectedRoute ? 'Protected resource secured behind gate.' : 'No protected route found to secure.'
    });

    const passedChecks = checks.filter(c => c.passed).length;
    const score = passedChecks;
    const success = passedChecks === checks.length;

    terminalOutput.push('Authentication check:');
    if (hasAuthCheck) {
      terminalOutput.push('UNKNOWN -> DENIED (401)');
      terminalOutput.push('PLAYER -> authenticated');
    } else {
      terminalOutput.push('UNKNOWN -> bypassed (WARNING!)');
    }
    
    terminalOutput.push('');
    terminalOutput.push('Authorization check:');
    if (hasAuthZCheck && hasAdminAllowed) {
      terminalOutput.push('PLAYER -> DENIED (403)');
      terminalOutput.push('ADMIN -> authenticated');
      terminalOutput.push('ADMIN -> AUTHORIZED');
    } else {
      terminalOutput.push('PLAYER -> allowed (SECURITY BREACH!)');
    }

    terminalOutput.push('');
    terminalOutput.push('Protected resource:');
    if (success) {
      terminalOutput.push('ACCESS GRANTED (to ADMIN only)');
      terminalOutput.push('');
      terminalOutput.push('Security Gate evaluation complete.');
    } else {
      terminalOutput.push('ACCESS DENIED / BREACHED');
      terminalOutput.push('Simulation failed. Review your middleware logic.');
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
