import { MissionEvaluator, EvaluationResult } from './evaluators/MissionEvaluator';
import { Mission01Evaluator } from './evaluators/Mission01Evaluator';
import { Mission02Evaluator } from './evaluators/Mission02Evaluator';
import { Mission03Evaluator } from './evaluators/Mission03Evaluator';
import { Mission04Evaluator } from './evaluators/Mission04Evaluator';
import { Mission05Evaluator } from './evaluators/Mission05Evaluator';
import { Mission06Evaluator } from './evaluators/Mission06Evaluator';
import { Mission07Evaluator } from './evaluators/Mission07Evaluator';
import { Mission08Evaluator } from './evaluators/Mission08Evaluator';

export class ExecutionService {
  private evaluators: Map<string, MissionEvaluator>;

  constructor() {
    this.evaluators = new Map();
    // Register evaluators
    this.evaluators.set('mission-01', new Mission01Evaluator());
    this.evaluators.set('mission-02', new Mission02Evaluator());
    this.evaluators.set('mission-03', new Mission03Evaluator());
    this.evaluators.set('mission-04', new Mission04Evaluator());
    this.evaluators.set('mission-05', new Mission05Evaluator());
    this.evaluators.set('mission-06', new Mission06Evaluator());
    this.evaluators.set('mission-07', new Mission07Evaluator());
    this.evaluators.set('mission-08', new Mission08Evaluator());
    // Future missions will be registered here
  }

  async run(missionId: string, code: string): Promise<EvaluationResult> {
    const evaluator = this.evaluators.get(missionId);
    
    if (!evaluator) {
      return {
        success: false,
        score: 0,
        checks: [],
        terminalOutput: ['[ERROR] Execution engine offline for this mission.'],
        feedback: ['This mission does not have an active evaluator yet.'],
        errors: ['EVALUATOR_NOT_FOUND']
      };
    }

    try {
      return await evaluator.evaluate(code);
    } catch (error: any) {
      console.error(`Evaluation error for ${missionId}:`, error);
      return {
        success: false,
        score: 0,
        checks: [],
        terminalOutput: ['[FATAL ERROR] Engine evaluation failure.'],
        feedback: ['An internal error occurred while evaluating your code.'],
        errors: [error.message || 'UNKNOWN_ERROR']
      };
    }
  }
}

export const executionService = new ExecutionService();
