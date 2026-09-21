# NODE WARS — FINAL FULL CONCEPT

## An Immersive Node.js + Cybersecurity Castle Battle

> **Build the system. Hide the bug. Hunt the vulnerability. Solve the bounty. Unlock the throne.**

---

## 1. CORE IDEA

**Node Wars** is a **150-minute immersive Node.js + cybersecurity workshop/game**.

Instead of teaching Node.js through slides and theory, participants **learn Node.js by actually building the systems that will later exist inside a Minecraft-style pixel-art castle**.

The entire experience follows:

> **LEARN → BUILD → UNDERSTAND → TEST → QUIZ → HIDE → HUNT → SOLVE → CONQUER**

There are **two teams**:

* 🔵 **Team Boys**
* 🔴 **Team Girls**

Each team gets an **identical pre-built castle**.

During the Node.js lab, everyone builds systems such as:

* Terminal
* Smart Door
* Security Gate
* Resource Vault
* Live Security Monitor

After learning, they get a quiz.

The **Top 5 participants from each team** become:

> **BUG ARCHITECTS**

They get special access to plant hidden bugs in their team's castle.

Then the teams switch castles.

* Boys invade Girls' castle.
* Girls invade Boys' castle.

They explore the opposing castle, discover hidden bug structures, answer Node.js/security bounty questions, collect **encrypted-looking flag fragments**, assemble the exact final pass, and attempt to unlock the opposing team's:

* 👑 **King's Room** — inside Boys' castle
* 👸 **Queen's Room** — inside Girls' castle

The team with the highest score wins.

---

## 2. THE MOST IMPORTANT DESIGN PRINCIPLE

This should **NOT feel like:**

> "First we attend a Node.js class, then we play a castle game."

It should feel like:

> **"The Node.js class IS the engineering workshop for the castle."**

Everything learned in the lab appears later in the game.

### Concept Mapping

| Lab            | What they build  | Later in castle         |
| -------------- | ---------------- | ----------------------- |
| Node + HTTP    | Server           | Terminal                |
| Express        | Server framework | Castle systems          |
| Routing        | Routes           | Smart Door              |
| Middleware     | Request pipeline | Security Gate           |
| Authentication | Identity         | Locked areas            |
| Authorization  | Permissions      | Restricted rooms        |
| Database       | Data storage     | Resource Vault          |
| CRUD           | Data operations  | Vault interactions      |
| Events         | Game events      | Security Monitor        |
| Socket.IO      | Real-time events | Live Monitor            |
| Async/Await    | Async operations | Database/API challenges |
| Debugging      | Find errors      | Bug hunting             |
| Security       | Find weaknesses  | Bug bounty              |

So when they enter the castle, they aren't seeing random game mechanics.

They're seeing:

> **"Oh — this is the thing I built."**

---

## 3. VISUAL STYLE

The game should use a **top-down pixel-art castle aesthetic**, inspired by retro RPG games.

Think:

* 16-bit / 32-bit RPG
* Stone castle walls
* Wooden doors
* Torches
* Bookshelves
* Tables
* Courtyards
* Towers
* Moats
* Hidden rooms
* Pixel-art characters
* Interactive objects
* Small animations

But combine that with a **modern cyber/security HUD**.

### Visual Example

```text
┌──────────────────────────────────────────────┐
│ ⚔ NODE WARS                  SCORE 1,240     │
│ CASTLE RAID                  BUGS 4/8         │
│                                              │
│              PIXEL CASTLE                    │
│                                              │
│          👤 → 🚪 → 🛡 → 💻                   │
│                                              │
├──────────────────────────────────────────────┤
│ FLAG FRAGMENTS                               │
│ MID_   DL@   EW#   AR!                       │
└──────────────────────────────────────────────┘
```

---

## 4. COMPLETE 150-MINUTE TIMELINE

### Phase 1 — Game Briefing (0–5 minutes)

Participants are divided into two teams.

They receive:

* Team identity
* Player identity
* Game rules
* Objective
* Scoring explanation

They are told:

> "You are not here just to learn Node.js. You're going to build the systems of a castle, then use your knowledge to attack another castle."

Explain the final objective:

> Find bugs → solve bounty → collect fragments → assemble exact flag → unlock Royal Room.

---

### Phase 2 — NODE.JS ENGINEERING LAB (5–105 minutes)

**~100 minutes**

This is the main educational component.

There should be **very little traditional lecture**.

