# NODE WARS - STUDY MATERIAL & EXAM GUIDE

## Overview
Node Wars is a 150-minute immersive Node.js + Cybersecurity workshop. Participants learn by building 7 systems, then use that knowledge to hunt bugs in a castle game.

---

## MISSION 01: FIRST SERVER

### Concepts
- **Node.js Runtime**: JavaScript execution outside browser
- **HTTP Module**: Built-in module for server creation
- **Request/Response Cycle**: How HTTP works
- **Ports & Sockets**: Communication endpoints (port 3000)
- **Server Lifecycle**: Starting and listening

### Code Pattern
```javascript
const http = require("http");
const server = http.createServer((req, res) => {
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end("System Online");
});
server.listen(3000);
```

### Key Takeaway
> A server is a process listening on a port, waiting for requests, and sending responses.

**Castle Component:** 💻 TERMINAL (entry point for players)

---

## MISSION 02: SMART DOOR

### Concepts
- **Express.js**: Web framework (faster than raw HTTP)
- **Routing**: URL patterns → handlers
- **HTTP Methods**: GET (retrieve), POST (create), PUT (update), DELETE (remove)
- **JSON**: Data format for APIs
- **Route Parameters**: Dynamic URLs (`/door/:action`)

### Code Pattern
```javascript
const express = require("express");
const app = express();
app.use(express.json()); // Parse JSON bodies

app.get("/door/status", (req, res) => {
  res.json({ status: "locked" });
});

app.post("/door/access", (req, res) => {
  res.json({ message: "Access granted" });
});

app.listen(3001);
```

### Key Takeaway
> Express routes map URL paths to functions. Each route handles specific HTTP methods.

**Castle Component:** 🚪 SMART DOOR (interactive)

---

## MISSION 03: SECURITY GATE

### Concepts
- **Middleware**: Functions that run before route handlers
- **Request Pipeline**: Request → Middleware → Route → Response
- **Authentication**: Who are you? (verify identity)
- **Authorization**: Are you allowed? (check permissions)
- **HTTP Status Codes**:
  - `401 Unauthorized`: Missing/invalid identity
  - `403 Forbidden`: Authenticated but not allowed
  - `200 OK`: Success

### Code Pattern
```javascript
const securityGate = (req, res, next) => {
  // 1. AUTHENTICATION: Check if user exists
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  // 2. AUTHORIZATION: Check if user is ADMIN
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  
  // 3. Allow access
  next();
};

app.get("/admin", securityGate, (req, res) => {
  res.json({ secret: "FLAG" });
});
```

### Key Takeaway
> Middleware intercepts requests. Call `next()` to pass to next handler. Return early to block access.

**Castle Component:** 🛡️ SECURITY GATE (access control)

---

## MISSION 04: RESOURCE VAULT

### Concepts
- **Database**: Persistent data storage
- **Prisma ORM**: Object-Relational Mapping (models instead of SQL)
- **CRUD Operations**:
  - **Create**: Add new data (`INSERT`)
  - **Read**: Fetch data (`SELECT`)
  - **Update**: Modify data (`UPDATE`)
  - **Delete**: Remove data (`DELETE`)
- **Async Database Calls**: Queries are non-blocking (use `await`)

### Code Pattern
```javascript
// Define model in schema.prisma
model Resource {
  id String @id @default(cuid())
  name String
  quantity Int
}

// Use in routes
app.post("/vault/gold", async (req, res) => {
  try {
    const resource = await prisma.resource.create({
      data: { name: "Gold", quantity: 100 }
    });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: "DB Error" });
  }
});
```

### Key Takeaway
> Databases store data reliably. Use models instead of raw SQL. Always use `await` for queries.

**Castle Component:** 📦 RESOURCE VAULT (inventory)

---

## MISSION 05: ASYNC OPERATIONS

### Concepts
- **Synchronous**: Code runs line-by-line, blocking
- **Asynchronous**: Code can start, pause, and resume
- **Promises**: Objects representing future values
  - `pending`: Waiting
  - `resolved`: Success
  - `rejected`: Error
- **async/await**: Cleaner syntax for Promises
- **Event Loop**: Node.js handles multiple operations without blocking

### Code Pattern
```javascript
// Promise-based
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve("Data"), 1000);
  });
}

// async/await (preferred)
async function startGrid() {
  try {
    const auth = await authenticatePower();    // Wait 1
    const resources = await loadResources();   // Wait 2
    const systems = await activateSystems();   // Wait 3
    console.log("Power Grid Online!");
  } catch (error) {
    console.error("Startup failed", error);
  }
}

startGrid();
```

### Key Takeaway
> `await` pauses the function until Promise resolves. Wrap in `try/catch` for errors. Event loop keeps other requests running.

**Castle Component:** ⚙️ Powers all async operations

---

## MISSION 06: LIVE SECURITY MONITOR

### Concepts
- **EventEmitter**: Publish-subscribe pattern
- **Events**: Named messages (`"PLAYER_ENTERED"`, `"DOOR_OPENED"`)
- **Listeners**: Functions that run when event fires (`.on()`)
- **Emitters**: Fire events (`.emit()`)
- **Socket.IO**: Real-time WebSocket communication
- **Rooms**: Broadcast to a subset of clients (team rooms)

