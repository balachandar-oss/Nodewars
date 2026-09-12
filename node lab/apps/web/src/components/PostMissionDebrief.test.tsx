import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PostMissionDebrief from './PostMissionDebrief';
import type { MissionTeachingContent } from '@node-wars/shared';

const mockContent: MissionTeachingContent = {
  missionId: 'mission-01',
  title: 'Test',
  briefing: 'Test',
  learningObjectives: [],
  concepts: [],
  successGuidance: {
    whatYouDid: 'You did a thing.',
    whyItWorks: 'Because science.'
  },
  reflection: {
    whatYouLearned: ['Fact 1', 'Fact 2'],
    whyItMatters: 'Important stuff.',
    prompt: 'Reflect on this.'
  },
  conceptCheck: [
    {
      question: 'What is 2+2?',
      options: ['3', '4', '5'],
      correctAnswerIndex: 1,
      explanation: 'Math says 4.'
    }
  ]
};

describe('PostMissionDebrief', () => {
  it('A. Successful evaluator result shows Success Guidance.', () => {
    render(<PostMissionDebrief content={mockContent} onReviewLesson={vi.fn()} onContinue={vi.fn()} isFinalMission={false} />);
    expect(screen.getByText('WHAT YOU DID')).toBeInTheDocument();
    expect(screen.getByText('You did a thing.')).toBeInTheDocument();
  });

  it('B. Reflection renders.', () => {
    render(<PostMissionDebrief content={mockContent} onReviewLesson={vi.fn()} onContinue={vi.fn()} isFinalMission={false} />);
    expect(screen.getByText('WHY THIS MATTERS')).toBeInTheDocument();
    expect(screen.getByText('Important stuff.')).toBeInTheDocument();
  });

  it('C. What You Learned renders.', () => {
    render(<PostMissionDebrief content={mockContent} onReviewLesson={vi.fn()} onContinue={vi.fn()} isFinalMission={false} />);
    expect(screen.getByText('Fact 1')).toBeInTheDocument();
    expect(screen.getByText('Fact 2')).toBeInTheDocument();
  });

  it('D. Concept check renders.', () => {
    render(<PostMissionDebrief content={mockContent} onReviewLesson={vi.fn()} onContinue={vi.fn()} isFinalMission={false} />);
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('G. Correct answers are not visibly exposed before selection.', () => {
    render(<PostMissionDebrief content={mockContent} onReviewLesson={vi.fn()} onContinue={vi.fn()} isFinalMission={false} />);
    expect(screen.queryByText('CORRECT')).not.toBeInTheDocument();
    expect(screen.queryByText('NOT QUITE')).not.toBeInTheDocument();
    expect(screen.queryByText('Math says 4.')).not.toBeInTheDocument();
  });

  it('E. Correct answer gives correct feedback.', () => {
    render(<PostMissionDebrief content={mockContent} onReviewLesson={vi.fn()} onContinue={vi.fn()} isFinalMission={false} />);
    
    // Click option B (index 1) which is correct
    fireEvent.click(screen.getByText('4'));
    
    expect(screen.getByText('CORRECT')).toBeInTheDocument();
    expect(screen.getByText('Math says 4.')).toBeInTheDocument();
  });

  it('F. Incorrect answer gives educational feedback.', () => {
    render(<PostMissionDebrief content={mockContent} onReviewLesson={vi.fn()} onContinue={vi.fn()} isFinalMission={false} />);
    
    // Click option A (index 0) which is incorrect
    fireEvent.click(screen.getByText('3'));
    
    expect(screen.getByText('NOT QUITE')).toBeInTheDocument();
    expect(screen.getByText('Math says 4.')).toBeInTheDocument();
  });

  it('I. Next Mission navigation works when another mission exists.', () => {
    const onContinue = vi.fn();
    render(<PostMissionDebrief content={mockContent} onReviewLesson={vi.fn()} onContinue={onContinue} isFinalMission={false} />);
    
    fireEvent.click(screen.getByText('NEXT MISSION'));
    expect(onContinue).toHaveBeenCalled();
  });

  it('J. Final Mission uses the appropriate final action.', () => {
    const onContinue = vi.fn();
    render(<PostMissionDebrief content={mockContent} onReviewLesson={vi.fn()} onContinue={onContinue} isFinalMission={true} />);
    
    fireEvent.click(screen.getByText('CONTINUE'));
    expect(onContinue).toHaveBeenCalled();
  });
  
  it('N. Review Lesson continues to work.', () => {
    const onReview = vi.fn();
    render(<PostMissionDebrief content={mockContent} onReviewLesson={onReview} onContinue={vi.fn()} isFinalMission={false} />);
    
    fireEvent.click(screen.getByText('REVIEW LESSON'));
    expect(onReview).toHaveBeenCalled();
  });
});