Instead:

> **Challenge → Build → Run → Observe → Explain → Break → Fix**

Every mission produces something that becomes relevant to the castle.

---

## 5. LAB INTERFACE

The lab should have a dedicated game-like interface.

### Layout Example

```text
⚔ NODE WARS // ENGINEERING LAB

MISSIONS                  MISSION 02
──────────────────        SMART DOOR

✓ FIRST SERVER            Build an Express-powered
◆ SMART DOOR              castle door.
○ SECURITY GATE
○ RESOURCE VAULT          OBJECTIVE
○ LIVE MONITOR            GET /door/open
○ BREAK IT                → return JSON

                           ┌─────────────────────┐
                           │ server.js           │
                           │                     │
                           │ YOUR CODE           │
                           │                     │
                           └─────────────────────┘

                           [ RUN ] [ TEST ] [?]

TERMINAL OUTPUT           CASTLE PREVIEW

Server running            ┌──────┐
GET /door/open             │ DOOR │
200 OK                     │ OPEN │
                           └──────┘
```

The lab interface contains:

### Left
Mission progression.

### Center
Code editor.

### Bottom
Terminal/output.

### Right/bottom
Visual castle component preview.

### Progress
XP / level / mission completion.

---

## 6. LAB MISSIONS

### Mission 1 — FIRST SERVER

**Topics:** Node.js runtime, HTTP, Server, Port, Request/Response

**Challenge:** "The castle has no communication system. Build the first server."

**Result:** Participants create a basic Node.js server.

**Castle component unlocked:** 💻 **TERMINAL**

---

### Mission 2 — SMART DOOR

**Topics:** Express.js, Routing, HTTP methods, JSON

**Challenge:** "The castle needs an intelligent door."

**Result:** Participants build routes like:
- `GET /door/status`
- `GET /door/open`
- `POST /door/access`

**Castle component unlocked:** 🚪 **SMART DOOR**

---

### Mission 3 — SECURITY GATE

**Topics:** Middleware, Authentication, Authorization

**Challenge:** "Protect the castle with middleware."

**Result:** Participants build middleware that checks:
- Identity (Who are you?)
- Role/Permissions (Are you allowed?)

**Castle component unlocked:** 🛡️ **SECURITY GATE**

---

### Mission 4 — RESOURCE VAULT

**Topics:** Database concepts, CRUD, Async operations

**Challenge:** "Store and manage castle resources."

**Result:** Participants implement:
- CREATE RESOURCE
- READ RESOURCE
- UPDATE RESOURCE
- DELETE RESOURCE

**Castle component unlocked:** 📦 **RESOURCE VAULT**

---

### Mission 5 — ASYNC OPERATIONS

**Topics:** Promises, async/await, Non-blocking behavior

**Challenge:** "Master non-blocking behavior."

**Result:** Participants understand async/await patterns.

---

### Mission 6 — LIVE SECURITY MONITOR

**Topics:** EventEmitter, Socket.IO, Real-time communication

**Challenge:** "Real-time event tracking."

**Result:** Participants create events like:
- PLAYER_ENTERED
- DOOR_OPENED
- VAULT_ACCESSED
- BUG_FOUND

**Castle component unlocked:** 📡 **LIVE SECURITY MONITOR**

---

### Mission 7 — BREAK IT

**Topics:** Debugging, Security vulnerabilities, Authorization

**Challenge:** "Find and fix the authorization bypass vulnerability."

**Result:** Participants identify and patch bugs in their own code.

---

## 7. NODE.JS TOPICS COVERED

The 100–120 minute lab should prioritize these:

### Core Topics
1. Node.js runtime
2. Modules
3. npm
4. HTTP
5. Request/Response
6. Express
7. Routing
8. JSON
9. Middleware
10. Authentication
11. Authorization
12. Async/Await
13. Database
14. CRUD
15. Events
16. Socket.IO
17. Error handling
18. Debugging
19. API design
20. Security concepts

### Supporting Topics
* Environment variables
* `fs` module
* Logging
* Input validation
* Status codes
* Headers
* Error handling

---

## 8. PHASE 3 — NODE.JS QUIZ (105–115 minutes)

**10 minutes**

The quiz determines the top 5 participants from each team.

### Quiz Format

**30% — Node concepts**

Example:
> Which mechanism executes before the protected route?

**30% — Code interpretation**

Show a small code snippet and ask what happens.

