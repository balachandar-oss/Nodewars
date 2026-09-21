import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { gameSeeds } from '../seeds/gameSeeds';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo team (PRINCE)
  const team = await prisma.team.upsert({
    where: { name: 'PRINCE' },
    update: {},
    create: {
      name: 'PRINCE',
      huntScore: 0
    },
  });

  // Create second team (PRINCESS) for competitive gameplay
  const betaTeam = await prisma.team.upsert({
    where: { name: 'PRINCESS' },
    update: {},
    create: {
      name: 'PRINCESS',
      huntScore: 0
    },
  });

  // Create demo user
  const passwordHash = await bcrypt.hash('demo123', 10);
  
  const user = await prisma.user.upsert({
    where: { username: 'demo_player' },
    update: {
      passwordHash,
      teamId: team.id,
    },
    create: {
      username: 'demo_player',
      passwordHash,
      role: 'DEMO',
      level: 1,
      xp: 0,
      missionsCompleted: 0,
      teamId: team.id,
    },
  });

  // Create seminar_demo user
  const seminarPasswordHash = await bcrypt.hash('NodeWars@2026', 10);
  
  await prisma.user.upsert({
    where: { username: 'seminar_demo' },
    update: {
      passwordHash: seminarPasswordHash,
      role: 'PLAYER',
      teamId: team.id,
    },
    create: {
      username: 'seminar_demo',
      passwordHash: seminarPasswordHash,
      role: 'PLAYER',
      level: 1,
      xp: 0,
      missionsCompleted: 0,
      teamId: team.id,
    },
  });

  const missions = [
    {
      id: 'mission-01',
      title: 'FIRST SERVER',
      description: 'The castle has no communication system. Build the first server. Learn the Node.js runtime, the module system (require/exports), and how to configure servers with environment variables. Understand production vs development thinking from the start.',
      order: 1,
      difficulty: 'EASY',
      xpReward: 100,
      concepts: JSON.stringify(['Node runtime', 'HTTP', 'Server', 'Request', 'Response', 'Port', 'Modules (require)', 'Environment variables', 'Error handling']),
      objectives: JSON.stringify(['Understand Node.js module system (require)', 'Import the http module', 'Create a server with a request handler', 'Listen on a configurable port using environment variables', 'Add basic error handling for server startup', 'Understand production vs development mindset']),
      instructions: 'Use the `http` module to create a server that listens on a port specified in an environment variable (default to 3000). Add error handling for startup failures.',
      starterCode: 'const http = require("http");\n\n// 1. Configure port from environment or use default\nconst PORT = process.env.PORT || 3000;\nconst NODE_ENV = process.env.NODE_ENV || "development";\n\n// 2. Create a server using http.createServer\nconst server = http.createServer((req, res) => {\n  // TODO: Send a response\n  res.writeHead(200, { "Content-Type": "text/plain" });\n  res.end("Server is running");\n});\n\n// 3. Handle server errors\nserver.on("error", (err) => {\n  if (NODE_ENV === "production") {\n    console.error("Server error:", err.message);\n  } else {\n    console.error("Development error:", err);\n  }\n});\n\n// 4. Make the server listen on PORT\nserver.listen(PORT, () => {\n  console.log(`Server listening on port ${PORT} in ${NODE_ENV} mode`);\n});\n',
      hints: JSON.stringify(['Use `const server = http.createServer((req, res) => { ... })` - this follows the module pattern', 'Read the port from `process.env.PORT` to make it configurable for production', 'Always add error handlers with `server.on("error", handler)` to prevent crashes', 'In development, log full errors; in production, log only safe messages']),
      prerequisites: JSON.stringify([]),
      unlockComponent: 'TERMINAL'
    },
    {
      id: 'mission-02',
      title: 'SMART DOOR',
      description: 'The castle needs an intelligent door. Learn Express routing, HTTP status codes, and how to properly handle errors in routes. Use NPM dependencies and return appropriate status codes for success and failure cases.',
      order: 2,
      difficulty: 'EASY',
      xpReward: 150,
      concepts: JSON.stringify(['Express', 'Routing', 'HTTP methods', 'JSON', 'Request/response', 'HTTP status codes', 'Error handling', 'NPM dependencies']),
      objectives: JSON.stringify(['Understand package.json and NPM dependencies', 'Implement GET /door/status with correct status code', 'Implement GET /door/open with status codes (200 or 400)', 'Implement POST /door/access with input validation', 'Return appropriate HTTP status codes (200, 400, 500)', 'Add error handling to route handlers']),
      instructions: 'Create an Express app and define the required routes to operate the smart door. Return appropriate HTTP status codes. Add validation and error handling to all routes.',
      starterCode: 'const express = require("express");\nconst app = express();\n\napp.use(express.json());\n\n// 1. GET /door/status (returns 200 OK)\napp.get("/door/status", (req, res) => {\n  try {\n    // Return JSON with 200 status\n    res.status(200).json({ status: "locked", secure: true });\n  } catch (err) {\n    res.status(500).json({ error: "Failed to get door status" });\n  }\n});\n\n// 2. GET /door/open (returns 200 or 400 if invalid password)\napp.get("/door/open", (req, res) => {\n  try {\n    const password = req.query.password;\n    if (password === "castle123") {\n      res.status(200).json({ status: "unlocked" });\n    } else {\n      // Return 400 Bad Request for invalid input\n      res.status(400).json({ error: "Invalid password" });\n    }\n  } catch (err) {\n    res.status(500).json({ error: "Server error" });\n  }\n});\n\n// 3. POST /door/access (validate request body)\napp.post("/door/access", (req, res) => {\n  try {\n    const { username, action } = req.body;\n    if (!username || !action) {\n      // Return 400 Bad Request if required fields missing\n      return res.status(400).json({ error: "Missing username or action" });\n    }\n    res.status(200).json({ message: `Access granted for ${username}` });\n  } catch (err) {\n    res.status(500).json({ error: "Server error" });\n  }\n});\n\napp.listen(3001, () => console.log("Smart Door running"));\n',
      hints: JSON.stringify(['Use `res.status(200)` to set HTTP status codes explicitly', 'Return 400 Bad Request for invalid client input, 500 for server errors', 'Always wrap route handlers in try/catch to handle unexpected errors', 'In package.json, express is listed as a dependency - this is why `require("express")` works']),
      prerequisites: JSON.stringify(['mission-01']),
      unlockComponent: 'SMART DOOR'
    },
    {
      id: 'mission-03',
      title: 'SECURITY GATE',
      description: 'Protect the castle with middleware. Learn to implement authentication and authorization middleware with proper error handling. Use environment variables for secrets. Understand HTTP status codes in security contexts.',
      order: 3,
      difficulty: 'MEDIUM',
      xpReward: 200,
      concepts: JSON.stringify(['Middleware', 'Authentication', 'Authorization', 'Protected routes', 'Error handling', 'Environment variables', 'HTTP status codes', 'Request pipeline']),
      objectives: JSON.stringify(['Understand the request pipeline and middleware order', 'Implement an authentication check (401)', 'Implement an authorization check (403)', 'Use error handling in middleware', 'Call next() to pass control to next middleware', 'Use environment variables for configuration', 'Return appropriate HTTP status codes']),
      instructions: 'Build a Security Gate middleware that stops unauthenticated users and unauthorized roles (only ADMIN allowed). Add proper error handling and use environment variables for sensitive configuration.',
      starterCode: 'const express = require("express");\nconst app = express();\n\n// Configuration from environment\nconst NODE_ENV = process.env.NODE_ENV || "development";\nconst ADMIN_SECRET = process.env.ADMIN_SECRET || "default-secret";\n\n// Simulated user attached to the request (Authentication happens before this usually)\napp.use((req, res, next) => {\n  try {\n    req.user = { username: "node_hacker", role: "PLAYER" }; // Change role to ADMIN to test\n    next();\n  } catch (err) {\n    res.status(500).json({ error: "Authentication middleware error" });\n  }\n});\n\n// SECURITY GATE MIDDLEWARE\nconst securityGate = (req, res, next) => {\n  try {\n    // 1. AUTHENTICATION: "Who are you?"\n    // Check if req.user exists. If not, return 401 Unauthorized.\n    if (!req.user) {\n      return res.status(401).json({ error: "Authentication required" });\n    }\n\n    // 2. AUTHORIZATION: "Are you allowed?"\n    // Check if req.user.role is "ADMIN". If not, return 403 Forbidden.\n    if (req.user.role !== "ADMIN") {\n      return res.status(403).json({ error: "Insufficient permissions (ADMIN required)" });\n    }\n\n    // 3. ALLOW ACCESS\n    // Call next() to proceed to the route.\n    next();\n  } catch (err) {\n    if (NODE_ENV === "production") {\n      res.status(500).json({ error: "Server error" });\n    } else {\n      res.status(500).json({ error: err.message });\n    }\n  }\n};\n\n// PROTECTED ROUTE\napp.get("/vault", securityGate, (req, res) => {\n  try {\n    res.status(200).json({ message: "Welcome to the Resource Vault, Admin." });\n  } catch (err) {\n    res.status(500).json({ error: "Failed to access vault" });\n  }\n});\n\napp.listen(3002);\n',
      hints: JSON.stringify(['Authentication (401) means checking identity - does req.user exist?', 'Authorization (403) means checking permissions - does this user have the right role?', 'Always return early with res.status() to prevent accidental next() calls', 'Wrap middleware in try/catch to prevent unhandled errors from crashing the server', 'Use process.env for secrets and configuration - never hardcode sensitive values']),
      prerequisites: JSON.stringify(['mission-02']),
      unlockComponent: 'SECURITY GATE'
    },
    {
      id: 'mission-04',
      title: 'RESOURCE VAULT',
      description: 'Store and manage castle resources. Master CRUD operations with async/await, proper error handling, and error propagation. Learn production-ready patterns for database access and error logging.',
      order: 4,
      difficulty: 'MEDIUM',
      xpReward: 250,
      concepts: JSON.stringify(['Database', 'Models', 'CRUD', 'Async database operations', 'Error handling', 'Error propagation', 'Try/catch blocks', 'Status codes']),
      objectives: JSON.stringify(['Setup a database connection concept', 'Implement a data model', 'Create a resource with error handling', 'Read resources with error handling', 'Update a resource with validation', 'Delete a resource with error handling', 'Use async/await and try/catch', 'Propagate errors appropriately', 'Return correct HTTP status codes']),
      instructions: 'Build a Resource Vault API that performs asynchronous CRUD operations on a database. Use async/await and handle errors with try/catch. Add validation and return appropriate status codes.',
      starterCode: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst NODE_ENV = process.env.NODE_ENV || "development";\n\n// 1. Simulated Database Connection with error simulation\nconst db = {\n  gold: [],\n  async create(item) {\n    if (!item.name) throw new Error("Item must have a name");\n    this.gold.push(item);\n    return item;\n  },\n  async find() {\n    return this.gold;\n  },\n  async update(id, data) {\n    if (!id) throw new Error("ID is required");\n    return { id, ...data };\n  },\n  async delete(id) {\n    if (!id) throw new Error("ID is required");\n    return true;\n  }\n};\n\n// 2. CREATE Resource\napp.post("/vault/gold", async (req, res) => {\n  try {\n    const { name, amount } = req.body;\n    if (!name || !amount) {\n      return res.status(400).json({ error: "Name and amount are required" });\n    }\n    const result = await db.create({ name, amount });\n    res.status(201).json(result);\n  } catch (err) {\n    console.error("Create error:", err.message);\n    res.status(500).json({ error: "Failed to create resource" });\n  }\n});\n\n// 3. READ Resources\napp.get("/vault/gold", async (req, res) => {\n  try {\n    const items = await db.find();\n    res.status(200).json(items);\n  } catch (err) {\n    console.error("Read error:", err.message);\n    res.status(500).json({ error: "Failed to fetch resources" });\n  }\n});\n\n// 4. UPDATE Resource\napp.put("/vault/gold/:id", async (req, res) => {\n  try {\n    const { id } = req.params;\n    const data = req.body;\n    if (!data || Object.keys(data).length === 0) {\n      return res.status(400).json({ error: "Update data is required" });\n    }\n    const result = await db.update(id, data);\n    res.status(200).json(result);\n  } catch (err) {\n    console.error("Update error:", err.message);\n    res.status(500).json({ error: "Failed to update resource" });\n  }\n});\n\n// 5. DELETE Resource\napp.delete("/vault/gold/:id", async (req, res) => {\n  try {\n    const { id } = req.params;\n    await db.delete(id);\n    res.status(204).send();\n  } catch (err) {\n    console.error("Delete error:", err.message);\n    res.status(500).json({ error: "Failed to delete resource" });\n  }\n});\n\napp.listen(3003);\n',
      hints: JSON.stringify(['Always `await` async database calls to wait for completion', 'Wrap route handlers in try/catch to catch async errors', 'Use 400 status for bad client input, 201 for created, 204 for deleted, 500 for server errors', 'Log errors with console.error() in development to debug issues', 'Validate input before calling database to fail fast with 400 status']),
      prerequisites: JSON.stringify(['mission-03']),
      unlockComponent: 'RESOURCE VAULT'
    },
    {
      id: 'mission-05',
      title: 'ASYNC OPERATIONS',
      description: 'Master non-blocking behavior. Learn Promises, async/await, error handling with try/catch, and how to manage async errors properly. Understand error propagation and rejection handling.',
      order: 5,
      difficulty: 'MEDIUM',
      xpReward: 200,
      concepts: JSON.stringify(['Promises', 'async', 'await', 'Non-blocking operations', 'Error handling', 'Promise.reject', 'Unhandled rejections', 'Error propagation']),
      objectives: JSON.stringify(['Understand Promises and their states (pending, resolved, rejected)', 'Use async/await to wait for promises', 'Run multiple async operations in sequence', 'Handle async errors with try/catch', 'Understand error propagation in async chains', 'Handle Promise rejections gracefully']),
      instructions: 'Start the castle power grid by calling the simulated asynchronous systems in order. They return Promises. Implement proper error handling to catch any failures.',
      starterCode: '// Simulated Asynchronous Systems (Returns Promises)\nfunction authenticatePower() {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      // Simulate occasional failures in production\n      if (Math.random() > 0.8) {\n        reject(new Error("Authentication failed"));\n      } else {\n        resolve("AUTH_OK");\n      }\n    }, 300);\n  });\n}\n\nfunction loadResources() {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      resolve("RES_OK");\n    }, 300);\n  });\n}\n\nfunction activateSystems() {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      resolve("SYS_OK");\n    }, 300);\n  });\n}\n\n// TODO: Create an async function to start the grid\nasync function startGrid() {\n  try {\n    console.log("Starting power grid...");\n    \n    // 1. Await authenticatePower()\n    const auth = await authenticatePower();\n    console.log("Auth result:", auth);\n    \n    // 2. Await loadResources()\n    const resources = await loadResources();\n    console.log("Resources result:", resources);\n    \n    // 3. Await activateSystems()\n    const systems = await activateSystems();\n    console.log("Systems result:", systems);\n    \n    console.log("Power Grid Online!");\n    return { status: "success" };\n  } catch (error) {\n    // Error handling catches rejections from any await statement\n    console.error("Startup failed:", error.message);\n    // Propagate or handle the error\n    return { status: "failed", reason: error.message };\n  }\n}\n\n// Execute and handle the promise this function returns\nstartGrid()\n  .then(result => console.log("Final result:", result))\n  .catch(err => console.error("Unhandled error:", err));\n',
      hints: JSON.stringify(['Use `await` before each async call to wait for it to finish, which also enables try/catch error handling', 'A Promise can be in three states: pending, resolved (fulfilled), or rejected - await waits for resolution or rejection', 'If any `await` throws or rejects, the catch block catches it and stops further awaits from running', 'Always handle Promise rejection with try/catch or .catch() to prevent unhandled rejection errors']),
      prerequisites: JSON.stringify(['mission-04']),
      unlockComponent: 'ASYNC OPERATIONS'
    },
    {
      id: 'mission-06',
      title: 'LIVE SECURITY MONITOR',
      description: 'Real-time event tracking using EventEmitter and Socket.IO. Learn event-driven architecture, error handling in event listeners, and how to broadcast events safely with proper error propagation.',
      order: 6,
      difficulty: 'HARD',
      xpReward: 300,
      concepts: JSON.stringify(['EventEmitter', 'Events', 'Socket.IO', 'Broadcasting', 'Error handling', 'Event listeners', 'Error events', 'Event-driven architecture']),
      objectives: JSON.stringify(['Instantiate an EventEmitter', 'Register an event listener with error handling', 'Emit an event with structured data', 'Handle EventEmitter errors gracefully', 'Initialize Socket.IO', 'Join a room', 'Broadcast a structured event payload', 'Handle connection errors']),
      instructions: 'Set up an event-driven architecture using Node.js EventEmitter and integrate Socket.IO to broadcast events in real-time to connected clients. Add error handling for event listeners and Socket.IO connections.',
      starterCode: 'const EventEmitter = require("events");\nconst { Server } = require("socket.io");\n\nconst NODE_ENV = process.env.NODE_ENV || "development";\n\n// 1. Initialize Event Bus\nconst gameEventBus = new EventEmitter();\n\n// Handle EventEmitter errors\ngameEventBus.on("error", (err) => {\n  console.error("EventBus error:", err.message);\n});\n\n// 2. Listen for PLAYER_ENTERED events with error handling\ngameEventBus.on("PLAYER_ENTERED", (eventData) => {\n  try {\n    console.log("Player entered:", eventData);\n    // Validate event data\n    if (!eventData.playerId || !eventData.teamId) {\n      throw new Error("Missing required event fields");\n    }\n    \n    // TODO: Broadcast the event using Socket.IO\n    // Hint: io.to(room).emit("game_event", eventData)\n  } catch (err) {\n    console.error("Error handling PLAYER_ENTERED:", err.message);\n  }\n});\n\n// 3. Initialize Socket.IO connection handling\nfunction setupSocket(io) {\n  io.on("connection", (socket) => {\n    try {\n      // Simulated authenticated user data\n      const teamId = "TEAM_OMEGA";\n      \n      // TODO: Join the authorized team room\n      socket.join("team:" + teamId);\n      console.log("Socket joined team room:", teamId);\n      \n      // Handle socket errors\n      socket.on("error", (err) => {\n        console.error("Socket error:", err.message);\n      });\n      \n      // Handle disconnection\n      socket.on("disconnect", () => {\n        console.log("Socket disconnected from team:", teamId);\n      });\n    } catch (err) {\n      console.error("Socket setup error:", err.message);\n    }\n  });\n}\n\n// 4. Emit a sample event\ntry {\n  gameEventBus.emit("PLAYER_ENTERED", {\n    type: "PLAYER_ENTERED",\n    playerId: "demo_player",\n    teamId: "TEAM_OMEGA",\n    timestamp: new Date().toISOString()\n  });\n} catch (err) {\n  console.error("Failed to emit event:", err.message);\n}\n',
      hints: JSON.stringify(['Register an "error" listener on EventEmitter to catch and handle errors gracefully', 'Validate event data in listeners before processing to fail fast', 'Use `socket.join("team:" + teamId)` to restrict broadcasts to specific rooms', 'Always wrap event handler logic in try/catch to prevent unhandled exceptions', 'Handle Socket.IO connection errors and disconnections to prevent memory leaks']),
      prerequisites: JSON.stringify(['mission-05']),
      unlockComponent: 'LIVE SECURITY MONITOR'
    },
    {
      id: 'mission-07',
      title: 'BREAK IT',
      description: 'Find and fix the authorization bypass vulnerability. Understand error handling implications of missing security checks, how to trace request flows, and the importance of validating assumptions in middleware.',
      order: 7,
      difficulty: 'CRITICAL',
      xpReward: 400,
      concepts: JSON.stringify(['Debugging', 'Security vulnerabilities', 'Authorization', 'Error handling', 'Request tracing', 'Broken Access Control']),
      objectives: JSON.stringify([
        'Locate the access control middleware',
        'Trace the request flow through middleware',
        'Identify the authorization flaw (missing role check)',
        'Understand why error handling alone is insufficient',
        'Patch the securityGate with proper authorization',
        'Verify PLAYER is denied (403)',
        'Verify ADMIN is allowed (200)',
        'Test error handling for unauthenticated users (401)'
      ]),
      instructions: 'SECURITY BREACH DETECTED.\n\nThe castle\'s administrator vault is accessible to unauthorized players.\n\nYour task:\n1. Inspect the access-control code\n2. Identify the vulnerability (missing authorization check)\n3. Trace why PLAYER can reach the protected resource\n4. Fix the vulnerability with proper error handling\n5. Verify ADMIN still has access and PLAYER is denied\n6. Test edge cases (no user, wrong role, correct role)',
      starterCode: 'const express = require("express");\nconst app = express();\n\nconst NODE_ENV = process.env.NODE_ENV || "development";\n\n// Simulated user (in reality, parsed from a JWT)\napp.use((req, res, next) => {\n  try {\n    req.user = { username: "node_hacker", role: "PLAYER" }; \n    next();\n  } catch (err) {\n    res.status(500).json({ error: "Auth setup error" });\n  }\n});\n\nconst securityGate = (req, res, next) => {\n  try {\n    // 1. Authentication check\n    if (!req.user) {\n      return res.status(401).json({ error: "Unauthorized" });\n    }\n    \n    // BUG: The authorization check is missing!\n    // A user is authenticated, but are they an ADMIN?\n    // TODO: Add role verification here\n    // if (req.user.role !== "ADMIN") {\n    //   return res.status(403).json({ error: "Insufficient permissions" });\n    // }\n    \n    next();\n  } catch (err) {\n    if (NODE_ENV === "production") {\n      res.status(500).json({ error: "Server error" });\n    } else {\n      res.status(500).json({ error: err.message });\n    }\n  }\n};\n\n// PROTECTED ROUTE - should only allow ADMIN\napp.get("/admin", securityGate, (req, res) => {\n  try {\n    res.status(200).json({ secret: "FLAG", user: req.user });\n  } catch (err) {\n    res.status(500).json({ error: "Failed to access admin resource" });\n  }\n});\n\n// Health check endpoint\napp.get("/health", (req, res) => {\n  res.status(200).json({ status: "ok" });\n});\n\napp.listen(3004, () => console.log("Server running on port 3004"));\n',
      hints: JSON.stringify([
        'Authentication checks identity (401), Authorization checks permissions (403) - this middleware is missing the second check',
        'Add `if (req.user.role !== "ADMIN") { return res.status(403)... }` after the authentication check',
        'A user is always authenticated in this middleware because it never calls next() without some form of response or early exit',
        'Error handling in middleware cannot compensate for missing security logic - fix the logic itself, not just error cases',
        'Test with both PLAYER and ADMIN roles to verify the fix works correctly'
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
  
  // Create progress entries for demo player
  for (const m of missions) {
    await prisma.missionProgress.upsert({
      where: {
        userId_missionId: {
          userId: user.id,
          missionId: m.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        missionId: m.id,
        status: m.order === 1 ? 'ACTIVE' : 'LOCKED'
      }
    });
  }

  console.log('Database seeded successfully with 7 missions.');

  // ==========================================
  // QUIZ SEEDING
  // ==========================================
  const quizQuestions = [
    // Additional Module & NPM Questions (All Missions)
    {
      missionId: 'mission-01',
      question: 'What is the purpose of the `require()` function in Node.js?',
      options: JSON.stringify([
        'To delete a file from disk',
        'To load and import a module or file into the current file',
        'To create a new HTTP request',
        'To compile JavaScript to binary'
      ]),
      correctAnswer: 'To load and import a module or file into the current file',
      explanation: 'require() is used to load modules, built-in Node modules, or local files and makes their exports available.'
    },
    {
      missionId: 'mission-01',
      question: 'What does `module.exports` do in Node.js?',
      options: JSON.stringify([
        'It imports external libraries',
        'It exports code from the current module so other files can require() it',
        'It creates a new module file',
        'It establishes an HTTP connection'
      ]),
      correctAnswer: 'It exports code from the current module so other files can require() it',
      explanation: 'module.exports allows you to define what your module exposes when it is required by other files.'
    },
    {
      missionId: 'mission-01',
      question: 'What is the role of package.json in a Node.js project?',
      options: JSON.stringify([
        'It stores encrypted passwords for the database',
        'It is a configuration file that lists dependencies, scripts, and project metadata',
        'It is the main server file that runs the application',
        'It stores all user data'
      ]),
      correctAnswer: 'It is a configuration file that lists dependencies, scripts, and project metadata',
      explanation: 'package.json is the manifest file for a Node.js project, containing dependencies (from npm), scripts, version, and other metadata.'
    },
    {
      missionId: 'mission-02',
      question: 'What command do you run to install dependencies listed in package.json?',
      options: JSON.stringify(['npm start', 'npm install', 'npm run', 'npm build']),
      correctAnswer: 'npm install',
      explanation: 'npm install (or npm i) installs all dependencies listed in package.json and creates node_modules directory.'
    },
    {
      missionId: 'mission-02',
      question: 'What is the difference between dependencies and devDependencies in package.json?',
      options: JSON.stringify([
        'devDependencies are installed on development machines; dependencies are for production',
        'devDependencies are for testing and development; dependencies are required for production',
        'There is no difference',
        'dependencies are always larger files'
      ]),
      correctAnswer: 'devDependencies are for testing and development; dependencies are required for production',
      explanation: 'dependencies are needed for the app to run in production, while devDependencies are only needed during development (testing, building).'
    },
    {
      missionId: 'mission-03',
      question: 'What are environment variables used for in Node.js applications?',
      options: JSON.stringify([
        'To store sensitive configuration without hardcoding it',
        'To replace console.log statements',
        'To increase server speed',
        'To automatically handle HTTP requests'
      ]),
      correctAnswer: 'To store sensitive configuration without hardcoding it',
      explanation: 'Environment variables (accessed via process.env) allow you to configure applications differently per environment (dev/staging/production) without changing code.'
    },
    {
      missionId: 'mission-03',
      question: 'How do you set an environment variable named "API_KEY" in Node.js?',
      options: JSON.stringify([
        'const API_KEY = "value";',
        'process.env.API_KEY = "value";',
        'env.set("API_KEY");',
        'const env = { API_KEY: "value" };'
      ]),
      correctAnswer: 'process.env.API_KEY = "value";',
      explanation: 'process.env is the global object that holds environment variables. You can read or set them directly.'
    },
    {
      missionId: 'mission-01',
      question: 'What is the advantage of using process.env.PORT instead of hardcoding port 3000?',
      options: JSON.stringify([
        'It makes the code run faster',
        'It allows different port configurations per deployment without code changes',
        'It automatically secures the connection',
        'It is required by Node.js'
      ]),
      correctAnswer: 'It allows different port configurations per deployment without code changes',
      explanation: 'Using environment variables makes your application flexible across different environments (dev, staging, production may need different ports).'
    },
    // Additional Error Handling Questions
    {
      missionId: 'mission-02',
      question: 'What is the purpose of a try/catch block?',
      options: JSON.stringify([
        'To make code execute faster',
        'To catch errors and prevent them from crashing the application',
        'To repeat code multiple times',
        'To pause execution temporarily'
      ]),
      correctAnswer: 'To catch errors and prevent them from crashing the application',
      explanation: 'try/catch allows you to gracefully handle errors that might occur during execution instead of crashing the entire application.'
    },
    {
      missionId: 'mission-02',
      question: 'In a try/catch block, what happens if an error is thrown in the try section?',
      options: JSON.stringify([
        'The entire application stops',
        'The error is logged to the database',
        'Execution jumps to the catch block',
        'The error is silently ignored'
      ]),
      correctAnswer: 'Execution jumps to the catch block',
      explanation: 'When an error is thrown in the try block, execution immediately stops and transfers to the catch block where you can handle it.'
    },
    {
      missionId: 'mission-03',
      question: 'What is error propagation in middleware?',
      options: JSON.stringify([
        'Broadcasting errors to all connected clients',
        'Passing errors to the next middleware or handler for handling',
        'Storing all errors in a database',
        'Ignoring errors by default'
      ]),
      correctAnswer: 'Passing errors to the next middleware or handler for handling',
      explanation: 'Error propagation means letting errors bubble up through middleware so they can be caught and handled appropriately.'
    },
    {
      missionId: 'mission-04',
      question: 'Why should database errors be caught and not allowed to crash the server?',
      options: JSON.stringify([
        'It slows down the server',
        'It prevents one failed request from taking down the entire application',
        'Database errors cannot be caught',
        'It is optional and not important'
      ]),
      correctAnswer: 'It prevents one failed request from taking down the entire application',
      explanation: 'Unhandled errors in async operations can crash the Node.js process. Catching and handling them keeps the server running.'
    },
    {
      missionId: 'mission-04',
      question: 'What is the best practice for logging errors in production?',
      options: JSON.stringify([
        'Log everything with console.error()',
        'Log error messages but not stack traces to avoid exposing internals',
        'Never log errors',
        'Only log errors on Mondays'
      ]),
      correctAnswer: 'Log error messages but not stack traces to avoid exposing internals',
      explanation: 'In production, you should log enough information to debug but avoid exposing sensitive system details or stack traces to users.'
    },
    {
      missionId: 'mission-05',
      question: 'What happens if a Promise is rejected and no .catch() or try/catch handles it?',
      options: JSON.stringify([
        'It silently disappears',
        'It logs a warning and continues',
        'Node.js throws an UnhandledPromiseRejectionWarning and may crash',
        'It retries automatically'
      ]),
      correctAnswer: 'Node.js throws an UnhandledPromiseRejectionWarning and may crash',
      explanation: 'Unhandled Promise rejections are treated as critical errors in Node.js and will cause the process to exit.'
    },
    {
      missionId: 'mission-06',
      question: 'How should errors in EventEmitter listeners be handled?',
      options: JSON.stringify([
        'They are automatically ignored',
        'With try/catch inside the listener or with "error" event listener on the emitter',
        'By disabling the emitter',
        'Errors cannot occur in event listeners'
      ]),
      correctAnswer: 'With try/catch inside the listener or with "error" event listener on the emitter',
      explanation: 'EventEmitter errors can be caught with try/catch in the listener or by registering an "error" event handler on the emitter itself.'
    },
    // Production vs Development Questions
    {
      missionId: 'mission-01',
      question: 'How should production and development environments differ in error reporting?',
      options: JSON.stringify([
        'They should be identical',
        'Production should reveal full error details; development should hide them',
        'Development should show full error details; production should hide sensitive internals',
        'Error reporting is not environment-specific'
      ]),
      correctAnswer: 'Development should show full error details; production should hide sensitive internals',
      explanation: 'In development, detailed errors help debugging. In production, detailed errors expose security vulnerabilities, so only safe messages should be shown.'
    },
    {
      missionId: 'mission-01',
      question: 'What does NODE_ENV=production do?',
      options: JSON.stringify([
        'It makes the server faster automatically',
        'It is a flag that tells your application to behave in production mode (less logging, performance optimization)',
        'It enables HTTPS automatically',
        'It has no effect'
      ]),
      correctAnswer: 'It is a flag that tells your application to behave in production mode (less logging, performance optimization)',
      explanation: 'NODE_ENV is a standard environment variable that frameworks and applications check to adjust behavior for production efficiency and security.'
    },
    {
      missionId: 'mission-03',
      question: 'Why should secrets (API keys, database passwords) never be hardcoded?',
      options: JSON.stringify([
        'It makes the code run slower',
        'Hardcoded secrets get committed to version control and exposed to anyone with repository access',
        'JavaScript doesn\'t allow string literals',
        'It is a personal preference'
      ]),
      correctAnswer: 'Hardcoded secrets get committed to version control and exposed to anyone with repository access',
      explanation: 'Version control history is permanent. Hardcoded secrets will be visible to anyone who accesses the repository.'
    },
    {
      missionId: 'mission-03',
      question: 'What is the best way to store secrets in a production Node.js application?',
      options: JSON.stringify([
        'Hardcode them in the source files',
        'Store them in environment variables or a secure secrets management system',
        'Ask users to provide them at startup',
        'Store them in public comments'
      ]),
      correctAnswer: 'Store them in environment variables or a secure secrets management system',
      explanation: 'Environment variables and secrets managers keep sensitive data out of source code and allow different values per deployment.'
    },
    // Status Code Questions (deeper)
    {
      missionId: 'mission-02',
      question: 'Which HTTP status code indicates that the resource was successfully created?',
      options: JSON.stringify(['200 OK', '201 Created', '204 No Content', '301 Moved Permanently']),
      correctAnswer: '201 Created',
      explanation: '201 is the correct status for successful resource creation (typically in POST requests).'
    },
    {
      missionId: 'mission-02',
      question: 'When should you return 204 No Content?',
      options: JSON.stringify([
        'When the client sends invalid input',
        'When the request succeeded but there is no content to return (like a successful DELETE)',
        'When the server encountered an error',
        'When the resource is not found'
      ]),
      correctAnswer: 'When the request succeeded but there is no content to return (like a successful DELETE)',
      explanation: '204 indicates success with no body content, commonly used for DELETE operations or updates with no response data.'
    },
    {
      missionId: 'mission-03',
      question: 'What is the difference between 401 and 403 status codes?',
      options: JSON.stringify([
        'They are the same',
        '401 means not authenticated; 403 means authenticated but not authorized',
        '401 is faster than 403',
        '403 means not authenticated; 401 means authenticated but not authorized'
      ]),
      correctAnswer: '401 means not authenticated; 403 means authenticated but not authorized',
      explanation: '401 Unauthorized requires authentication (identity verification), 403 Forbidden means identity is known but access is denied.'
    },
    {
      missionId: 'mission-04',
      question: 'What status code should be returned when a database query fails?',
      options: JSON.stringify(['200 OK', '400 Bad Request', '404 Not Found', '500 Internal Server Error']),
      correctAnswer: '500 Internal Server Error',
      explanation: 'Database errors are server-side failures, so 500 Internal Server Error is appropriate.'
    },
    // Advanced Module and Debugging Questions
    {
      missionId: 'mission-07',
      question: 'In the BREAK IT mission, what was the flaw in the security check?',
      options: JSON.stringify([
        'The authentication check was missing entirely',
        'The authorization check (role verification) was missing',
        'The error handling was broken',
        'The request was not being received'
      ]),
      correctAnswer: 'The authorization check (role verification) was missing',
      explanation: 'The middleware verified that a user existed (authentication) but never checked their role (authorization), allowing any logged-in user to access admin resources.'
    },
    {
      missionId: 'mission-07',
      question: 'How can you test if a middleware is working correctly?',
      options: JSON.stringify([
        'By reading the code alone',
        'By sending requests with different user roles and verifying the responses',
        'Middleware cannot be tested',
        'By checking if the server starts without errors'
      ]),
      correctAnswer: 'By sending requests with different user roles and verifying the responses',
      explanation: 'Testing middleware requires actual requests to see if it behaves correctly for different inputs and states.'
    },
    {
      missionId: 'mission-06',
      question: 'What is the benefit of using Socket.IO over REST APIs for real-time features?',
      options: JSON.stringify([
        'Socket.IO is always faster',
        'REST APIs support real-time equally',
        'Socket.IO maintains a persistent connection for bi-directional real-time communication',
        'Socket.IO requires no client library'
      ]),
      correctAnswer: 'Socket.IO maintains a persistent connection for bi-directional real-time communication',
      explanation: 'Socket.IO provides persistent WebSocket connections that enable true real-time communication, unlike REST which requires polling.'
    },
    // Original Mission 01 questions
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

  console.log(`Database seeded with ${quizQuestions.length} quiz questions (including ${quizQuestions.filter(q => q.missionId).length} mission-specific questions).`);

  // ==========================================
  // GAME SEEDING - 20 Pre-made Bugs
  // ==========================================
  console.log('\nSeeding game bugs...');

  // Initialize game state
  await prisma.gameState.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      phase: 'ENGINEERING'
    }
  });

  // Get the admin or any user from TEAM OMEGA to plant bugs
  let bugArchitect = await prisma.user.findFirst({
    where: { teamId: team.id }
  });

  if (!bugArchitect) {
    // Create a demo Bug Architect if needed
    bugArchitect = await prisma.user.create({
      data: {
        username: 'bug_architect_omega',
        passwordHash: await bcrypt.hash('architect123', 10),
        role: 'ADMIN',
        teamId: team.id,
        level: 1,
        xp: 0,
        missionsCompleted: 0
      }
    });
  }

  // Seed 20 bugs: OMEGA plants on BETA
  let bugsCreated = 0;
  for (const bugSeed of gameSeeds) {
    try {
      await prisma.bug.create({
        data: {
          architectUserId: bugArchitect.id,
          architectTeamId: team.id, // TEAM OMEGA
          targetTeamId: betaTeam.id, // Target TEAM BETA
          vulnerabilityType: bugSeed.vulnerabilityType,
          targetSystem: bugSeed.targetSystem,
          configuration: JSON.stringify({
            difficulty: bugSeed.difficulty,
            question: bugSeed.question,
            options: bugSeed.options,
            correctAnswer: bugSeed.correctAnswer,
            fragmentValue: bugSeed.fragmentValue,
            ...bugSeed.configuration
          }),
          status: 'PLANTED'
        }
      });
      bugsCreated++;
    } catch (error) {
      console.error(`Failed to seed bug ${bugSeed.id}:`, error);
    }
  }

  // Also seed 20 bugs: BETA plants on OMEGA
  let betaBugArchitect = await prisma.user.findFirst({
    where: { teamId: betaTeam.id }
  });

  if (!betaBugArchitect) {
    betaBugArchitect = await prisma.user.create({
      data: {
        username: 'bug_architect_beta',
        passwordHash: await bcrypt.hash('architect123', 10),
        role: 'ADMIN',
        teamId: betaTeam.id,
        level: 1,
        xp: 0,
        missionsCompleted: 0
      }
    });
  }

  let betaBugsCreated = 0;
  for (const bugSeed of gameSeeds) {
    try {
      await prisma.bug.create({
        data: {
          architectUserId: betaBugArchitect.id,
          architectTeamId: betaTeam.id, // TEAM BETA
          targetTeamId: team.id, // Target TEAM OMEGA
          vulnerabilityType: bugSeed.vulnerabilityType,
          targetSystem: bugSeed.targetSystem,
          configuration: JSON.stringify({
            difficulty: bugSeed.difficulty,
            question: bugSeed.question,
            options: bugSeed.options,
            correctAnswer: bugSeed.correctAnswer,
            fragmentValue: bugSeed.fragmentValue,
            ...bugSeed.configuration
          }),
          status: 'PLANTED'
        }
      });
      betaBugsCreated++;
    } catch (error) {
      console.error(`Failed to seed bug for BETA:`, error);
    }
  }

  console.log(`Game bugs seeded: ${bugsCreated} bugs planted on PRINCESS, ${betaBugsCreated} bugs planted on PRINCE`);
  console.log('Total bugs seeded: ' + (bugsCreated + betaBugsCreated));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
