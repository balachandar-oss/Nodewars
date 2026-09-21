import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HintPanel from './HintPanel';
import type { TeachingHint } from '@node-wars/shared';

describe('HintPanel', () => {
  it('renders nothing if no hints are provided', () => {
    const { container } = render(<HintPanel />);
    expect(container.firstChild).toBeNull();
  });

  it('renders legacy hints with default labels', () => {
    render(<HintPanel hints={['First hint string', 'Second hint string']} hasFailed={true} />);
    
    // Hint 1 should be unlocked by default? No, wait, in my implementation Hint 1 is LOCKED initially.
    // Let me check my implementation. unlockedHints starts at 0. So Hint 1 is LOCKED.
    expect(screen.getByTestId('hint-unlock-0')).toBeInTheDocument();
    
    // Hint 2 is completely locked (not next to unlock)
    expect(screen.getByTestId('hint-locked-1')).toBeInTheDocument();
  });

  it('progressively unlocks hints sequentially', () => {
    const progressiveHints: TeachingHint[] = [
      { label: 'CONCEPT', text: 'Concept text' },
      { label: 'DIRECTION', text: 'Direction text', codeSnippet: 'console.log();' },
      { label: 'PARTIAL SOLUTION', text: 'Partial text' }
    ];

    render(<HintPanel progressiveHints={progressiveHints} hasFailed={true} />);

    // Initially 0 unlocked
    expect(screen.queryByTestId('hint-revealed-0')).not.toBeInTheDocument();
    expect(screen.getByTestId('hint-unlock-0')).toBeInTheDocument(); // Next to unlock
    expect(screen.getByTestId('hint-locked-1')).toBeInTheDocument(); // Completely locked
    expect(screen.getByTestId('hint-locked-2')).toBeInTheDocument();

    // Click unlock on hint 1
    fireEvent.click(screen.getByTestId('btn-show-hint')); // The only visible button

    // Now 1 is unlocked
    expect(screen.getByTestId('hint-revealed-0')).toBeInTheDocument();
    expect(screen.getByText('Concept text')).toBeInTheDocument();

    // Now 2 is next to unlock
    expect(screen.getByTestId('hint-unlock-1')).toBeInTheDocument();
    expect(screen.getByTestId('hint-locked-2')).toBeInTheDocument(); // 3 is still locked

    // Click unlock on hint 2
    fireEvent.click(screen.getByTestId('btn-show-hint')); // Targets the new next button

    // Now 2 is unlocked
    expect(screen.getByTestId('hint-revealed-1')).toBeInTheDocument();
    expect(screen.getByText('Direction text')).toBeInTheDocument();
    expect(screen.getByText('console.log();')).toBeInTheDocument();

    // Now 3 is next to unlock
    expect(screen.getByTestId('hint-unlock-2')).toBeInTheDocument();
  });
});
