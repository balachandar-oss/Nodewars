import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { gameSeeds, createGameBugConfiguration } from '../seeds/gameSeeds';

const prisma = new PrismaClient();

import { SEMINAR_ACCOUNTS } from './seminarAccounts';

async function main() {
  console.log('Seeding database...');

  // Create primary seminar teams if not exist: PRINCES and PRINCESSES
  const teamPrinces = await prisma.team.upsert({
    where: { name: 'PRINCES' },
    update: {},
    create: {
      name: 'PRINCES',
    },
  });

  const teamPrincesses = await prisma.team.upsert({
    where: { name: 'PRINCESSES' },
    update: {},
    create: {
      name: 'PRINCESSES',
    },
  });

  console.log(`Seeding ${SEMINAR_ACCOUNTS.length} seminar accounts...`);
  const createdUsers = [];

  for (let i = 0; i < SEMINAR_ACCOUNTS.length; i++) {
    const acc = SEMINAR_ACCOUNTS[i];
    const passwordHash = await bcrypt.hash(acc.initialPassword, 10);
    
    // Explicit team assignment from seminar account definition:
    // PRINCES -> teamPrinces.id, PRINCESSES -> teamPrincesses.id, ADMIN -> null
    let teamId: string | null = null;
    if (acc.team === 'PRINCES') {
      teamId = teamPrinces.id;
    } else if (acc.team === 'PRINCESSES') {
      teamId = teamPrincesses.id;
    }

    const user = await prisma.user.upsert({
      where: { rollNumber: acc.rollNumber },
      update: {
        username: acc.username,
        name: acc.name,
        classification: acc.classification || null,
        passwordHash,
        role: acc.role,
        teamId,
      },
      create: {
        username: acc.username,
        name: acc.name,
        classification: acc.classification || null,
        rollNumber: acc.rollNumber,
        passwordHash,
        role: acc.role,
        level: 1,
        xp: 0,
        missionsCompleted: 0,
        teamId,
      },
    });
    createdUsers.push(user);
  }

  // ==========================================
  // ORGANIZER ACCOUNTS
  // ==========================================
  console.log('Seeding organizer accounts...');
  const organizerPasswords = {
    bala: process.env.ORGANIZER_BALA_PASSWORD || 'fallback-pass',
    vaishnav: process.env.ORGANIZER_VAISHNAV_PASSWORD || 'fallback-pass'
  };

  const organizers = [
    { username: 'bala', name: 'Bala', role: 'ADMIN', pass: organizerPasswords.bala },
    { username: 'bala-instructor', name: 'Bala (Instructor)', role: 'INSTRUCTOR', pass: organizerPasswords.bala },
    { username: 'vaishnav', name: 'Vaishnav', role: 'ADMIN', pass: organizerPasswords.vaishnav },
    { username: 'vaishnav-instructor', name: 'Vaishnav (Instructor)', role: 'INSTRUCTOR', pass: organizerPasswords.vaishnav }
  ];

  for (const org of organizers) {
    if (org.pass === 'fallback-pass') {
       console.warn(`WARNING: Missing environment variable password for ${org.username}`);
    }
    const hash = await bcrypt.hash(org.pass, 10);
    await prisma.user.upsert({
      where: { username: org.username },
      update: {
        name: org.name,
        passwordHash: hash,
        role: org.role,
        teamId: null
      },
      create: {
        username: org.username,
        name: org.name,
        passwordHash: hash,
        role: org.role,
        level: 99,
        xp: 9999,
        missionsCompleted: 7,
        teamId: null
      }
    });
  }

  const missions = [
    {
      id: 'mission-01',
      title: 'FIRST SERVER',
      description: 'The castle has no communication system. Build the first server.',
      order: 1,
      difficulty: 'EASY',
      xpReward: 100,
      concepts: JSON.stringify(['Node runtime', 'HTTP', 'Server', 'Request', 'Response', 'Port']),
      objectives: JSON.stringify(['Import the http module', 'Create a server with a request handler', 'Listen on port 3000']),
      instructions: 'Use the `http` module to create a server that listens on port 3000.',
      starterCode: 'const http = require("http");\n\n// 1. Create a server using http.createServer\n// The callback should accept (req, res)\n\n\n// 2. Make the server listen on port 3000\n',
      hints: JSON.stringify(['Use `const server = http.createServer((req, res) => { ... })`', 'Call `server.listen(3000)` at the end of the file.']),
      prerequisites: JSON.stringify([]),
      unlockComponent: 'TERMINAL'
    },
    {
      id: 'mission-02',
      title: 'SMART DOOR',
      description: 'The castle needs an intelligent door.',
      order: 2,
      difficulty: 'EASY',
      xpReward: 150,
      concepts: JSON.stringify(['Express', 'Routing', 'HTTP methods', 'JSON', 'Request/response']),
      objectives: JSON.stringify(['Implement GET /door/status', 'Implement GET /door/open', 'Implement POST /door/access']),
      instructions: 'Create an Express app and define the required routes to operate the smart door.',
      starterCode: 'const express = require("express");\nconst app = express();\n\n// Use express.json() middleware to parse JSON bodies\napp.use(express.json());\n\n// 1. GET /door/status\napp.get("/door/status", (req, res) => {\n  // TODO: Return JSON { status: "locked" }\n});\n\n// 2. GET /door/open\n\n\n// 3. POST /door/access\n\n\napp.listen(3001, () => console.log("Smart Door running"));\n',
      hints: JSON.stringify(['Use app.get() and app.post().', 'Remember to return JSON using res.json().']),
      prerequisites: JSON.stringify(['mission-01']),
      unlockComponent: 'SMART DOOR'
    },
    {
      id: 'mission-03',
      title: 'SECURITY GATE',
      description: 'Protect the castle with middleware.',
      order: 3,
      difficulty: 'MEDIUM',
      xpReward: 200,
      concepts: JSON.stringify(['Middleware', 'Authentication', 'Authorization', 'Protected routes']),
      objectives: JSON.stringify(['Understand the request pipeline', 'Implement an authentication check', 'Implement an authorization check', 'Use next() to pass control']),
      instructions: 'Build a Security Gate middleware that stops unauthenticated users and unauthorized roles (only ADMIN allowed).',
      starterCode: 'const express = require("express");\nconst app = express();\n\n// Simulated user attached to the request (Authentication happens before this usually)\napp.use((req, res, next) => {\n  req.user = { username: "node_hacker", role: "PLAYER" }; // Change role to ADMIN to test\n  next();\n});\n\n// SECURITY GATE MIDDLEWARE\nconst securityGate = (req, res, next) => {\n  // 1. AUTHENTICATION: "Who are you?"\n  // Check if req.user exists. If not, return 401 Unauthorized.\n\n\n  // 2. AUTHORIZATION: "Are you allowed?"\n  // Check if req.user.role is "ADMIN". If not, return 403 Forbidden.\n\n\n  // 3. ALLOW ACCESS\n  // Call next() to proceed to the route.\n\n};\n\n// PROTECTED ROUTE\napp.get("/vault", securityGate, (req, res) => {\n  res.json({ message: "Welcome to the Resource Vault, Admin." });\n});\n\napp.listen(3002);\n',
      hints: JSON.stringify(['Authentication means checking identity (401).', 'Authorization means checking permissions (403).', 'Don\'t forget to call next() if they are allowed!']),
      prerequisites: JSON.stringify(['mission-02']),
      unlockComponent: 'SECURITY GATE'
    },
    {
      id: 'mission-04',
      title: 'RESOURCE VAULT',
      description: 'Store and manage castle resources.',
      order: 4,
      difficulty: 'MEDIUM',
      xpReward: 250,
      concepts: JSON.stringify(['Database', 'Models', 'CRUD', 'Async database operations']),
      objectives: JSON.stringify(['Setup a database connection concept', 'Implement a data model', 'Create a resource', 'Read resources', 'Update a resource', 'Delete a resource', 'Use async/await and try/catch']),
      instructions: 'Build a Resource Vault API that performs asynchronous CRUD operations on a database. Use async/await and handle errors with try/catch.',
      starterCode: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\n// 1. Simulated Database Connection\nconst db = {\n  gold: [],\n  async create(item) { this.gold.push(item); return item; },\n  async find() { return this.gold; },\n  async update(id, data) { return { id, ...data }; },\n  async delete(id) { return true; }\n};\n\n// 2. CREATE Resource\napp.post("/vault/gold", async (req, res) => {\n  try {\n    // TODO: Await db.create() and return result\n\n  } catch (err) {\n    res.status(500).json({ error: "DB Error" });\n  }\n});\n\n// 3. READ Resources\napp.get("/vault/gold", async (req, res) => {\n  // TODO: Implement GET using db.find()\n\n});\n\n// 4. UPDATE Resource\napp.put("/vault/gold/:id", async (req, res) => {\n  // TODO: Implement PUT using db.update()\n\n});\n\n// 5. DELETE Resource\napp.delete("/vault/gold/:id", async (req, res) => {\n  // TODO: Implement DELETE using db.delete()\n\n});\n\napp.listen(3003);\n',
      hints: JSON.stringify(['Remember to use `await` before database calls.', 'Wrap your async logic in a `try/catch` block to handle errors.']),
      prerequisites: JSON.stringify(['mission-03']),
      unlockComponent: 'RESOURCE VAULT'
    },
    {
      id: 'mission-05',
      title: 'ASYNC OPERATIONS',
      description: 'Master non-blocking behavior.',
      order: 5,
      difficulty: 'MEDIUM',
      xpReward: 200,
      concepts: JSON.stringify(['Promises', 'async', 'await', 'Non-blocking operations']),
      objectives: JSON.stringify(['Understand async/await', 'Wait for promises to resolve', 'Run multiple async operations in sequence', 'Handle async errors']),
      instructions: 'Start the castle power grid by calling the simulated asynchronous systems in order. They return Promises.',
      starterCode: '// Simulated Asynchronous Systems (Returns Promises)\nfunction authenticatePower() {\n  return new Promise(resolve => setTimeout(() => resolve("AUTH_OK"), 300));\n}\n\nfunction loadResources() {\n  return new Promise(resolve => setTimeout(() => resolve("RES_OK"), 300));\n}\n\nfunction activateSystems() {\n  return new Promise(resolve => setTimeout(() => resolve("SYS_OK"), 300));\n}\n\n// TODO: Create an async function to start the grid\nasync function startGrid() {\n  try {\n    // 1. Await authenticatePower()\n    \n    // 2. Await loadResources()\n    \n    // 3. Await activateSystems()\n    \n    console.log("Power Grid Online!");\n  } catch (error) {\n    console.error("Startup failed", error);\n  }\n}\n\n// Execute\nstartGrid();\n',
      hints: JSON.stringify(['Use the `await` keyword before each function call to wait for it to finish.']),
      prerequisites: JSON.stringify(['mission-04']),
      unlockComponent: 'ASYNC OPERATIONS'
    },
    {
      id: 'mission-06',
      title: 'LIVE SECURITY MONITOR',
      description: 'Real-time event tracking.',
      order: 6,
      difficulty: 'HARD',
      xpReward: 300,
      concepts: JSON.stringify(['EventEmitter', 'Events', 'Socket.IO', 'Broadcasting']),
      objectives: JSON.stringify(['Instantiate an EventEmitter', 'Register an event listener', 'Emit an event', 'Initialize Socket.IO', 'Join a room', 'Broadcast a structured event payload']),
      instructions: 'Set up an event-driven architecture using Node.js EventEmitter and integrate Socket.IO to broadcast events in real-time to connected clients.',
      starterCode: 'const EventEmitter = require("events");\nconst { Server } = require("socket.io");\n\n// 1. Initialize Event Bus\nconst gameEventBus = new EventEmitter();\n\n// 2. Listen for PLAYER_ENTERED events\ngameEventBus.on("PLAYER_ENTERED", (eventData) => {\n  console.log("Player entered:", eventData);\n  \n  // TODO: Broadcast the event using Socket.IO\n  // Hint: io.to(room).emit("game_event", eventData)\n});\n\n// 3. Initialize Socket.IO connection handling\nfunction setupSocket(io) {\n  io.on("connection", (socket) => {\n    // Simulated authenticated user data\n    const teamId = "PRINCES";\n    \n    // TODO: Join the authorized team room\n\n  });\n}\n\n// 4. Emit a sample event\ngameEventBus.emit("PLAYER_ENTERED", {\n  type: "PLAYER_ENTERED",\n  playerId: "demo_player",\n  teamId: "PRINCES",\n  timestamp: new Date().toISOString()\n});\n',
      hints: JSON.stringify(['Use `socket.join("team:" + teamId)` to restrict broadcasts.', 'Use `io.to("team:" + teamId).emit(...)` to send the event payload.']),
      prerequisites: JSON.stringify(['mission-05']),
      unlockComponent: 'LIVE SECURITY MONITOR'
    },
    {
      id: 'mission-07',
      title: 'BREAK IT',
      description: 'Find and fix the authorization bypass vulnerability.',
      order: 7,
      difficulty: 'CRITICAL',
      xpReward: 400,
      concepts: JSON.stringify(['Debugging', 'Security vulnerabilities', 'Authorization']),
      objectives: JSON.stringify([
        'Locate the access control middleware',
        'Trace the request flow',
        'Identify the authorization flaw',
        'Patch the securityGate',
        'Verify PLAYER is denied',
        'Verify ADMIN is allowed'
      ]),
      instructions: 'SECURITY BREACH DETECTED.\n\nThe castle\'s administrator vault is accessible to unauthorized players.\n\nYour task:\n1. Inspect the access-control code\n2. Identify the vulnerability\n3. Determine why PLAYER can reach the protected resource\n4. Fix the vulnerability\n5. Verify ADMIN still has access and PLAYER is denied',
      starterCode: 'const express = require("express");\nconst app = express();\n\n// Simulated user (in reality, parsed from a JWT)\napp.use((req, res, next) => {\n  req.user = { username: "node_hacker", role: "PLAYER" }; \n  next();\n});\n\nconst securityGate = (req, res, next) => {\n  // 1. Authentication check\n  if (!req.user) {\n    return res.status(401).json({ error: "Unauthorized" });\n  }\n  \n  // BUG: The authorization check is missing!\n  // A user is authenticated, but are they an ADMIN?\n  \n  next();\n};\n\napp.get("/admin", securityGate, (req, res) => {\n  res.json({ secret: "FLAG" });\n});\n\napp.listen(3004);\n',
      hints: JSON.stringify([
        'Trace what happens after the request is authenticated.',
        'Authentication answers WHO. Authorization answers WHETHER THEY MAY CONTINUE.',
        'Compare PLAYER and ADMIN behavior. Ensure non-admins are rejected.'
      ]),
      prerequisites: JSON.stringify(['mission-06']),
      unlockComponent: 'SECURITY PATCH'
    }
  ];

  for (const m of missions) {
    await prisma.mission.upsert({
      where: { id: m.id },
      update: m,
      create: m,
    });
  }
  
  // Initialize mission progress for all seminar users
  for (const seminarUser of createdUsers) {
    for (const m of missions) {
      await prisma.missionProgress.upsert({
        where: {
          userId_missionId: {
            userId: seminarUser.id,
            missionId: m.id
          }
        },
        update: {},
        create: {
          userId: seminarUser.id,
          missionId: m.id,
          status: m.order === 1 ? 'ACTIVE' : 'LOCKED'
        }
      });
    }
  }

  console.log(`Database seeded successfully with 7 missions across ${createdUsers.length} seminar users.`);

  // ==========================================
  // QUIZ SEEDING
  // ==========================================
  const quizQuestions = [
    // Mission 01
    {
      missionId: 'mission-01',
      question: 'Which core Node.js module is used to create a basic web server?',
      options: JSON.stringify(['http', 'fs', 'net', 'url']),
      correctAnswer: 'http',
      explanation: 'The http module provides the createServer method required to build a web server in Node.js.'
    },
    {
      missionId: 'mission-01',
      question: 'What is the primary role of the "req" and "res" parameters in an HTTP request handler?',
      options: JSON.stringify([
        'They represent the Request URL and the Response HTML.',
        'They represent the incoming Request object and outgoing Response object.',
        'They are used to define the Router and Server configuration.',
        'They are standard variable names but have no functional meaning.'
      ]),
      correctAnswer: 'They represent the incoming Request object and outgoing Response object.',
      explanation: 'req contains details about the incoming request, while res is used to construct and send the response back to the client.'
    },
    {
      missionId: 'mission-01',
      question: 'Why must a server listen on a specific port?',
      options: JSON.stringify([
        'To prevent hackers from accessing the code.',
        'To instruct the OS where to route incoming network traffic for this application.',
        'Because Node.js requires port 3000 by default.',
        'To encrypt the HTTP communication.'
      ]),
      correctAnswer: 'To instruct the OS where to route incoming network traffic for this application.',
      explanation: 'Ports act as communication endpoints, allowing the operating system to direct incoming packets to the correct application.'
    },
    // Mission 02
    {
      missionId: 'mission-02',
      question: 'Which Express method is used to handle incoming POST requests?',
      options: JSON.stringify(['app.get()', 'app.listen()', 'app.send()', 'app.post()']),
      correctAnswer: 'app.post()',
      explanation: 'app.post() defines a route handler specifically for HTTP POST requests.'
    },
    {
      missionId: 'mission-02',
      question: 'What does the express.json() middleware accomplish?',
      options: JSON.stringify([
        'It formats the server\'s outgoing responses as JSON.',
        'It parses incoming request bodies with JSON payloads.',
        'It converts the Express app into a JSON file.',
        'It validates that the client is a web browser.'
      ]),
      correctAnswer: 'It parses incoming request bodies with JSON payloads.',
      explanation: 'express.json() is built-in middleware that parses incoming requests with JSON payloads and makes the data available on req.body.'
    },
    {
      missionId: 'mission-02',
      question: 'In an Express route like `/users/:id`, what is `:id`?',
      options: JSON.stringify(['A query parameter', 'A JSON body field', 'A route parameter', 'An HTTP header']),
      correctAnswer: 'A route parameter',
      explanation: 'The colon denotes a route parameter, capturing the value in the URL path.'
    },
    {
      missionId: 'mission-02',
      question: 'What is the correct way to send a JSON response in Express?',
      options: JSON.stringify(['res.sendJSON()', 'res.json()', 'return json()', 'res.body = {}']),
      correctAnswer: 'res.json()',
      explanation: 'res.json() automatically sets the correct Content-Type header and converts the passed object to a JSON string.'
    },
    // Mission 03
    {
      missionId: 'mission-03',
      question: 'What happens if an Express middleware function does not call next() and does not send a response?',
      options: JSON.stringify([
        'The request automatically proceeds to the next route.',
        'The server crashes with an unhandled exception.',
        'The request hangs and eventually times out.',
        'Express automatically sends a 404 response.'
      ]),
      correctAnswer: 'The request hangs and eventually times out.',
      explanation: 'If a middleware neither terminates the request-response cycle nor passes control with next(), the client will be left hanging.'
    },
    {
      missionId: 'mission-03',
      question: 'What is the main difference between Authentication and Authorization?',
      options: JSON.stringify([
        'Authentication determines what a user is allowed to do.',
        'Authentication verifies identity; Authorization checks permissions.',
        'They are interchangeable terms for the same security process.',
        'Authorization creates the user password; Authentication checks it.'
      ]),
      correctAnswer: 'Authentication verifies identity; Authorization checks permissions.',
      explanation: 'Authentication verifies WHO you are (identity), while Authorization determines WHAT you can do (access control).'
    },
    {
      missionId: 'mission-03',
      question: 'Which HTTP status code is most appropriate when a user is authenticated but does not have permission to access a resource?',
      options: JSON.stringify(['200 OK', '301 Moved Permanently', '401 Unauthorized', '403 Forbidden']),
      correctAnswer: '403 Forbidden',
      explanation: '403 Forbidden indicates the server understood the request but refuses to authorize it, meaning the identity is known but access is denied.'
    },
    {
      missionId: 'mission-03',
      question: 'What status code is appropriate when the server does not recognize the user\'s identity?',
      options: JSON.stringify(['401 Unauthorized', '403 Forbidden', '404 Not Found', '500 Internal Server Error']),
      correctAnswer: '401 Unauthorized',
      explanation: '401 Unauthorized means the client must authenticate itself to get the requested response.'
    },
    // Mission 04
    {
      missionId: 'mission-04',
      question: 'In standard CRUD operations, what does the "U" stand for?',
      options: JSON.stringify(['Use', 'Upload', 'Update', 'Upsert']),
      correctAnswer: 'Update',
      explanation: 'CRUD stands for Create, Read, Update, Delete.'
    },
    {
      missionId: 'mission-04',
      question: 'Which HTTP method is typically mapped to the "Update" operation?',
      options: JSON.stringify(['GET', 'PUT', 'POST', 'DELETE']),
      correctAnswer: 'PUT',
      explanation: 'PUT (or PATCH) is traditionally used to update an existing resource.'
    },
    {
      missionId: 'mission-04',
      question: 'Why are database operations typically asynchronous in Node.js?',
      options: JSON.stringify([
        'Because databases are slow and blocking operations would freeze the single-threaded event loop.',
        'To prevent race conditions during concurrent data access.',
        'Because SQL queries require a compiled Promise object.',
        'Asynchronous functions automatically encrypt the data payload.'
      ]),
      correctAnswer: 'Because databases are slow and blocking operations would freeze the single-threaded event loop.',
      explanation: 'Node.js is single-threaded. Blocking the thread to wait for a database query would prevent the server from handling other requests.'
    },
    {
      missionId: 'mission-04',
      question: 'How do you handle errors inside an async/await block?',
      options: JSON.stringify(['Using .catch() chains', 'With a try/catch block', 'By returning false', 'Errors are automatically ignored']),
      correctAnswer: 'With a try/catch block',
      explanation: 'When using async/await, errors are handled using standard try/catch blocks.'
    },
    // Mission 05
    {
      missionId: 'mission-05',
      question: 'What does the "await" keyword do in Node.js?',
      options: JSON.stringify([
        'It pauses the entire Node.js server until the operation completes.',
        'It pauses the execution of the async function until the Promise settles.',
        'It converts a callback function into a Promise.',
        'It forces a synchronous function to run asynchronously.'
      ]),
      correctAnswer: 'It pauses the execution of the async function until the Promise settles.',
      explanation: 'await pauses the execution of the specific async function, allowing the event loop to continue running other tasks.'
    },
    {
      missionId: 'mission-05',
      question: 'What happens if you use "await" outside of an async function?',
      options: JSON.stringify([
        'It works normally if the runtime supports top-level await, otherwise it throws a SyntaxError.',
        'It silently ignores the await and continues execution.',
        'It converts the parent function into an async function automatically.',
        'It crashes the operating system.'
      ]),
      correctAnswer: 'It works normally if the runtime supports top-level await, otherwise it throws a SyntaxError.',
      explanation: 'In older Node.js versions or CommonJS, await must be inside an async function. Modern modules support top-level await.'
    },
    {
      missionId: 'mission-05',
      question: 'What is a Promise in JavaScript?',
      options: JSON.stringify([
        'An object representing the eventual completion or failure of an asynchronous operation.',
        'A guarantee that the code has no bugs.',
        'A special type of string returned by a database query.',
        'A synchronous block of execution logic.'
      ]),
      correctAnswer: 'An object representing the eventual completion or failure of an asynchronous operation.',
      explanation: 'Promises represent values that are not yet known when the operation begins.'
    },
    {
      missionId: 'mission-05',
      question: 'If funcA() takes 2s and funcB() takes 3s, how long does `await Promise.all([funcA(), funcB()])` take to resolve?',
      options: JSON.stringify(['5 seconds', '2 seconds', '3 seconds', 'It depends on which function is listed first']),
      correctAnswer: '3 seconds',
      explanation: 'Promise.all runs them concurrently, so the total time is bounded by the longest operation (3 seconds).'
    },
    // Mission 06
    {
      missionId: 'mission-06',
      question: 'What is the purpose of the Node.js EventEmitter?',
      options: JSON.stringify([
        'To schedule tasks via cron jobs.',
        'To facilitate an event-driven architecture by allowing objects to emit and listen for named events.',
        'To emit HTTP requests to external APIs.',
        'To handle unhandled exceptions and prevent server crashes.'
      ]),
      correctAnswer: 'To facilitate an event-driven architecture by allowing objects to emit and listen for named events.',
      explanation: 'EventEmitter is the core module in Node.js that enables the observer pattern.'
    },
    {
      missionId: 'mission-06',
      question: 'How do you trigger an event on an instance of EventEmitter?',
      options: JSON.stringify(['emitter.trigger("event")', 'emitter.send("event")', 'emitter.emit("event")', 'emitter.broadcast("event")']),
      correctAnswer: 'emitter.emit("event")',
      explanation: 'The .emit() method is used to synchronously call all listeners registered for the named event.'
    },
    {
      missionId: 'mission-06',
      question: 'In Socket.IO, what is a "room"?',
      options: JSON.stringify([
        'A physical server partition.',
        'An arbitrary channel that sockets can join and leave to receive broadcasted events.',
        'A namespace for isolating authentication credentials.',
        'A persistent database table for chat messages.'
      ]),
      correctAnswer: 'An arbitrary channel that sockets can join and leave to receive broadcasted events.',
      explanation: 'Rooms allow you to broadcast events to a subset of connected clients.'
    },
    {
      missionId: 'mission-06',
      question: 'How does Socket.IO differ from standard REST APIs?',
      options: JSON.stringify([
        'Socket.IO uses JSON, while REST uses XML.',
        'Socket.IO enables bidirectional, persistent, real-time communication, whereas REST is stateless and request-driven.',
        'Socket.IO is much slower due to connection overhead.',
        'Socket.IO cannot handle authentication.'
      ]),
      correctAnswer: 'Socket.IO enables bidirectional, persistent, real-time communication, whereas REST is stateless and request-driven.',
      explanation: 'WebSockets (used by Socket.IO) keep a persistent connection open for real-time duplex data flow.'
    },
    // Mission 07
    {
      missionId: 'mission-07',
      question: 'If an Express route uses `app.get("/admin", securityGate, handler)`, and `securityGate` does NOT call `next()`, what happens to `handler`?',
      options: JSON.stringify([
        'It executes immediately after securityGate finishes.',
        'It is skipped, and the request is effectively terminated or left hanging.',
        'Express throws an error indicating missing execution flow.',
        'It executes on a separate thread.'
      ]),
      correctAnswer: 'It is skipped, and the request is effectively terminated or left hanging.',
      explanation: 'Control flow in Express requires calling next() to move to the subsequent middleware or route handler.'
    },
    {
      missionId: 'mission-07',
      question: 'What is Broken Access Control?',
      options: JSON.stringify([
        'A failure where users cannot log in due to database corruption.',
        'A vulnerability where a user can perform actions or access data outside their intended permissions.',
        'A physical breach in a server room.',
        'A syntax error in a JSON Web Token.'
      ]),
      correctAnswer: 'A vulnerability where a user can perform actions or access data outside their intended permissions.',
      explanation: 'Broken Access Control occurs when authorization policies are missing or improperly enforced.'
    },
    {
      missionId: 'mission-07',
      question: 'Why is client-side authorization hiding (e.g., hiding a button with CSS) insufficient for security?',
      options: JSON.stringify([
        'Because users can inspect the DOM or use tools like cURL/Postman to send requests directly to the API.',
        'Because CSS is often blocked by ad blockers.',
        'Because modern browsers cache the CSS differently.',
        'It is sufficient; hiding elements is the standard security practice.'
      ]),
      correctAnswer: 'Because users can inspect the DOM or use tools like cURL/Postman to send requests directly to the API.',
      explanation: 'Client-side checks are purely cosmetic. Real security enforcement must happen on the server.'
    },
    {
      missionId: 'mission-07',
      question: 'In the context of the BREAK IT mission, what flaw allowed the PLAYER to access the ADMIN vault?',
      options: JSON.stringify([
        'The server crashed and defaulted to open access.',
        'The route was missing an authentication check entirely.',
        'The middleware verified the user was logged in, but failed to check their specific role.',
        'The PLAYER used an advanced SQL Injection.'
      ]),
      correctAnswer: 'The middleware verified the user was logged in, but failed to check their specific role.',
      explanation: 'Authentication was present (checking if req.user exists), but Authorization was missing (checking if req.user.role === "ADMIN").'
    }
  ];

  await prisma.quizQuestion.deleteMany(); // Clear existing
  for (const q of quizQuestions) {
    await prisma.quizQuestion.create({ data: q });
  }

  console.log(`Database seeded with ${quizQuestions.length} quiz questions.`);

  // ============================================
  // Seed exactly 10 dedicated seminar DRAFT bugs (5 PRINCES->PRINCESSES, 5 PRINCESSES->PRINCES)
  // These bugs have:
  // - isSeminarPool: true
  // - status: 'DRAFT'
  // - architectUserId: null (no placeholder ownership!)
  // - space-normalized targetSystem matching hunt.ts
  // Idempotent: upsert using stable IDs without overwriting assigned or planted states.
  // ============================================
  console.log('\nSeeding dedicated seminar DRAFT bugs (5 PRINCES->PRINCESSES, 5 PRINCESSES->PRINCES)...');

  const princeToPrincessSeedIds = [
    'seed-bug-easy-01',
    'seed-bug-medium-01',
    'seed-bug-medium-05',
    'seed-bug-hard-01',
    'seed-bug-critical-01'
  ];

  const princessToPrinceSeedIds = [
    'seed-bug-easy-02',
    'seed-bug-medium-02',
    'seed-bug-medium-06',
    'seed-bug-hard-02',
    'seed-bug-critical-02'
  ];

  const findSeed = (id: string) => {
    const seed = gameSeeds.find(s => s.id === id);
    if (!seed) throw new Error(`gameSeeds missing seed id: ${id}`);
    return seed;
  };

  const seedSeminarBugs = async (
    seedIds: string[],
    direction: string,
    architectTeamId: string,
    targetTeamId: string
  ) => {
    for (const seedId of seedIds) {
      const seed = findSeed(seedId);
      const configuration = createGameBugConfiguration(seed);
      const normalizedTargetSystem = seed.targetSystem.replace(/_/g, ' ');
      const bugId = `bug-${direction}-${seed.id}`;

      await prisma.bug.upsert({
        where: { id: bugId },
        update: {
          targetSystem: normalizedTargetSystem,
          difficulty: seed.difficulty,
          isSeminarPool: true
        },
        create: {
          id: bugId,
          architectUserId: null,
          architectTeamId,
          targetTeamId,
          vulnerabilityType: seed.vulnerabilityType,
          targetSystem: normalizedTargetSystem,
          configuration: JSON.stringify(configuration),
          status: 'DRAFT',
          isSeminarPool: true,
          structureType: seed.targetSystem,
          difficulty: seed.difficulty
        }
      });
    }
  };

  await seedSeminarBugs(princeToPrincessSeedIds, 'p2p', teamPrinces.id, teamPrincesses.id);
  await seedSeminarBugs(princessToPrinceSeedIds, 'pr2p', teamPrincesses.id, teamPrinces.id);

  const seminarDraftCount = await prisma.bug.count({
    where: { isSeminarPool: true, status: 'DRAFT' }
  });
  console.log(`Dedicated seminar DRAFT bugs seeded. Total: ${seminarDraftCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
