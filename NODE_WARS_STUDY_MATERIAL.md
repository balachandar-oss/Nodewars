# Node Wars — Lab Study Material

You are building a real multiplayer game server from scratch, one piece at a time. Each mission you solve is the next working part of the game going live — by the end of Mission 04, everything you built is running as one connected system. Same order, same content, same code as the actual lab: Briefing → Lesson → Build the piece → Hands-on Challenge → Debrief, for all 4 missions.

---

## Mission 01: Build the game server core (NODE CORE)
**PART 1 — LAY THE FOUNDATION**

### 1. Briefing
- **Where you're starting:** Your game has no working core yet — two parts of it can't talk to each other.
- **Objective:** Build the connection between them using Node's module system.
- **How it fits the bigger picture:** Modules are the foundation every other part of your game server will be built on.
- **You will learn:**
  1. Understand what a Node.js module is
  2. Understand why modules exist
  3. Import Node.js modules using require()

### 2. Lesson

**What you're building:** The first working piece of your game server — two files that need to share data. One holds a game object, the other needs to use it. You'll connect them using Node's module system.

**What you'll learn:**
1. Understand what a Node.js module is
2. Understand why modules exist
3. Import Node.js modules using require()
4. Understand module.exports and custom modules

#### Concept 1: Node.js Runtime & Modules
Node.js allows you to run JavaScript outside the browser. To organize code, Node uses Modules. A module is a reusable piece of JavaScript functionality. Modules exist so you don't have to keep all your game's code in one giant file.

**Key takeaway:** Modules keep your game server's code organized and reusable.

#### Concept 2: Custom Modules & module.exports
You can create your own custom local modules. By assigning functionality to `module.exports`, you allow other files to require() it. This is how the different parts of your game server will talk to each other.

**Tiny example:**
```js
// gate.js
module.exports = {
  status: "locked"
};

// server.js
const gate = require("./gate");
console.log(gate.status);
```

**How the pieces connect:** server.js → require("./gate") → gate.js → module.exports

**Code walkthrough:**
- Step 1: `module.exports = { ... }` — Exposes the gate object from gate.js.
- Step 2: `require("./gate")` — Loads your custom module from the local file system.

**Key takeaway:** module.exports exposes functionality; require() imports it.

### 3. What's broken in your build
- **Component:** OUTER GATE
- **Symptom:** This piece of your game can't be created.
- **Objective:** Trace the module import/export connection and fix it.

### 4. Hands-on Challenge
**Build this:** Connect the Lever object to the Gate so your game core comes online.

**Requirements:**
- Export the Lever object from lever.js.
- Require the lever module inside gate.js.

**Success condition:** The Gate successfully imports the Lever and reads its state.

**Starter code:**
```js
const lever = { state: "pulled" };

// TODO 1: export the lever


// --- In gate.js ---
// TODO 2: require the lever
// const lever = ...
```

**Hints (revealed progressively):**
1. CONCEPT: Files in Node.js cannot automatically see variables in other files. They must be exported and required.
2. DIRECTION: You need to expose the Lever object so other files can use it.
3. PARTIAL SOLUTION: In lever.js, use `module.exports = lever;`. In gate.js, use `const lever = require("./lever");`.
4. STRONG GUIDANCE: Check that the path in require() is correct, e.g., require("./lever").

### 5. Debrief
- **Status:** Your game core is online and its modules are communicating. (NODE CORE ONLINE)
- **What's next:** The core works, but your game doesn't have any real capabilities yet.
- **Next build:** NPM SUPPLY
- **What you built:** The foundation of your game server, using the Node.js module system.
- **Why it matters:** require() and module.exports are how you'll wire together every other feature you build from here.

**Concept check:**
1. Which of the following allows a file to expose its variables to other files?
   - import.all / **module.exports** / global.share / require.expose
   - *module.exports is the CommonJS mechanism for exporting functionality from a module.*
2. How do you bring an exported module into your current file?
   - include() / load() / **require()** / fetch()
   - *require() is the Node.js function used to load modules.*

---

## Mission 02: Add a real capability to your game (NPM SUPPLY)
**PART 2 — PLUG IN A REAL PACKAGE**

