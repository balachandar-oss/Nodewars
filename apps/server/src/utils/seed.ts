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
      type: 'THEORY',
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
      type: 'THEORY',
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
      type: 'CODE',
      question: '`// lever.js\\nmodule.exports = { state: "pulled" };\\n\\n// gate.js\\nconst lever = require("./lever");\\nconsole.log(lever.state);`\\nWhat does this log?',
      options: JSON.stringify(['undefined', '"pulled"', 'an error - require() cannot load local files', '{}']),
      correctAnswer: '"pulled"',
      explanation: 'gate.js requires lever.js, which exports an object with state: "pulled", so lever.state logs "pulled".'
    },

    // Module 2: NPM
    {
      missionId: 'mission-02',
      type: 'THEORY',
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
      type: 'THEORY',
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
      type: 'CODE',
      question: 'You run `require("chalk")` but never ran `npm install chalk` and it is not in package.json. What happens?',
      options: JSON.stringify([
        'Node.js automatically downloads it at runtime',
        'It throws "Cannot find module \'chalk\'" and the app crashes',
        'It silently returns an empty object',
        'It works fine as long as you are online'
      ]),
      correctAnswer: 'It throws "Cannot find module \'chalk\'" and the app crashes',
      explanation: 'require() only looks in node_modules on disk - it does not fetch packages over the network at runtime.'
    },

    // Module 3: Events
    {
      missionId: 'mission-03',
      type: 'THEORY',
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
      type: 'THEORY',
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
    {
      missionId: 'mission-03',
      type: 'CODE',
      question: '`const e = new EventEmitter();\\ne.emit("ping");\\ne.on("ping", () => console.log("pong"));`\\nDoes "pong" get logged?',
      options: JSON.stringify([
        'Yes, immediately',
        'No - emit() ran before the listener was registered, so it is never called',
        'Yes, but only after 1 second',
        'It throws an error'
      ]),
      correctAnswer: 'No - emit() ran before the listener was registered, so it is never called',
      explanation: 'emit() is synchronous and only notifies listeners already registered at the moment it runs.'
    },

    // Module 4: Deployment
    {
      missionId: 'mission-04',
      type: 'THEORY',
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
      type: 'THEORY',
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
      type: 'CODE',
      question: '`const PORT = process.env.PORT || 3000;\\nserver.listen(PORT);`\\nOn the hosting platform, process.env.PORT is 8080. What port does the server listen on?',
      options: JSON.stringify(['3000', '8080', 'Both at once', 'It crashes']),
      correctAnswer: '8080',
      explanation: 'process.env.PORT is 8080 (truthy), so it is used instead of falling back to 3000.'
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
