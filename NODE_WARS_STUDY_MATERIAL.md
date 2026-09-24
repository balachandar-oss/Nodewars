# Node Wars — Lab Study Material

Exact content shown to students, in the exact order they see it: Briefing → Lesson → Bug Hunt → Code Challenge → Debrief, for all 4 missions in order.

---

## Mission 01: NODE CORE
**ACT I — AWAKEN**

### 1. Briefing
- **Current status:** The castle's Node core is offline.
- **Objective:** Repair the core by linking the broken modules.
- **How it connects:** Modules are the fundamental building blocks of the entire castle infrastructure.
- **You will learn:**
  1. Understand what a Node.js module is
  2. Understand why modules exist
  3. Import Node.js modules using require()

### 2. Lesson

**What's happening:** The castle's core is broken. A critical element is offline due to a missing connection. We must establish the connection using Node's module system.

**What you'll learn:**
1. Understand what a Node.js module is
2. Understand why modules exist
3. Import Node.js modules using require()
4. Understand module.exports and custom modules

#### Concept 1: Node.js Runtime & Modules
Node.js allows you to run JavaScript outside the browser. To organize code, Node uses Modules. A module is a reusable piece of JavaScript functionality. Modules exist so you don't have to keep all your code in one giant file.

**Key takeaway:** Modules keep backend code organized and reusable.

#### Concept 2: Custom Modules & module.exports
You can create your own custom local modules. By assigning functionality to `module.exports`, you allow other files to require() it. This is how different parts of our castle communicate.

**Tiny example:**
```js
// gate.js
module.exports = {
  status: "locked"
};

// castle.js
const gate = require("./gate");
console.log(gate.status);
```

**Castle relationship:** castle.js → require("./gate") → gate.js → module.exports

**Code walkthrough:**
- Step 1: `module.exports = { ... }` — Exposes the gate object from gate.js.
- Step 2: `require("./gate")` — Loads your custom module from the local file system.

**Key takeaway:** module.exports exposes functionality; require() imports it.

### 3. Bug Hunt
- **Target:** OUTER GATE
- **Symptom:** Castle element cannot be created.
- **Objective:** Trace the module/import/export connection.

### 4. Code Challenge
**Mission objective:** Repair the broken castle core by connecting the Lever to the Gate.

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
- **Status:** The castle modules are communicating. (NODE CORE ONLINE)
- **What's next:** The core is awake, but it lacks advanced capabilities.
- **Next objective:** NEXT SYSTEM: NPM SUPPLY
- **What you built:** You reconnected the castle elements using the Node.js module system.
- **Why it matters:** require() and module.exports allow separate JavaScript files to share functionality safely.

**Concept check:**
1. Which of the following allows a file to expose its variables to other files?
   - import.all / **module.exports** / global.share / require.expose
   - *module.exports is the CommonJS mechanism for exporting functionality from a module.*
2. How do you bring an exported module into your current file?
   - include() / load() / **require()** / fetch()
   - *require() is the Node.js function used to load modules.*

---

## Mission 02: NPM SUPPLY
**ACT II — SUPPLY**

### 1. Briefing
- **Current status:** The core is alive, but a critical component is missing external dependencies.
- **Objective:** Supply the missing capability through NPM.
- **How it connects:** The modules we built now rely on external capabilities to function fully.
- **You will learn:**
  1. Understand NPM and package.json
  2. Differentiate between dependencies and devDependencies
  3. Install external packages using npm install

### 2. Lesson

**What's happening:** The castle needs a specific capability to function, but we do not have the code for it. We must supply the missing capability using NPM (Node Package Manager).

**What you'll learn:**
1. Understand NPM and package.json
2. Differentiate between dependencies and devDependencies
3. Install external packages using npm install

#### Concept 1: Module vs Package vs Dependency
MODULE: reusable JavaScript functionality.
PACKAGE: distributable piece of software published by someone else.
NPM DEPENDENCY: package declared as a project dependency in package.json.

**Castle relationship:** package.json → dependencies → capability-package → node_modules

**Key takeaway:** NPM manages external packages; Node runs the code.

#### Concept 2: NPM & package.json
NPM is the package manager. `package.json` declares the packages your castle needs. `npm install` downloads them into `node_modules`.

**Tiny example:**
```
npm install chalk
```

