# Structure Interaction System Integration Guide

## Overview

The Structure Interaction System allows players to see and interact with the structures (game systems) they built during missions. When a player enters the game world, they can navigate to completed structures, press [E] to interact, and view detailed information about how each system works.

## Files Created

1. **`src/utils/structureData.ts`** - Data layer defining structure types, content, and utilities
2. **`src/components/StructureInteraction.tsx`** - Main UI component handling interactions and display
3. **`src/hooks/useStructureInteraction.ts`** - React hook for state management
4. **`src/components/CastleMap.tsx`** - Updated to integrate structure system

## How It Works

### 1. Structure Detection

The system uses radius-based collision detection to determine when a player is near a structure:

```typescript
// In StructureInteraction component
const dx = playerPosition.x - structurePos.x;
const dy = playerPosition.y - structurePos.y;
const distance = Math.sqrt(dx * dx + dy * dy);
return distance < collisionRadius; // collision detected
```

### 2. Interaction Prompt

When a player is within collision radius:
- A prompt appears at the bottom of the screen
- Shows the structure name and "PRESS [E] TO INTERACT"
- Color-coded based on structure type

### 3. Structure Info Modal

Pressing [E] opens a modal displaying:
- Structure icon and name
- Key details (status, metrics, etc.)
- Type-specific content:
  - **TERMINAL**: Running server info + code snippet
  - **SMART_DOOR**: API endpoints list
  - **SECURITY_GATE**: Auth status + middleware chain
  - **RESOURCE_VAULT**: Stored resources list
  - **ASYNC_ENGINE**: Queue and job status
  - **LIVE_MONITOR**: Event stream with real-time events
  - **CORE_PATCH**: Security test info

Modal can be closed by:
- Pressing ESC
- Clicking outside the modal
- Clicking the X button

## Integration with CastleMap

The CastleMap component now accepts structure-related props:

```typescript
<CastleMap
  completedMissions={['mission-01', 'mission-02', 'mission-03']}
  onStructureInteract={(structure) => {
    console.log('Player interacted with:', structure.title);
  }}
  onPositionChange={(x, y, roomId) => {
    // Handle position updates
  }}
/>
```

### Props

- **`completedMissions`**: Array of mission IDs to show structures for
  - Example: `['mission-01', 'mission-02']`
  - Automatically places structures on the map

- **`onStructureInteract`**: Callback when player interacts with a structure
  - Receives the `StructureInfo` object
  - Use to track analytics, play sounds, etc.

## Structure Types and Locations

The system maps missions to structures with default positions:

```
TERMINAL (Mission 01)       → x: 150, y: 150
SMART_DOOR (Mission 02)     → x: 350, y: 150
SECURITY_GATE (Mission 03)  → x: 550, y: 150
RESOURCE_VAULT (Mission 04) → x: 250, y: 300
ASYNC_ENGINE (Mission 05)   → x: 450, y: 300
LIVE_MONITOR (Mission 06)   → x: 350, y: 450
CORE_PATCH (Mission 07)     → x: 150, y: 450
```

## Using useStructureInteraction Hook

For custom implementations or additional features:

```typescript
const MyGameComponent = () => {
  const {
    structures,           // Array of StructureInfo[]
    addStructure,         // Add a structure manually
    removeStructure,      // Remove a structure by type
    clearStructures,      // Clear all structures
    playerPosition,       // Current player position {x, y}
    setPlayerPosition,    // Update player position
    selectedStructure,    // Currently open structure (or null)
    handleStructureInteract,  // Handle interaction
    clearSelection,       // Close the modal
  } = useStructureInteraction({
    onStructureInteract: (structure) => {
      console.log('Interacted with:', structure);
    }
  });

  return (
    <>
      {/* Your game component */}
      <StructureInteraction
        structures={structures}
        playerPosition={playerPosition}
        onInteract={handleStructureInteract}
      />
    </>
  );
};
```

## Customizing Structure Content

To customize structure content, pass override data when adding:

```typescript
addStructure('TERMINAL', 
  { x: 100, y: 100 },
  {
    details: [
      { label: 'Custom Field', value: 'Custom Value' },
      { label: 'Status', value: 'ONLINE' }
    ],
    codeSnippet: `// Your custom code`
  }
);
```

## Keyboard Controls

- **WASD or Arrow Keys**: Move player
- **E**: Interact with nearby structure
- **ESC**: Close structure info modal

## Collision Radius

Each structure has a default collision radius of 50 pixels. Customize per structure:

```typescript
// In structureData.ts
export const structureRegistry: Record<StructureType, ...> = {
  TERMINAL: {
    ...
    radius: 75,  // Increase interaction range
  },
  ...
}
```

## Event Stream (Live Monitor)

The LIVE_MONITOR structure displays real-time events. Update events programmatically:

```typescript
const monitor = structures.find(s => s.type === 'LIVE_MONITOR');
if (monitor) {
  monitor.content.eventStream?.push({
    event: 'CUSTOM_EVENT',
    timestamp: new Date().toISOString(),
    payload: { customData: 'value' }
  });
}
```

## Color System

Structures are color-coded by mission:

- **TERMINAL**: Blue (foundational)
- **SMART_DOOR**: Green (routing)
- **SECURITY_GATE**: Red (security)
- **RESOURCE_VAULT**: Blue (storage)
- **ASYNC_ENGINE**: Amber (background processing)
- **LIVE_MONITOR**: Purple (monitoring)
- **CORE_PATCH**: Amber (testing)

Colors automatically apply to:
- Interaction prompt
- Modal header and borders
- Icon colors
- UI element highlights

## Integration Example

```typescript
import CastleMap from './components/CastleMap';

export const GamePage = () => {
  const [completedMissions, setCompletedMissions] = useState<string[]>([
    'mission-01', 'mission-02', 'mission-03'
  ]);

  const handleStructureInteract = (structure) => {
    console.log(`Player learned about ${structure.title}`);
    // Track in analytics
    // Play interaction sound
    // Update quest progress
  };

  return (
    <div>
      <CastleMap
        completedMissions={completedMissions}
        onStructureInteract={handleStructureInteract}
        onPositionChange={(x, y, room) => {
          console.log(`Player at ${x}, ${y} in ${room}`);
        }}
      />
    </div>
  );
};
```

## Performance Considerations

- Collision detection is O(n) per frame where n = number of structures
- For 7-10 structures, negligible performance impact
- Modal rendering is only on user interaction
- Event stream is capped at 50 items to prevent memory issues

## Future Enhancements

Potential improvements:
- Animated structure indicators on map
- Sound effects on interaction
- Achievement tracking for visiting all structures
- Guided tours / help system
- Custom structure types
- Photo mode / screenshot capture
- Multiplayer structure sharing
