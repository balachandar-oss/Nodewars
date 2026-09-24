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
      title: 'NODE CORE',
      description: 'The castle\'s core is broken. A critical element is offline due to a missing connection. We must establish the connection using Node\'s module system.',
      order: 1,
      difficulty: 'EASY',
      xpReward: 100,
      concepts: JSON.stringify(['Node runtime', 'Modules (require/module.exports)', 'HTTP', 'Server', 'Port']),
      objectives: JSON.stringify(['Export a value from a module', 'Require a module']),
      instructions: 'Repair the broken castle core by connecting the Lever to the Gate.',
      starterCode: 'const lever = { state: "pulled" };\n\n// TODO 1: export the lever\n\n\n// --- In gate.js ---\n// TODO 2: require the lever\n// const lever = ...\n',
      hints: JSON.stringify(['module.exports = lever', 'require("./lever")']),
      prerequisites: JSON.stringify([]),
      unlockComponent: 'TERMINAL',
      isBonus: false
    },
    {
      id: 'mission-02',
      title: 'NPM SUPPLY',
      description: 'The castle needs a specific capability to function, but we do not have the code for it. We must supply the missing capability using NPM.',
      order: 2,
      difficulty: 'EASY',
      xpReward: 120,
      concepts: JSON.stringify(['NPM', 'package.json', 'node_modules', 'Dependencies']),
      objectives: JSON.stringify(['Understand npm install', 'require() an external package']),
      instructions: 'Supply the missing castle capability by fixing the package dependencies.',
      starterCode: '// TODO: require the missing capability package that you installed via NPM\n// const capability = require("...");\n\nconsole.log("Capability loaded!");',
      hints: JSON.stringify(['Check the package.json', 'npm install <package>']),
      prerequisites: JSON.stringify(['mission-01']),
      unlockComponent: 'SMART DOOR',
      isBonus: false
    },
    {
      id: 'mission-03',
      title: 'EVENT SYSTEM',
      description: 'The castle\'s circuits are dead. The Lever is pulled, but the Gate does not respond. We must repair the circuit using the Node.js Event system.',
      order: 3,
      difficulty: 'EASY',
      xpReward: 150,
      concepts: JSON.stringify(['Events', 'EventEmitter', '.on()', '.emit()']),
      objectives: JSON.stringify(['Create an EventEmitter', 'Register a listener with .on()', 'Fire an event with .emit()']),
      instructions: 'Repair the event circuit between the Lever and the Gate.',
      starterCode: 'const EventEmitter = require("events");\nconst castle = new EventEmitter();\n\n// TODO 1: listen for "lever_pulled"\n\n\n// TODO 2: emit "lever_pulled"\n',
      hints: JSON.stringify(['castle.on("lever_pulled", () => {})', 'castle.emit("lever_pulled")']),
      prerequisites: JSON.stringify(['mission-02']),
      unlockComponent: 'EVENT MONITOR',
      isBonus: false
    },
    {
      id: 'mission-04',
      title: 'SIGNAL TOWER',
      description: 'The castle works perfectly on your local machine, but it is isolated. We must take it online by fixing its deployment configuration so others can reach it.',
      order: 4,
      difficulty: 'EASY',
      xpReward: 120,
      concepts: JSON.stringify(['Deployment', 'Hosting', 'process.env.PORT', 'package.json start script']),
      objectives: JSON.stringify(['Understand what deploying means', 'Read the port from process.env.PORT']),
      instructions: 'Configure the Signal Tower so the castle can be deployed.',
      starterCode: 'const http = require("http");\n\n// TODO 1: use process.env.PORT with a fallback to 3000\nconst PORT = 3000;\n\nconst server = http.createServer((req, res) => {\n  res.end("Castle is online");\n});\n\nserver.listen(PORT, () => console.log(`Listening on ${PORT}`));\n',
      hints: JSON.stringify(['const PORT = process.env.PORT || 3000;']),
      prerequisites: JSON.stringify(['mission-03']),
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

  // Remove stale missions from older mission ID schemes (e.g. mission-05..08)
  // and their dependent rows, so this stays idempotent across restructures.
  const currentMissionIds = missions.map(m => m.id);
  const staleMissions = await prisma.mission.findMany({
    where: { id: { notIn: currentMissionIds } },
    select: { id: true },
  });
  if (staleMissions.length > 0) {
    const staleIds = staleMissions.map(m => m.id);
    console.log(`Removing stale missions: ${staleIds.join(', ')}`);
    await prisma.submission.deleteMany({ where: { missionId: { in: staleIds } } });
    await prisma.missionProgress.deleteMany({ where: { missionId: { in: staleIds } } });
    await prisma.mission.deleteMany({ where: { id: { in: staleIds } } });
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
    // Module 1: Node.js + Modules
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

    // Module 2: NPM
    {
      missionId: 'mission-02',
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
      explanation: 'dependencies are needed for the app to run in production, while devDependencies are only needed during development.'
    },
    {
      missionId: 'mission-02',
      question: 'Why is it a bad idea to commit the node_modules folder to Git?',
      options: JSON.stringify([
        'It is usually very large, OS-specific, and can be regenerated via npm install',
        'Git cannot track folders named node_modules',
        'It contains your source code',
        'It crashes the Git repository'
      ]),
      correctAnswer: 'It is usually very large, OS-specific, and can be regenerated via npm install',
      explanation: 'node_modules is generated from package.json/package-lock.json. Committing it wastes space and causes OS conflicts.'
    },
    {
      missionId: 'mission-02',
      question: 'What happens when you run `npm install` with no arguments?',
      options: JSON.stringify([
        'It compiles the code.',
        'It downloads the packages listed in package.json into node_modules.',
        'It starts the Node.js server.',
        'It creates a new module.'
      ]),
      correctAnswer: 'It downloads the packages listed in package.json into node_modules.',
      explanation: 'npm install reads package.json and downloads all required packages.'
    },

    // Module 3: Events
    {
      missionId: 'mission-03',
      question: 'What is the primary purpose of emit()?',
      options: JSON.stringify([
        'To register a function to be called later.',
        'To trigger an event and announce that something happened.',
        'To load an NPM module into the application.',
        'To compile JavaScript.'
      ]),
      correctAnswer: 'To trigger an event and announce that something happened.',
      explanation: 'emit() announces the event, causing any registered listeners to run.'
    },
    {
      missionId: 'mission-03',
      question: 'What is the primary purpose of on()?',
      options: JSON.stringify([
        'To trigger an event.',
        'To register a listener function that reacts to an event.',
        'To install an external dependency.',
        'To create an HTTP connection.'
      ]),
      correctAnswer: 'To register a listener function that reacts to an event.',
      explanation: 'on() registers a handler function that will be executed whenever the specified event is emitted.'
    },
    {
      missionId: 'mission-03',
      question: 'If you call emitter.emit("door_opened") BEFORE calling emitter.on("door_opened", ...), what happens?',
      options: JSON.stringify([
        'Node.js queues the event and delivers it once a listener is registered.',
        'The listener registered afterward never receives that emission - it already happened.',
        'It throws a "no listener" error.',
        'The event fires twice.'
      ]),
      correctAnswer: 'The listener registered afterward never receives that emission - it already happened.',
      explanation: 'emit() is synchronous and only calls listeners that are already registered at the moment it runs.'
    },
    {
      missionId: 'mission-03',
      question: 'How do you trigger an event on an instance of EventEmitter?',
      options: JSON.stringify(['emitter.trigger("event")', 'emitter.send("event")', 'emitter.emit("event")', 'emitter.broadcast("event")']),
      correctAnswer: 'emitter.emit("event")',
      explanation: 'The .emit() method is used to synchronously call all listeners registered for the named event.'
    },
    {
      missionId: 'mission-03',
      question: 'What is a major benefit of an event-driven architecture?',
      options: JSON.stringify([
        'It makes code execution faster.',
        'It decouples components so they do not need to know about each other directly.',
        'It prevents any errors from occurring.',
        'It encrypts data automatically.'
      ]),
      correctAnswer: 'It decouples components so they do not need to know about each other directly.',
      explanation: 'Event-driven systems decouple the emitter from the listener, making the code more modular and flexible.'
    },

    // Module 4: Deployment
    {
      missionId: 'mission-04',
      question: 'What does "deploying" an application actually mean?',
      options: JSON.stringify([
        'Compressing your code into a zip file',
        'Getting your code running on a computer that stays on 24/7, reachable by others',
        'Writing unit tests for your code',
        'Deleting unused npm packages'
      ]),
      correctAnswer: 'Getting your code running on a computer that stays on 24/7, reachable by others',
      explanation: 'Deployment moves your code from a local machine to one that is always on and reachable by everyone else.'
    },
    {
      missionId: 'mission-04',
      question: 'Why should a server read its port from process.env.PORT instead of hardcoding 3000?',
      options: JSON.stringify([
        'Hardcoded ports run faster',
        'Hosting platforms assign their own port at runtime, and your app must listen on whatever they give it',
        'process.env.PORT is required by JavaScript syntax',
        'It has no real effect either way'
      ]),
      correctAnswer: 'Hosting platforms assign their own port at runtime, and your app must listen on whatever they give it',
      explanation: 'If your app ignores the assigned PORT and only listens on 3000, the host cannot route traffic to it.'
    },
    {
      missionId: 'mission-04',
      question: 'What does the "start" script in package.json do?',
      options: JSON.stringify([
        'It lists your project dependencies',
        'It tells hosting platforms (and `npm start`) the exact command to launch your app',
        'It starts your code editor',
        'It runs your test suite'
      ]),
      correctAnswer: 'It tells hosting platforms (and `npm start`) the exact command to launch your app',
      explanation: 'Most hosting platforms run `npm start` automatically, which runs whatever command is defined under scripts.start.'
    },
    {
      missionId: 'mission-04',
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
    {
      missionId: 'mission-04',
      question: 'What are environment variables used for in Node.js applications?',
      options: JSON.stringify([
        'To store sensitive configuration without hardcoding it',
        'To replace console.log statements',
        'To increase server speed',
        'To automatically handle HTTP requests'
      ]),
      correctAnswer: 'To store sensitive configuration without hardcoding it',
      explanation: 'Environment variables allow you to configure applications differently per environment without changing code.'
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
