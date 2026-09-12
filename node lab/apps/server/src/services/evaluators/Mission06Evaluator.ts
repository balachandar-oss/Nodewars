import { MissionEvaluator, EvaluationResult } from './MissionEvaluator';

export class Mission06Evaluator implements MissionEvaluator {
  async evaluate(code: string): Promise<EvaluationResult> {
    const checks = [
      { id: 'event-emitter', label: 'EventEmitter instantiated', passed: false, message: 'Could not find EventEmitter instantiation (e.g., new EventEmitter()).' },
      { id: 'event-listener', label: 'Event listener registered', passed: false, message: 'Could not find .on() listener.' },
      { id: 'event-emission', label: 'Event emitted', passed: false, message: 'Could not find .emit() usage.' },
      { id: 'socket-init', label: 'Socket.IO initialized', passed: false, message: 'Could not find Socket.IO usage (e.g. io.on("connection")).' },
      { id: 'socket-room', label: 'Socket room join', passed: false, message: 'Could not find socket.join() logic.' },
      { id: 'socket-broadcast', label: 'Event broadcast to room', passed: false, message: 'Could not find io.to(...).emit(...) logic.' }
    ];

    const terminalOutput: string[] = [
      '[Node Lab Simulator]',
      'Initializing Live Security Monitor...'
    ];

    try {
      // Very basic static analysis regexes
      if (/new\s+EventEmitter\s*\(/.test(code)) checks[0].passed = true;
      if (/\.on\s*\(\s*['"]/.test(code)) checks[1].passed = true;
      if (/\.emit\s*\(\s*['"]/.test(code)) checks[2].passed = true;
      if (/io\.on\s*\(\s*['"]connection['"]/.test(code)) checks[3].passed = true;
      if (/socket\.join\s*\(/.test(code)) checks[4].passed = true;
      if (/io\.to\s*\([^)]+\)\.emit\s*\(/.test(code)) checks[5].passed = true;

      // Calculate score
      const score = checks.filter(c => c.passed).length;
      const success = score === checks.length;

      // Simulated terminal feedback
      terminalOutput.push(`EventEmitter ............ ${checks[0].passed ? 'OK' : 'FAIL'}`);
      terminalOutput.push(`Listeners ............... ${checks[1].passed ? 'OK' : 'FAIL'}`);
      terminalOutput.push(`Event emission .......... ${checks[2].passed ? 'OK' : 'FAIL'}`);
      terminalOutput.push(`Socket.IO ............... ${checks[3].passed ? 'CONNECTED' : 'OFFLINE'}`);
      terminalOutput.push(`Team room ............... ${checks[4].passed ? 'JOINED' : 'FAILED'}`);
      terminalOutput.push(`Broadcast pipeline ...... ${checks[5].passed ? 'OK' : 'FAIL'}`);

      if (success) {
        terminalOutput.push('');
        terminalOutput.push('EVENT STREAM');
        terminalOutput.push('PLAYER_ENTERED .......... RECEIVED');
        terminalOutput.push('DOOR_OPENED ............. RECEIVED');
        terminalOutput.push('VAULT_ACCESSED .......... RECEIVED');
        terminalOutput.push('');
        terminalOutput.push('LIVE SECURITY MONITOR ONLINE');
      }

      return {
        success,
        score,
        checks,
        terminalOutput,
        feedback: success 
          ? ['Excellent! Your real-time event pipeline is functional.']
          : ['Review your event-driven and Socket.IO concepts.'],
        errors: []
      };

    } catch (error: any) {
      return {
        success: false,
        score: 0,
        checks,
        terminalOutput: ['[ERROR] Evaluation failed due to internal error.'],
        feedback: ['An error occurred while analyzing your code.'],
        errors: [error.message || 'Unknown error']
      };
    }
  }
}
