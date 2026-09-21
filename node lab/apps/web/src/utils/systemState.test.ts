import { describe, it, expect } from 'vitest';
import { getSystemVisualState, getPathVisualState } from './systemState';

describe('SystemVisualState Mapper', () => {
  it('maps COMPLETE to COMPLETED regardless of accessibility', () => {
    expect(getSystemVisualState('COMPLETE', true)).toBe('COMPLETED');
    expect(getSystemVisualState('COMPLETE', false)).toBe('COMPLETED');
  });

  it('maps ACTIVE to CURRENT as it represents the current mission', () => {
    expect(getSystemVisualState('ACTIVE', true)).toBe('CURRENT');
    expect(getSystemVisualState('ACTIVE', false)).toBe('CURRENT');
  });

  it('maps LOCKED to AVAILABLE if frontend accessibility allows it (e.g. Demo mode)', () => {
    expect(getSystemVisualState('LOCKED', true)).toBe('AVAILABLE');
  });

  it('maps LOCKED to LOCKED if inaccessible', () => {
    expect(getSystemVisualState('LOCKED', false)).toBe('LOCKED');
  });
});

describe('PathVisualState Mapper', () => {
  it('returns active when source is COMPLETED and target is accessible (AVAILABLE/CURRENT/COMPLETED)', () => {
    expect(getPathVisualState('COMPLETED', 'AVAILABLE')).toBe('active');
    expect(getPathVisualState('COMPLETED', 'CURRENT')).toBe('active');
    expect(getPathVisualState('COMPLETED', 'COMPLETED')).toBe('active');
  });

  it('returns transition when source is COMPLETED but target is LOCKED', () => {
    expect(getPathVisualState('COMPLETED', 'LOCKED')).toBe('transition');
  });

  it('returns dormant when source is not COMPLETED', () => {
    expect(getPathVisualState('CURRENT', 'LOCKED')).toBe('dormant');
    expect(getPathVisualState('CURRENT', 'AVAILABLE')).toBe('dormant');
    expect(getPathVisualState('LOCKED', 'LOCKED')).toBe('dormant');
    expect(getPathVisualState('AVAILABLE', 'LOCKED')).toBe('dormant');
  });
});
