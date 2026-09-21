export interface CheckResult {
  id: string;
  label: string;
  passed: boolean;
  message: string;
}

export interface EvaluationResult {
  success: boolean;
  score: number;
  checks: CheckResult[];
  terminalOutput: string[];
  feedback: string[];
  errors: string[];
}

export interface MissionEvaluator {
  evaluate(code: string): Promise<EvaluationResult>;
}
