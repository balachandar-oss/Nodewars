# Bug Planting and Bounty Question System

## Overview
A complete system for planting pre-generated security bugs with MCQ questions and flag fragments. Architects select bugs and locations, players answer questions to unlock fragments and claim bugs.

## Components Built

### Frontend Components

#### 1. `BugArchitectPanel.tsx`
**Location:** `apps/web/src/components/BugArchitectPanel.tsx`

Features:
- Fetches pre-generated bugs from API `/api/games/:gameId/available-bugs`
- Displays bugs with: structureType, difficulty, question preview, and options
- Bug selection interface (click to select)
- Location selection (ROOM, TOWER, CORRIDOR)
- Plant confirmation with instant feedback
- Shows planted count (X/20)
- Difficulty-based color coding (GREEN/AMBER/RED)
- Responsive grid layout with glass-panel styling

Props:
- `gameId`: The game/match ID to plant bugs for
- `maxBugs`: Maximum bugs that can be planted (default: 20)

#### 2. `BountyPopup.tsx`
**Location:** `apps/web/src/components/BountyPopup.tsx`

Features:
- MCQ question modal with 4 options (A, B, C, D)
- 60-second countdown timer with visual indicators
- Real-time feedback:
  - ✓ Correct: Green feedback, reveal fragment, award points
  - ✗ Incorrect: Red feedback, -5 points, allow retry
  - ⏱ Timeout: Amber feedback, bounty expired
- Dynamic point calculation based on:
  - Base difficulty multiplier (EASY: 1x, MEDIUM: 1.5x, HARD: 2x, CRITICAL: 3x)
  - Speed bonus (+5 points if answered in 50+ seconds remaining)
- Fragment display on correct answer
- Retry button on incorrect attempts
- Clean modal design with neon styling

Props:
- `bugId`: Bug ID to answer bounty for
- `question`: MCQ question text
- `options`: Array of 4 answer options
- `onClose`: Callback when popup closes
- `onCorrect`: Callback on correct answer (fragment, points)
- `onIncorrect`: Callback on incorrect answer (penalty)
- `timeLimit`: Timer duration in seconds (default: 60)

### Backend Routes

#### 1. `bounty.ts` (New Route File)
**Location:** `apps/server/src/routes/bounty.ts`

Three endpoints integrated into the API:

##### GET `/api/games/:gameId/available-bugs`
- **Auth:** Required (Bearer token)
- **Purpose:** Fetch list of available bugs for planting in a game
- **Logic:**
  - Verify user is a bug architect in the game
  - Fetch all DRAFT bugs with questions and fragments
  - Return formatted bug list with structure type, difficulty, Q&A
  - Include planted count and max limit
- **Response:**
  ```json
  {
    "bugs": [
      {
        "id": "bug-id",
        "structureType": "ROOM",
        "difficulty": "MEDIUM",
        "question": "Question text...",
        "options": ["A", "B", "C", "D"],
        "fragment": "FLAG_FRAGMENT_VALUE"
      }
    ],
    "plantedCount": 5,
    "maxBugs": 20
  }
  ```

##### POST `/api/bugs/:bugId/plant`
- **Auth:** Required (Bearer token)
- **Body:**
  ```json
  {
    "location": "ROOM|TOWER|CORRIDOR",
    "gameId": "game-id"
  }
  ```
- **Purpose:** Plant a bug at a specific location
- **Logic:**
  - Verify user is bug architect in game
  - Validate bug exists and is in DRAFT status
  - Check 20-bug planting limit
  - Update bug to PLANTED status with architect and location
  - Increment architect's bugsPlanted counter
- **Response:**
  ```json
  {
    "id": "bug-id",
    "status": "PLANTED",
    "location": "ROOM",
    "plantedAt": "2026-09-21T12:00:00Z"
  }
  ```

##### POST `/api/bounties/:bugId/answer`
- **Auth:** Required (Bearer token)
- **Body:**
  ```json
  {
    "answer": "A|B|C|D",
    "timeRemaining": 45
  }
  ```