**Castle relationship:** PROJECT → package.json → npm install → node_modules → EXTERNAL CAPABILITY

**Code walkthrough:**
- Step 1: `package.json` — Declares what your project needs.
- Step 2: `npm install` — Downloads the packages into node_modules.

**Key takeaway:** NPM saves you from reinventing the wheel.

### 3. Bug Hunt
- **Target:** ROYAL KEY
- **Symptom:** Dependency unavailable.
- **Objective:** Restore the missing package capability.

### 4. Code Challenge
**Mission objective:** Supply the missing castle capability by fixing the package dependencies.

**Requirements:**
- Identify the missing package from the error message.
- Add the missing package dependency.

**Success condition:** The castle successfully utilizes the external capability without throwing an error.

**Starter code:**
```js
// TODO: require the missing capability package that you installed via NPM
// const capability = require("...");

console.log("Capability loaded!");
```

**Hints (revealed progressively):**
1. CONCEPT: Applications often depend on code written by others, distributed as packages.
2. DIRECTION: If a module is not found, you might need to install it.
3. PARTIAL SOLUTION: Look at the require() statement that is failing. That is the name of the package you need.
4. STRONG GUIDANCE: In your code, you need to `npm install` the missing package, or add it to package.json dependencies.

### 5. Debrief
- **Status:** The castle is now utilizing external packages. (CAPABILITY SUPPLIED)
- **What's next:** The components are built and supplied, but they do not communicate in real-time.
- **Next objective:** NEXT SYSTEM: EVENT SYSTEM
- **What you built:** You successfully provided a third-party capability to the castle.
- **Why it matters:** NPM resolves the missing dependency and downloads it to node_modules so require() can find it.

**Concept check:**
1. What does package.json primarily contain?
   - HTML markup / **Project metadata, scripts, and dependencies** / HTTP response data / Database records
   - *package.json manages project configuration and dependencies for NPM.*
2. What happens when you run `npm install`?
   - It compiles the code. / **It downloads the packages listed in package.json into node_modules.** / It starts the Node.js server. / It creates a new module.
   - *npm install reads package.json and downloads all required packages.*

---

## Mission 03: EVENT SYSTEM
**ACT III — CONNECT**

### 1. Briefing
- **Current status:** The systems are built, but they are isolated and dead.
- **Objective:** Connect the castle elements using events.
- **How it connects:** Events allow isolated modules to communicate seamlessly in real time.
- **You will learn:**
  1. Explain what an event is and event-driven programming
  2. Understand Node.js EventEmitter, emit(), and on()
  3. Understand why event-driven architecture reduces coupling

### 2. Lesson

**What's happening:** The castle's circuits are dead. The Lever is pulled, but the Gate does not respond. We must repair the circuit using the Node.js Event system.

**What you'll learn:**
1. Explain what an event is and event-driven programming
2. Understand Node.js EventEmitter, emit(), and on()
3. Understand why event-driven architecture reduces coupling

#### Concept 1: What is an event?
An event represents something that happened (e.g., lever pulled). Emitting an event announces it occurred; listeners can then react.

**Tiny example:**
```
// 1. Something happens
// 2. Event is emitted
// 3. Listener reacts
```

**Castle relationship:** LEVER PULLED → EVENT EMITTED → GATE LISTENS → GATE OPENS

**Code walkthrough:**
- Step 1: `Event is emitted` — An announcement that a specific action occurred.
- Step 2: `Listener reacts` — Code that executes in response to the event.

**Key takeaway:** An event represents something that happened; listeners define what should happen in response.

#### Concept 2: EventEmitter — emit() and on()
`emit()` triggers an event. `on()` registers a listener. The event names must match exactly.

**Tiny example:**
```js
const EventEmitter = require("events");
const castle = new EventEmitter();

castle.on("lever_pulled", () => {
  console.log("Gate opening!");
});

castle.emit("lever_pulled");
```

**Code walkthrough:**
- Step 1: `castle.on("lever_pulled", ...)` — Registers a listener for the event.
- Step 2: `castle.emit("lever_pulled")` — Triggers the event, causing the handler to run.

**Key takeaway:** emit() announces the event; on() reacts to it.

### 3. Bug Hunt
- **Target:** INNER GATE
- **Symptom:** Lever activates but gate remains closed.
- **Objective:** Repair the event connection.

