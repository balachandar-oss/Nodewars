import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import InstructorMode from './InstructorMode';

// Mock routing hooks
vi.mock('react-router-dom', () => ({
  useOutletContext: vi.fn(),
  useNavigate: () => vi.fn(),
  Navigate: () => <div data-testid="navigate-redirect" />
}));

import { useOutletContext } from 'react-router-dom';

vi.mock('@node-wars/shared', () => {
  return {
    teachingRegistry: {
      'mission-01': {
        missionId: 'mission-01',
        title: 'FIRST SERVER',
        instructorGuide: {
          timeLabel: '10 minutes',
          durationMinutes: 10,
          purpose: 'Understand Node.js runtime and basic HTTP server setup.',
          teach: ['Node.js is a runtime', 'running JavaScript outside the browser', 'HTTP server', 'port', 'request/response'],
          demonstrate: 'node server.js',
          ask: 'What happens when the browser requests localhost:3000?',
          watchFor: 'Students confusing Node.js with a programming language.',
          letStudentsCode: 'Allow students to implement the basic HTTP server.',
          debrief: 'Connect the code they wrote to the client/server request flow.',
          transition: 'The server is alive. Now it needs routes.'
        }
      },
      'mission-02': {
        missionId: 'mission-02',
        title: 'SMART DOOR',
        instructorGuide: { durationMinutes: 15, teach: [] }
      },
      'mission-03': {
        missionId: 'mission-03',
        title: 'SECURITY GATE',
        instructorGuide: { durationMinutes: 15, teach: [] }
      },
      'mission-04': {
        missionId: 'mission-04',
        title: 'RESOURCE VAULT',
        instructorGuide: { durationMinutes: 15, teach: [] }
      },
      'mission-05': {
        missionId: 'mission-05',
        title: 'ASYNC OPERATIONS',
        instructorGuide: { durationMinutes: 12, teach: [] }
      },
      'mission-06': {
        missionId: 'mission-06',
        title: 'LIVE SECURITY MONITOR',
        instructorGuide: { durationMinutes: 15, teach: [] }
      },
      'mission-07': {
        missionId: 'mission-07',
        title: 'BREAK IT',
        instructorGuide: { durationMinutes: 13, teach: [] }
      }
    }
  };
});

describe('InstructorMode', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('A. Instructor Mode renders for ADMIN.', () => {
    (useOutletContext as any).mockReturnValue({ user: { role: 'ADMIN' } });
    render(<InstructorMode />);
    expect(screen.getByText('NODE LAB // INSTRUCTOR MODE')).toBeInTheDocument();
  });

  it('B. PLAYER cannot use Instructor Mode.', () => {
    (useOutletContext as any).mockReturnValue({ user: { role: 'PLAYER' } });
    render(<InstructorMode />);
    expect(screen.getByText('Instructor access required.')).toBeInTheDocument();
    expect(screen.queryByText('NODE LAB // INSTRUCTOR MODE')).not.toBeInTheDocument();
  });

  it('D. All 7 InstructorGuides load (can navigate to them).', () => {
    (useOutletContext as any).mockReturnValue({ user: { role: 'ADMIN' } });
    render(<InstructorMode />);
    
    // Check initial mission
    expect(screen.getByText('FIRST SERVER')).toBeInTheDocument();
    
    // Click Next
    fireEvent.click(screen.getByText('[ NEXT MISSION ]'));
    expect(screen.getByText('SMART DOOR')).toBeInTheDocument();

    // Click Next until Mission 07
    fireEvent.click(screen.getByText('[ NEXT MISSION ]')); // 03
    fireEvent.click(screen.getByText('[ NEXT MISSION ]')); // 04
    fireEvent.click(screen.getByText('[ NEXT MISSION ]')); // 05
    fireEvent.click(screen.getByText('[ NEXT MISSION ]')); // 06
    fireEvent.click(screen.getByText('[ NEXT MISSION ]')); // 07
    expect(screen.getByText('BREAK IT')).toBeInTheDocument();
  });

  it('E - M. Instructor Guide content renders.', () => {
    (useOutletContext as any).mockReturnValue({ user: { role: 'ADMIN' } });
    render(<InstructorMode />);
    
    // Mission 01 Content checks based on our data
    expect(screen.getByText('TIME')).toBeInTheDocument();
    expect(screen.getByText('10 minutes')).toBeInTheDocument();
    
    expect(screen.getByText('PURPOSE')).toBeInTheDocument();
    expect(screen.getByText('Understand Node.js runtime and basic HTTP server setup.')).toBeInTheDocument();
    
    expect(screen.getByText('TEACH')).toBeInTheDocument();
    expect(screen.getByText('Node.js is a runtime')).toBeInTheDocument();
    
    expect(screen.getByText('DEMONSTRATE')).toBeInTheDocument();
    expect(screen.getByText('node server.js')).toBeInTheDocument();
    
    expect(screen.getByText('ASK')).toBeInTheDocument();
    expect(screen.getByText(/"What happens when the browser requests localhost:3000\?"/)).toBeInTheDocument();
    
    expect(screen.getByText('WATCH FOR')).toBeInTheDocument();
    expect(screen.getByText('Students confusing Node.js with a programming language.')).toBeInTheDocument();
    
    expect(screen.getByText('LET STUDENTS CODE')).toBeInTheDocument();
    expect(screen.getByText('Allow students to implement the basic HTTP server.')).toBeInTheDocument();
    
    expect(screen.getByText('DEBRIEF')).toBeInTheDocument();
    expect(screen.getByText('Connect the code they wrote to the client/server request flow.')).toBeInTheDocument();
    
    expect(screen.getByText('TRANSITION')).toBeInTheDocument();
    expect(screen.getByText(/"The server is alive\. Now it needs routes\."/)).toBeInTheDocument();
  });

  it('N. Previous/Next mission navigation works.', () => {
    (useOutletContext as any).mockReturnValue({ user: { role: 'ADMIN' } });
    render(<InstructorMode />);
    
    const nextBtn = screen.getByText('[ NEXT MISSION ]');
    const prevBtn = screen.getByText('[ PREVIOUS ]');
    
    expect(prevBtn).toBeDisabled(); // Disabled on first mission
    fireEvent.click(nextBtn);
    expect(screen.getByText('SMART DOOR')).toBeInTheDocument();
    expect(prevBtn).not.toBeDisabled();
    
    fireEvent.click(prevBtn);
    expect(screen.getByText('FIRST SERVER')).toBeInTheDocument();
    expect(prevBtn).toBeDisabled();
  });

  it('O-S. Timer start, pause, resume, reset, and cleanup works.', () => {
    (useOutletContext as any).mockReturnValue({ user: { role: 'ADMIN' } });
    render(<InstructorMode />);
    
    // Initial state: 00:00
    expect(screen.getByText('00:00')).toBeInTheDocument();
    
    // Start (Mission 1 is 10 minutes = 600 seconds = 10:00)
    fireEvent.click(screen.getByTestId('timer-start'));
    expect(screen.getByText('10:00')).toBeInTheDocument();
    
    // Advance 5 seconds
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText('09:55')).toBeInTheDocument();
    
    // Pause
    fireEvent.click(screen.getByTestId('timer-pause'));
    // Advance 5 seconds (should stay 09:55)
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText('09:55')).toBeInTheDocument();
    
    // Resume (Start)
    fireEvent.click(screen.getByTestId('timer-start'));
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText('09:50')).toBeInTheDocument();
    
    // Reset
    fireEvent.click(screen.getByTestId('timer-reset'));
    expect(screen.getByText('10:00')).toBeInTheDocument(); // Resets back to 10:00
  });
});