- **Purpose:** Submit answer to a bounty question
- **Logic:**
  - Verify answer against bugQuestion.correctAnswer
  - Calculate points based on difficulty + time bonus
  - Update GameScore if applicable
  - If correct: mark bug CLAIMED, return fragment
  - If incorrect: return penalty, allow retry
- **Response (Correct):**
  ```json
  {
    "isCorrect": true,
    "points": 15,
    "fragment": "FLAG_PART_1",
    "message": "Correct! Bug claimed and fragment unlocked."
  }
  ```
- **Response (Incorrect):**
  ```json
  {
    "isCorrect": false,
    "points": 0,
    "penalty": 5,
    "message": "Incorrect answer. Try again!"
  }
  ```

### Database Models

The system uses these Prisma models:

1. **Bug** - Enhanced with new fields:
   - `gameId`: Game reference
   - `structureType`: Type (ROOM, TOWER, CORRIDOR, etc.)
   - `difficulty`: EASY, MEDIUM, HARD, CRITICAL
   - `questionId`: Reference to BugQuestion
   - `fragmentId`: Reference to FlagFragment
   - `location`: Where the bug was planted

2. **BugQuestion** - MCQ data:
   - `text`: Question content
   - `options`: JSON array of 4 answer choices
   - `correctAnswer`: The correct option (A, B, C, or D)
   - `explanation`: Explanation for wrong answers

3. **FlagFragment** - Flag puzzle pieces:
   - `position`: 1-4 (fragment position in flag)
   - `value`: The actual fragment content
   - `gameId`: Which game this fragment belongs to
   - `teamId`: Which team can collect this fragment

4. **GameScore** - Per-user game stats:
   - `bugsDiscovered`: Number of bugs found
   - `bugsSolved`: Number of bugs answered correctly
   - `score`: Total points earned
   - `fragmentsCollected`: Number of flag fragments collected

5. **BugArchitect** - Tracks architects per game:
   - `userId`: The architect user
   - `gameId`: Which game they're architecting
   - `teamId`: Their team
   - `bugsPlanted`: Count of bugs they've planted (0-20)

### Bug Seeding Data

**Location:** `apps/server/src/seeds/gameSeeds.ts` (Pre-existing)

Contains 20 pre-made bugs organized by difficulty:
- **EASY (5 bugs):** 5 points each
  - Missing authentication
  - Input validation
  - Error handling
  - Wrong status codes
  - Hardcoded configuration

- **MEDIUM (8 bugs):** 10 points each
  - Authorization vs authentication
  - Middleware order
  - Async error handling
  - Promise rejection
  - Event emitter errors
  - Socket.IO room access
  - SQL injection
  - CORS misconfiguration

- **HARD (5 bugs):** 20 points each
  - Race conditions
  - JWT token validation
  - Timing attacks
  - Error message leakage
  - Missing HTTPS

- **CRITICAL (2 bugs):** 50 points each
  - Authorization chain attacks
  - Prototype pollution

### Game Initialization Flow

1. **Admin creates game:**
   ```bash
   POST /api/games
   {
     "name": "Game Name"
   }
   ```

2. **Admin seeds bugs:**
   ```bash
   POST /api/games/:gameId/seed-bugs
   ```
   This creates:
   - 20 BugQuestion records with MCQ data
   - 20 FlagFragment records (4 positions × 5 per position)
   - 20 Bug records with DRAFT status

3. **Bug Architect enters:**
   - Becomes BugArchitect for their team
   - Calls GET `/api/games/:gameId/available-bugs`
   - Views 20 pre-made bugs
   - Selects location and plants bug
   - Bug moves from DRAFT → PLANTED

4. **Players hunt bugs:**
   - During HUNT phase, see PLANTED bugs
   - Answer BountyPopup MCQ
   - On correct answer:
     - Fragment revealed
     - Points awarded
     - Bug marked CLAIMED

### UI/UX Features

**BugArchitectPanel:**
- Glass-panel aesthetic matching game theme
- Neon color coding (purple for selection, green for action)
- Smooth transitions and animations
- Responsive grid layout
- Real-time feedback messages
- Planted count visual indicator