### 4. Code Challenge
**Mission objective:** Repair the event circuit between the Lever and the Gate.

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
- **Status:** Castle elements are now communicating dynamically. (CIRCUIT REPAIRED)
- **What's next:** The castle works internally, but no one on the outside can reach it.
- **Next objective:** NEXT SYSTEM: SIGNAL TOWER
- **What you built:** You successfully bridged two castle elements using event-driven architecture.
- **Why it matters:** The Lever doesn't need to know the Gate exists; it just emits the event. The Gate listens independently. This reduces tight coupling.

**Concept check:**
1. What is the primary purpose of emit()?
   - To register a function to be called later. / **To trigger an event and announce that something happened.** / To load an NPM module into the application.
   - *emit() announces the event, causing any registered listeners to run.*
2. What is the primary purpose of on()?
   - To trigger an event. / **To register a listener function that reacts to an event.** / To install an external dependency.
   - *on() registers a handler function that will be executed whenever the specified event is emitted.*

---

## Mission 04: SIGNAL TOWER
**ACT IV — DEPLOY**

### 1. Briefing
- **Current status:** The castle is isolated from the outside world.
- **Objective:** Configure the deployment settings to take the castle online.
- **How it connects:** The final step is to make all our connected systems publicly accessible.
- **You will learn:**
  1. Understand deployment and hosting
  2. Understand environment variables like process.env.PORT
  3. Understand package.json start scripts

### 2. Lesson

**What's happening:** The castle works perfectly on your local machine, but it is isolated. We must take it online by fixing its deployment configuration so others can reach it.

**What you'll learn:**
1. Understand deployment and hosting
2. Understand environment variables like process.env.PORT
3. Understand package.json start scripts

#### Concept 1: Deployment & Hosting
Deployment means putting your code on a computer (host) that stays on 24/7 so anyone can reach it. Hosting platforms automatically run your code, but you must configure it correctly.

**Key takeaway:** Deployment takes your local app and makes it public.

#### Concept 2: process.env.PORT
When hosting platforms run your app, they assign it a random PORT via an environment variable. If you hardcode your port (e.g., 3000), the platform cannot route traffic to it.

**Tiny example:**
```js
const PORT = process.env.PORT || 3000;
server.listen(PORT);
```

**Castle relationship:** HOST PROVIDES PORT → process.env.PORT → SERVER LISTENS

**Code walkthrough:**
- Step 1: `process.env.PORT` — Reads the port assigned by the hosting provider.
- Step 2: `|| 3000` — Provides a fallback for local development.

**Key takeaway:** Always use process.env.PORT in deployment.

#### Concept 3: Start Script
Hosting platforms don't magically know how to start your app. They usually run `npm start`. You must define this script in your `package.json`.

**Tiny example:**
```json
"scripts": {
  "start": "node server.js"
}
```

**Key takeaway:** The start script tells the host how to launch your application.

### 3. Bug Hunt
- **Target:** SIGNAL TOWER
- **Symptom:** Application cannot become publicly reachable.
- **Objective:** Repair deployment configuration.

### 4. Code Challenge
**Mission objective:** Fix the configuration so the Signal Tower can successfully deploy the castle.

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
- **Status:** The Signal Tower is broadcasting. The castle is deployed. (CASTLE ONLINE)
- **What's next:** THE SYSTEM WILL NOW BE TESTED.
- **Next objective:** NEXT PHASE: SHOWCASE
- **What you built:** You correctly configured the application for a cloud deployment.
- **Why it matters:** By reading the dynamic port and providing a standardized start script, the host can automatically run and route traffic to your application.

**Concept check:**
1. Why should a server read its port from process.env.PORT instead of hardcoding 3000?
   - Hardcoded ports run faster. / **Hosting platforms assign their own port at runtime, and your app must listen on whatever they give it.** / It is required by JavaScript syntax.
   - *If your app ignores the assigned PORT and only listens on 3000, the host cannot route traffic to it.*
2. What does the "start" script in package.json do?
   - **It tells hosting platforms (and `npm start`) the exact command to launch your app.** / It lists your project's dependencies. / It compiles the code.
   - *Hosting platforms run `npm start` automatically, which executes whatever command is defined under scripts.start.*

---

## After Mission 04: Showcase
Students see a 4-stage animation ("The System Awakens") recapping MODULES → NPM → EVENTS → DEPLOYMENT as one connected system, then proceed to the quiz.
