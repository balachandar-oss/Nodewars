import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StructureInteraction from './StructureInteraction';
import { getStructureInfo } from '../utils/structureData';

describe('StructureInteraction Component', () => {
  const testStructures = [
    getStructureInfo('TERMINAL', { x: 100, y: 100 }),
    getStructureInfo('SMART_DOOR', { x: 200, y: 100 }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <StructureInteraction
        structures={testStructures}
        playerPosition={{ x: 0, y: 0 }}
      />
    );
  });

  it('shows interaction prompt when player is near structure', async () => {
    const { rerender } = render(
      <StructureInteraction
        structures={testStructures}
        playerPosition={{ x: 0, y: 0 }}
      />
    );

    // Initially no prompt
    expect(screen.queryByText(/PRESS \[E\] TO INTERACT/i)).not.toBeInTheDocument();

    // Move player near structure (within 50px radius)
    rerender(
      <StructureInteraction
        structures={testStructures}
        playerPosition={{ x: 110, y: 110 }}
      />
    );

    // Should show prompt now
    await waitFor(() => {
      expect(screen.getByText(/PRESS \[E\] TO INTERACT/i)).toBeInTheDocument();
    });
  });

  it('displays structure name in prompt', async () => {
    const { rerender } = render(
      <StructureInteraction
        structures={testStructures}
        playerPosition={{ x: 0, y: 0 }}
      />
    );

    rerender(
      <StructureInteraction
        structures={testStructures}
        playerPosition={{ x: 110, y: 110 }}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('NODE CORE')).toBeInTheDocument();
    });
  });

  it('opens modal when E key is pressed', async () => {
    render(
      <StructureInteraction
        structures={testStructures}
        playerPosition={{ x: 110, y: 110 }}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/PRESS \[E\] TO INTERACT/i)).toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: 'e' });

    await waitFor(() => {
      expect(screen.getByText('TERMINAL (Mission 01)')).toBeInTheDocument();
    });
  });

  it('closes modal on ESC key', async () => {
    render(
      <StructureInteraction
        structures={testStructures}
        playerPosition={{ x: 110, y: 110 }}
      />
    );

    // Open modal
    fireEvent.keyDown(window, { key: 'e' });

    await waitFor(() => {
      expect(screen.getByText('TERMINAL (Mission 01)')).toBeInTheDocument();
    });

    // Close with ESC
    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('TERMINAL (Mission 01)')).not.toBeInTheDocument();
    });
  });

  it('closes modal when clicking outside', async () => {
    const { container } = render(
      <StructureInteraction
        structures={testStructures}
        playerPosition={{ x: 110, y: 110 }}
      />
    );

    fireEvent.keyDown(window, { key: 'e' });

    await waitFor(() => {
      expect(screen.getByText('TERMINAL (Mission 01)')).toBeInTheDocument();
    });

    // Click on backdrop
    const backdrop = container.querySelector('[class*="backdrop-blur"]');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    await waitFor(() => {
      expect(screen.queryByText('TERMINAL (Mission 01)')).not.toBeInTheDocument();
    });
  });

  it('calls onInteract callback when E key is pressed', async () => {
    const onInteract = vi.fn();

    render(
      <StructureInteraction
        structures={testStructures}
        playerPosition={{ x: 110, y: 110 }}
        onInteract={onInteract}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/PRESS \[E\] TO INTERACT/i)).toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: 'e' });

    await waitFor(() => {
      expect(onInteract).toHaveBeenCalledWith(testStructures[0]);
    });
  });

  it('displays correct structure details', async () => {
    render(
      <StructureInteraction
        structures={testStructures}
        playerPosition={{ x: 110, y: 110 }}
      />
    );

    fireEvent.keyDown(window, { key: 'e' });

    await waitFor(() => {
      expect(screen.getByText('3000')).toBeInTheDocument(); // Port from TERMINAL
      expect(screen.getByText('RUNNING')).toBeInTheDocument(); // Status
    });
  });

  it('shows code snippet for TERMINAL structure', async () => {
    render(
      <StructureInteraction
        structures={testStructures}
        playerPosition={{ x: 110, y: 110 }}
      />
    );

    fireEvent.keyDown(window, { key: 'e' });

    await waitFor(() => {
      expect(screen.getByText(/http\.createServer/)).toBeInTheDocument();
    });
  });

  it('shows API endpoints for SMART_DOOR structure', async () => {
    render(
      <StructureInteraction
        structures={testStructures}
        playerPosition={{ x: 210, y: 110 }}
      />
    );

    fireEvent.keyDown(window, { key: 'e' });

    await waitFor(() => {
      expect(screen.getByText(/\/door\/status/)).toBeInTheDocument();
      expect(screen.getByText(/\/door\/access/)).toBeInTheDocument();
    });
  });

  it('handles multiple nearby structures (closes old modal)', async () => {
    const { rerender } = render(
      <StructureInteraction
        structures={testStructures}
        playerPosition={{ x: 110, y: 110 }}
      />
    );

    fireEvent.keyDown(window, { key: 'e' });

    await waitFor(() => {
      expect(screen.getByText('TERMINAL (Mission 01)')).toBeInTheDocument();
    });

    // Move to second structure
    rerender(
      <StructureInteraction
        structures={testStructures}
        playerPosition={{ x: 210, y: 110 }}
      />
    );

    fireEvent.keyDown(window, { key: 'e' });

    await waitFor(() => {
      expect(screen.getByText('API GATEWAY & ROUTING LAYER')).toBeInTheDocument();
    });
  });

  it('does not respond to interaction outside radius', async () => {
    const onInteract = vi.fn();

    render(
      <StructureInteraction
        structures={testStructures}
        playerPosition={{ x: 500, y: 500 }}
        onInteract={onInteract}
      />
    );

    fireEvent.keyDown(window, { key: 'e' });

    await waitFor(() => {
      expect(onInteract).not.toHaveBeenCalled();
    });
  });

  it('copies code snippet to clipboard', async () => {
    const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText');

    render(
      <StructureInteraction
        structures={testStructures}
        playerPosition={{ x: 110, y: 110 }}
      />
    );

    fireEvent.keyDown(window, { key: 'e' });

    await waitFor(() => {
      expect(screen.getByText(/COPY/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/COPY/i));

    expect(clipboardSpy).toHaveBeenCalled();

    clipboardSpy.mockRestore();
  });
});
