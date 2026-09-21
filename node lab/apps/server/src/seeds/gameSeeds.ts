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
  // EASY 1: Basic Authentication
  {
    id: 'seed-bug-easy-01',
    vulnerabilityType: 'MISSING_AUTHENTICATION',
    targetSystem: 'SMART_DOOR',
    difficulty: 'EASY',
    question:
      'A resource endpoint does not check if a user is authenticated. Which HTTP status code should the server return when no auth token is provided?',
    options: [
      '200 OK - The server always responds successfully',
      '400 Bad Request - The client sent invalid input',
      '401 Unauthorized - Authentication is required',
      '404 Not Found - The resource does not exist'
    ],
    correctAnswer: '401 Unauthorized - Authentication is required',
    fragmentValue: 5,
    configuration: {
      concept: 'Missing authentication check',
      location: 'GET /api/door/open',
      hint: 'The endpoint does not verify req.user exists'
    }
  },

  // EASY 2: Input Validation
  {
    id: 'seed-bug-easy-02',
    vulnerabilityType: 'MISSING_VALIDATION',
    targetSystem: 'SERVER',
    difficulty: 'EASY',
    question:
      'A POST endpoint accepts a request body but does not validate required fields. What is the correct HTTP status for rejecting invalid input?',
    options: [
      '201 Created - The request was created successfully',
      '204 No Content - The request succeeded with no response',
      '400 Bad Request - The client input was invalid or missing required fields',
      '500 Internal Server Error - The server encountered an error'
    ],
    correctAnswer:
      '400 Bad Request - The client input was invalid or missing required fields',
    fragmentValue: 5,
    configuration: {
      concept: 'Missing input validation',
      location: 'POST /api/resource',
      hint: 'Check if req.body contains required fields before processing'
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
  // MEDIUM 1: Authorization vs Authentication
  {
    id: 'seed-bug-medium-01',
    vulnerabilityType: 'ROLE_CHECK_FLAW',
    targetSystem: 'ADMIN_VAULT',
    difficulty: 'MEDIUM',
    question:
      'A middleware checks if req.user exists (authentication) but never checks req.user.role. What is this missing check called?',
    options: [
      'Authentication - verifying user identity',
      'Authorization - verifying user permissions',
      'Validation - checking input format',
      'Encryption - protecting data in transit'
    ],
    correctAnswer: 'Authorization - verifying user permissions',
    fragmentValue: 10,
    configuration: {
      concept: 'Missing authorization check after authentication',
      location: 'middleware/securityGate',
      hint: 'Add: if (req.user.role !== "ADMIN") return res.status(403)...'
    }
  },

  // MEDIUM 2: Middleware Order
  {
    id: 'seed-bug-medium-02',
    vulnerabilityType: 'MIDDLEWARE_ORDER_FLAW',
    targetSystem: 'SECURITY_MONITOR',
    difficulty: 'MEDIUM',
    question:
      'A security middleware is defined AFTER a vulnerable route handler in Express. What happens when a request comes in?',
    options: [
      'The middleware runs first and protects the route',
      'The route handler executes immediately without middleware protection',
      'Express automatically reorders middleware',
      'The middleware runs on the response, not the request'
    ],
    correctAnswer: 'The route handler executes immediately without middleware protection',
    fragmentValue: 10,
    configuration: {
      concept: 'Security middleware positioned after the route it should protect',
      location: 'routes/sensitive.ts',
      hint: 'Define middleware before the route it protects'
    }
  },

  // MEDIUM 3: Async Error Handling
  {
    id: 'seed-bug-medium-03',
    vulnerabilityType: 'MISSING_AWAIT',
    targetSystem: 'RESOURCE_VAULT',
    difficulty: 'MEDIUM',
    question:
      'An async database call is not awaited in an async function. The function returns before the database operation completes. What is the result?',
    options: [
      'The database call waits automatically',
      'The function returns a pending Promise instead of the data',
      'The server crashes immediately',
      'The request times out'
    ],
    correctAnswer: 'The function returns a pending Promise instead of the data',
    fragmentValue: 10,
    configuration: {
      concept: 'Missing await on async database operation',
      location: 'services/DataService.ts',
      hint: 'Add await before: const result = db.query(...)'
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

  // MEDIUM 5: Event Emitter Errors
  {
    id: 'seed-bug-medium-05',
    vulnerabilityType: 'MISSING_ERROR_LISTENER',
    targetSystem: 'SECURITY_MONITOR',
    difficulty: 'MEDIUM',
    question:
      'An EventEmitter listener throws an error, but the emitter has no "error" event listener. How should errors in listeners be handled?',
    options: [
      'Errors are always automatically caught',
      'With try/catch inside the listener or an "error" event handler on the emitter',
      'Errors cannot occur in event listeners',
      'By disabling the emitter'
    ],
    correctAnswer:
      'With try/catch inside the listener or an "error" event handler on the emitter',
    fragmentValue: 10,
    configuration: {
      concept: 'Missing error handling in EventEmitter listener',
      location: 'services/GameEventBus.ts',
      hint:
        'Add: emitter.on("error", (err) => { console.error(err); })'
    }
  },

  // MEDIUM 6: Socket.IO Room Access Control
  {
    id: 'seed-bug-medium-06',
    vulnerabilityType: 'MISSING_ROOM_VALIDATION',
    targetSystem: 'LIVE_SECURITY_MONITOR',
    difficulty: 'MEDIUM',
    question:
      'A Socket.IO endpoint broadcasts a message to all connected users without checking which room they joined. What is the vulnerability?',
    options: [
      'The server crashes',
      'Users see messages meant for other teams or unauthorized users',
      'The broadcast is encrypted automatically',
      'Socket.IO prevents this automatically'
    ],
    correctAnswer: 'Users see messages meant for other teams or unauthorized users',
    fragmentValue: 10,
    configuration: {
      concept: 'Missing room-based access control in Socket.IO',
      location: 'socket/index.ts',
      hint:
        'Use: io.to("team:" + teamId).emit() instead of io.emit()'
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

  // HARD 5: Missing HTTPS Enforcement
  {
    id: 'seed-bug-hard-05',
    vulnerabilityType: 'MISSING_HTTPS',
    targetSystem: 'SERVER',
    difficulty: 'HARD',
    question:
      'The API accepts both HTTP and HTTPS requests in production, including authentication requests with JWT tokens. What is the vulnerability?',
    options: [
      'The server becomes slower',
      'Man-in-the-Middle attack - tokens and credentials can be intercepted over unencrypted HTTP',
      'The database is deleted',
      'Users are locked out'
    ],
    correctAnswer:
      'Man-in-the-Middle attack - tokens and credentials can be intercepted over unencrypted HTTP',
    fragmentValue: 20,
    configuration: {
      concept: 'Missing HTTP to HTTPS redirect in production',
      location: 'server.ts',
      hint: 'Use HSTS header and force HTTPS redirect in production'
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