### 1. Briefing
- **Where you're starting:** Your game core is alive, but it's missing a capability you don't want to build from scratch.
- **Objective:** Pull in that capability using NPM instead of writing it yourself.
- **How it fits the bigger picture:** Real games are built on other people's published code — you're about to use the same system every production app uses.
- **You will learn:**
  1. Understand NPM and package.json
  2. Differentiate between dependencies and devDependencies
  3. Install external packages using npm install

### 2. Lesson

**What you're building:** The next piece of your game needs a capability that isn't built into Node.js. Instead of writing it from scratch, you'll pull in a real published package with NPM (Node Package Manager) — exactly how real games add features fast.

**What you'll learn:**
1. Understand NPM and package.json
2. Differentiate between dependencies and devDependencies
3. Install external packages using npm install

#### Concept 1: Module vs Package vs Dependency
MODULE: reusable JavaScript functionality.
PACKAGE: distributable piece of software published by someone else.
NPM DEPENDENCY: package declared as a project dependency in package.json.

**How the pieces connect:** package.json → dependencies → capability-package → node_modules

**Key takeaway:** NPM manages external packages; Node runs the code.

#### Concept 2: NPM & package.json
NPM is the package manager. `package.json` declares the packages your game needs. `npm install` downloads them into `node_modules`.

**Tiny example:**
```
npm install chalk
```

**How the pieces connect:** YOUR GAME → package.json → npm install → node_modules → EXTERNAL CAPABILITY

**Code walkthrough:**
- Step 1: `package.json` — Declares what your project needs.
- Step 2: `npm install` — Downloads the packages into node_modules.

**Key takeaway:** NPM saves you from reinventing the wheel.

### 3. What's broken in your build
- **Component:** ROYAL KEY
- **Symptom:** This piece of your game needs a dependency that isn't available.
- **Objective:** Restore the missing package capability.

### 4. Hands-on Challenge
**Build this:** Wire the missing capability into your game by fixing the package dependency.

**Requirements:**
- Identify the missing package from the error message.
- Add the missing package dependency.

**Success condition:** Your game successfully uses the external capability without throwing an error.

**Starter code:**
```js
// TODO: require the missing capability package that you installed via NPM
// const capability = require("...");

console.log("Capability loaded!");
```

**Hints (revealed progressively):**
1. CONCEPT: Real applications depend on code written by others, distributed as packages.
2. DIRECTION: If a module is not found, you might need to install it.
3. PARTIAL SOLUTION: Look at the require() statement that is failing. That is the name of the package you need.
4. STRONG GUIDANCE: In your code, you need to `npm install` the missing package, or add it to package.json dependencies.

### 5. Debrief
- **Status:** Your game is now running on a real external package. (CAPABILITY SUPPLIED)
- **What's next:** The pieces you've built exist, but they don't talk to each other in real time yet.
- **Next build:** EVENT SYSTEM
- **What you built:** A real third-party capability, wired into your game.
- **Why it matters:** NPM resolves the missing dependency and downloads it to node_modules so require() can find it — this is how you'll add every major feature going forward.

**Concept check:**
1. What does package.json primarily contain?
   - HTML markup / **Project metadata, scripts, and dependencies** / HTTP response data / Database records
   - *package.json manages project configuration and dependencies for NPM.*
2. What happens when you run `npm install`?
   - It compiles the code. / **It downloads the packages listed in package.json into node_modules.** / It starts the Node.js server. / It creates a new module.
   - *npm install reads package.json and downloads all required packages.*

---

## Mission 03: Make your game respond in real time (EVENT SYSTEM)
**PART 3 — WIRE UP LIVE GAMEPLAY**

### 1. Briefing
- **Where you're starting:** The pieces of your game are built, but they're isolated — nothing reacts to anything yet.
- **Objective:** Connect them with real-time events, the same mechanism that will power live multiplayer gameplay.
- **How it fits the bigger picture:** This is the exact pattern behind the live multiplayer castle game you'll see running right after this mission.
- **You will learn:**
  1. Explain what an event is and event-driven programming
  2. Understand Node.js EventEmitter, emit(), and on()
  3. Understand why event-driven architecture reduces coupling