**20% — Debugging**

Show broken code. Ask: "Why does this route fail?"

**20% — Security scenarios**

Example:
> A logged-in user can access an admin-only route. What control is missing?

### Quiz Lockdown

The quiz should have a **Quiz Lockdown Mode**:

* Request fullscreen
* Detect tab visibility changes
* Detect focus loss
* Record violations
* Randomize questions
* Randomize answer options
* Use server-side timing
* Validate answers server-side
* Record attempt logs

---

## 9. TOP 5 → BUG ARCHITECTS (115–120 minutes)

The highest five scorers from each team become:

# BUG ARCHITECTS

These players receive a special ability.

**Normal participants:** Build castle structures.

**Bug Architects:** Build + plant bugs.

This gives the quiz a real gameplay consequence:

> **"Your Node.js knowledge gives your team offensive power."**

---

## 10. THE CASTLE

There are **two identical castles**.

Each castle has:

* 🚪 Main Entrance
* 🛡️ Security Gate
* 💻 Command Hall
* 📚 Archive
* 📦 Resource Vault
* 📡 Security Core
* 🏰 Towers
* Corridors
* Hidden passages
* Side rooms
* Courtyard
* Moat
* 👑 Royal Room

### Important — The Castle Is Not Just Decoration

Every important structure has a digital identity.

Example:

```text
CASTLE A

STRUCTURE-001
SMART_DOOR

STRUCTURE-002
SECURITY_GATE

STRUCTURE-003
RESOURCE_VAULT

STRUCTURE-004
LIVE_MONITOR
```

The physical/digital object can contain:

* QR code
* NFC tag
* Printed identifier
* Visual marker

Example:

```text
┌──────────────┐
│ 🛡 SECURITY  │
│    GATE      │
│              │
│   BUG-B17    │
└──────────────┘
```

Scanning/interacting with it opens the corresponding digital challenge.

---

## 11. PHASE 4 — CASTLE MODIFICATION (120–130 minutes)

**10 minutes**

Now everyone gets a limited inventory of building components.

Example:

```text
YOUR TEAM INVENTORY

🧱 2 × Smart Door
🛡️ 2 × Security Gate
💻 2 × Terminal
📦 2 × Vault
📡 1 × Monitor
🚪 3 × Door
🧩 2 × Puzzle Room
```

They can place these around their castle.

This means the castle isn't identical anymore.

It has become:

> **YOUR TEAM'S ARCHITECTURE**

---

## 12. BUG ARCHITECTS — SPECIAL PHASE

Only the Top 5 can access:

> 🐛 **BUG ARCHITECT MODE**

They can plant hidden bugs.

They don't directly modify the actual backend.

Instead, the organizers provide a controlled bug-template system.

For each bug:

```text
BUG CREATOR

Structure:
[ SECURITY GATE ]

Bug Type:
[ Authorization ]

Difficulty:
[ HARD ]

Location:
[ EAST TOWER ]

Bounty:
[ Question ]

Reward:
[ Flag Fragment ]

Visibility:
[ Hidden ]
```

Then:

> **PLANT BUG**

---

## 13. TYPES OF BUGS

The bugs should be based on things participants actually learned.

### Bug Type 1 — Authentication
Something about identity/login/session handling.

### Bug Type 2 — Authorization
Correctly authenticated user gets an unauthorized privilege.

### Bug Type 3 — Middleware
Incorrect middleware order or missing middleware.

### Bug Type 4 — Routing
Incorrect route/method/parameter logic.

### Bug Type 5 — Input Validation
Unexpected input produces an unintended result.

### Bug Type 6 — API Logic
The API behaves incorrectly under a particular sequence.

### Bug Type 7 — Information Exposure
The system reveals information it shouldn't.

### Bug Type 8 — Async Logic
A race/order/timing-related conceptual challenge.

### Bug Type 9 — Database/CRUD
Incorrect data state or operation.

### Bug Type 10 — Event/Socket Challenge
An event is triggered, handled, or broadcast incorrectly.

Everything is **sandboxed and simulated**.

Participants are not attacking a real vulnerable production system.

---

## 14. BUG DIFFICULTY

Each bug can have a difficulty.

### EASY
Basic Node.js concept.
```text
+40 points
```

### MEDIUM
Requires understanding multiple concepts.
```text
+60 points
```

### HARD
Requires debugging/reasoning.
```text
+75 points
```