**BountyPopup:**
- Modal overlay with backdrop blur
- Neon blue border and styling
- Color-coded timer (green → amber → red)
- Animated pulse on time running out
- Letter-based option selection (A, B, C, D)
- Fragment display with monospace font
- Clear feedback states (correct/incorrect/timeout)

### Integration Points

1. **Server Registration:** Bounty routes imported and registered in `server.ts`
   - All routes available under `/api` path
   - GET `/api/games/:gameId/available-bugs`
   - POST `/api/bugs/:bugId/plant`
   - POST `/api/bounties/:bugId/answer`

2. **Game Phase Support:** Works during BUG_PLACEMENT phase for architects, HUNT phase for hunters

3. **Authentication:** All endpoints require valid JWT token

4. **Points System:** Integrated with GameScore model for tracking achievements

## Usage Example

### For Bug Architects:
```typescript
// 1. Import component
import BugArchitectPanel from '@/components/BugArchitectPanel';

// 2. Render in your game setup page
<BugArchitectPanel gameId={currentGame.id} maxBugs={20} />

// 3. Component handles the rest:
//    - Fetches available bugs
//    - Lets architect select bug + location
//    - Plants bug on click
//    - Shows feedback
```

### For Bug Hunters:
```typescript
// 1. When bug is discovered, show bounty popup
<BountyPopup
  bugId={discoveredBug.id}
  question={bug.bugQuestion.text}
  options={JSON.parse(bug.bugQuestion.options)}
  onClose={() => setShowBounty(false)}
  onCorrect={(fragment, points) => {
    addFragment(fragment);
    addPoints(points);
  }}
  onIncorrect={(penalty) => {
    deductPoints(penalty);
  }}
/>
```

## API Response Examples

### Available Bugs (Formatted)
```json
{
  "bugs": [
    {
      "id": "seed-bug-easy-01",
      "structureType": "ROOM",
      "difficulty": "EASY",
      "question": "A resource endpoint does not check if a user is authenticated...",
      "options": [
        "200 OK - The server always responds successfully",
        "400 Bad Request - The client sent invalid input",
        "401 Unauthorized - Authentication is required",
        "404 Not Found - The resource does not exist"
      ],
      "fragment": "FLAG_PART_1"
    }
  ],
  "plantedCount": 3,
  "maxBugs": 20
}
```

### Plant Bug Response
```json
{
  "id": "bug-123",
  "status": "PLANTED",
  "location": "TOWER",
  "plantedAt": "2026-09-21T14:30:00Z"
}
```

### Bounty Answer Response (Correct)
```json
{
  "isCorrect": true,
  "points": 15,
  "fragment": "FLAG_PART_2",
  "message": "Correct! Bug claimed and fragment unlocked."
}
```

## Performance Notes

- Bugs fetched once on component mount (caching possible)
- Plant operations are atomic (single database transaction)
- Answer validation happens server-side (secure)
- Point calculations are deterministic based on difficulty + time

## Security Considerations

- All endpoints require authentication
- Bug architects verified per-game
- Answer validation server-side (client can't cheat)
- Location validation restricts to allowed values
- Plant limit enforced (max 20 bugs per architect)
- Fragment values are opaque to frontend (can't guess)

## File Locations Summary

**Frontend:**
- `apps/web/src/components/BugArchitectPanel.tsx`
- `apps/web/src/components/BountyPopup.tsx`

**Backend:**
- `apps/server/src/routes/bounty.ts` (NEW)
- `apps/server/src/routes/games.ts` (MODIFIED for seeding)
- `apps/server/src/seeds/gameSeeds.ts` (Pre-existing, used as data source)
- `apps/server/src/server.ts` (MODIFIED to register routes)

**Database:**
- `prisma/schema.prisma` (Contains all models)

## Next Steps for Integration

1. Run Prisma migration if schema changes need DB sync:
   ```bash
   npx prisma migrate dev --name add_bug_bounty_system
   ```

2. Register BugArchitectPanel in a game setup/management page

3. Integrate BountyPopup into the Hunt/Discovery system

4. Create admin UI for seeding bugs via API

5. Add WebSocket events for real-time bug status updates (optional)

6. Create leaderboard display for fragment collection progress
