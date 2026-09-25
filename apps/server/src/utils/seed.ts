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
      title: 'IGNITION',
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
      title: 'SUPPLY RUN',
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
      title: 'SPARK',
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
      title: 'LAUNCH',
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
    },
    {
      id: 'capstone',
      title: 'THE BUILD',
      description: 'Combine everything from the whole lab - a module, an NPM package, an event connection, and a deployment port - into one working build, then pull the lever yourself.',
      order: 5,
      difficulty: 'MEDIUM',
      xpReward: 150,
      concepts: JSON.stringify(['Modules', 'NPM', 'Events', 'Deployment', 'Combining it all together']),
      objectives: JSON.stringify(['Export a module', 'Require an NPM package', 'Wire an event with on()/emit()', 'Read process.env.PORT with a fallback']),
      instructions: 'Wire together everything you have learned into the Gatehouse, then pull the lever.',
      starterCode: '// GATEHOUSE — bring every system online\n\n// 1. MODULE: export this file\'s lever object\nconst lever = { state: "ready" };\n// TODO 1: export the lever\n\n\n// 2. PACKAGE: bring in an NPM capability\n// TODO 2: require a capability package\n\n\n// 3. EVENT: wire the lever to the gate\nconst EventEmitter = require("events");\nconst gate = new EventEmitter();\n// TODO 3: listen for "lever_pulled" and log a message\n\n\n// 4. DEPLOY: read the port so this can go live\n// TODO 4: read PORT from process.env with a 3000 fallback\n\n\n// Pull the lever!\ngate.emit("lever_pulled");\n',
      hints: JSON.stringify(['module.exports = lever;', 'const capability = require("chalk");', 'gate.on("lever_pulled", () => console.log("Gate opening!"));', 'const PORT = process.env.PORT || 3000;']),
      prerequisites: JSON.stringify(['mission-04']),
      unlockComponent: 'GATEHOUSE',
      isBonus: true
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
      type: 'CODE',
      question: '`// a.js\\nlet x = 5;\\nmodule.exports.x = x;\\nx = 10;\\n\\n// b.js\\nconst a = require("./a");\\nconsole.log(a.x);`\\nWhat does this log?',
      options: JSON.stringify(['5', '10', 'undefined', 'ReferenceError']),
      correctAnswer: '5',
      explanation: 'The value of x (5) was copied onto module.exports.x at the moment of export. Reassigning x afterward does not change the already-exported copy.'
    },
    {
      missionId: 'mission-01',
      type: 'THEORY',
      question: 'If two different files both `require("./config")` in the same running app, how many times does config.js actually execute?',
      options: JSON.stringify(['Twice - once per require() call', 'Once - the result is cached and reused on every later require()', 'Zero - only require.main executes files', 'It depends on file size']),
      correctAnswer: 'Once - the result is cached and reused on every later require()',
      explanation: 'Node caches modules by resolved file path. The second require() returns the cached exports object instead of re-running the file.'
    },
    {
      missionId: 'mission-01',
      type: 'THEORY',
      question: 'Why does reassigning `exports = { foo: "bar" }` directly (instead of `module.exports = ...`) silently fail to export anything?',
      options: JSON.stringify([
        'exports is just a local variable pointing at module.exports - reassigning it breaks that link, while module.exports (what require() actually returns) is untouched',
        'exports is read-only and throws an error',
        'There is no difference; both work identically',
        'exports only works inside async functions'
      ]),
      correctAnswer: 'exports is just a local variable pointing at module.exports - reassigning it breaks that link, while module.exports (what require() actually returns) is untouched',
      explanation: 'require() returns module.exports specifically. exports starts as a reference to it, but reassigning exports just repoints the local variable - module.exports (and what the caller receives) never changes.'
    },
    {
      missionId: 'mission-01',
      type: 'CODE',
      question: '`// gate.js\\nconst lever = require("./lever");\\nconsole.log(typeof lever.pull);`\\nIf lever.js never defines module.exports at all, what is logged?',
      options: JSON.stringify(['"function"', '"undefined"', 'It throws before logging anything', '"object"']),
      correctAnswer: '"undefined"',
      explanation: 'A module with no module.exports assignment still resolves to an empty object ({}) by default, so .pull on it is simply undefined - no crash.'
    },
    {
      missionId: 'mission-01',
      type: 'THEORY',
      question: 'What is the key architectural risk of two modules requiring each other (A requires B, and B requires A)?',
      options: JSON.stringify([
        'Node.js crashes immediately with a stack overflow',
        'One of the two modules receives a partial/incomplete exports object, since the circular require returns whatever has been exported so far, not the final version',
        'It works exactly the same as no circular dependency',
        'npm refuses to install the project'
      ]),
      correctAnswer: 'One of the two modules receives a partial/incomplete exports object, since the circular require returns whatever has been exported so far, not the final version',
      explanation: 'Node does not loop forever or crash - but whichever module finishes loading second sees an incomplete version of the other, which is a common source of subtle bugs.'
    },

    // Module 2: NPM
    {
      missionId: 'mission-02',
      type: 'CODE',
      question: 'package.json lists `"chalk": "^4.1.2"`. Which of these could `npm install` legally install today?',
      options: JSON.stringify(['4.9.0', '5.0.0', '3.9.9', '4.0.0']),
      correctAnswer: '4.9.0',
      explanation: 'The caret (^) allows any newer minor/patch version within the same major version (4.x.x), but never jumps to 5.0.0 or drops below 4.1.2.'
    },
    {
      missionId: 'mission-02',
      type: 'THEORY',
      question: 'What specifically does package-lock.json guarantee that package.json alone does not?',
      options: JSON.stringify([
        'Nothing - they contain the same information',
        'The exact resolved version of every package in the full dependency tree, so every install is byte-for-byte reproducible',
        'It stores your environment variables',
        'It lists which files to upload to npm'
      ]),
      correctAnswer: 'The exact resolved version of every package in the full dependency tree, so every install is byte-for-byte reproducible',
      explanation: 'package.json allows a version range (like ^4.1.2); package-lock.json pins the exact version that was actually resolved, including for nested/transitive dependencies.'
    },
    {
      missionId: 'mission-02',
      type: 'THEORY',
      question: 'Your node_modules folder is deleted. A teammate has a package-lock.json committed to the repo. What is the correct command to restore the exact same dependency versions they have?',
      options: JSON.stringify(['npm update', 'npm install', 'npm ci', 'npm audit fix']),
      correctAnswer: 'npm ci',
      explanation: 'npm ci installs strictly from package-lock.json with no version resolution, guaranteeing an identical tree. npm install can still shift versions within allowed ranges.'
    },
    {
      missionId: 'mission-02',
      type: 'CODE',
      question: 'What is the critical difference between `require("./utils")` and `require("utils")`?',
      options: JSON.stringify([
        'No difference, both resolve the same way',
        'The leading ./ means "look for a local file relative to this file"; without it, Node searches node_modules for an installed package named utils',
        './ means it is a built-in Node module',
        'require("utils") is faster'
      ]),
      correctAnswer: 'The leading ./ means "look for a local file relative to this file"; without it, Node searches node_modules for an installed package named utils',
      explanation: 'This exact distinction is what the capstone\'s package-import check relies on - relative paths are your own files, bare names are installed packages.'
    },
    {
      missionId: 'mission-02',
      type: 'THEORY',
      question: 'A package is listed only under devDependencies. What happens if you deploy with `npm install --production` (or `--omit=dev`)?',
      options: JSON.stringify([
        'It installs normally, same as any other dependency',
        'It is skipped entirely, so requiring it in production code would crash with "Cannot find module"',
        'It gets installed but disabled',
        'It causes the install itself to fail'
      ]),
      correctAnswer: 'It is skipped entirely, so requiring it in production code would crash with "Cannot find module"',
      explanation: 'devDependencies (test runners, linters, bundlers) are intentionally excluded from production installs - using one in actual runtime code is a common deployment bug.'
    },

    // Module 3: Events
    {
      missionId: 'mission-03',
      type: 'CODE',
      question: '`const e = new EventEmitter();\\ne.on("x", () => console.log(1));\\ne.on("x", () => console.log(2));\\ne.emit("x");`\\nWhat is logged, and in what order?',
      options: JSON.stringify(['Only 2 (last listener wins)', '1 then 2 - listeners run synchronously in the order they were registered', '2 then 1', 'Nothing - only once() listeners fire'] ),
      correctAnswer: '1 then 2 - listeners run synchronously in the order they were registered',
      explanation: 'EventEmitter supports multiple listeners per event and calls all of them, in registration order, synchronously within the emit() call.'
    },
    {
      missionId: 'mission-03',
      type: 'THEORY',
      question: 'Is EventEmitter.emit() synchronous or asynchronous?',
      options: JSON.stringify([
        'Asynchronous - it queues listeners on the next tick',
        'Synchronous - every matching listener runs to completion before emit() returns',
        'It depends on the Node.js version',
        'Synchronous for one listener, asynchronous for multiple'
      ]),
      correctAnswer: 'Synchronous - every matching listener runs to completion before emit() returns',
      explanation: 'This is a common misconception - emit() is fully synchronous. If you need async behavior, the listener functions themselves must handle it (e.g. with a Promise).'
    },
    {
      missionId: 'mission-03',
      type: 'CODE',
      question: '`e.once("x", () => console.log("fired"));\\ne.emit("x");\\ne.emit("x");`\\nHow many times does "fired" get logged?',
      options: JSON.stringify(['0', '1', '2', 'Infinitely']),
      correctAnswer: '1',
      explanation: '.once() automatically removes its own listener immediately after the first time it fires, so the second emit("x") has nothing left to call.'
    },
    {
      missionId: 'mission-03',
      type: 'THEORY',
      question: 'What is special about Node.js EventEmitter\'s handling of the specific event name "error"?',
      options: JSON.stringify([
        'Nothing - it behaves exactly like any other event name',
        'If an "error" event is emitted with zero listeners registered for it, Node.js throws that error and can crash the process',
        'error events are always ignored silently',
        '"error" events pause the entire event loop'
      ]),
      correctAnswer: 'If an "error" event is emitted with zero listeners registered for it, Node.js throws that error and can crash the process',
      explanation: 'This is a real gotcha in production code - EventEmitter treats "error" as special. Always register an "error" listener on emitters that might emit one.'
    },
    {
      missionId: 'mission-03',
      type: 'CODE',
      question: '`const e = new EventEmitter();\\nfunction log() { console.log("hi"); }\\ne.on("x", log);\\ne.off("x", log);\\ne.emit("x");`\\nWhat happens?',
      options: JSON.stringify(['"hi" is logged once', 'Nothing is logged - the listener was removed with off() before the event fired', 'It throws because off() is not a real method', '"hi" is logged twice']),
      correctAnswer: 'Nothing is logged - the listener was removed with off() before the event fired',
      explanation: '.off() (alias for removeListener()) unregisters a specific listener function. Once removed, that function will not run on future emits.'
    },

    // Module 4: Deployment
    {
      missionId: 'mission-04',
      type: 'CODE',
      question: '`const PORT = process.env.PORT ?? 3000;`\\nIf the hosting platform sets `process.env.PORT` to the empty string `""`, what port does this listen on - and how is that different from using `||` instead of `??`?',
      options: JSON.stringify([
        'Both ?? and || would fall back to 3000 - no difference',
        '?? only falls back on null/undefined, so it keeps the empty string "" (a broken port); || falls back to 3000 because "" is falsy',
        '?? always throws an error on empty strings',
        '|| is not valid JavaScript syntax'
      ]),
      correctAnswer: '?? only falls back on null/undefined, so it keeps the empty string "" (a broken port); || falls back to 3000 because "" is falsy',
      explanation: 'This is a genuine gotcha: ?? (nullish coalescing) only triggers on null/undefined, not on other falsy values like "" or 0 - unlike ||, which treats any falsy value as a reason to fall back.'
    },
    {
      missionId: 'mission-04',
      type: 'THEORY',
      question: 'Why exactly can\'t a hosting platform route traffic to your app if you hardcode `server.listen(3000)` instead of reading process.env.PORT?',
      options: JSON.stringify([
        'Port 3000 is banned by all cloud providers',
        'The platform assigns your container a specific port at runtime (often different from 3000) and only forwards external traffic to that exact port - if your app listens elsewhere, the connection never reaches it',
        'Hardcoded ports run the app twice as slow',
        'It is purely a style preference with no functional effect'
      ]),
      correctAnswer: 'The platform assigns your container a specific port at runtime (often different from 3000) and only forwards external traffic to that exact port - if your app listens elsewhere, the connection never reaches it',
      explanation: 'This is the actual mechanical reason, not just convention - the platform\'s reverse proxy only knows about the port it assigned you.'
    },
    {
      missionId: 'mission-04',
      type: 'THEORY',
      question: 'A .env file containing a real database password gets accidentally committed and pushed to a public GitHub repo, then removed in the very next commit. Is the secret still compromised?',
      options: JSON.stringify([
        'No - deleting it in the next commit removes it completely',
        'Yes - it still exists in the Git history of that earlier commit, which is publicly viewable and often already scraped by bots within minutes',
        'Only if someone stars the repository',
        'No, GitHub automatically scrubs secrets from history'
      ]),
      correctAnswer: 'Yes - it still exists in the Git history of that earlier commit, which is publicly viewable and often already scraped by bots within minutes',
      explanation: 'Git history is permanent unless you rewrite it (and force-push). A committed secret must be treated as compromised and rotated immediately, not just deleted going forward.'
    },
    {
      missionId: 'mission-04',
      type: 'CODE',
      question: '`"scripts": { "start": "node index.js" }` but your actual entry file is named `server.js`. What happens when a hosting platform runs `npm start`?',
      options: JSON.stringify([
        'It automatically finds server.js instead',
        'It fails with "Cannot find module \'index.js\'" - npm start runs exactly the command written, nothing more',
        'It merges index.js and server.js',
        'It silently does nothing'
      ]),
      correctAnswer: 'It fails with "Cannot find module \'index.js\'" - npm start runs exactly the command written, nothing more',
      explanation: 'The start script is not "smart" - it runs the literal command string. A mismatch between the script and your actual entry file is a very common real-world deploy failure.'
    },
    {
      missionId: 'mission-04',
      type: 'THEORY',
      question: 'What is the functional difference between the "start" script and a custom script like "dev" in package.json?',
      options: JSON.stringify([
        'There is no difference; both are custom names',
        '"start" is a reserved npm lifecycle script name that hosting platforms (and plain `npm start`) run automatically; "dev" is just a custom label that must be explicitly invoked with `npm run dev`',
        '"dev" always runs faster than "start"',
        '"start" can only run JavaScript files, "dev" can run any file type'
      ]),
      correctAnswer: '"start" is a reserved npm lifecycle script name that hosting platforms (and plain `npm start`) run automatically; "dev" is just a custom label that must be explicitly invoked with `npm run dev`',
      explanation: 'npm recognizes a small set of reserved script names (start, test, install, etc.) that can be run without "run". Everything else, including "dev", needs the explicit `npm run <name>`.'
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
