/**
 * Game Seed Data
 * 20 pre-made bugs with questions, options, correct answers, and fragment values
 * Organized by difficulty: EASY (5), MEDIUM (8), HARD (5), CRITICAL (2)
 */

export interface GameBugSeed {
  id: string;
  vulnerabilityType: string;
  targetSystem: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CRITICAL';
  question: string;
  options: string[];
  correctAnswer: string;
  fragmentValue: number;
  configuration: Record<string, any>;
}

export const gameSeeds: GameBugSeed[] = [
  // ========== EASY (5 bugs - 5 points each) ==========
  // EASY 1 (Modules theme): module.exports mistake
  {
    id: 'seed-bug-easy-01',
    vulnerabilityType: 'MODULE_EXPORT_MISTAKE',
    targetSystem: 'SMART_DOOR',
    difficulty: 'EASY',
    question:
      'A file has `function openDoor() { ... }` but the file never assigns anything to `module.exports`. Another file does `const { openDoor } = require("./door")` and gets `openDoor is not a function`. What is wrong?',
    options: [
      'require() only works with npm packages, never local files',
      'The function was declared but never attached to module.exports, so requiring the file exports an empty object',
      'JavaScript functions cannot be shared between files',
      'The file needs to use import instead of require'
    ],
    correctAnswer:
      'The function was declared but never attached to module.exports, so requiring the file exports an empty object',
    fragmentValue: 5,
    configuration: {
      concept: 'Forgot to attach a function to module.exports',
      location: 'utils/door.js',
      hint: 'Add: module.exports = { openDoor };'
    }
  },

  // EASY 2 (NPM theme): missing dependency
  {
    id: 'seed-bug-easy-02',
    vulnerabilityType: 'MISSING_NPM_DEPENDENCY',
    targetSystem: 'SERVER',
    difficulty: 'EASY',
    question:
      'A route handler does `const dayjs = require("dayjs")`, but "dayjs" was never added to package.json and never installed. What happens when the server starts?',
    options: [
      'Node.js silently skips the require() call',
      'The server crashes with "Cannot find module \'dayjs\'" because the package is not installed',
      'npm automatically installs missing packages on server start',
      'The require() call returns undefined without error'
    ],
    correctAnswer:
      'The server crashes with "Cannot find module \'dayjs\'" because the package is not installed',
    fragmentValue: 5,
    configuration: {
      concept: 'Code requires a package that is missing from package.json/node_modules',
      location: 'routes/resource.ts',
      hint: 'Run npm install dayjs and add it to package.json dependencies'
    }
  },

  // EASY 3: Error Handling Basics
  {
    id: 'seed-bug-easy-03',
    vulnerabilityType: 'MISSING_ERROR_HANDLING',
    targetSystem: 'SECURITY_GATE',
    difficulty: 'EASY',
    question:
      'A route handler synchronously accesses a value that might be undefined, causing a TypeError. What should wrap the logic to prevent a crash?',
    options: [
      'A setTimeout delay',
      'An if statement to check type',
      'A try/catch block',
      'A Promise.reject() call'
    ],
    correctAnswer: 'A try/catch block',
    fragmentValue: 5,
    configuration: {
      concept: 'Missing try/catch error handling',
      location: 'GET /api/gate/status',
      hint: 'Wrap operations on potentially undefined variables'
    }
  },

  // EASY 4: Status Code for Creation
  {
    id: 'seed-bug-easy-04',
    vulnerabilityType: 'WRONG_STATUS_CODE',
    targetSystem: 'RESOURCE_VAULT',
    difficulty: 'EASY',
    question:
      'A POST endpoint successfully creates a new resource. Which HTTP status code should it return?',
    options: [
      '200 OK - General success response',
      '201 Created - Resource was created',
      '204 No Content - Success with no body',
      '202 Accepted - Request accepted for processing'
    ],
    correctAnswer: '201 Created - Resource was created',
    fragmentValue: 5,
    configuration: {
      concept: 'Wrong HTTP status code for resource creation',
      location: 'POST /api/vault/gold',
      hint: 'Resource creation should return 201, not 200'
    }
  },

  // EASY 5: Environment Variables
  {
    id: 'seed-bug-easy-05',
    vulnerabilityType: 'HARDCODED_CONFIG',
    targetSystem: 'ASYNC_CORE',
    difficulty: 'EASY',
    question:
      'A database password is hardcoded in the source file as const DB_PASS = "secret123". Why is this a vulnerability?',
    options: [
      'It makes the server slower',
      'It gets committed to version control and exposed to anyone with repository access',
      'JavaScript does not allow string literals',
      'It prevents the database from starting'
    ],
    correctAnswer:
      'It gets committed to version control and exposed to anyone with repository access',
    fragmentValue: 5,
    configuration: {
      concept: 'Hardcoded secrets in source code',
      location: 'config.ts',
      hint: 'Use process.env.DB_PASS instead of hardcoding'
    }
  },

  // ========== MEDIUM (8 bugs - 10 points each) ==========
  // MEDIUM 1 (Modules theme): circular require
  {
    id: 'seed-bug-medium-01',
    vulnerabilityType: 'CIRCULAR_REQUIRE',
    targetSystem: 'ADMIN_VAULT',
    difficulty: 'MEDIUM',
    question:
      '`vault.js` does `const guard = require("./guard")` at the top, and `guard.js` does `const vault = require("./vault")` at the top. When vault.js loads first, guard.js\'s require of vault.js returns an incomplete, partially-populated object. What is this called?',
    options: [
      'A memory leak',
      'A circular require - the two modules require each other, so one of them gets an unfinished module.exports',
      'A stack overflow error',
      'A missing npm dependency'
    ],
    correctAnswer:
      'A circular require - the two modules require each other, so one of them gets an unfinished module.exports',
    fragmentValue: 10,
    configuration: {
      concept: 'Circular require between two local modules causes an incomplete export',
      location: 'services/vault.js + services/guard.js',
      hint: 'Break the cycle: extract the shared piece into a third module both files require'
    }
  },

  // MEDIUM 2 (Deployment theme): hardcoded port ignoring env config
  {
    id: 'seed-bug-medium-02',
    vulnerabilityType: 'HARDCODED_PORT',
    targetSystem: 'SECURITY_MONITOR',
    difficulty: 'MEDIUM',
    question:
      'The server does `app.listen(3000)` instead of `app.listen(process.env.PORT || 3000)`. On a hosting platform that assigns its own port via the PORT environment variable, what happens?',
    options: [
      'The app automatically listens on whatever port the host assigns',
      'The deployment fails or the app is unreachable, because it ignores the PORT the host gave it and binds to 3000 instead',
      'Nothing - port numbers are ignored by hosting platforms',
      'The app listens on both 3000 and the host-assigned port'
    ],
    correctAnswer:
      'The deployment fails or the app is unreachable, because it ignores the PORT the host gave it and binds to 3000 instead',
    fragmentValue: 10,
    configuration: {
      concept: 'Hardcoded port instead of reading process.env.PORT for deployment',
      location: 'server.ts',
      hint: 'Use: app.listen(process.env.PORT || 3000)'
    }
  },

  // MEDIUM 3 (NPM theme): wrong import path for an installed package
  {
    id: 'seed-bug-medium-03',
    vulnerabilityType: 'WRONG_PACKAGE_IMPORT_PATH',
    targetSystem: 'RESOURCE_VAULT',
    difficulty: 'MEDIUM',
    question:
      '"jsonwebtoken" is correctly listed in package.json and installed, but the code does `const jwt = require("jsonwebtoken/sign")` instead of `require("jsonwebtoken")`. What is the result?',
    options: [
      'It works exactly the same either way',
      '"Cannot find module \'jsonwebtoken/sign\'" - the package is installed, but that specific subpath does not exist inside it',
      'npm automatically corrects the import path at runtime',
      'The package gets reinstalled automatically'
    ],
    correctAnswer:
      '"Cannot find module \'jsonwebtoken/sign\'" - the package is installed, but that specific subpath does not exist inside it',
    fragmentValue: 10,
    configuration: {
      concept: 'Importing a package via a wrong/invalid subpath even though the package itself is installed',
      location: 'services/DataService.ts',
      hint: 'Import the package by its documented entry point: require("jsonwebtoken")'
    }
  },

  // MEDIUM 4: Promise Error Propagation
  {
    id: 'seed-bug-medium-04',
    vulnerabilityType: 'UNHANDLED_REJECTION',
    targetSystem: 'ASYNC_CORE',
    difficulty: 'MEDIUM',
    question:
      'A Promise is created but neither .catch() nor try/catch handles its rejection. What happens in Node.js?',
    options: [
      'The error is silently ignored',
      'Node.js logs an UnhandledPromiseRejectionWarning and may crash the process',
      'The Promise waits forever',
      'The error is stored in memory'
    ],
    correctAnswer:
      'Node.js logs an UnhandledPromiseRejectionWarning and may crash the process',
    fragmentValue: 10,
    configuration: {
      concept: 'Unhandled Promise rejection',
      location: 'routes/async-task.ts',
      hint: 'Add .catch() or wrap in try/catch'
    }
  },

  // MEDIUM 5 (Events theme): missing listener silently breaks a live feature
  {
    id: 'seed-bug-medium-05',
    vulnerabilityType: 'MISSING_EVENT_LISTENER',
    targetSystem: 'SECURITY_MONITOR',
    difficulty: 'MEDIUM',
    question:
      'The castle\'s live event system (GameEventBus, which relays over Socket.IO) does `gameEventBus.emit("bug:planted", payload)` when a bug is planted, so the dashboard updates in real time. A teammate\'s dashboard never updates. They forgot to register `gameEventBus.on("bug:planted", handler)` anywhere. Why does nothing break loudly - no crash, no error?',
    options: [
      'Node.js throws a fatal error whenever emit() has no matching listener',
      'EventEmitter.emit() with no matching listener for that event name is a silent no-op - the event just goes nowhere, so the code keeps running with no crash and no update',
      'The Socket.IO connection automatically disconnects',
      'The event gets queued and fires the next time the server restarts'
    ],
    correctAnswer:
      'EventEmitter.emit() with no matching listener for that event name is a silent no-op - the event just goes nowhere, so the code keeps running with no crash and no update',
    fragmentValue: 10,
    configuration: {
      concept: 'emit() fired with no corresponding .on() listener registered, so a real-time update silently never fires',
      location: 'services/GameEventBus.ts',
      hint:
        'Add: gameEventBus.on("bug:planted", (payload) => { io.to(...).emit("bug:planted", payload); })'
    }
  },

  // MEDIUM 6 (Events theme): listener attached to the wrong emitter instance
  {
    id: 'seed-bug-medium-06',
    vulnerabilityType: 'LISTENER_ATTACHED_WRONG_INSTANCE',
    targetSystem: 'LIVE_SECURITY_MONITOR',
    difficulty: 'MEDIUM',
    question:
      'A module does `const bus = new EventEmitter()` and exports it, but a different file accidentally does `const bus = new EventEmitter()` again (a second, separate instance) and attaches its `.on("hunt:score")` listener there instead of importing the shared bus. The real GameEventBus emits "hunt:score" but the Socket.IO broadcast never fires. What is the root cause?',
    options: [
      'Socket.IO does not support custom event names',
      'Two separate EventEmitter instances exist - listeners on one instance never hear emits from a different instance, even with the same event name',
      'EventEmitter can only have one listener total across the whole app',
      'The event name is case-sensitive and was probably misspelled'
    ],
    correctAnswer:
      'Two separate EventEmitter instances exist - listeners on one instance never hear emits from a different instance, even with the same event name',
    fragmentValue: 10,
    configuration: {
      concept: 'Listener attached to a duplicate EventEmitter instance instead of the shared/imported one',
      location: 'socket/index.ts',
      hint:
        'Import and reuse the single shared instance: const { gameEventBus } = require("../services/GameEventBus")'
    }
  },

  // MEDIUM 7: SQL Injection Prevention
  {
    id: 'seed-bug-medium-07',
    vulnerabilityType: 'SQL_INJECTION',
    targetSystem: 'RESOURCE_VAULT',
    difficulty: 'MEDIUM',
    question:
      'User input is directly concatenated into a SQL query string: const query = "SELECT * FROM users WHERE id = " + userId. What is this vulnerability called?',
    options: [
      'CSRF attack',
      'SQL Injection - attacker can manipulate the query',
      'XSS attack',
      'Buffer overflow'
    ],
    correctAnswer: 'SQL Injection - attacker can manipulate the query',
    fragmentValue: 10,
    configuration: {
      concept: 'User input not parameterized in SQL query',
      location: 'queries/users.ts',
      hint: 'Use parameterized queries or ORM to prevent injection'
    }
  },

  // MEDIUM 8: CORS Misconfiguration
  {
    id: 'seed-bug-medium-08',
    vulnerabilityType: 'CORS_OPEN',
    targetSystem: 'SERVER',
    difficulty: 'MEDIUM',
    question:
      'CORS is configured to allow origin: "*" (all origins) in production. What is the security risk?',
    options: [
      'The server becomes slower',
      'Any website can make authenticated requests to the API from a user\'s browser',
      'The API cannot be used from browsers',
      'Sessions are automatically encrypted'
    ],
    correctAnswer:
      'Any website can make authenticated requests to the API from a user\'s browser',
    fragmentValue: 10,
    configuration: {
      concept: 'Overly permissive CORS configuration',
      location: 'server.ts - CORS setup',
      hint: 'Restrict origin to trusted domains: origin: "https://yourdomain.com"'
    }
  },

  // ========== HARD (5 bugs - 20 points each) ==========
  // HARD 1: Race Condition in Database Update
  {
    id: 'seed-bug-hard-01',
    vulnerabilityType: 'RACE_CONDITION',
    targetSystem: 'RESOURCE_VAULT',
    difficulty: 'HARD',
    question:
      'Two concurrent requests each read a user balance (100), then each adds 50 and saves. Expected result: 200. Actual result: 150. What is this called?',
    options: [
      'Deadlock',
      'Race condition - non-atomic read-modify-write sequence',
      'Database corruption',
      'Network latency'
    ],
    correctAnswer: 'Race condition - non-atomic read-modify-write sequence',
    fragmentValue: 20,
    configuration: {
      concept: 'Non-atomic update vulnerable to concurrent modification',
      location: 'services/BalanceService.ts',
      hint: 'Use atomic database operations: { increment: 50 } instead of read-then-write'
    }
  },

  // HARD 2: JWT Token Validation Flaw
  {
    id: 'seed-bug-hard-02',
    vulnerabilityType: 'INVALID_JWT_VERIFICATION',
    targetSystem: 'SECURITY_GATE',
    difficulty: 'HARD',
    question:
      'A JWT token is decoded but the signature is never verified. An attacker changes the "role" field from PLAYER to ADMIN. What is the vulnerability?',
    options: [
      'The server crashes',
      'Token Tampering - the attacker can modify claims without a secret key',
      'The database is deleted',
      'CORS blocks the request'
    ],
    correctAnswer:
      'Token Tampering - the attacker can modify claims without a secret key',
    fragmentValue: 20,
    configuration: {
      concept: 'JWT signature not verified during token validation',
      location: 'utils/sharedAuth.ts',
      hint: 'Ensure jwt.verify() is called with the secret key'
    }
  },

  // HARD 3: Timing Attack on Comparison
  {
    id: 'seed-bug-hard-03',
    vulnerabilityType: 'TIMING_ATTACK',
    targetSystem: 'ADMIN_VAULT',
    difficulty: 'HARD',
    question:
      'A password comparison uses: if (input === correctPassword). Each character comparison takes time. An attacker uses timing differences to guess the password. What is this attack?',
    options: [
      'Brute force attack',
      'Timing attack - exploiting response time differences',
      'Dictionary attack',
      'Rainbow table attack'
    ],
    correctAnswer: 'Timing attack - exploiting response time differences',
    fragmentValue: 20,
    configuration: {
      concept: 'String comparison leaks timing information',
      location: 'utils/verify.ts',
      hint: 'Use crypto.timingSafeEqual() for sensitive comparisons'
    }
  },

  // HARD 4: Error Message Information Leakage
  {
    id: 'seed-bug-hard-04',
    vulnerabilityType: 'INFO_LEAKAGE',
    targetSystem: 'SECURITY_MONITOR',
    difficulty: 'HARD',
    question:
      'In production, the server responds with detailed database error messages that reveal table names and queries. Why is this dangerous?',
    options: [
      'It slows down the server',
      'Attackers learn the database structure and can craft targeted SQL injection attacks',
      'It makes logging harder',
      'It has no security impact'
    ],
    correctAnswer:
      'Attackers learn the database structure and can craft targeted SQL injection attacks',
    fragmentValue: 20,
    configuration: {
      concept: 'Detailed error messages expose system internals in production',
      location: 'routes/all-routes.ts',
      hint: 'In production, respond with generic error message: "Server error". Log full details on server only.'
    }
  },

  // HARD 5 (Deployment theme): hardcoded config instead of env var
  {
    id: 'seed-bug-hard-05',
    vulnerabilityType: 'HARDCODED_ENV_CONFIG',
    targetSystem: 'SERVER',
    difficulty: 'HARD',
    question:
      'In server.ts, the database connection string is hardcoded as `const DATABASE_URL = "file:./dev.db"` instead of reading `process.env.DATABASE_URL`. The app works fine locally but fails to find the production database after deployment. Why?',
    options: [
      'SQLite databases cannot be deployed at all',
      'The hardcoded local path is baked into the code and deployed as-is, ignoring whatever DATABASE_URL the hosting platform actually provides for production',
      'Deployment platforms delete all environment variables automatically',
      'The server always prefers hardcoded values over environment variables at runtime'
    ],
    correctAnswer:
      'The hardcoded local path is baked into the code and deployed as-is, ignoring whatever DATABASE_URL the hosting platform actually provides for production',
    fragmentValue: 20,
    configuration: {
      concept: 'Hardcoded config value instead of reading it from process.env at deploy time',
      location: 'server.ts',
      hint: 'Read config from environment: const DATABASE_URL = process.env.DATABASE_URL;'
    }
  },

  // ========== CRITICAL (2 bugs - 50 points each) ==========
  // CRITICAL 1: Authorization Bypass + Information Leakage Chain
  {
    id: 'seed-bug-critical-01',
    vulnerabilityType: 'AUTHORIZATION_CHAIN',
    targetSystem: 'ADMIN_VAULT',
    difficulty: 'CRITICAL',
    question:
      'A PLAYER can access /admin (no role check). The response includes userIds, which they use to brute-force passwords via /api/auth/reset?userId=X. Which vulnerabilities are chained?',
    options: [
      'Only CORS misconfiguration',
      'Broken Access Control + Information Disclosure, enabling account takeover',
      'Only SQL Injection',
      'Only timing attacks'
    ],
    correctAnswer:
      'Broken Access Control + Information Disclosure, enabling account takeover',
    fragmentValue: 50,
    configuration: {
      concept: 'Multiple chained vulnerabilities enable account takeover',
      location: 'routes/admin.ts + routes/auth.ts',
      hint:
        'Fix: 1) Add role check to /admin, 2) Remove userIds from response, 3) Rate-limit password reset attempts'
    }
  },

  // CRITICAL 2: Authentication Bypass via Object Injection
  {
    id: 'seed-bug-critical-02',
    vulnerabilityType: 'PROTOTYPE_POLLUTION',
    targetSystem: 'SECURITY_GATE',
    difficulty: 'CRITICAL',
    question:
      'A user sends: {"username":"player","role":"ADMIN","__proto__":{"isAdmin":true}}. The object merge does not handle __proto__, and all users become admins. What is this?',
    options: [
      'Cross-site scripting',
      'Prototype Pollution - polluting Object.prototype to affect all objects',
      'Buffer overflow',
      'Denial of service'
    ],
    correctAnswer:
      'Prototype Pollution - polluting Object.prototype to affect all objects',
    fragmentValue: 50,
    configuration: {
      concept: 'Object.assign() or spread operator vulnerable to prototype pollution',
      location: 'utils/userValidation.ts',
      hint:
        'Use Object.create(null) or filter out __proto__, constructor, prototype before merging'
    }
  }
];

export const createGameBugConfiguration = (bug: GameBugSeed) => ({
  ...bug.configuration,
  difficulty: bug.difficulty,
  question: bug.question,
  options: bug.options,
  correctAnswer: bug.correctAnswer,
  fragmentValue: bug.fragmentValue
});
