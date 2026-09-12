import { MissionEvaluator, EvaluationResult } from './MissionEvaluator';

export class Mission07Evaluator implements MissionEvaluator {
  async evaluate(code: string): Promise<EvaluationResult> {
    const checks = [
      { id: 'route-protected', label: 'Route protected', passed: false, message: 'The /admin route is missing or no longer uses security middleware.' },
      { id: 'authn-required', label: 'Authentication required', passed: false, message: 'Missing authentication check (e.g., if (!req.user)).' },
      { id: 'authz-enforced', label: 'Authorization enforced', passed: false, message: 'Missing check for req.user.role.' },
      { id: 'player-denied', label: 'PLAYER denied', passed: false, message: 'Missing rejection path (e.g., 403 Forbidden) for non-admins.' },
      { id: 'admin-allowed', label: 'ADMIN allowed', passed: false, message: 'Missing success path (next()) for authorized users.' },
      { id: 'vulnerability-resolved', label: 'Vulnerability resolved', passed: false, message: 'The security gate does not properly link authorization checks with rejection/success paths.' }
    ];

    const terminalOutput: string[] = [
      '[Node Lab Security Scanner]',
      'Target: /admin'
    ];

    try {
      // Clean up code for regex analysis (remove single-line and multi-line comments)
      const cleanCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');

      // Check 1: Route protected
      // Look for app.get("/admin", something, ...
      const routeMatch = cleanCode.match(/app\.(?:get|post|put|delete|all)\s*\(\s*['"`]\/admin['"`]\s*,\s*([a-zA-Z0-9_]+)\s*,/);
      let middlewareName = '';
      if (routeMatch && routeMatch[1]) {
        middlewareName = routeMatch[1];
        checks[0].passed = true;
      }

      // If the route isn't protected, we can't evaluate the middleware properly
      if (!checks[0].passed) {
        throw new Error('VULNERABILITY DETECTED: Protected route missing or exposed without middleware.');
      }

      // Extract the middleware function body
      // We'll look for `const/let/var/function middlewareName`
      const middlewareRegex = new RegExp(`(?:const|let|var|function)\\s+${middlewareName}\\s*(?:=|\\()([\\s\\S]*?)(?:app\\.)`);
      const middlewareMatch = cleanCode.match(middlewareRegex);
      const middlewareBody = middlewareMatch ? middlewareMatch[1] : cleanCode; // Fallback to full code if extraction fails

      // Check 2: Authentication required
      if (/req\.user/.test(middlewareBody) || /user\s*=/.test(middlewareBody)) {
        checks[1].passed = true;
      }

      // Check 3: Authorization enforced
      if (/role/.test(middlewareBody) && (/ADMIN/i.test(middlewareBody) || /PLAYER/i.test(middlewareBody))) {
        checks[2].passed = true;
      }

      // Check 4: PLAYER denied (rejection path)
      if (/status\s*\(\s*403\s*\)/.test(middlewareBody) || /401/.test(middlewareBody) || /send\s*\(/.test(middlewareBody) || /json\s*\(/.test(middlewareBody)) {
        // If there's a response being sent inside the middleware, it's a rejection path
        // Must contain role logic + a response
        if (checks[2].passed) {
           checks[3].passed = true;
        }
      }

      // Check 5: ADMIN allowed (success path)
      if (/next\s*\(\s*\)/.test(middlewareBody)) {
        checks[4].passed = true;
      }

      // Check 6: Vulnerability resolved (Relationship check)
      // Must have auth check AND role check AND rejection AND next() inside the middleware
      if (checks[1].passed && checks[2].passed && checks[3].passed && checks[4].passed) {
        checks[5].passed = true;
      }

      const score = checks.filter(c => c.passed).length;
      const success = score === checks.length;

      // Simulated terminal feedback
      if (!success) {
        terminalOutput.push('');
        terminalOutput.push('PLAYER request:');
        terminalOutput.push(`AUTHENTICATED ......... ${checks[1].passed ? 'YES' : 'NO'}`);
        terminalOutput.push(`AUTHORIZED ........... ${checks[2].passed ? 'YES  <-- ANOMALY' : 'NO'}`);
        terminalOutput.push('RESOURCE ACCESS ....... GRANTED');
        terminalOutput.push('');
        terminalOutput.push('SECURITY STATUS:');
        terminalOutput.push('CRITICAL');
        terminalOutput.push('');
        terminalOutput.push('Vulnerability:');
        terminalOutput.push('BROKEN AUTHORIZATION / ACCESS CONTROL');
      } else {
        terminalOutput.push('');
        terminalOutput.push('PLAYER request:');
        terminalOutput.push('AUTHENTICATED ......... YES');
        terminalOutput.push('AUTHORIZED ........... NO');
        terminalOutput.push('HTTP STATUS ........... 403');
        terminalOutput.push('');
        terminalOutput.push('ADMIN request:');
        terminalOutput.push('AUTHENTICATED ......... YES');
        terminalOutput.push('AUTHORIZED ........... YES');
        terminalOutput.push('RESOURCE ACCESS ....... GRANTED');
        terminalOutput.push('');
        terminalOutput.push('SECURITY STATUS:');
        terminalOutput.push('RESOLVED');
      }

      return {
        success,
        score,
        checks,
        terminalOutput,
        feedback: success 
          ? ['Security patch verified. The castle vault is secure.']
          : ['The security audit failed. Review the simulated request flows.'],
        errors: []
      };

    } catch (error: any) {
      terminalOutput.push('');
      terminalOutput.push('SECURITY STATUS:');
      terminalOutput.push('CRITICAL');
      terminalOutput.push('');
      terminalOutput.push(error.message || 'Unknown error');

      return {
        success: false,
        score: checks.filter(c => c.passed).length,
        checks,
        terminalOutput,
        feedback: ['An anomaly was detected during the security audit. Ensure the route and middleware are intact.'],
        errors: [error.message || 'Unknown error']
      };
    }
  }
}
