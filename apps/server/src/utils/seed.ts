import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
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

  // Seed organizer accounts (Bala & Vaishnav in ADMIN and INSTRUCTOR modes)
  console.log('Seeding organizer accounts...');
  let balaPass = process.env.ORGANIZER_BALA_PASSWORD;
  let vaishnavPass = process.env.ORGANIZER_VAISHNAV_PASSWORD;

  const credPath = path.resolve(__dirname, 'credentials.json');
  if (fs.existsSync(credPath)) {
    try {
      const { admins } = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
      const balaAdmin = admins.find((a: any) => a.username === 'bala');
      const vaishnavAdmin = admins.find((a: any) => a.username === 'vaishnav');
      if (balaAdmin) balaPass = balaAdmin.password;
      if (vaishnavAdmin) vaishnavPass = vaishnavAdmin.password;
    } catch (e) {
      console.warn('Could not read credentials.json:', e);
    }
  }

  const fallbackAdminPass = process.env.ADMIN_PASSWORD || 'node-wars-master';
  balaPass = balaPass || fallbackAdminPass;
  vaishnavPass = vaishnavPass || fallbackAdminPass;

  const organizers = [
    { username: 'bala', name: 'Bala', role: 'ADMIN', pass: balaPass },
    { username: 'bala-instructor', name: 'Bala (Instructor)', role: 'INSTRUCTOR', pass: balaPass },
    { username: 'vaishnav', name: 'Vaishnav', role: 'ADMIN', pass: vaishnavPass },
    { username: 'vaishnav-instructor', name: 'Vaishnav (Instructor)', role: 'INSTRUCTOR', pass: vaishnavPass }
  ];

  for (const org of organizers) {
    const hash = await bcrypt.hash(org.pass, 10);
    await prisma.user.upsert({
      where: { username: org.username },
      update: { passwordHash: hash, role: org.role },
      create: {
        username: org.username,
        passwordHash: hash,
        role: org.role,
        level: 1,
        xp: 0,
        missionsCompleted: 0
      }
    });
    console.log(`  Organizer account ready: ${org.username} (${org.role})`);
  }

  const missions = [
    {
      id: 'mission-01',
      title: 'FIRST SERVER',
      description: 'The castle has no communication system. Build the first server by hand. Learn how Node.js modules work (require/module.exports) and how the built-in http module answers a request.',
      order: 1,
      difficulty: 'EASY',
      xpReward: 100,
      concepts: JSON.stringify(['Node runtime', 'Modules (require/module.exports)', 'HTTP', 'Server', 'Port']),
      objectives: JSON.stringify(['Export a value from a module with module.exports', 'Require a built-in Node module (http)', 'Create a server with http.createServer', 'Listen on a port']),
      instructions: 'This file has two small parts: a tiny module that exports a greeting, and a server that uses the built-in `http` module to respond to every request. Fill in the two TODOs.',
      starterCode: 'const http = require("http");\n\n// A "module" is just a file. module.exports decides what other\n// files see when they require() this one.\nconst greeter = {\n  // TODO 1: make this return "Hello from the castle gate"\n  greet() {\n    return "";\n  }\n};\nmodule.exports = greeter;\n\nconst PORT = process.env.PORT || 3000;\n\n// TODO 2: use greeter.greet() as the response body\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { "Content-Type": "text/plain" });\n  res.end(greeter.greet());\n});\n\nserver.listen(PORT, () => {\n  console.log(`Server listening on port ${PORT}`);\n});\n',
      hints: JSON.stringify(['module.exports = greeter makes this object available to any file that calls require() on this file', 'require("http") loads a module that ships with Node itself - no install needed', 'http.createServer takes a function that receives (req, res) for every request', 'res.end(text) sends the response body and closes it']),
      prerequisites: JSON.stringify([]),
      unlockComponent: 'TERMINAL',
      isBonus: false
    },
    {
      id: 'mission-02',
      title: 'SMART DOOR',
      description: 'NPM lets you use code you did not write yourself. Install Express (already in this project) and stand up one route with it, instead of writing raw HTTP parsing by hand.',
      order: 2,
      difficulty: 'EASY',
      xpReward: 120,
      concepts: JSON.stringify(['NPM', 'package.json', 'node_modules', 'Express', 'Routes']),
      objectives: JSON.stringify(['Understand that npm install downloads code into node_modules based on package.json', 'require() a package instead of a built-in module', 'Define one GET route with Express', 'Send a JSON response']),
      instructions: 'Express is an NPM package - someone else wrote it, published it, and `npm install express` pulled it into node_modules. Use it to answer one route: GET /door/status.',
      starterCode: 'const express = require("express"); // this comes from NPM, not from Node itself\nconst app = express();\n\n// TODO: respond to GET /door/status with res.json({ status: "locked" })\napp.get("/door/status", (req, res) => {\n\n});\n\napp.listen(3001, () => console.log("Smart Door running"));\n',
      hints: JSON.stringify(['Express was installed with `npm install express` and is listed in package.json under dependencies', 'require("express") loads that installed package from node_modules', 'app.get(path, handler) registers a route for GET requests', 'res.json({ ... }) sends a JSON response with the right headers automatically']),
      prerequisites: JSON.stringify(['mission-01']),
      unlockComponent: 'SMART DOOR',
      isBonus: false
    },
    {
      id: 'mission-06',
      title: 'LIVE SECURITY MONITOR',
      description: 'The castle reacts to things happening inside it - a door opening, a guard arriving - without anyone polling and asking "did anything happen yet?". That is what Node\'s EventEmitter does. Register one listener, fire one event. This exact mechanism (just wired to real sockets) is what powers the live multiplayer castle game you will see demoed right after this mission.',
      order: 3,
      difficulty: 'EASY',
      xpReward: 150,
      concepts: JSON.stringify(['Events', 'EventEmitter', '.on()', '.emit()']),
      objectives: JSON.stringify(['Create an EventEmitter', 'Register a listener with .on()', 'Fire an event with .emit()']),
      instructions: 'Create an EventEmitter, listen for a "door_opened" event, and emit it once with a small payload. This is the same publish/subscribe idea the real Node Wars game engine uses to broadcast live events to every player.',
      starterCode: 'const EventEmitter = require("events");\n\nconst castle = new EventEmitter();\n\n// TODO 1: listen for "door_opened" and console.log the payload\n\n\n// TODO 2: emit "door_opened" with { guard: "sentinel" }\n',
      hints: JSON.stringify(['new EventEmitter() creates an object that can broadcast named events', 'castle.on("door_opened", (data) => { ... }) registers a listener', 'castle.emit("door_opened", { guard: "sentinel" }) fires the event and calls every listener', 'Listeners must be registered with .on() before .emit() is called, or they miss it']),
      prerequisites: JSON.stringify(['mission-02']),
      unlockComponent: 'LIVE SECURITY MONITOR',
      isBonus: false
    },
    {
      id: 'mission-08',
      title: 'SIGNAL TOWER',
      description: 'Deployment means getting your code off your laptop and onto a computer somewhere else that stays on 24/7, so anyone can reach it - not just you. Hosting platforms (Render, Railway, Vercel, etc.) run that computer for you. They start your app with your package.json "start" script and hand it a PORT to listen on - your code must use that PORT, not a hardcoded one.',
      order: 4,
      difficulty: 'EASY',
      xpReward: 120,
      concepts: JSON.stringify(['Deployment', 'Hosting', 'process.env.PORT', 'package.json start script']),
      objectives: JSON.stringify(['Understand what "deploying" actually means', 'Read the port from process.env.PORT with a local fallback', 'Write a valid "start" script for package.json'])
      ,
      instructions: 'A hosting platform will run `npm start`, which runs whatever is in package.json\'s "start" script, and it will assign your server a random PORT via an environment variable. Finish the server so it listens on process.env.PORT, and fix the "start" script below so the platform knows how to launch it.',
      starterCode: 'const http = require("http");\n\n// TODO 1: read the port from the environment, falling back to 3000 for local testing\nconst PORT = 3000;\n\nconst server = http.createServer((req, res) => {\n  res.end("Castle server is live 24/7");\n});\n\nserver.listen(PORT, () => console.log(`Listening on ${PORT}`));\n\n// ---- package.json (this is what the hosting platform runs) ----\n// {\n//   "name": "castle-server",\n//   "scripts": {\n//     "start": "TODO"\n//   }\n// }\n',
      hints: JSON.stringify(['Hosting platforms set process.env.PORT to whatever port they gave your app - you rarely control the number', 'Use `const PORT = process.env.PORT || 3000;` so it works both locally and when deployed', 'The "start" script should run `node server.js` (or whatever your entry file is named)', 'If your app ignores process.env.PORT and hardcodes 3000, the host cannot route traffic to it and deployment fails']),
      prerequisites: JSON.stringify(['mission-06']),
      unlockComponent: 'SIGNAL TOWER',
      isBonus: false
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

  console.log(`Database seeded successfully with ${missions.length} missions (4 core, ${missions.filter(m => m.isBonus).length} bonus).`);

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
      question: 'If you call emitter.emit("door_opened") BEFORE calling emitter.on("door_opened", ...), what happens?',
      options: JSON.stringify([
        'Node.js queues the event and delivers it once a listener is registered.',
        'The listener registered afterward never receives that emission - it already happened.',
        'It throws a "no listener" error.',
        'The event fires twice.'
      ]),
      correctAnswer: 'The listener registered afterward never receives that emission - it already happened.',
      explanation: 'emit() is synchronous and only calls listeners that are already registered at the moment it runs - order matters.'
    },
    {
      missionId: 'mission-06',
      question: 'Why does the real Node Wars game use the same EventEmitter pattern you just practiced?',
      options: JSON.stringify([
        'Because it is the only way to write JavaScript.',
        'Because reacting to named events (a door opening, a player joining) as they happen is exactly what a live multiplayer game needs.',
        'Because EventEmitter automatically creates a database.',
        'It does not - the game uses a completely different mechanism.'
      ]),
      correctAnswer: 'Because reacting to named events (a door opening, a player joining) as they happen is exactly what a live multiplayer game needs.',
      explanation: 'The real game engine (GameEventBus) wires the same .on()/.emit() pattern to Socket.IO so those events reach every connected browser in real time.'
    },
    // Mission 08 (Deployment & Hosting)
    {
      missionId: 'mission-08',
      question: 'What does "deploying" an application actually mean?',
      options: JSON.stringify([
        'Compressing your code into a zip file',
        'Getting your code running on a computer that stays on 24/7, reachable by others - not just your own laptop',
        'Writing unit tests for your code',
        'Deleting unused npm packages'
      ]),
      correctAnswer: 'Getting your code running on a computer that stays on 24/7, reachable by others - not just your own laptop',
      explanation: 'Deployment moves your code from a machine only you can reach to one that is always on and reachable by everyone else.'
    },
    {
      missionId: 'mission-08',
      question: 'Why should a server read its port from process.env.PORT instead of hardcoding 3000?',
      options: JSON.stringify([
        'Hardcoded ports run faster',
        'Hosting platforms assign their own port at runtime, and your app must listen on whatever they give it',
        'process.env.PORT is required by JavaScript syntax',
        'It has no real effect either way'
      ]),
      correctAnswer: 'Hosting platforms assign their own port at runtime, and your app must listen on whatever they give it',
      explanation: 'If your app ignores the assigned PORT and only listens on 3000, the host cannot route traffic to it and the deployment fails.'
    },
    {
      missionId: 'mission-08',
      question: 'What does the "start" script in package.json do?',
      options: JSON.stringify([
        'It lists your project\'s dependencies',
        'It tells hosting platforms (and `npm start`) the exact command to launch your app',
        'It starts your code editor',
        'It runs your test suite'
      ]),
      correctAnswer: 'It tells hosting platforms (and `npm start`) the exact command to launch your app',
      explanation: 'Most hosting platforms run `npm start` automatically, which runs whatever command is defined under scripts.start.'
    },
    {
      missionId: 'mission-08',
      question: 'You wrote `const PORT = process.env.PORT || 3000;`. What does the `|| 3000` do?',
      options: JSON.stringify([
        'It multiplies the port by 3000',
        'It provides a fallback so the app still works locally, where PORT usually is not set',
        'It forces the app to always use port 3000',
        'It causes a syntax error'
      ]),
      correctAnswer: 'It provides a fallback so the app still works locally, where PORT usually is not set',
      explanation: 'process.env.PORT is undefined on your own machine unless you set it, so the fallback keeps local development working.'
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

  // Clear dependent attempt rows first (FK constraints) before wiping questions
  await prisma.attemptQuestion.deleteMany();
  await prisma.quizAttempt.deleteMany();
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
