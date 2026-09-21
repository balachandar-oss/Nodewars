import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TestResults from './TestResults';
import type { FailureGuidance, SuccessGuidance } from '@node-wars/shared';

const mockFailureGuidance: FailureGuidance = {
  whyItMatters: 'Security matters.',
  thinkAbout: 'Did you think about security?'
};

const mockSuccessGuidance: SuccessGuidance = {
  whatYouDid: 'You built a server.',
  whyItWorks: 'Node listens on ports.'
};

const checks = [
  { id: '1', label: 'Check 1', passed: true, message: 'Good' },
  { id: '2', label: 'Check 2', passed: false, message: 'Bad' }
];

describe('TestResults UX Sequences', () => {
  it('No evaluation yet shows READY FOR TEST', () => {
    render(<TestResults checks={[]} score={0} total={0} hasRun={false} isEvaluating={false} />);
    expect(screen.getByText(/Ready For Test/i)).toBeInTheDocument();
    expect(screen.queryByText(/FAILED/i)).not.toBeInTheDocument();
  });

  it('Evaluation running shows RUNNING CHALLENGE', () => {
    render(<TestResults checks={[]} score={0} total={0} hasRun={false} isEvaluating={true} />);
    expect(screen.getByText(/RUNNING CHALLENGE/i)).toBeInTheDocument();
  });

  it('Failed evaluation shows FAILED and guidance', () => {
    render(
      <TestResults 
        checks={checks} 
        score={1} 
        total={2} 
        success={false} 
        hasRun={true} 
        isEvaluating={false} 
        failureGuidance={mockFailureGuidance} 
      />
    );
    expect(screen.getByText('FAILED')).toBeInTheDocument();
    expect(screen.getByText('FAILED CHECKS')).toBeInTheDocument();
    expect(screen.getByText('EVALUATOR FEEDBACK')).toBeInTheDocument();
    expect(screen.getByTestId('failure-guidance')).toBeInTheDocument();
    expect(screen.getByText('Security matters.')).toBeInTheDocument();
  });

  it('Successful evaluation shows MISSION OBJECTIVE COMPLETE and success guidance', () => {
    const successChecks = [{ id: '1', label: 'Check 1', passed: true, message: 'Good' }];
    render(
      <TestResults 
        checks={successChecks} 
        score={1} 
        total={1} 
        success={true} 
        hasRun={true} 
        isEvaluating={false} 
        successGuidance={mockSuccessGuidance} 
      />
    );
    expect(screen.getByText('MISSION OBJECTIVE COMPLETE')).toBeInTheDocument();
    expect(screen.getByText('WHAT YOU BUILT')).toBeInTheDocument();
    expect(screen.getByText('You built a server.')).toBeInTheDocument();
  });

  it('Execution error shows CODE EXECUTION ERROR', () => {
    render(
      <TestResults 
        checks={[]} 
        score={0} 
        total={0} 
        success={false} 
        hasRun={true} 
        isEvaluating={false} 
        executionErrors={['SyntaxError: missing ) after argument list']} 
      />
    );
    expect(screen.getByText('CODE EXECUTION ERROR')).toBeInTheDocument();
    expect(screen.getByText(/SyntaxError/i)).toBeInTheDocument();
  });
  
  it('Raw output can be expanded', () => {
    render(
      <TestResults 
        checks={checks} 
        score={1} 
        total={2} 
        success={false} 
        hasRun={true} 
        isEvaluating={false} 
      />
    );
    const toggle = screen.getByText(/VIEW RAW TEST OUTPUT/i);
    expect(toggle).toBeInTheDocument();
    
    // Initially hidden
    expect(screen.queryByText(/RAW CHECKS DUMP/i)).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(toggle);
    expect(screen.getByText(/RAW CHECKS DUMP/i)).toBeInTheDocument();
  });
});
