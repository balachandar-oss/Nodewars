import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TestResults from './TestResults';
import type { FailureGuidance } from '@node-wars/shared';

const mockFailureGuidance: FailureGuidance = {
  whyItMatters: 'Security matters.',
  thinkAbout: 'Did you think about security?'
};

const checks = [
  { id: '1', label: 'Check 1', passed: true, message: 'Good' },
  { id: '2', label: 'Check 2', passed: false, message: 'Bad' }
];

describe('TestResults', () => {
  it('K. Failure feedback groups actual evaluator checks.', () => {
    render(<TestResults checks={checks} score={1} total={2} success={false} failureGuidance={mockFailureGuidance} />);
    
    expect(screen.getByText('PASSED')).toBeInTheDocument();
    expect(screen.getByText('Check 1')).toBeInTheDocument();
    
    expect(screen.getByText('FAILED')).toBeInTheDocument();
    expect(screen.getByText('Check 2')).toBeInTheDocument();
    
    expect(screen.getByTestId('failure-guidance')).toBeInTheDocument();
    expect(screen.getByText('Security matters.')).toBeInTheDocument();
  });

  it('L. Missing/empty evaluator check data does not crash the UI.', () => {
    const { container } = render(<TestResults checks={[]} score={0} total={0} />);
    
    expect(screen.getByText('Run the mission to evaluate your implementation.')).toBeInTheDocument();
    expect(container).toBeInTheDocument();
  });

  it('Does not show failure guidance on success', () => {
    render(<TestResults checks={checks} score={1} total={2} success={true} failureGuidance={mockFailureGuidance} />);
    
    expect(screen.queryByTestId('failure-guidance')).not.toBeInTheDocument();
  });
});