### CRITICAL
Multi-step security challenge.
```text
+100 points
```

---

## 15. PHASE 5 — CASTLE INVASION (~130–150 minutes)

Now the teams switch castles.

### Boys → Girls' Castle
### Girls → Boys' Castle

And the raid begins.

The objective isn't simply:

> "Find the bugs."

It is:

> **Explore → identify → investigate → solve → collect → assemble → unlock.**

---

## 16. PLAYER MOVEMENT

The castle should be an actual interactive game.

Players can:

* Walk around
* Enter rooms
* Open doors
* Inspect objects
* Interact with terminals
* Scan structures
* Discover hidden objects
* Trigger events
* Solve challenges

The reference image becomes the **actual game map**, not just an illustration.

---

## 17. BUG DISCOVERY

A hidden bug structure could look like:

```text
     🧱
  ┌─────────┐
  │  ???    │
  │ BUG B17 │
  └─────────┘
```

The player interacts.

The game responds:

> **BUG DETECTED**

Then:

# BUG BOUNTY

```text
BUG B-17
DIFFICULTY: HARD

A protected Express route must verify
permissions before allowing access.

Which Node.js concept controls this
request-processing stage?

A. Middleware
B. Buffer
C. EventEmitter
D. File System
```

---

## 18. SOLVING THE BUG

Correct:

```text
✓ BOUNTY SOLVED

+75 POINTS

FLAG FRAGMENT RECOVERED

MID_
```

Incorrect:

```text
✗ INCORRECT

-5 POINTS

BUG REMAINS UNCLAIMED
```

They can move on and try another bug.

---

## 19. THE FLAG FRAGMENT SYSTEM

This is an important part of the game.

The fragments should **NOT simply reveal the Node.js concept**.

For example, don't give:

```text
MID
DLE
WAR
E
```

because players can immediately guess:

> MIDDLEWARE

Instead, the fragments are **opaque cryptographic-style strings**.

For example:

```text
BUG 1 → MID_
BUG 2 → DL@
BUG 3 → EW#
BUG 4 → AR!
```

The final string is:

```text
MID_DL@EW#AR!
```

The special characters are **part of the actual pass**.

### Why This Is Important

Suppose someone figures out:

> "Oh, these bugs are about middleware."

That doesn't help.

They still don't know:

```text
MID_DL@EW#AR!
```

They must actually find and solve the required bugs.

This creates a proper:

> **CTF-style flag assembly mechanic**

without requiring a real-world vulnerable system.

---

## 20. RANDOM FRAGMENT ORDER

Fragments can be discovered in any order.

For example:

**First:**
```text
EW#
```

**Then:**
```text
MID_
```

**Then:**
```text
AR!
```

**Then:**
```text
DL@
```

The dashboard records the correct position.

Eventually:

```text
POSITION 1 → MID_
POSITION 2 → DL@
POSITION 3 → EW#
POSITION 4 → AR!
```

Final:

```text
MID_DL@EW#AR!
```

The team cannot simply guess it from the visible fragments.

---

## 21. TEAM FLAG DASHBOARD

During the raid:

```text
┌────────────────────────────────────┐
│        FLAG ASSEMBLY               │
├────────────────────────────────────┤
│                                    │
│  [MID_] [DL@] [EW#] [AR!]          │
│                                    │
│  4 / 4 FRAGMENTS                   │
│                                    │
│  STATUS: READY                     │
│                                    │
│       [ ATTEMPT ROYAL ROOM ]       │
└────────────────────────────────────┘
```

Before all required fragments:

```text
ROYAL ROOM

🔒 LOCKED

Required fragments:
2 / 4
```

---

## 22. THE ROYAL ROOM

This is the final objective.

For Boys' castle:

> 👑 **KING'S ROOM**

For Girls' castle:

> 👸 **QUEEN'S ROOM**

The room contains the final prize/objective.

But the door doesn't open simply because the team has discovered all bugs.

They must enter the:

> **EXACT FINAL FLAG**

Example:

```text
ENTER ROYAL ACCESS CODE:

____________________

[ UNLOCK ]
```

Correct:

```text
✓ ACCESS GRANTED

ROYAL ROOM UNLOCKED

+300 POINTS

CASTLE CONQUERED
```

Wrong:

```text
✗ ACCESS DENIED

Exact flag required.

-20 POINTS
```

---

## 23. SCORING SYSTEM

Keep the scoring simple.