### Code Pattern
```javascript
const EventEmitter = require("events");
const gameEventBus = new EventEmitter();

// 1. Listen for events
gameEventBus.on("PLAYER_ENTERED", (data) => {
  console.log("Player:", data.playerId);
  // Broadcast to team via Socket.IO
  io.to(`team:${data.teamId}`).emit("game_event", data);
});

// 2. Emit events
gameEventBus.emit("PLAYER_ENTERED", {
  playerId: "player-123",
  teamId: "TEAM_OMEGA"
});

// 3. Socket.IO connection
io.on("connection", (socket) => {
  socket.join(`team:${socket.data.teamId}`);
  socket.on("bug_found", (data) => {
    io.to(`team:${socket.data.teamId}`).emit("bug_discovered", data);
  });
});
```

### Key Takeaway
> Events decouple systems. `.emit()` to broadcast, `.on()` to listen. Socket.IO sends real-time updates to all connected players.

**Castle Component:** 📡 LIVE SECURITY MONITOR (real-time events)

---

## MISSION 07: BREAK IT

### Concepts
- **Debugging**: Finding and fixing bugs
- **Security Vulnerabilities**: Flaws in authorization/authentication
- **Authorization Bypass**: Accessing restricted resources without permission
- **Common Flaws**:
  - Missing auth check (no role verification)
  - Incorrect HTTP status (returning 200 instead of 403)
  - Logic errors (wrong condition in middleware)
- **Testing**: Verify both success and failure cases

### Vulnerable Pattern
```javascript
// BUGGY: Missing authorization check
const securityGate = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // BUG: Never checks if ADMIN!
  next(); // All authenticated users pass!
};

// FIXED: Add role check
if (req.user.role !== "ADMIN") {
  return res.status(403).json({ error: "Forbidden" });
}
next(); // Only ADMIN passes
```

### Key Takeaway
> Authentication (who are you?) is different from Authorization (are you allowed?). Always verify BOTH.

**Castle Component:** 🐛 BUG HUNTING (finding vulnerabilities)

---

## QUICK REFERENCE TABLE

| Mission | Concept | HTTP Method | Example |
|---------|---------|------------|---------|
| 01 | HTTP Server | - | `http.createServer()` |
| 02 | Express Routes | GET, POST | `app.get("/door", ...)` |
| 03 | Middleware | - | `app.use(securityGate)` |
| 04 | Database CRUD | GET, POST, PUT, DELETE | `prisma.resource.create()` |
| 05 | Async/Await | - | `await fetchData()` |
| 06 | Events/Sockets | - | `io.emit("event", data)` |
| 07 | Security | - | `401` vs `403` status codes |

---

## CASTLE GAME FLOW

### Phase 1: Lab (Missions)
```
Mission 01 → Server built → TERMINAL unlocked
Mission 02 → Routes built → DOOR unlocked
Mission 03 → Middleware built → GATE unlocked
Mission 04 → Database built → VAULT unlocked
Mission 05 → Async mastered → Powers all systems
Mission 06 → Events built → MONITOR unlocked
Mission 07 → Bug found → Security mindset earned
```

### Phase 2: Quiz (10 min)
```
27 questions on all 7 missions
Top 5 from each team → BUG ARCHITECTS
```

### Phase 3: Castle Raid (20 min)
```
Teams switch castles
Find hidden bugs → Answer bounties → Collect flags
Unlock Royal Room with exact flag
```

---

## EXAM TIPS

### What You MUST Know
1. **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (delete)
2. **Status Codes**: 200 (OK), 201 (Created), 401 (Unauth), 403 (Forbidden), 500 (Server Error)
3. **Middleware Flow**: Request → Middleware → Route → Response
4. **Auth vs Authz**: Authentication = identity, Authorization = permissions
5. **Async**: `await` waits for Promise, `try/catch` handles errors
6. **Events**: `.emit()` to fire, `.on()` to listen
7. **CRUD**: Create, Read, Update, Delete operations

### Common Mistakes to Avoid
- ❌ Forgetting `next()` in middleware (request hangs)
- ❌ Returning 200 instead of 401/403 (wrong status)
- ❌ Not using `await` with async operations (returns Promise, not value)
- ❌ Checking role after returning early (logic error)
- ❌ Hardcoding secrets in code (security flaw)

### Questions You'll See
- "What middleware runs before route handlers?"
- "Why use 403 instead of 401?"
- "How does `await` differ from `.then()`?"
- "What does `next()` do in middleware?"
- "How do events decouple systems?"

---

## FINAL CHECKLIST

Before the exam, make sure you can answer:
- ✅ What is HTTP and how do requests/responses work?
- ✅ What does Express routing do?
- ✅ How does middleware intercept requests?
- ✅ What's the difference between authentication and authorization?
- ✅ Why use databases instead of files?
- ✅ How does async/await work?
- ✅ What's the difference between events and APIs?
- ✅ What are the common authorization vulnerabilities?

---

## RESOURCES

**During Workshop:**
- Built systems displayed in castle (Terminal, Door, Gate, Vault, Monitor)
- Bounty questions test understanding of each mission
- Flag fragments reveal deeper security concepts

**After Workshop:**
- Royal Room challenge: Assemble final flag from collected fragments
- Leaderboard: See how your team scored

---

**Good luck! Knowledge → Power → Victory in Node Wars! 🎮**
