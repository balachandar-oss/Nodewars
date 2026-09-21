export type SystemVisualState = 'LOCKED' | 'AVAILABLE' | 'CURRENT' | 'COMPLETED';

/**
 * Maps the backend progression state and frontend access rules to a visual state.
 * Does not mutate any state.
 * 
 * @param backendStatus The mission's status from the backend/progress (e.g. 'LOCKED', 'ACTIVE', 'COMPLETE')
 * @param isAccessible Whether the frontend access rules allow interacting with this mission (e.g. demo mode unlocks it)
 */
export function getSystemVisualState(
  backendStatus: string,
  isAccessible: boolean
): SystemVisualState {
  if (backendStatus === 'COMPLETE') {
    return 'COMPLETED';
  }

  // In the Node Wars backend, 'ACTIVE' represents the single mission the user is currently working on.
  if (backendStatus === 'ACTIVE') {
    return 'CURRENT';
  }

  // If the backend considers it LOCKED, but the frontend rules (like Demo mode) allow access,
  // it is AVAILABLE.
  if (backendStatus === 'LOCKED' && isAccessible) {
    return 'AVAILABLE';
  }

  return 'LOCKED';
}

/**
 * Determines the visual state of a connection path between two nodes.
 * @param sourceState The visual state of the starting node
 * @param targetState The visual state of the ending node
 */
export function getPathVisualState(
  sourceState: SystemVisualState,
  targetState: SystemVisualState
): 'active' | 'dormant' | 'transition' {
  if (sourceState === 'COMPLETED') {
    if (targetState === 'LOCKED') {
      return 'transition';
    }
    // If target is AVAILABLE, CURRENT, or COMPLETED, the path is fully active
    return 'active';
  }

  // If source is not COMPLETED (e.g. CURRENT or LOCKED), path to next is dormant
  return 'dormant';
}