| Action                   | Points |
| ------------------------ | -----: |
| Discover bug             |    +10 |
| Solve Easy bug           |    +40 |
| Solve Medium bug         |    +60 |
| Solve Hard bug           |    +75 |
| Solve Critical bug       |   +100 |
| Correct flag assembly    |    +50 |
| Royal Room unlock        |   +300 |
| Time bonus               |    +50 |
| Wrong bounty answer      |     -5 |
| Wrong Royal Room attempt |    -20 |

The exact values can be tuned during testing.

The philosophy is:

> **The more bugs you find and correctly solve before time runs out, the more chances your team has to win.**

---

## 24. GAME END

At the end:

```text
══════════════════════════════
       NODE WARS COMPLETE
══════════════════════════════

BOYS
BUGS SOLVED       7
SCORE          1,125
ROYAL ROOM       ✓

GIRLS
BUGS SOLVED       9
SCORE          1,280
ROYAL ROOM       ✓

══════════════════════════════
        🏆 WINNER
           GIRLS
══════════════════════════════
```

---

## 25. REAL-TIME GAME SYSTEM

The game should be powered by:

### Frontend
HTML/CSS/JavaScript or your chosen frontend framework.

Responsible for:
* Castle rendering
* Player movement
* Interaction
* HUD
* Bug interface
* Bounty interface
* Score display
* Flag fragments
* Timer

### Backend
**Node.js + Express**

Responsible for:
* Players
* Teams
* Game state
* Bugs
* Challenges
* Score
* Flag fragments
* Castle structures
* Royal Room
* Validation

### Real-time
**Socket.IO**

Responsible for:
```text
PLAYER_ENTERED
PLAYER_LEFT
BUG_DISCOVERED
BUG_CLAIMED
SCORE_UPDATED
FRAGMENT_COLLECTED
DOOR_OPENED
ROOM_UNLOCKED
TIME_WARNING
GAME_ENDED
```

### Database
Use something practical:
* MongoDB
* PostgreSQL
* SQLite

---

## 26. SERVER-AUTHORITATIVE DESIGN

This is very important.

Never trust the browser.

The client should NOT be able to simply send:

```text
"I solved bug B17."
```

and receive points.

The server checks:

```text
Player?
✓

Correct team?
✓

Bug exists?
✓

Bug available?
✓

Challenge answer correct?
✓

Already claimed?
No

→ CLAIM BUG
→ AWARD POINTS
→ RELEASE FRAGMENT
```

Likewise:

```text
"I unlocked Royal Room"
```

means nothing unless the server verifies:

```text
Required fragments?
✓

Correct final flag?
✓

Game active?
✓

Player authorized?
✓

→ UNLOCK
```

---

## 27. DATABASE STRUCTURE

A simple architecture:

### User
```text
id
name
team
role
```

### Team
```text
id
name
score
castleId
```

### Castle
```text
id
team
structures[]
royalRoom
```

### Structure
```text
id
castleId
type
location
owner
```

### Bug
```text
id
structureId
challengeId
difficulty
fragmentId
status
```

### Challenge
```text
id
question
options
correctAnswer
concept
difficulty
```

### Fragment
```text
id
position
value
claimedBy
claimedAt
```

### Game
```text
startTime
endTime
status
winner
```

---

## 28. ADMIN PANEL

You will need an organizer/admin interface.

Something like:

```text
NODE WARS // ADMIN CONTROL

GAME STATUS
🟢 ACTIVE

TEAMS
BOYS       820
GIRLS      940

PLAYERS
20 / 20

BUGS
17 PLANTED
9 CLAIMED

ROYAL ROOMS
KING       LOCKED
QUEEN      LOCKED
```

Admin should be able to:

* Create teams
* Add players
* Create castles
* Place structures
* Create bugs
* Create questions
* Set difficulty
* Set fragments
* Start game
* Pause game
* End game
* Reset game
* Monitor scores
* See discovered bugs
* See solved bugs
* See Royal Room status

---

## 29. PHYSICAL + DIGITAL BRIDGE

This can make the project much more impressive.

Your physical castle can have actual:

* Building blocks
* Doors
* Gates
* Towers
* Rooms
* Bug markers
* QR codes
* NFC tags

Example:

```text
PHYSICAL SECURITY GATE

        🛡
   ┌───────────┐
   │ SECURITY  │
   │   GATE    │
   │           │
   │  QR CODE  │
   └───────────┘
```

