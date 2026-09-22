# Node Wars — Teaching Guide

Split by presenter. Each section: what the mission is about, the code to walk through, what MUST be explained (quiz depends on it), and what to skip.

**Vaishnav:** Intro, Mission 01 (first half), Mission 03, Mission 04, Mission 07
**Bala:** Mission 01 (second half), Mission 02, Mission 05, Mission 06

---

## INTRO (Vaishnav)

Set the frame: students will build a small castle system, mission by mission, each one a real Node.js concept. At the end, a quiz decides who becomes a "Bug Architect," then two teams (PRINCE vs PRINCESS) hunt bugs planted in each other's castle and race to unlock the King/Queen room.

Don't teach any code yet — just the shape of the day.

---

## MISSION 01 — FIRST SERVER

**Split:** Vaishnav teaches steps 1–2 (Node runtime + http module), Bala teaches steps 3–4 (error handling + env vars).

### What it's about
Building a raw HTTP server with Node's built-in `http` module — no frameworks yet.

### Code to walk through
```js
const http = require("http");
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Server is running");
});

server.on("error", (err) => {
  if (NODE_ENV === "production") {
    console.error("Server error:", err.message);
  } else {
    console.error("Development error:", err);
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in ${NODE_ENV} mode`);
});
```

### MUST explain (Vaishnav — first half)
- **What Node.js is**: JavaScript running outside the browser
- `require("http")` — Node's module system, built-in modules don't need npm install
- `http.createServer((req, res) => {...})` — the callback runs once per incoming request
- **Ports**: a port is how the OS routes incoming traffic to this specific process
- `res.writeHead(200, {...})` then `res.end(...)` — you must always end a response or the client hangs forever

### MUST explain (Bala — second half)
- **Environment variables**: `process.env.PORT` — why hardcoding `3000` is bad (can't run two servers, can't configure per-deployment)
- `process.env.PORT || 3000` — fallback pattern, if the env var isn't set, use a default
- **Error handling**: `server.on("error", handler)` — without this, a startup failure (e.g. port already in use) crashes silently or ugly
- **Dev vs production logging**: full error detail in dev, safe generic message in production (security reason: don't leak internals to users)

### Quiz topics this covers
- What module creates a server (`http`)
- Purpose of req/res objects
- Why servers listen on ports
- `process.env.PORT` reasoning
- Dev vs prod error reporting difference
- What `NODE_ENV=production` does

### Do NOT bring up here
- Express, routing, middleware (that's Mission 02) — keep this mission about raw Node only

---

## MISSION 02 — SMART DOOR (Bala)

### What it's about
Moving from raw `http` to **Express**, and returning correct HTTP status codes.

### Code to walk through
```js
const express = require("express");
const app = express();
app.use(express.json());

