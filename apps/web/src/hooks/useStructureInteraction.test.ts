import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStructureInteraction } from './useStructureInteraction';

describe('useStructureInteraction hook', () => {
  it('initializes with empty structures', () => {
    const { result } = renderHook(() => useStructureInteraction());

    expect(result.current.structures).toEqual([]);
    expect(result.current.selectedStructure).toBeNull();
  });

  it('initializes player position at origin', () => {
    const { result } = renderHook(() => useStructureInteraction());

    expect(result.current.playerPosition).toEqual({ x: 0, y: 0 });
  });

  it('adds a structure', () => {
    const { result } = renderHook(() => useStructureInteraction());

    act(() => {
      result.current.addStructure('TERMINAL', { x: 100, y: 100 });
    });

    expect(result.current.structures).toHaveLength(1);
    expect(result.current.structures[0].type).toBe('TERMINAL');
    expect(result.current.structures[0].position).toEqual({ x: 100, y: 100 });
  });

  it('prevents duplicate structure types', () => {
    const { result } = renderHook(() => useStructureInteraction());

    act(() => {
      result.current.addStructure('TERMINAL', { x: 100, y: 100 });
      result.current.addStructure('TERMINAL', { x: 200, y: 200 });
    });

    expect(result.current.structures).toHaveLength(1);
    expect(result.current.structures[0].position).toEqual({ x: 200, y: 200 });
  });

  it('adds multiple different structures', () => {
    const { result } = renderHook(() => useStructureInteraction());

    act(() => {
      result.current.addStructure('TERMINAL', { x: 100, y: 100 });
      result.current.addStructure('SMART_DOOR', { x: 200, y: 100 });
      result.current.addStructure('SECURITY_GATE', { x: 300, y: 100 });
    });

    expect(result.current.structures).toHaveLength(3);
  });

  it('removes a structure by type', () => {
    const { result } = renderHook(() => useStructureInteraction());

    act(() => {
      result.current.addStructure('TERMINAL', { x: 100, y: 100 });
      result.current.addStructure('SMART_DOOR', { x: 200, y: 100 });
    });

    expect(result.current.structures).toHaveLength(2);

    act(() => {
      result.current.removeStructure('TERMINAL');
    });

    expect(result.current.structures).toHaveLength(1);
    expect(result.current.structures[0].type).toBe('SMART_DOOR');
  });

  it('clears all structures', () => {
    const { result } = renderHook(() => useStructureInteraction());

    act(() => {
      result.current.addStructure('TERMINAL', { x: 100, y: 100 });
      result.current.addStructure('SMART_DOOR', { x: 200, y: 100 });
    });

    expect(result.current.structures).toHaveLength(2);

    act(() => {
      result.current.clearStructures();
    });

    expect(result.current.structures).toHaveLength(0);
  });

  it('updates player position', () => {
    const { result } = renderHook(() => useStructureInteraction());

    act(() => {
      result.current.setPlayerPosition({ x: 50, y: 75 });
    });

    expect(result.current.playerPosition).toEqual({ x: 50, y: 75 });
  });

  it('handles structure interaction', () => {
    const onInteract = vi.fn();
    const { result } = renderHook(() =>
      useStructureInteraction({ onStructureInteract: onInteract })
    );

    act(() => {
      result.current.addStructure('TERMINAL', { x: 100, y: 100 });
    });

    act(() => {
      result.current.handleStructureInteract(result.current.structures[0]);
    });

    expect(result.current.selectedStructure).toBe(result.current.structures[0]);
    expect(onInteract).toHaveBeenCalledWith(result.current.structures[0]);
  });

  it('clears selection', () => {
    const { result } = renderHook(() => useStructureInteraction());

    act(() => {
      result.current.addStructure('TERMINAL', { x: 100, y: 100 });
      result.current.handleStructureInteract(result.current.structures[0]);
    });

    expect(result.current.selectedStructure).toBeTruthy();

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedStructure).toBeNull();
  });

  it('allows custom content override', () => {
    const { result } = renderHook(() => useStructureInteraction());

    act(() => {
      result.current.addStructure('TERMINAL', { x: 100, y: 100 }, {
        details: [
          { label: 'Custom', value: 'Data' }
        ]
      });
    });

    expect(result.current.structures[0].content.details).toContainEqual({
      label: 'Custom',
      value: 'Data'
    });
  });

  it('merges custom content with defaults', () => {
    const { result } = renderHook(() => useStructureInteraction());

    act(() => {
      result.current.addStructure('TERMINAL', { x: 100, y: 100 }, {
        details: [
          { label: 'Extra Field', value: 'Extra Value' }
        ]
      });
    });

    const details = result.current.structures[0].content.details;
    // Should have merged custom details
    expect(details.some(d => d.label === 'Extra Field')).toBe(true);
  });

  it('calls callback without callback function provided', () => {
    const { result } = renderHook(() => useStructureInteraction());

    act(() => {
      result.current.addStructure('TERMINAL', { x: 100, y: 100 });
    });

    // Should not throw
    expect(() => {
      act(() => {
        result.current.handleStructureInteract(result.current.structures[0]);
      });
    }).not.toThrow();
  });

  it('manages multiple interactions sequentially', () => {
    const { result } = renderHook(() => useStructureInteraction());

    act(() => {
      result.current.addStructure('TERMINAL', { x: 100, y: 100 });
      result.current.addStructure('SMART_DOOR', { x: 200, y: 100 });
    });

    // Interact with first
    act(() => {
      result.current.handleStructureInteract(result.current.structures[0]);
    });
    expect(result.current.selectedStructure?.type).toBe('TERMINAL');

    // Clear and interact with second
    act(() => {
      result.current.clearSelection();
      result.current.handleStructureInteract(result.current.structures[1]);
    });
    expect(result.current.selectedStructure?.type).toBe('SMART_DOOR');
  });

  it('provides all expected properties', () => {
    const { result } = renderHook(() => useStructureInteraction());

    expect(result.current).toHaveProperty('structures');
    expect(result.current).toHaveProperty('addStructure');
    expect(result.current).toHaveProperty('removeStructure');
    expect(result.current).toHaveProperty('clearStructures');
    expect(result.current).toHaveProperty('playerPosition');
    expect(result.current).toHaveProperty('setPlayerPosition');
    expect(result.current).toHaveProperty('selectedStructure');
    expect(result.current).toHaveProperty('handleStructureInteract');
    expect(result.current).toHaveProperty('clearSelection');
  });
});