Scanning it opens:

```text
NODE WARS

STRUCTURE:
SECURITY GATE

STATUS:
⚠ BUG DETECTED

[ INVESTIGATE ]
```

The server knows:

```text
QR → STRUCTURE-17
STRUCTURE-17 → CASTLE-B
STRUCTURE-17 → BUG-07
BUG-07 → CHALLENGE-42
```

So your physical castle and digital game become one system.

---

## 30. PARTICIPANT INVENTORY

Every participant can have a digital inventory.

Example:

```text
MY BUILD INVENTORY

🧱 Smart Door ×2
🛡 Security Gate ×1
💻 Terminal ×1
📦 Vault ×1
📡 Monitor ×1
```

During the 10-minute build phase:

```text
PLACE COMPONENT

[ SMART DOOR ]

Available: 2

LOCATION:
□ East Tower
□ North Corridor
□ Command Hall

[ BUILD ]
```

This makes the castle modification phase organized instead of chaotic.

---

## 31. BUG ARCHITECT INVENTORY

Bug Architects see something normal players don't:

```text
BUG ARCHITECT MODE

AVAILABLE BUGS

🐛 Authentication
🐛 Authorization
🐛 Middleware
🐛 Routing
🐛 Input Validation
🐛 API Logic
🐛 Database
🐛 Async
🐛 Socket/Event
```

They can choose:

```text
TARGET:
Security Gate

BUG:
Authorization

DIFFICULTY:
HARD

BOUNTY:
Question #42

REWARD:
DL@

LOCATION:
North Tower

[ PLANT BUG ]
```

---

## 32. WHY THE TOP 5 MATTER

This is an extremely important game-design element.

The quiz is not just an assessment.

It creates a hierarchy:

```text
ALL PARTICIPANTS
       ↓
    NODE.JS LAB
       ↓
      QUIZ
       ↓
TOP 5 FROM EACH TEAM
       ↓
BUG ARCHITECTS
       ↓
CONTROL WHERE BUGS ARE HIDDEN
```

So:

> **Knowledge → Power**

That is a very strong educational/game connection.

---

## 33. THE LEARNING LOOP

The entire workshop follows this loop repeatedly:

### 1. Encounter a problem
> "The castle needs a door."

### 2. Learn the concept
> Express + routing.

### 3. Build it
> `/door/open`

### 4. See it working
> Door opens.

### 5. Understand why
> Request → route → handler → response.

### 6. Break it
> Incorrect route/security logic.

### 7. Fix it
> Debugging.

### 8. Later encounter it in the castle
> Smart Door.

### 9. Use knowledge offensively
> Identify the bug.

That's much stronger than simply teaching definitions.

---

## 34. FINAL EXPERIENCE FROM A PARTICIPANT'S PERSPECTIVE

They enter.

```text
NODE WARS
```

They receive a team.

---

### 0–5 min

They learn the mission.

> "Build your systems. Your knowledge will become your weapon."

---

### 5–105 min

They enter the Engineering Lab.

They build:

```text
SERVER
 ↓
SMART DOOR
 ↓
SECURITY GATE
 ↓
RESOURCE VAULT
 ↓
LIVE MONITOR
 ↓
BREAK IT
```

Their progress increases.

```text
LEVEL 01
LEVEL 02
LEVEL 03
LEVEL 04
...
```

---

### 105–115 min

Quiz.

They compete for the top five positions.

---

### 115–120 min

Top five are announced.

> **BUG ARCHITECTS**

---

### 120–130 min

Teams modify their castles.

Bug Architects secretly plant vulnerabilities.

---

### 130 min

**CASTLE RAID BEGINS.**

Teams switch castles.

---

### 130–150 min

Players explore.

```text
ENTER ROOM
 ↓
INSPECT SYSTEM
 ↓
DISCOVER BUG
 ↓
BOUNTY QUESTION
 ↓
SOLVE
 ↓
FLAG FRAGMENT
```

Eventually:

```text
MID_
DL@
EW#
AR!
```

They assemble:

```text
MID_DL@EW#AR!
```

They reach:

> 👑 KING'S ROOM

or

> 👸 QUEEN'S ROOM

They enter the exact flag.

```text
ACCESS GRANTED
```

The room opens.

---

## 35. WHAT YOU ACTUALLY NEED TO BUILD

Your project can be divided into these major components.

### A. Node.js Lab Platform

Build:

