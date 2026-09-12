import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Lab from './Lab';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useOutletContext: () => ({ user: { role: 'STUDENT' } })
  };
});

// Mock dependencies
vi.mock('../hooks/useGameSocket', () => ({
  useGameSocket: () => ({ isConnected: true, events: [] })
}));

vi.mock('@monaco-editor/react', () => ({
  default: () => <div data-testid="monaco-editor" />
}));

// Mock the teachingRegistry from shared to ensure we have controlled test data
vi.mock('@node-wars/shared', () => ({
  teachingRegistry: {
    'mission-01': {
      missionId: 'mission-01',
      title: 'TEST MISSION',
      briefing: 'Test Briefing',
      learningObjectives: [],
      concepts: [
        { id: 'c1', title: 'Test Concept', explanation: 'Test Explanation' }
      ],
      guidedTask: {
        task: 'Build a test task',
        requirements: ['Test Requirement 1'],
        successCondition: 'Test passes successfully'
      }
    },
    'mission-02': {
      // Missing guidedTask to test fallback
      missionId: 'mission-02',
      title: 'FALLBACK MISSION',
      briefing: 'Fallback',
      learningObjectives: [],
      concepts: []
    }
    // 'mission-invalid' intentionally left missing
  }
}));

// Mock the components rendered by Lab to reduce noise
vi.mock('../components/Terminal', () => ({ default: () => <div data-testid="terminal" /> }));
vi.mock('../components/CastlePreview', () => ({ default: () => <div data-testid="castle-preview" /> }));
vi.mock('../components/HintPanel', () => ({ default: () => <div data-testid="hint-panel" /> }));
vi.mock('../components/TestResults', () => ({ default: () => <div data-testid="test-results" /> }));
vi.mock('../components/LiveSecurityMonitor', () => ({ default: () => <div data-testid="live-monitor" /> }));

describe('Lab page integration', () => {
  
  beforeEach(() => {
    sessionStorage.clear();
    window.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/missions/')) {
        if (url.endsWith('/progress')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ status: 'IN_PROGRESS' })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            id: 'm1', 
            order: 1, 
            title: 'Test Mission', 
            starterCode: '// start',
            objectives: '[]',
            hints: '[]'
          })
        });
      }
      return Promise.reject(new Error('not found'));
    });
    
    const mockStorage: Record<string, string> = { token: 'fake-token' };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      return mockStorage[key] || null;
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      mockStorage[key] = value.toString();
    });
    vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
      for (const key in mockStorage) {
        if (key !== 'token') delete mockStorage[key];
      }
    });
  });

  const renderLab = (missionId: string) => {
    return render(
      <MemoryRouter initialEntries={[`/lab/${missionId}`]}>
        <Routes>
          {/* We need a mock Outlet context for the 'user' */}
          <Route path="/lab/:missionId" element={<Lab />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders teaching layer if session storage does not have it marked as viewed', async () => {
    renderLab('mission-01');
    
    // Wait for fetch and render
    await waitFor(() => {
      expect(screen.getByTestId('teaching-overlay')).toBeInTheDocument();
    });
  });

  it('H. sessionStorage prevents automatic reopening during the same session', async () => {
    // Manually set session storage to simulate already viewed
    sessionStorage.setItem('node-lab-lesson-viewed-mission-01', 'true');
    renderLab('mission-01');
    
    await waitFor(() => {
      // Editor should be there, but teaching overlay should NOT be there
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });
    
    expect(screen.queryByTestId('teaching-overlay')).not.toBeInTheDocument();
  });

  it('G. REVIEW LESSON reopens the teaching layer', async () => {
    sessionStorage.setItem('node-lab-lesson-viewed-mission-01', 'true');
    renderLab('mission-01');
    
    await waitFor(() => {
      expect(screen.getByText(/REVIEW LESSON/i)).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText(/REVIEW LESSON/i));
    
    expect(screen.getByTestId('teaching-overlay')).toBeInTheDocument();
  });

  it('I. missing/invalid teaching content fails gracefully', async () => {
    // "mission-invalid" is not in the mocked teachingRegistry
    renderLab('mission-invalid');
    
    await waitFor(() => {
      // It should just render the lab directly without crashing
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });
    
    expect(screen.queryByTestId('teaching-overlay')).not.toBeInTheDocument();
  });

  it('F. BEGIN CHALLENGE dismisses the Teaching Layer and J. reaches existing editor', async () => {
    renderLab('mission-01');
    
    await waitFor(() => {
      expect(screen.getByTestId('teaching-overlay')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText(/BEGIN LESSON/i));
    fireEvent.click(screen.getByTestId('btn-begin-challenge'));
    
    expect(screen.queryByTestId('teaching-overlay')).not.toBeInTheDocument();
    expect(sessionStorage.getItem('node-lab-lesson-viewed-mission-01')).toBe('true');
    
    // Workbench is reachable
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    expect(screen.getByText(/EXECUTE MISSION/i)).toBeInTheDocument();
  });

  it('renders Guided Task from registry', async () => {
    sessionStorage.setItem('node-lab-lesson-viewed-mission-01', 'true');
    renderLab('mission-01');

    await waitFor(() => {
      expect(screen.getByTestId('guided-task')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Build a test task')).toBeInTheDocument();
    expect(screen.getByText('Test Requirement 1')).toBeInTheDocument();
    expect(screen.getByText('Test passes successfully')).toBeInTheDocument();
  });

  it('falls back to DIRECTIVE and TACTICAL TASKS if Guided Task is missing', async () => {
    sessionStorage.setItem('node-lab-lesson-viewed-mission-02', 'true');
    renderLab('mission-02');

    await waitFor(() => {
      expect(screen.getByTestId('fallback-task')).toBeInTheDocument();
    });
    
    expect(screen.queryByTestId('guided-task')).not.toBeInTheDocument();
  });
});
