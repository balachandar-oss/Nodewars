export interface LearningObjective {
  id: string;
  description: string;
}

export interface CodeWalkthroughStep {
  codeFragment: string;
  explanation: string;
}

export interface ConceptCard {
  id: string;
  title: string;
  explanation: string;
  exampleCode?: string;
  walkthrough?: CodeWalkthroughStep[];
  visualFlow?: string[];
  keyTakeaway?: string;
}

export interface GuidedTask {
  task: string;
  requirements: string[];
  successCondition: string;
}

export interface TeachingHint {
  label: 'CONCEPT' | 'DIRECTION' | 'PARTIAL SOLUTION' | 'STRONG GUIDANCE';
  text: string;
  codeSnippet?: string;
}

export interface Hint {
  id: string;
  text: string;
}

export interface ConceptCheck {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface InstructorGuide {
  timeLabel: string;
  durationMinutes: number;
  purpose: string;
  teach: string[];
  demonstrate: string;
  ask: string;
  watchFor: string;
  letStudentsCode: string;
  debrief: string;
  transition: string;
}

export interface FailureGuidance {
  whyItMatters: string;
  thinkAbout: string;
}

export interface SuccessGuidance {
  whatYouDid: string;
  whyItWorks: string;
}

export interface Reflection {
  whatYouLearned: string[];
  whyItMatters: string;
  prompt: string;
}

export interface ConceptCheckQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface MissionTeachingContent {
  missionId: string;
  title: string;
  briefing: string;
  learningObjectives: LearningObjective[];
  concepts: ConceptCard[];
  guidedTask?: GuidedTask;
  progressiveHints?: TeachingHint[];
  task?: string;
  hints?: Hint[];
  failureGuidance?: FailureGuidance;
  successGuidance?: SuccessGuidance;
  reflection?: Reflection;
  conceptCheck?: ConceptCheckQuestion[];
  instructorGuide?: InstructorGuide;
}

export const teachingRegistry: Record<string, MissionTeachingContent> = {
  'mission-01': {
    missionId: 'mission-01',
    title: 'FIRST SERVER',
    briefing: 'The castle has no communication system. We need to establish a basic server to start taking requests.',
    learningObjectives: [
      { id: 'm1-obj1', description: 'Understand the Node.js runtime' },
      { id: 'm1-obj2', description: 'Create a basic HTTP server' },
      { id: 'm1-obj3', description: 'Understand request and response objects' },
      { id: 'm1-obj4', description: 'Bind a server to a network port' }
    ],
    concepts: [
      {
        id: 'm1-c1',
        title: 'Node.js Runtime',
        explanation: 'Node.js allows you to run JavaScript on the server, outside of a web browser.',
        keyTakeaway: 'Node.js runs JavaScript on the backend.'
      },
      {
        id: 'm1-c2',
        title: 'HTTP Module',
        explanation: 'The built-in HTTP module allows Node.js to transfer data over the Hyper Text Transfer Protocol (HTTP).',
        exampleCode: 'const http = require("http");\n\nconst server = http.createServer((req, res) => {\n  res.end("Hello Castle!");\n});\n\nserver.listen(8080);',
        walkthrough: [
          { codeFragment: 'require("http")', explanation: 'Imports the built-in HTTP module.' },
          { codeFragment: 'http.createServer(...)', explanation: 'Creates a new HTTP server.' },
          { codeFragment: 'res.end(...)', explanation: 'Sends the response back to the client and ends the connection.' },
          { codeFragment: 'server.listen(8080)', explanation: 'Starts listening for connections on port 8080.' }
        ],
        visualFlow: ['CLIENT', 'HTTP REQUEST', 'NODE SERVER', 'HTTP RESPONSE'],
        keyTakeaway: 'The HTTP module is the foundation of web servers in Node.'
      },
      {
        id: 'm1-c3',
        title: 'Request and Response',
        explanation: 'The request (req) object contains information about the incoming client request. The response (res) object is used to send data back to the client.',
        keyTakeaway: 'Requests carry input, responses carry output.'
      }
    ],
    guidedTask: {
      task: 'Build a basic Node.js HTTP server.',
      requirements: [
        'Import the native HTTP module.',
        'Create a server that handles incoming requests.',
        'Respond to all requests with the text "System Online".',
        'Listen for connections on port 3000.'
      ],
      successCondition: 'The evaluation engine receives a 200 OK response with "System Online" from port 3000.'
    },
    progressiveHints: [
      { label: 'CONCEPT', text: 'Which Node module creates an HTTP server?' },
      { label: 'DIRECTION', text: 'Use the `http.createServer` method and assign it to a variable.' },
      { label: 'PARTIAL SOLUTION', text: 'Inside the server callback, use `res.end("System Online")` to reply.' },
      { label: 'STRONG GUIDANCE', text: 'Where does the server bind itself to a port so it can accept connections? Make sure you call the `listen` method at the end of the file.' }
    ],
    failureGuidance: {
      whyItMatters: 'A server needs to be actively listening on the correct port to accept connections.',
      thinkAbout: 'Did you bind the server to port 3000, and did you ensure the request handler sends a response back?'
    },
    successGuidance: {
      whatYouDid: 'You initialized a basic Node.js HTTP server from scratch.',
      whyItWorks: 'The built-in HTTP module provides the core network capabilities that power every Node backend.'
    },
    reflection: {
      whatYouLearned: [
        'Node.js runs JavaScript on the server.',
        'The `http` module creates the foundation of the server.',
        'Requests come in, responses go out.'
      ],
      whyItMatters: 'Everything built on top of Node.js (like Express) fundamentally relies on this exact request-response cycle.',
      prompt: 'If you started a server but never called `res.end()`, what would happen to the client?'
    },
    conceptCheck: [
      {
        question: 'What is the purpose of the response (res) object?',
        options: [
          'To read the incoming data from the user.',
          'To send data back to the client and close the connection.',
          'To start the server listening on a port.',
          'To load the HTTP module.'
        ],
        correctAnswerIndex: 1,
        explanation: 'The request holds input, while the response is used to send output back.'
      }
    ],
    instructorGuide: {
      timeLabel: '10 minutes',
      durationMinutes: 10,
      purpose: 'Understand Node.js runtime and basic HTTP server setup.',
      teach: [
        'Node.js is a runtime',
        'running JavaScript outside the browser',
        'HTTP server',
        'port',
        'request/response'
      ],
      demonstrate: 'node server.js',
      ask: 'What happens when the browser requests localhost:3000?',
      watchFor: 'Students confusing Node.js with a programming language.',
      letStudentsCode: 'Allow students to implement the basic HTTP server.',
      debrief: 'Connect the code they wrote to the client/server request flow.',
      transition: 'The server is alive. Now it needs routes.'
    }
  },
  'mission-02': {
    missionId: 'mission-02',
    title: 'SMART DOOR',
    briefing: 'The castle needs an intelligent door. We will use the Express framework to build an API that handles door operations.',
    learningObjectives: [
      { id: 'm2-obj1', description: 'Initialize an Express application' },
      { id: 'm2-obj2', description: 'Define routes for different HTTP methods (GET, POST)' },
      { id: 'm2-obj3', description: 'Parse JSON request bodies' },
      { id: 'm2-obj4', description: 'Send JSON responses' }
    ],
    concepts: [
      {
        id: 'm2-c1',
        title: 'Express Framework',
        explanation: 'Express is a fast, unopinionated, minimalist web framework for Node.js that makes creating APIs much simpler than using the raw HTTP module.'
      },
      {
        id: 'm2-c2',
        title: 'Routing & JSON',
        explanation: 'Routing refers to determining how an application responds to a client request. We can easily parse and return JSON.',
        exampleCode: 'app.get("/door/status", (req, res) => {\n  res.json({ status: "open" });\n});',
        walkthrough: [
          { codeFragment: 'app.get(...)', explanation: 'Registers a GET route.' },
          { codeFragment: '"/door/status"', explanation: 'Defines the URL path for the route.' },
          { codeFragment: '(req, res)', explanation: 'Provides the request and response objects.' },
          { codeFragment: 'res.json(...)', explanation: 'Sends a JSON response.' }
        ],
        visualFlow: ['REQUEST', 'EXPRESS ROUTER', 'HANDLER', 'JSON RESPONSE'],
        keyTakeaway: 'Express makes defining routes and sending JSON simple.'
      }
    ],
    guidedTask: {
      task: 'Build Express routes for the Smart Door.',
      requirements: [
        'Initialize an Express app and set it to use JSON parsing middleware.',
        'Create a GET route at `/door/status` that returns `{ "status": "closed" }`.',
        'Start the server on port 3000.'
      ],
      successCondition: 'The evaluator can successfully request and receive the door status in JSON format.'
    },
    progressiveHints: [
      { label: 'CONCEPT', text: 'Which Express method handles a GET request?' },
      { label: 'DIRECTION', text: 'You need to initialize the app and then define `app.get("/door/status", ...)`' },
      { label: 'PARTIAL SOLUTION', text: 'To send JSON back, use `res.json({ key: "value" })`' },
      { label: 'STRONG GUIDANCE', text: 'Remember to apply the JSON parsing middleware at the top of your app before defining routes.', codeSnippet: 'app.use(express.json());' }
    ],
    failureGuidance: {
      whyItMatters: 'Express relies on exact path matching and proper middleware configuration.',
      thinkAbout: 'Did you use `express.json()` before declaring your routes, and is the route path exactly `/door/status`?'
    },
    successGuidance: {
      whatYouDid: 'You used Express to rapidly spin up an API endpoint.',
      whyItWorks: 'Express abstracts the native HTTP module, handling URL routing and JSON formatting for you automatically.'
    },
    reflection: {
      whatYouLearned: [
        'Express simplifies server creation.',
        'app.get() binds a function to a specific URL path.',
        'res.json() automatically formats the response as JSON.'
      ],
      whyItMatters: 'REST APIs communicate almost entirely via JSON over distinct URL paths.',
      prompt: 'If a client sent a POST request to `/door/status`, what would Express do?'
    },
    conceptCheck: [
      {
        question: 'What does an Express route connect?',
        options: [
          'A database to a table.',
          'An HTTP method and URL path to a callback function.',
          'A client to a frontend framework.',
          'A JSON file to a server.'
        ],
        correctAnswerIndex: 1,
        explanation: 'A route defines how an application responds to a client request to a particular endpoint (method + path).'
      }
    ],
    instructorGuide: {
      timeLabel: '15 minutes',
      durationMinutes: 15,
      purpose: 'Understand Express routing and JSON APIs.',
      teach: [
        'Express',
        'routes',
        'GET/POST',
        'JSON'
      ],
      demonstrate: 'One tiny GET route.',
      ask: 'Why does Express need the HTTP method as well as the path?',
      watchFor: 'Confusing GET/POST or route paths.',
      letStudentsCode: 'Allow students to implement the door status API.',
      debrief: 'Connect route matching to request handling.',
      transition: 'The door works. Now we need to decide who is allowed through it.'
    }
  },
  'mission-03': {
    missionId: 'mission-03',
    title: 'SECURITY GATE',
    briefing: 'Protect the castle by implementing a security gate. You will learn about middleware to authenticate and authorize users.',
    learningObjectives: [
      { id: 'm3-obj1', description: 'Understand the Express request pipeline' },
      { id: 'm3-obj2', description: 'Write custom middleware functions' },
      { id: 'm3-obj3', description: 'Differentiate between Authentication and Authorization' },
      { id: 'm3-obj4', description: 'Protect routes from unauthorized access' }
    ],
    concepts: [
      {
        id: 'm3-c1',
        title: 'Middleware & next()',
        explanation: 'Middleware functions have access to the request object, response object, and the next function in the application’s request-response cycle.',
        exampleCode: 'const authCheck = (req, res, next) => {\n  if (req.headers.token === "secret") {\n    next();\n  } else {\n    res.status(401).send("No Entry");\n  }\n};\n\napp.get("/vault", authCheck, (req, res) => {\n  res.send("Vault contents");\n});',
        walkthrough: [
          { codeFragment: 'authCheck = (req, res, next)', explanation: 'Defines a custom middleware function.' },
          { codeFragment: 'req.headers.token', explanation: 'Checks for a specific token in the request headers.' },
          { codeFragment: 'next()', explanation: 'Passes control to the next middleware or route handler.' },
          { codeFragment: 'res.status(401)', explanation: 'Rejects the request with an Unauthorized HTTP status code.' }
        ],
        visualFlow: ['REQUEST', 'AUTHENTICATION', 'AUTHORIZATION', 'PROTECTED ROUTE'],
        keyTakeaway: 'Middleware forms a pipeline. Calling next() moves to the next step; sending a response ends the pipeline.'
      },
      {
        id: 'm3-c2',
        title: 'Authentication vs Authorization',
        explanation: 'Authentication checks WHO you are (e.g. logging in). Authorization checks WHAT you can do (e.g. role-based access).',
        keyTakeaway: 'Authentication = Who. Authorization = What.'
      }
    ],
    guidedTask: {
      task: 'Protect the admin route using authentication and authorization middleware.',
      requirements: [
        'Extract the token from `req.headers.authorization`.',
        'Verify the token belongs to a valid user (Authentication).',
        'Verify the user has the ADMIN role (Authorization).',
        'Reject unauthorized access with a 403 Forbidden status.',
        'Allow ADMIN users to access the `/admin` route.'
      ],
      successCondition: 'The security tests pass, correctly rejecting PLAYER roles and accepting ADMIN roles.'
    },
    progressiveHints: [
      { label: 'CONCEPT', text: 'Authentication identifies the user. What checks what they\'re allowed to do?' },
      { label: 'DIRECTION', text: 'Create a middleware function that runs before the route handler. It must call `next()` if the user is an admin.' },
      { label: 'PARTIAL SOLUTION', text: 'Check `req.user.role === "ADMIN"`. If they aren\'t, send `res.status(403).json({ error: "Forbidden" })`.' },
      { label: 'STRONG GUIDANCE', text: 'Apply your custom middleware directly to the route.', codeSnippet: 'app.get("/admin", requireAdmin, (req, res) => { ... });' }
    ],
    failureGuidance: {
      whyItMatters: 'Authentication identifies the user. Authorization determines what that user is allowed to do.',
      thinkAbout: 'What should happen after the server knows who the user is? Are you checking the role?'
    },
    successGuidance: {
      whatYouDid: 'You protected the route and separated identity checking from permission checking.',
      whyItWorks: 'The middleware validates the request before the protected route is allowed to execute.'
    },
    reflection: {
      whatYouLearned: [
        'Middleware controls request processing.',
        'Authentication identifies a user.',
        'Authorization checks permissions.'
      ],
      whyItMatters: 'Protected routes need both identity and permission checks to remain secure.',
      prompt: 'What would happen if authentication existed but authorization did not?'
    },
    conceptCheck: [
      {
        question: 'A user is logged in, but accesses /admin and gets a 403. Which security control successfully blocked them?',
        options: [
          'Authentication',
          'Authorization',
          'Encryption',
          'Routing'
        ],
        correctAnswerIndex: 1,
        explanation: 'Authentication knew who they were (logged in), but Authorization checked their role and blocked them.'
      }
    ],
    instructorGuide: {
      timeLabel: '15 minutes',
      durationMinutes: 15,
      purpose: 'Understand middleware, authentication and authorization.',
      teach: [
        'middleware',
        'authentication',
        'authorization',
        'roles'
      ],
      demonstrate: 'Request -> middleware -> protected route.',
      ask: 'Can a logged-in user automatically access /admin?',
      watchFor: 'Authentication/authorization confusion.',
      letStudentsCode: 'Allow students to implement the security gate.',
      debrief: 'Reinforce identity vs permission.',
      transition: 'The castle is protected. Now it needs persistent resources.'
    }
  },
  'mission-04': {
    missionId: 'mission-04',
    title: 'RESOURCE VAULT',
    briefing: 'Store and manage castle resources safely. We will build an API that performs CRUD operations on a database.',
    learningObjectives: [
      { id: 'm4-obj1', description: 'Understand CRUD operations' },
      { id: 'm4-obj2', description: 'Interact with a database asynchronously' },
      { id: 'm4-obj3', description: 'Handle errors during database operations' }
    ],
    concepts: [
      {
        id: 'm4-c1',
        title: 'CRUD operations with Database',
        explanation: 'CRUD stands for Create, Read, Update, and Delete. Database operations take time, so we must use async/await.',
        exampleCode: 'app.post("/items", async (req, res) => {\n  try {\n    const newItem = await db.items.create(req.body);\n    res.status(201).json(newItem);\n  } catch (error) {\n    res.status(500).json({ error: "Failed to create" });\n  }\n});',
        walkthrough: [
          { codeFragment: 'async (req, res)', explanation: 'Declares the route handler as an asynchronous function.' },
          { codeFragment: 'await db.items.create', explanation: 'Waits for the database insertion to finish before moving on.' },
          { codeFragment: 'try / catch', explanation: 'Gracefully catches and handles any database errors.' },
          { codeFragment: 'res.status(201)', explanation: 'Returns a 201 Created status upon success.' }
        ],
        visualFlow: ['API', 'MODEL', 'DATABASE'],
        keyTakeaway: 'Always use async/await for databases, and always handle errors with try/catch.'
      }
    ],
    guidedTask: {
      task: 'Implement database-backed CRUD operations for the castle inventory.',
      requirements: [
        'Create a GET route that fetches all resources from the database.',
        'Create a POST route that adds a new resource to the database.',
        'Wrap database calls in try/catch blocks.',
        'Return appropriate HTTP status codes (200, 201, 500).'
      ],
      successCondition: 'The evaluator can successfully read from and write to the database using the API.'
    },
    progressiveHints: [
      { label: 'CONCEPT', text: 'Which CRUD operation retrieves existing data?' },
      { label: 'DIRECTION', text: 'You need an `app.get()` route that uses `await Resource.findAll()` or similar.' },
      { label: 'PARTIAL SOLUTION', text: 'For the POST route, parse `req.body` and pass it to your creation query.' },
      { label: 'STRONG GUIDANCE', text: 'Make sure you mark your route callback as `async` before using `await`.', codeSnippet: 'app.get("/resources", async (req, res) => { ... });' }
    ],
    failureGuidance: {
      whyItMatters: 'Database interactions are external. If an API doesn\'t handle them correctly, it will crash or freeze.',
      thinkAbout: 'Did you use `await` on every database call, and did you catch errors if the database fails?'
    },
    successGuidance: {
      whatYouDid: 'You successfully bridged the Express API with the backend data layer.',
      whyItWorks: 'By awaiting the database operations, Node.js can pause the current execution context until the database finishes responding.'
    },
    reflection: {
      whatYouLearned: [
        'CRUD maps to HTTP methods (POST, GET, PUT, DELETE).',
        'Database queries must be asynchronous.',
        'Try/catch is essential for database resilience.'
      ],
      whyItMatters: 'Handling asynchronous errors correctly prevents the entire API server from crashing when the database hiccups.',
      prompt: 'If you forgot `await` before a database read, what would `res.json()` send back to the user?'
    },
    conceptCheck: [
      {
        question: 'Which CRUD operation is used to retrieve existing data?',
        options: [
          'Create (POST)',
          'Read (GET)',
          'Update (PUT/PATCH)',
          'Delete (DELETE)'
        ],
        correctAnswerIndex: 1,
        explanation: 'Read operations are typically handled by HTTP GET requests.'
      }
    ],
    instructorGuide: {
      timeLabel: '15 minutes',
      durationMinutes: 15,
      purpose: 'Understand CRUD operations and database interactions.',
      teach: [
        'database',
        'model',
        'CRUD',
        'async DB operations',
        'errors'
      ],
      demonstrate: 'One simple CRUD operation.',
      ask: 'What are the four CRUD operations?',
      watchFor: 'Confusing HTTP methods with CRUD operations.',
      letStudentsCode: 'Allow students to implement database routes.',
      debrief: 'Connect API -> model -> database.',
      transition: 'The database works. Now let\'s make its operations behave correctly without blocking the application.'
    }
  },
  'mission-05': {
    missionId: 'mission-05',
    title: 'ASYNC OPERATIONS',
    briefing: 'Master non-blocking operations to start the castle power grid.',
    learningObjectives: [
      { id: 'm5-obj1', description: 'Understand the concept of asynchronous programming in Node.js' },
      { id: 'm5-obj2', description: 'Work with Promises' },
      { id: 'm5-obj3', description: 'Use async/await syntax to write readable asynchronous code' }
    ],
    concepts: [
      {
        id: 'm5-c1',
        title: 'Promises and Non-blocking I/O',
        explanation: 'Node.js does not wait for I/O operations to complete. It continues executing other code and handles the I/O result when it is ready. A Promise represents this eventual completion.',
        exampleCode: 'console.log("Start");\n\nfs.promises.readFile("data.txt")\n  .then(data => console.log("File loaded!"))\n  .catch(err => console.error("Error reading"));\n\nconsole.log("End");',
        walkthrough: [
          { codeFragment: 'fs.promises.readFile', explanation: 'Starts reading a file without blocking the rest of the application.' },
          { codeFragment: '.then(data => ...)', explanation: 'Executes this callback only when the file is fully loaded.' },
          { codeFragment: '"Start" -> "End" -> "File loaded!"', explanation: 'Notice how "End" will print BEFORE the file finishes loading.' }
        ],
        keyTakeaway: 'Asynchronous functions return Promises that resolve later, allowing Node to handle other tasks in the meantime.'
      }
    ],
    guidedTask: {
      task: 'Use asynchronous patterns correctly to boot the power grid generators sequentially.',
      requirements: [
        'Identify which functions return Promises.',
        'Use `async/await` or `.then()` to ensure Generator 2 only starts after Generator 1 has finished.',
        'Catch any errors that occur during the boot sequence.'
      ],
      successCondition: 'The boot logs show the generators starting in the correct sequence without crashing.'
    },
    progressiveHints: [
      { label: 'CONCEPT', text: 'What keyword lets an async function wait for a Promise?' },
      { label: 'DIRECTION', text: 'You have a sequence of operations that take time. If you do not wait for the first, the second will fail.' },
      { label: 'PARTIAL SOLUTION', text: 'Use `await powerSystem.bootGenerator(1);` before moving to the next line.' },
      { label: 'STRONG GUIDANCE', text: 'Wrap the entire sequence in a try/catch block to handle failures safely.' }
    ],
    failureGuidance: {
      whyItMatters: 'Some operations depend on the result of previous asynchronous tasks.',
      thinkAbout: 'Are your generators booting at the exact same time, or is one waiting for the other?'
    },
    successGuidance: {
      whatYouDid: 'You successfully synchronized asynchronous tasks in the correct order.',
      whyItWorks: 'The `await` keyword pauses execution of the function until the Promise resolves, ensuring the sequence is preserved.'
    },
    reflection: {
      whatYouLearned: [
        'Node handles I/O asynchronously by default.',
        'Promises represent future values.',
        'Async/await makes asynchronous code read sequentially.'
      ],
      whyItMatters: 'Mastering async flow control is the most critical skill for Node.js developers.',
      prompt: 'If you need to boot 3 independent generators simultaneously, would you use `await` on each one in sequence?'
    },
    conceptCheck: [
      {
        question: 'What keyword allows an async function to pause until a Promise resolves?',
        options: [
          'pause',
          'wait',
          'await',
          'defer'
        ],
        correctAnswerIndex: 2,
        explanation: '`await` tells the JavaScript runtime to suspend the async function until the Promise settles.'
      }
    ],
    instructorGuide: {
      timeLabel: '12 minutes',
      durationMinutes: 12,
      purpose: 'Understand asynchronous operations and Promises.',
      teach: [
        'promises',
        'async/await',
        'non-blocking I/O'
      ],
      demonstrate: 'A tiny async example.',
      ask: 'Why shouldn\'t Node wait unnecessarily for every operation?',
      watchFor: 'Thinking await makes Node globally synchronous.',
      letStudentsCode: 'Allow students to fix the generator boot sequence.',
      debrief: 'Explain that async/await improves readability while preserving asynchronous operation behavior.',
      transition: 'We can perform asynchronous work. Now let\'s make the castle react to events in real time.'
    }
  },
  'mission-06': {
    missionId: 'mission-06',
    title: 'LIVE SECURITY MONITOR',
    briefing: 'Set up an event-driven architecture to monitor the castle in real-time.',
    learningObjectives: [
      { id: 'm6-obj1', description: 'Use the Node.js EventEmitter class' },
      { id: 'm6-obj2', description: 'Integrate Socket.IO for real-time web socket communication' },
      { id: 'm6-obj3', description: 'Broadcast events to specific client rooms' }
    ],
    concepts: [
      {
        id: 'm6-c1',
        title: 'EventEmitter',
        explanation: 'The Node.js core API is built around an event-driven architecture where objects (emitters) emit named events that cause Function objects (listeners) to be called.'
      },
      {
        id: 'm6-c2',
        title: 'Socket.IO & Rooms',
        explanation: 'Socket.IO enables real-time, bidirectional communication. Rooms allow you to broadcast events to a subset of clients.',
        exampleCode: 'io.on("connection", (socket) => {\n  socket.join("guards");\n\n  socket.on("alert", (msg) => {\n    io.to("guards").emit("breach", msg);\n  });\n});',
        walkthrough: [
          { codeFragment: 'io.on("connection", ...)', explanation: 'Listens for new clients connecting.' },
          { codeFragment: 'socket.join("guards")', explanation: 'Adds the connected client to the "guards" room.' },
          { codeFragment: 'socket.on("alert", ...)', explanation: 'Listens for an "alert" event from this specific client.' },
          { codeFragment: 'io.to("guards").emit(...)', explanation: 'Broadcasts a "breach" event to everyone in the "guards" room.' }
        ],
        visualFlow: ['EVENT', 'EVENT BUS', 'SOCKET.IO', 'CLIENTS'],
        keyTakeaway: 'Socket.IO allows you to instantly push events to clients without them having to ask for it.'
      }
    ],
    guidedTask: {
      task: 'Implement event-driven real-time security monitoring via websockets.',
      requirements: [
        'Listen for client socket connections.',
        'When a client emits a `subscribe` event for a specific zone, add them to that Socket.IO room.',
        'When a `breach` event is received, broadcast a warning only to the clients in that specific zone room.'
      ],
      successCondition: 'The test clients successfully receive breach alerts only for the zones they subscribed to.'
    },
    progressiveHints: [
      { label: 'CONCEPT', text: 'What event should be emitted when a security action occurs?' },
      { label: 'DIRECTION', text: 'You need to listen for `subscribe` events inside the main `connection` listener.' },
      { label: 'PARTIAL SOLUTION', text: 'Use `socket.join(zone)` when processing a subscription request.' },
      { label: 'STRONG GUIDANCE', text: 'To broadcast to a specific room, use `io.to(zone).emit("warning", payload)`.' }
    ],
    failureGuidance: {
      whyItMatters: 'Real-time broadcasting relies on clients being grouped accurately into channels/rooms.',
      thinkAbout: 'Did you ensure the client was added to the room before broadcasting, and did you target the correct room string?'
    },
    successGuidance: {
      whatYouDid: 'You implemented a real-time pub/sub system using Websockets.',
      whyItWorks: 'Socket.IO maintains persistent connections and organizes clients into memory-backed rooms for instant messaging.'
    },
    reflection: {
      whatYouLearned: [
        'Events allow decoupled architecture.',
        'Socket.IO maintains persistent connections.',
        'Rooms allow targeted broadcasting.'
      ],
      whyItMatters: 'Modern applications demand real-time feedback. Polling APIs constantly is too slow and wastes resources.',
      prompt: 'If thousands of clients join a single room, what happens to the server memory?'
    },
    conceptCheck: [
      {
        question: 'What mechanism allows connected clients to receive an event in real time without polling?',
        options: [
          'REST API GET Requests',
          'Websockets / Socket.IO',
          'Database Triggers',
          'Cron Jobs'
        ],
        correctAnswerIndex: 1,
        explanation: 'Websockets keep a persistent connection open, allowing the server to push events directly to the client.'
      }
    ],
    instructorGuide: {
      timeLabel: '15 minutes',
      durationMinutes: 15,
      purpose: 'Understand event-driven architecture and WebSockets.',
      teach: [
        'events',
        'EventEmitter',
        'Socket.IO',
        'rooms',
        'broadcasting',
        'real-time'
      ],
      demonstrate: 'Trigger one event and show it reaching another client.',
      ask: 'Why doesn\'t the browser need to keep asking the server for updates?',
      watchFor: 'Confusing polling with real-time event delivery.',
      letStudentsCode: 'Allow students to implement live monitoring.',
      debrief: 'Connect event -> server -> Socket.IO -> clients.',
      transition: 'The systems are connected. Now let\'s see what happens when one of those security controls is implemented incorrectly.'
    }
  },
  'mission-07': {
    missionId: 'mission-07',
    title: 'BREAK IT',
    briefing: 'Find and fix a critical authorization bypass vulnerability in the castle systems.',
    learningObjectives: [
      { id: 'm7-obj1', description: 'Identify broken access control vulnerabilities' },
      { id: 'm7-obj2', description: 'Debug and trace request flow through middleware' },
      { id: 'm7-obj3', description: 'Apply a patch to secure a vulnerable endpoint' }
    ],
    concepts: [
      {
        id: 'm7-c1',
        title: 'Broken Access Control',
        explanation: 'Broken access control is a security vulnerability where users can perform actions or access data outside their intended permissions.',
        exampleCode: '// VULNERABLE\napp.post("/admin/delete", requireAuth, (req, res) => {\n  db.deleteUser(req.body.id);\n});\n\n// SECURE\napp.post("/admin/delete", requireAuth, requireAdminRole, (req, res) => {\n  db.deleteUser(req.body.id);\n});',
        walkthrough: [
          { codeFragment: 'requireAuth', explanation: 'Checks if the user is logged in (Authentication).' },
          { codeFragment: 'requireAdminRole', explanation: 'Checks if the logged-in user actually has permission to delete (Authorization).' }
        ],
        visualFlow: ['REQUEST', 'AUTHENTICATION', 'AUTHORIZATION', 'ACTION ALLOWED'],
        keyTakeaway: 'Never trust the client. Always verify permissions on the server for every protected action.'
      }
    ],
    guidedTask: {
      task: 'Identify and fix the controlled authorization vulnerability.',
      requirements: [
        'Locate the route responsible for deleting system logs.',
        'Ensure that standard users cannot access this endpoint.',
        'Apply the correct authorization middleware.'
      ],
      successCondition: 'The automated attack fails to delete the logs, receiving a 403 Forbidden.'
    },
    progressiveHints: [
      { label: 'CONCEPT', text: 'Ask whether authentication and authorization are both being checked.' },
      { label: 'DIRECTION', text: 'Examine the route definition for `/logs/delete`. What middleware is it using?' },
      { label: 'PARTIAL SOLUTION', text: 'The route currently uses `requireAuth`, which only checks if the user is logged in.' },
      { label: 'STRONG GUIDANCE', text: 'Look at the other secure admin routes. They use a second middleware function to enforce the ADMIN role. Add it to the vulnerable route.' }
    ],
    failureGuidance: {
      whyItMatters: 'If a route only checks authentication, anyone who is logged in can exploit it.',
      thinkAbout: 'Is the route actively verifying that the user is an ADMIN before deleting the logs?'
    },
    successGuidance: {
      whatYouDid: 'You successfully patched a Broken Access Control vulnerability.',
      whyItWorks: 'By inserting the authorization middleware, the request pipeline correctly rejects unauthorized players before the deletion happens.'
    },
    reflection: {
      whatYouLearned: [
        'Broken access control is a top security risk.',
        'Middleware pipelines must be comprehensive.',
        'Authorization is just as important as authentication.'
      ],
      whyItMatters: 'Attackers don\'t follow the UI. They will guess backend URLs directly to see if they are protected.',
      prompt: 'Could an attacker bypass the middleware by using a different HTTP method (like GET)?'
    },
    conceptCheck: [
      {
        question: 'Why is authentication alone insufficient to protect an admin route?',
        options: [
          'Because authentication expires too quickly.',
          'Because authentication only proves who the user is, not what they are allowed to do.',
          'Because authentication does not use HTTPS.',
          'Because authentication tokens can be forged.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Authentication answers "Who are you?" while Authorization answers "What are you allowed to do?" Both are needed.'
      }
    ],
    instructorGuide: {
      timeLabel: '13 minutes',
      durationMinutes: 13,
      purpose: 'Identify and patch a broken access control vulnerability.',
      teach: [
        'debugging',
        'broken access control',
        'authentication vs authorization',
        'security reasoning'
      ],
      demonstrate: 'Only enough to explain the vulnerability concept. DO NOT demonstrate the complete solution.',
      ask: 'Where does the request become trusted?',
      watchFor: 'Students fixing symptoms rather than identifying the authorization problem.',
      letStudentsCode: 'Allow students to find and fix the vulnerability.',
      debrief: 'Connect the bug back to Mission 03.',
      transition: 'Let\'s review everything we learned today.'
    }
  }
};