* Login
* Team assignment
* Mission system
* Code editor
* Code execution/simulation
* Test engine
* Hints
* Progress tracking
* XP
* Completion system
* Lab dashboard

---

### B. Castle Game

Build:

* Pixel-art map
* Player movement
* Collision
* Rooms
* Doors
* Structures
* Interaction system
* Bug objects
* Bounty interface
* Flag inventory
* Timer
* Score
* Royal Room

---

### C. Backend

Build:

* Node.js
* Express
* Socket.IO
* Database
* Authentication
* Authorization
* Game state
* Bug state
* Challenge validation
* Scoring
* Flag system

---

### D. Bug Architect System

Build:

* Bug creation
* Bug templates
* Difficulty
* Location
* Bounty assignment
* Fragment assignment
* Hidden status
* Placement validation

---

### E. Admin Panel

Build:

* Team management
* Player management
* Castle management
* Bug management
* Challenge management
* Game controls
* Score monitoring
* Live activity

---

### F. Physical Game

Create:

* 2 identical castles
* Building blocks
* Component markers
* Bug markers
* QR/NFC tags if desired
* Royal Rooms
* Team identifiers

---

## 36. THE COMPLETE SYSTEM

Ultimately, your architecture becomes:

```text
                         NODE WARS
                             │
              ┌──────────────┴──────────────┐
              │                             │
        ENGINEERING LAB                CASTLE GAME
              │                             │
       ┌──────┴──────┐                ┌─────┴─────┐
       │             │                │           │
    NODE.JS       SECURITY        CASTLE       BUGS
       │             │                │           │
    Express       Auth             Rooms      Bounties
    Routing       Roles            Doors      Challenges
    Middleware    Validation       Gates      Fragments
    Database      Debugging        Vault      Scoring
    Socket.IO                     Monitor
       │                             │
       └──────────────┬──────────────┘
                      │
                   DATABASE
                      │
                 NODE.JS SERVER
                      │
                  SOCKET.IO
                      │
             REAL-TIME GAME STATE
```

---

## 37. THE FINAL GAME LOOP

```text
                  ┌─────────────┐
                  │    LEARN    │
                  └──────┬──────┘
                         ↓
                  ┌─────────────┐
                  │    BUILD    │
                  └──────┬──────┘
                         ↓
                  ┌─────────────┐
                  │    TEST     │
                  └──────┬──────┘
                         ↓
                  ┌─────────────┐
                  │    QUIZ     │
                  └──────┬──────┘
                         ↓
                  ┌─────────────┐
                  │ BUG ARCHITECTS│
                  └──────┬──────┘
                         ↓
                  ┌─────────────┐
                  │ HIDE BUGS   │
                  └──────┬──────┘
                         ↓
                  ┌─────────────┐
                  │ SWITCH      │
                  │ CASTLES     │
                  └──────┬──────┘
                         ↓
                  ┌─────────────┐
                  │ HUNT BUGS   │
                  └──────┬──────┘
                         ↓
                  ┌─────────────┐
                  │ SOLVE       │
                  │ BOUNTIES    │
                  └──────┬──────┘
                         ↓
                  ┌─────────────┐
                  │ COLLECT     │
                  │ FRAGMENTS   │
                  └──────┬──────┘
                         ↓
                  ┌─────────────┐
                  │ ASSEMBLE    │
                  │ EXACT FLAG  │
                  └──────┬──────┘
                         ↓
                  ┌─────────────┐
                  │ UNLOCK      │
                  │ ROYAL ROOM  │
                  └──────┬──────┘
                         ↓
                      👑 WIN
```

---

## 38. THE ONE-LINE PITCH

> **Node Wars is a 150-minute immersive Node.js cybersecurity workshop where participants learn by building real working systems, then use that knowledge to hide and hunt vulnerabilities inside a pixel-art castle battle.**

### Shorter:

> **Learn Node.js. Build the castle. Hide the bugs. Hunt the vulnerabilities. Conquer the throne.**

### Strongest tagline:

> # **DON'T JUST LEARN NODE.JS.**
>
> **BUILD IT. BREAK IT. DEFEND IT. HUNT IT. WIN WITH IT.**

This gives you a **single coherent experience**, rather than a Node.js lab attached to a cybersecurity game. The lab, quiz, physical castle, digital castle, bug system, Node.js concepts, scoring, and final Royal Room are all parts of **one game mechanic**.