app.get("/door/status", (req, res) => {
  try {
    res.status(200).json({ status: "locked", secure: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to get door status" });
  }
});

app.get("/door/open", (req, res) => {
  try {
    const password = req.query.password;
    if (password === "castle123") {
      res.status(200).json({ status: "unlocked" });
    } else {
      res.status(400).json({ error: "Invalid password" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/door/access", (req, res) => {
  try {
    const { username, action } = req.body;
    if (!username || !action) {
      return res.status(400).json({ error: "Missing username or action" });
    }
    res.status(200).json({ message: `Access granted for ${username}` });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
```

### MUST explain
- **NPM**: `express` is a package installed via `npm install`, listed in `package.json` under `dependencies` — this is different from Node's built-in modules like `http`
- `app.get()` vs `app.post()` — routes map a URL + HTTP method to a handler function
- `express.json()` middleware — parses incoming JSON bodies into `req.body` (without it, `req.body` is undefined)
- **Route parameters** vs **query params**: `req.query.password` (from `?password=x`) vs a route param like `/door/:action`
- `res.json()` — sets Content-Type automatically and serializes the object
- **Status codes to actually name out loud**: 200 (OK), 201 (Created), 400 (bad client input), 500 (server error)
- `try/catch` in every route — never let an unhandled exception crash the process

### Quiz topics this covers
- Express method for POST requests
- What `express.json()` does
- What a route parameter is (`:id`)
- Correct way to send JSON response
- `dependencies` vs `devDependencies` in package.json
- `npm install` purpose

### Do NOT bring up here
- Authentication/authorization (that's Mission 03) — this mission's password check is just basic input validation, not real auth, don't conflate the two

---

## MISSION 03 — SECURITY GATE (Vaishnav)

### What it's about
**Middleware**, and the single most important distinction in the whole workshop: **Authentication vs Authorization**.

### Code to walk through
```js
// Simulated user attached to request
app.use((req, res, next) => {
  req.user = { username: "node_hacker", role: "PLAYER" };
  next();
});

const securityGate = (req, res, next) => {
  try {
    // 1. AUTHENTICATION: "Who are you?"
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // 2. AUTHORIZATION: "Are you allowed?"
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // 3. ALLOW ACCESS
    next();
  } catch (err) {
    res.status(500).json({ error: NODE_ENV === "production" ? "Server error" : err.message });
  }
};

app.get("/vault", securityGate, (req, res) => {
  res.status(200).json({ message: "Welcome to the Resource Vault, Admin." });
});
```

### MUST explain
- **Middleware = a function that runs BEFORE the route handler.** Order matters — middleware registered first runs first.
- `next()` — calling it passes control to the next middleware/handler. **If you forget to call it, the request just hangs.**
- Returning early (`return res.status(...)`) after sending a response — otherwise code keeps running and you get a "headers already sent" crash
- **The core distinction, say this explicitly and slowly:**
  - **401 Unauthorized = we don't know who you are** (authentication failed)
  - **403 Forbidden = we know who you are, but you're not allowed** (authorization failed)
- Why middleware order matters: the auth-check middleware must run before the route handler that needs `req.user`
- `process.env.ADMIN_SECRET` pattern reinforced from Mission 01 — secrets belong in env vars, never hardcoded

### Quiz topics this covers
- Difference between 401 and 403 (this WILL be asked, drill it)
- What happens if middleware doesn't call `next()` and doesn't send a response (request hangs)
- Authentication vs Authorization definition
- Why hardcoded secrets are bad

### Do NOT bring up here
- Don't yet reveal the "missing authorization check" bug pattern — that's the whole twist of Mission 07, save it

---

## MISSION 04 — RESOURCE VAULT (Vaishnav)

### What it's about
Async **CRUD** operations (Create, Read, Update, Delete) against a simulated database, with proper `async/await` error handling.

### Code to walk through
```js
const db = {
  gold: [],
  async create(item) {
    if (!item.name) throw new Error("Item must have a name");
    this.gold.push(item);
    return item;
  },
  async find() { return this.gold; },
  async update(id, data) { ... },
  async delete(id) { ... }
};

app.post("/vault/gold", async (req, res) => {
  try {
    const { name, amount } = req.body;
    if (!name || !amount) {
      return res.status(400).json({ error: "Name and amount are required" });
    }
    const result = await db.create({ name, amount });
    res.status(201).json(result);
  } catch (err) {
    console.error("Create error:", err.message);
    res.status(500).json({ error: "Failed to create resource" });
  }
});
```

### MUST explain
- **CRUD** = Create, Read, Update, Delete — the four things almost every API does
- Why database calls are `async` — Node is single-threaded; blocking on a slow DB query would freeze the whole server for everyone
- `await` — pauses THIS function until the promise resolves, but doesn't block other requests
- `async function` + `try/catch` is how you catch errors from `await` calls — this is the standard pattern, not `.then()/.catch()`
- **Status code mapping** (name these explicitly): 201 = created, 200 = success/read, 204 = deleted with no body, 400 = bad input, 500 = server-side failure
- Validate input BEFORE calling the database — fail fast with 400 rather than letting a bad value blow up later

### Quiz topics this covers
- What CRUD stands for
- HTTP method mapped to "Update" (PUT)
- Why DB operations are async (single-threaded event loop)
- How to handle errors in async/await (try/catch)

### Do NOT bring up here
- Real Promises/`.then()` chaining mechanics — save the deep dive for Mission 05, here just use async/await as a tool

---

## MISSION 05 — ASYNC OPERATIONS (Bala)

### What it's about
Promises themselves — states, chaining, and what actually happens under the hood when you `await`.

### Code to walk through
```js
function authenticatePower() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.8) reject(new Error("Authentication failed"));
      else resolve("AUTH_OK");
    }, 300);
  });
}

async function startGrid() {
  try {
    const auth = await authenticatePower();
    const resources = await loadResources();
    const systems = await activateSystems();
    return { status: "success" };
  } catch (error) {
    return { status: "failed", reason: error.message };
  }
}
```

### MUST explain
- **A Promise has exactly 3 states**: pending, resolved (fulfilled), rejected — say all three, quiz asks this directly
- `resolve()` vs `reject()` — resolve = success value, reject = error
- `await` pauses the async function specifically, NOT the whole program — the event loop keeps handling other requests
- If any `await` in a `try` block rejects, execution jumps straight to `catch` — later awaits in that block never run
- **Sequential vs parallel**: this code runs 3 awaits back to back (sequential, ~900ms total). Contrast conceptually with `Promise.all([...])` running things concurrently (bounded by the SLOWEST one, not the sum) — mention this even though it's not in the starter code, it's a quiz question
- Unhandled promise rejections crash the Node process — this is why try/catch (or `.catch()`) isn't optional

### Quiz topics this covers
- The 3 Promise states
- What `await` actually pauses
- What happens with `Promise.all([funcA(), funcB()])` timing (bounded by slowest)
- Consequence of an unhandled rejection

### Do NOT bring up here
- Don't re-teach CRUD/database specifics — this mission is about the async mechanism itself, keep it abstract

---

## MISSION 06 — LIVE SECURITY MONITOR (Bala)

### What it's about
Event-driven architecture: Node's `EventEmitter`, and Socket.IO for real-time broadcasting to connected clients.

### Code to walk through
```js
const EventEmitter = require("events");
const gameEventBus = new EventEmitter();

gameEventBus.on("error", (err) => console.error("EventBus error:", err.message));

gameEventBus.on("PLAYER_ENTERED", (eventData) => {
  try {
    if (!eventData.playerId || !eventData.teamId) {
      throw new Error("Missing required event fields");
    }
    // io.to(room).emit("game_event", eventData);
  } catch (err) {
    console.error("Error handling PLAYER_ENTERED:", err.message);
  }
});

function setupSocket(io) {
  io.on("connection", (socket) => {
    socket.join("team:" + teamId);
    socket.on("disconnect", () => { ... });
  });
}

gameEventBus.emit("PLAYER_ENTERED", { playerId: "demo_player", teamId: "TEAM_OMEGA" });
```

### MUST explain
- **The observer pattern**: `.on("eventName", handler)` registers a listener, `.emit("eventName", data)` triggers it — this is the whole EventEmitter model, say it plainly
- Events **decouple** systems — the code emitting an event doesn't need to know who's listening or what they do with it
- **Socket.IO vs REST**: REST is request/response (client asks, server answers once); Socket.IO keeps a persistent connection open for real-time, bidirectional push — server can send data without the client asking first
- **Rooms**: `socket.join("team:" + teamId)` — lets you broadcast to a subset of connected clients instead of everyone
- Always register an `"error"` listener on an EventEmitter — otherwise an emitted error event with no listener crashes the process
- Validate event payloads inside the listener — an event is just data, nothing guarantees its shape

### Quiz topics this covers
- Purpose of EventEmitter (event-driven / observer pattern)
- How to trigger an event (`.emit()`)
- What a Socket.IO "room" is
- Socket.IO vs REST API difference

### Do NOT bring up here
- Don't get into the actual game's Socket.IO event names (PLAYER_MOVED, BUG_DISCOVERED etc.) — those are implementation detail for the castle game, not the teaching point here

---

## MISSION 07 — BREAK IT (Vaishnav)

### What it's about
The payoff mission. Students are handed CODE THAT LOOKS LIKE Mission 03's securityGate, but with the authorization check silently missing. They have to find and fix it.

### Code to walk through (the BUGGY version students start with)
```js
app.use((req, res, next) => {
  req.user = { username: "node_hacker", role: "PLAYER" };
  next();
});

const securityGate = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // BUG: The authorization check is missing!
    // if (req.user.role !== "ADMIN") {
    //   return res.status(403).json({ error: "Insufficient permissions" });
    // }

    next();
  } catch (err) { ... }
};

app.get("/admin", securityGate, (req, res) => {
  res.status(200).json({ secret: "FLAG", user: req.user });
});
```

**The fix** (uncomment/add the role check):
```js
if (req.user.role !== "ADMIN") {
  return res.status(403).json({ error: "Insufficient permissions" });
}
```

### MUST explain
- Walk through the request flow OUT LOUD: a `PLAYER` hits `/admin` → passes the `req.user` exists check (authenticated) → `next()` is called with no role check → reaches the route handler → gets the secret. **The bug is that authentication ran, but authorization never did.**
- This is a real, named vulnerability class: **Broken Access Control** (OWASP-style terminology, worth naming)
- Client-side hiding (e.g. hiding an admin button in the UI with CSS) is NOT security — anyone can call the API directly with curl/Postman, bypassing the UI entirely. Say this explicitly, it's a common misconception and a quiz question.
- How to test the fix properly: try as PLAYER (expect 403), try as ADMIN (expect 200), try with no user at all (expect 401) — testing all three cases, not just the happy path

### Quiz topics this covers
- What flaw let PLAYER reach the ADMIN route (authorization check missing, not authentication)
- Definition of Broken Access Control
- Why hiding UI elements isn't real security
- What happens to the next handler if middleware doesn't call `next()`

### Do NOT bring up here
- Don't introduce new syntax/concepts — this mission is pure application of Missions 01–06, keep the focus on the debugging process itself, not new material

---

## Quick Reference: Who Teaches What

| Mission | Presenter | Core Topic |
|---|---|---|
| Intro | Vaishnav | Workshop overview |
| 01 (1st half) | Vaishnav | Node runtime, http server, ports |
| 01 (2nd half) | Bala | Env vars, error handling |
| 02 | Bala | Express, routing, status codes, NPM |
| 03 | Vaishnav | Middleware, 401 vs 403 |
| 04 | Vaishnav | CRUD, async/await, DB patterns |
| 05 | Bala | Promises, event loop |
| 06 | Bala | EventEmitter, Socket.IO |
| 07 | Vaishnav | Broken Access Control (applied) |

After Mission 07 → Quiz → Reveal Scores → Bug Placement → Hunt → Royal Room (see `FULL_WORKSHOP_FLOW.md` for that part).