### 2. Lesson

**What you're building:** A live reaction system for your game — one part triggers an action, another part responds instantly, with nothing sitting around asking "did anything happen yet?" You'll build this with Node's Event system.

**What you'll learn:**
1. Explain what an event is and event-driven programming
2. Understand Node.js EventEmitter, emit(), and on()
3. Understand why event-driven architecture reduces coupling

#### Concept 1: What is an event?
An event represents something that happened in your game (e.g., a lever pulled). Emitting an event announces it occurred; listeners can then react instantly.

**Tiny example:**
```
// 1. Something happens in the game
// 2. Event is emitted
// 3. Listener reacts
```

**How the pieces connect:** LEVER PULLED → EVENT EMITTED → GATE LISTENS → GATE OPENS

**Code walkthrough:**
- Step 1: `Event is emitted` — An announcement that a specific action occurred.
- Step 2: `Listener reacts` — Code that executes in response to the event.

**Key takeaway:** An event represents something that happened; listeners define what your game should do in response.

#### Concept 2: EventEmitter — emit() and on()
`emit()` triggers an event. `on()` registers a listener. The event names must match exactly.

**Tiny example:**
```js
const EventEmitter = require("events");
const game = new EventEmitter();

game.on("lever_pulled", () => {
  console.log("Gate opening!");
});

game.emit("lever_pulled");
```

**Code walkthrough:**
- Step 1: `game.on("lever_pulled", ...)` — Registers a listener for the event.
- Step 2: `game.emit("lever_pulled")` — Triggers the event, causing the handler to run.

**Key takeaway:** emit() announces the event; on() reacts to it — this exact mechanism (wired to real sockets) is what powers live multiplayer.

### 3. What's broken in your build
- **Component:** INNER GATE
- **Symptom:** The lever activates, but nothing responds.
- **Objective:** Repair the event connection.

### 4. Hands-on Challenge
**Build this:** Wire the Lever and the Gate together so your game reacts live.

**Requirements:**
- Ensure the Lever emits the correct event name.
- Ensure the Gate listens for the correct event name.

**Success condition:** When the lever is pulled, the gate reacts successfully.

**Starter code:**
```js
const EventEmitter = require("events");
const castle = new EventEmitter();

// TODO 1: listen for "lever_pulled"


// TODO 2: emit "lever_pulled"
```

**Hints (revealed progressively):**
1. CONCEPT: Events must have matching names. If I shout "Hello", you must be listening for "Hello".
2. DIRECTION: Check the event name being emitted by the Lever. Is it the exact same string the Gate is listening for?
3. PARTIAL SOLUTION: Make sure both `emit("lever_pulled")` and `on("lever_pulled")` use the exact same string.
4. STRONG GUIDANCE: Fix the typo in the event name so that the `.emit()` and `.on()` match perfectly.

### 5. Debrief
- **Status:** Your game's pieces are now communicating live. (CIRCUIT REPAIRED)
- **What's next:** Your game works on your machine, but nobody outside it can reach it yet.
- **Next build:** SIGNAL TOWER
- **What you built:** Real-time, event-driven communication between two parts of your game.
- **Why it matters:** The Lever doesn't need to know the Gate exists; it just emits the event. The Gate listens independently. This is exactly how you'll wire up multiplayer without every part of your game needing to know about every other part.

**Concept check:**
1. What is the primary purpose of emit()?
   - To register a function to be called later. / **To trigger an event and announce that something happened.** / To load an NPM module into the application.
   - *emit() announces the event, causing any registered listeners to run.*
2. What is the primary purpose of on()?
   - To trigger an event. / **To register a listener function that reacts to an event.** / To install an external dependency.
   - *on() registers a handler function that will be executed whenever the specified event is emitted.*

---

## Mission 04: Ship your game to the world (SIGNAL TOWER)
**PART 4 — GO LIVE**

### 1. Briefing
- **Where you're starting:** Your game runs perfectly on your own machine — and nowhere else.
- **Objective:** Configure it so a hosting platform can run it and the whole world can play.
- **How it fits the bigger picture:** This is the final step that turns everything you built into something real people can actually play.
- **You will learn:**
  1. Understand deployment and hosting
  2. Understand environment variables like process.env.PORT
  3. Understand package.json start scripts

