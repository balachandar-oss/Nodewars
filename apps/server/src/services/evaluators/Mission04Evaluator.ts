import { MissionEvaluator, EvaluationResult, CheckResult } from './MissionEvaluator';

export class Mission04Evaluator implements MissionEvaluator {
  async evaluate(code: string): Promise<EvaluationResult> {
    const checks: CheckResult[] = [];
    const terminalOutput: string[] = [
      '[Node Lab Simulator]',
      'Opening Resource Vault...',
      ''
    ];
    const feedback: string[] = [];
    
    // Normalize code for static analysis
    const strippedCode = code.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Check 1: Database connection/setup concept
    const hasDbConnection = /db\s*=\s*new\s*Database/i.test(strippedCode) || 
                            /connect\s*\(/i.test(strippedCode) || 
                            /createConnection/i.test(strippedCode) ||
                            /const\s+(db|database)/i.test(strippedCode);
    checks.push({
      id: 'db_connection',
      label: 'Database connection concept detected',
      passed: hasDbConnection,
      message: hasDbConnection ? 'Database connection established.' : 'Missing database initialization or connection logic.'
    });

    // Check 2: Resource model/representation (Gold, Castle Key, Flag, Shield)
    const hasResource = /(gold|castle key|flag|shield)/i.test(strippedCode) || /resource/i.test(strippedCode);
    checks.push({
      id: 'data_model',
      label: 'Resource model detected',
      passed: hasResource,
      message: hasResource ? 'Resource data model structured.' : 'Could not identify a resource model (like Gold, Shield, Flag).'
    });

    // Check 3: CREATE
    const hasCreate = /\.create\s*\(/i.test(strippedCode) || /\.insert\s*\(/i.test(strippedCode) || /\.save\s*\(/i.test(strippedCode) || /INSERT\s+INTO/i.test(strippedCode);
    checks.push({
      id: 'crud_create',
      label: 'CREATE operation detected',
      passed: hasCreate,
      message: hasCreate ? 'Create logic implemented.' : 'Missing resource creation logic.'
    });

    // Check 4: READ
    const hasRead = /\.find\w*\s*\(/i.test(strippedCode) || /\.read\w*\s*\(/i.test(strippedCode) || /SELECT\s+.*FROM/i.test(strippedCode) || /\.get\w*\s*\(/i.test(strippedCode);
    checks.push({
      id: 'crud_read',
      label: 'READ operation detected',
      passed: hasRead,
      message: hasRead ? 'Read logic implemented.' : 'Missing resource retrieval logic.'
    });

    // Check 5: UPDATE
    const hasUpdate = /\.update\w*\s*\(/i.test(strippedCode) || /UPDATE\s+.*\s+SET/i.test(strippedCode) || /\.save\s*\(/i.test(strippedCode);
    checks.push({
      id: 'crud_update',
      label: 'UPDATE operation detected',
      passed: hasUpdate,
      message: hasUpdate ? 'Update logic implemented.' : 'Missing resource modification logic.'
    });

    // Check 6: DELETE
    const hasDelete = /\.delete\w*\s*\(/i.test(strippedCode) || /\.remove\w*\s*\(/i.test(strippedCode) || /DELETE\s+FROM/i.test(strippedCode) || /\.destroy\s*\(/i.test(strippedCode);
    checks.push({
      id: 'crud_delete',
      label: 'DELETE operation detected',
      passed: hasDelete,
      message: hasDelete ? 'Delete logic implemented.' : 'Missing resource deletion logic.'
    });

    // Check 7 & 8: Async behavior (async/await or promises)
    const hasAsyncAwait = /async\s+function/.test(strippedCode) || /async\s*\(/.test(strippedCode) || /\s+await\s+/.test(strippedCode);
    const hasPromise = /\.then\s*\(/.test(strippedCode);
    const isAsync = hasAsyncAwait || hasPromise;
    checks.push({
      id: 'async_handling',
      label: 'Async database operation detected',
      passed: isAsync,
      message: isAsync ? 'Asynchronous operations correctly formatted.' : 'Database operations should be asynchronous (use async/await or Promises).'
    });

    // Check 9: Error handling
    const hasCatch = /try\s*\{/.test(strippedCode) && /catch\s*\(/.test(strippedCode) || /\.catch\s*\(/.test(strippedCode);
    checks.push({
      id: 'error_handling',
      label: 'Error handling detected',
      passed: hasCatch,
      message: hasCatch ? 'Async error boundary configured.' : 'Missing error handling (try/catch or .catch()) for database calls.'
    });

    const passedChecks = checks.filter(c => c.passed).length;
    const score = passedChecks;
    const success = passedChecks === checks.length;

    if (hasDbConnection) terminalOutput.push('Database connection ........ OK');
    if (hasResource) terminalOutput.push('Resource model ............ OK');
    
    terminalOutput.push('');
    terminalOutput.push('CRUD verification:');
    if (hasCreate) terminalOutput.push('CREATE resource ...... OK');
    if (hasRead) terminalOutput.push('READ resource ........ OK');
    if (hasUpdate) terminalOutput.push('UPDATE resource ...... OK');
    if (hasDelete) terminalOutput.push('DELETE resource ...... OK');
    
    terminalOutput.push('');
    terminalOutput.push('Async operation checks:');
    if (isAsync) terminalOutput.push('Promise handling ...... OK');
    if (hasCatch) terminalOutput.push('Error handling ........ OK');
    
    terminalOutput.push('');

    if (success) {
      terminalOutput.push('RESOURCE VAULT ONLINE');
    } else {
      terminalOutput.push('RESOURCE VAULT FAILED TO INITIALIZE');
      terminalOutput.push('Review your CRUD logic and async boundaries.');
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
