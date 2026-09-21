import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NarrativeBriefing from './NarrativeBriefing';
import type { MissionTeachingContent } from '@node-wars/shared';

describe('NarrativeBriefing Component', () => {
  const mockContent: MissionTeachingContent = {
    missionId: 'mission-01',
    title: 'First Server',
    briefing: 'mock',
    learningObjectives: [
      { id: '1', description: 'Obj 1' },
      { id: '2', description: 'Obj 2' }
    ],
    concepts: [],
    narrative: {
      act: 'ACT I — AWAKEN',
      systemName: 'NODE CORE',
      threatStatus: 'The core is offline.',
      objective: 'Bring server online.',
      systemConnection: 'Core foundation.',
      successMessage: 'NODE CORE ONLINE',
      systemStatus: 'Listening',
      nextThreat: 'No routes.',
      nextObjective: 'SMART DOOR'
    }
  };

  it('renders correctly with narrative content', () => {
    const handleEnter = vi.fn();
    render(
      <NarrativeBriefing
        missionNumber={1}
        content={mockContent}
        onEnterMission={handleEnter}
      />
    );

    // Should display act
    expect(screen.getByText('ACT I — AWAKEN')).toBeDefined();
    
    // Should display system name
    expect(screen.getByText('NODE CORE')).toBeDefined();
    
    // Should display threat status
    expect(screen.getByText('The core is offline.')).toBeDefined();

    // Should display learning objectives
    expect(screen.getByText('Obj 1')).toBeDefined();
    
    // Should display button
    const button = screen.getByText('ENTER MISSION');
    expect(button).toBeDefined();
    
    fireEvent.click(button);
    expect(handleEnter).toHaveBeenCalledTimes(1);
  });

  it('renders nothing if narrative content is missing', () => {
    const contentWithoutNarrative = { ...mockContent, narrative: undefined };
    const { container } = render(
      <NarrativeBriefing
        missionNumber={1}
        content={contentWithoutNarrative}
        onEnterMission={() => {}}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });
});