### 2. Lesson

**What you're building:** The last piece — taking your finished game and putting it online so it stays running 24/7 and anyone can reach it, by fixing its deployment configuration.

**What you'll learn:**
1. Understand deployment and hosting
2. Understand environment variables like process.env.PORT
3. Understand package.json start scripts

#### Concept 1: Deployment & Hosting
Deployment means putting your game on a computer (host) that stays on 24/7 so anyone can play it. Hosting platforms automatically run your code, but you must configure it correctly.

**Key takeaway:** Deployment takes your local game and makes it public.

#### Concept 2: process.env.PORT
When hosting platforms run your game, they assign it a random PORT via an environment variable. If you hardcode your port (e.g., 3000), the platform cannot route players' traffic to it.

**Tiny example:**
```js
const PORT = process.env.PORT || 3000;
server.listen(PORT);
```

**How the pieces connect:** HOST PROVIDES PORT → process.env.PORT → SERVER LISTENS

**Code walkthrough:**
- Step 1: `process.env.PORT` — Reads the port assigned by the hosting provider.
- Step 2: `|| 3000` — Provides a fallback for local development.

**Key takeaway:** Always use process.env.PORT in deployment.

#### Concept 3: Start Script
Hosting platforms don't magically know how to start your game. They usually run `npm start`. You must define this script in your `package.json`.

**Tiny example:**
```json
"scripts": {
  "start": "node server.js"
}
```

**Key takeaway:** The start script tells the host how to launch your game.

### 3. What's broken in your build
- **Component:** SIGNAL TOWER
- **Symptom:** Your game can't become publicly reachable.
- **Objective:** Repair the deployment configuration.

### 4. Hands-on Challenge
**Build this:** Fix the configuration so your finished game can go live.

**Requirements:**
- Ensure the server listens on `process.env.PORT`.
- Ensure the `start` script is correctly defined.

**Success condition:** The deployment simulator successfully starts and connects to your application.

**Starter code:**
```js
const http = require("http");

// TODO 1: use process.env.PORT with a fallback to 3000
const PORT = 3000;

const server = http.createServer((req, res) => {
  res.end("Castle is online");
});

server.listen(PORT, () => console.log(`Listening on ${PORT}`));
```

**Hints (revealed progressively):**
1. CONCEPT: Hosting platforms assign their own ports dynamically using environment variables.
2. DIRECTION: Look at the server code. Is it listening on a hardcoded port, or is it reading from `process.env`?
3. PARTIAL SOLUTION: Change `const PORT = 3000;` to `const PORT = process.env.PORT || 3000;`
4. STRONG GUIDANCE: Also check the `package.json` simulation. The start script needs to run your server file using Node.

### 5. Debrief
- **Status:** Your game is live and broadcasting to the world. (CASTLE ONLINE)
- **What's next:** THE SYSTEM WILL NOW BE TESTED.
- **Next phase:** SHOWCASE
- **What you built:** A finished game, correctly configured for a real cloud deployment.
- **Why it matters:** By reading the dynamic port and providing a standardized start script, any hosting provider can automatically run and route traffic to the game you built.

**Concept check:**
1. Why should a server read its port from process.env.PORT instead of hardcoding 3000?
   - Hardcoded ports run faster. / **Hosting platforms assign their own port at runtime, and your app must listen on whatever they give it.** / It is required by JavaScript syntax.
   - *If your app ignores the assigned PORT and only listens on 3000, the host cannot route traffic to it.*
2. What does the "start" script in package.json do?
   - **It tells hosting platforms (and `npm start`) the exact command to launch your app.** / It lists your project's dependencies. / It compiles the code.
   - *Hosting platforms run `npm start` automatically, which executes whatever command is defined under scripts.start.*

---

## After Mission 04: See your game come alive
Students see a 4-stage animation ("The System Awakens") showing everything they built — MODULES → NPM → EVENTS → DEPLOYMENT — connecting into one running game, then move into the quiz to see whose team built it best.
