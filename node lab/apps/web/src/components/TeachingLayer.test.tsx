import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TeachingLayer from './TeachingLayer';

const mockContent = {
  missionId: 'mission-01',
  title: 'FIRST SERVER',
  briefing: 'The castle has no communication system.',
  learningObjectives: [
    { id: 'obj1', description: 'Understand Node.js' },
  ],
  concepts: [
    { 
      id: 'c1', 
      title: 'Node.js Runtime', 
      explanation: 'Run JS on server.',
      exampleCode: 'console.log("Hello Node");',
      walkthrough: [
        { codeFragment: 'console.log', explanation: 'Prints output to the terminal.' }
      ],
      visualFlow: ['INPUT', 'PROCESS', 'OUTPUT'],
      keyTakeaway: 'Node is cool.'
    },
    { 
      id: 'c2', 
      title: 'HTTP Module', 
      explanation: 'Create server.' 
    }
  ]
};

describe('TeachingLayer component', () => {
  let onBeginChallengeMock: any;

  beforeEach(() => {
    onBeginChallengeMock = vi.fn();
  });

  it('renders the mission briefing initially', () => {
    render(<TeachingLayer missionNumber={1} content={mockContent as any} onBeginChallenge={onBeginChallengeMock} />);
    expect(screen.getByTestId('teaching-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('mission-briefing')).toBeInTheDocument();
    expect(screen.getByText('FIRST SERVER')).toBeInTheDocument();
  });

  it('Learning objectives render', () => {
    render(<TeachingLayer missionNumber={1} content={mockContent as any} onBeginChallenge={onBeginChallengeMock} />);
    expect(screen.getByText('Understand Node.js')).toBeInTheDocument();
  });

  it('A. Tiny example renders', () => {
    render(<TeachingLayer missionNumber={1} content={mockContent as any} onBeginChallenge={onBeginChallengeMock} />);
    fireEvent.click(screen.getByText(/BEGIN LESSON/i));
    
    expect(screen.getByTestId('tiny-example')).toBeInTheDocument();
    expect(screen.getByText(/console.log\("Hello Node"\);/)).toBeInTheDocument();
  });

  it('B. Code walkthrough renders & C. Steps can be navigated/read', () => {
    render(<TeachingLayer missionNumber={1} content={mockContent as any} onBeginChallenge={onBeginChallengeMock} />);
    fireEvent.click(screen.getByText(/BEGIN LESSON/i));
    
    expect(screen.getByTestId('code-walkthrough')).toBeInTheDocument();
    expect(screen.getByText('console.log')).toBeInTheDocument();
    expect(screen.getByText('Prints output to the terminal.')).toBeInTheDocument();
  });

  it('D. Visual explanation renders where defined', () => {
    render(<TeachingLayer missionNumber={1} content={mockContent as any} onBeginChallenge={onBeginChallengeMock} />);
    fireEvent.click(screen.getByText(/BEGIN LESSON/i));
    
    expect(screen.getByTestId('visual-flow')).toBeInTheDocument();
    expect(screen.getByText('INPUT')).toBeInTheDocument();
    expect(screen.getByText('PROCESS')).toBeInTheDocument();
    expect(screen.getByText('OUTPUT')).toBeInTheDocument();
  });

  it('E. Concept indicator is correct', () => {
    render(<TeachingLayer missionNumber={1} content={mockContent as any} onBeginChallenge={onBeginChallengeMock} />);
    
    // Briefing state
    expect(screen.getByText(/MISSION BRIEFING/i)).toBeInTheDocument();
    expect(screen.getByTestId('concept-indicator')).toBeInTheDocument();

    fireEvent.click(screen.getByText(/BEGIN LESSON/i));
    // Concept 1 state
    expect(screen.getByText(/CONCEPT 1 OF 2/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/NEXT/i));
    // Concept 2 state
    expect(screen.getByText(/CONCEPT 2 OF 2/i)).toBeInTheDocument();
  });

  it('F. BEGIN CHALLENGE triggers onBeginChallenge callback (closes layer)', () => {
    render(<TeachingLayer missionNumber={1} content={mockContent as any} onBeginChallenge={onBeginChallengeMock} />);
    fireEvent.click(screen.getByText(/BEGIN LESSON/i));
    fireEvent.click(screen.getByText(/NEXT/i)); // Go to Concept 2 (last)
    
    const btn = screen.getByTestId('btn-begin-challenge');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onBeginChallengeMock).toHaveBeenCalledTimes(1);
  });
});
