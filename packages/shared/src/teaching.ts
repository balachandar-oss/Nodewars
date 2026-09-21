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


export interface NarrativeContent {
  act: string;
  systemName: string;
  threatStatus: string;
  objective: string;
  systemConnection: string;
  successMessage: string;
  systemStatus: string;
  nextThreat: string;
  nextObjective: string;
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
  narrative?: NarrativeContent;
}

export const teachingRegistry: Record<string, MissionTeachingContent> = {
  'mission-01': {
    missionId: 'mission-01',
    title: 'FIRST SERVER & DEPLOYMENT BASICS',
    briefing: 'The castle has no communication system. We need to establish a basic server and understand how to deploy it so others can connect.',
    learningObjectives: [
      { id: 'm1-obj1', description: 'Understand what a Node.js module is' },
      { id: 'm1-obj2', description: 'Understand why modules exist' },
      { id: 'm1-obj3', description: 'Import Node.js built-in/core modules using require()' },
      { id: 'm1-obj4', description: 'Understand module.exports and custom modules' },
      { id: 'm1-obj5', description: 'Create a basic HTTP server' },
      { id: 'm1-obj6', description: 'Understand request and response objects' },
      { id: 'm1-obj7', description: 'Understand the difference between localhost and public access' },
      { id: 'm1-obj8', description: 'Understand the purpose of hosting' },
      { id: 'm1-obj9', description: 'Differentiate between IP address, Port, and Domain' },
      { id: 'm1-obj10', description: 'Differentiate between development and production environments' },
      { id: 'm1-obj11', description: 'Understand environment variables and separating configuration from code' },
      { id: 'm1-obj12', description: 'Understand the generic deployment sequence (Build vs Start)' },
      { id: 'm1-obj13', description: 'Recognize common deployment techniques' }
    ],
    concepts: [
      {
        id: 'm1-c1',
        title: 'Node.js Runtime & Modules',
        explanation: 'Node.js allows you to run JavaScript on the server. To organize code, Node uses Modules. A module is a reusable piece of JavaScript functionality. Modules exist so you don\'t have to keep all your code in one giant file.',
        keyTakeaway: 'Modules keep backend code organized and reusable.'
      },
      {
        id: 'm1-c2',
        title: 'Built-in Core Modules & require()',
        explanation: 'Node.js provides built-in (core) modules for essential functionality, like networking and file systems. You use the `require()` mechanism (CommonJS) to load them. Note that a module is different from an NPM package.',
        exampleCode: 'const http = require("http");',
        walkthrough: [
          { codeFragment: 'http', explanation: 'A Node.js built-in/core module.' },
          { codeFragment: 'require()', explanation: 'The mechanism used to load the module.' }
        ],
        visualFlow: ['YOUR FILE', 'require()', 'NODE MODULE', 'EXPORTED FUNCTIONALITY'],
        keyTakeaway: 'Use require() to load built-in Node functionality.'
      },
      {
        id: 'm1-c2b',
        title: 'Custom Modules & module.exports',
        explanation: 'You can also create your own custom local modules. By assigning functionality to `module.exports`, you allow other files to require() it.',
        exampleCode: '// math.js\nmodule.exports = {\n  add(a, b) {\n    return a + b;\n  }\n};\n\n// app.js\nconst math = require("./math");\nconsole.log(math.add(2, 3));',
        walkthrough: [
          { codeFragment: 'module.exports = { ... }', explanation: 'Exposes the math functions from math.js.' },
          { codeFragment: 'require("./math")', explanation: 'Loads your custom module from the local file system.' }
        ],
        visualFlow: ['app.js', 'require("./math")', 'math.js', 'module.exports'],
        keyTakeaway: 'module.exports exposes functionality; require() imports it.'
      },
      {
        id: 'm1-c3',
        title: 'Creating a Server',
        explanation: 'Using the built-in HTTP module, we can create a server that listens for incoming connections and sends responses.',
        exampleCode: 'const http = require("http");\n\nconst server = http.createServer((req, res) => {\n  res.end("System Online");\n});\n\nserver.listen(3000);',
        walkthrough: [
          { codeFragment: 'http.createServer(...)', explanation: 'Creates a new HTTP server.' },
          { codeFragment: 'res.end(...)', explanation: 'Sends the response back to the client and ends the connection.' },
          { codeFragment: 'server.listen(3000)', explanation: 'Starts listening for connections on port 3000.' }
        ],
        keyTakeaway: 'The HTTP module is the foundation of web servers in Node.'
      },
      {
        id: 'm1-c4',
        title: 'LOCALHOST VS PUBLIC ACCESS',
        explanation: 'When your Node server runs on `localhost:3000`, it is running locally on your developer machine. `localhost` (or the IP `127.0.0.1`) conceptually means "this machine". Another computer cannot simply use your localhost address to connect to your application because their computer will look for the server on their own machine, not yours.',
        keyTakeaway: 'Localhost is for local development on your own machine. It is not publicly accessible.'
      },
      {
        id: 'm1-c5',
        title: 'WHAT IS HOSTING?',
        explanation: 'For someone else to access your application, it needs to be hosted. Hosting provides an environment/machine where an application can run and, depending on its configuration, be made accessible to its intended users.\n\nA hosted Node application generally needs:\n- A machine/runtime support (Node.js installed)\n- Application files and dependencies\n- Configuration\n- A running server process\n- Network access',
        visualFlow: ['Developer Laptop', 'Node App (localhost:3000)', 'Deployment', 'Hosted Environment', 'Public Application', 'Users'],
        keyTakeaway: 'Hosting provides the environment and resources necessary to run an application so intended users can reach it.'
      },
      {
        id: 'm1-c6',
        title: 'IP ADDRESS, PORT AND DOMAIN',
        explanation: 'To reach a hosted application over the network, requests rely on three core concepts:\n\n1. **Domain**: Provides a human-friendly name (e.g., https://example.com) that points to a destination.\n2. **IP Address**: Identifies the specific network destination (machine) on the internet.\n3. **Port**: Identifies a specific network service endpoint/process on that machine (e.g., port 3000 for your Node app).',
        visualFlow: ['DOMAIN', 'NETWORK DESTINATION', 'HOSTING ENVIRONMENT', 'NODE PROCESS', 'APPLICATION', 'HTTP RESPONSE'],
        keyTakeaway: 'A Domain resolves to an IP address (the machine), and a Port routes the traffic to the specific running application.'
      },
      {
        id: 'm1-c7',
        title: 'DEVELOPMENT VS PRODUCTION',
        explanation: 'A **Development environment** is your local machine. It focuses on debugging, frequent code changes, uses localhost, and uses development configuration.\n\nA **Production environment** is the deployed application intended for real users. It prioritizes reliability, security, and uses production configuration.\n\nProduction does not simply mean "a bigger computer"; the configuration and operational requirements differ significantly.',
        keyTakeaway: 'Development is for building; Production is for serving real users reliably.'
      },
      {
        id: 'm1-c8',
        title: 'ENVIRONMENT VARIABLES',
        explanation: 'Configuration values that change between environments (like ports or database passwords) should NOT be hardcoded in your source code. Instead, we use Environment Variables.\n\nFor example, setting `PORT=3000` outside your app, and accessing it via `process.env.PORT`.\n\n**WARNING**: `.env` files containing secrets or passwords should never be committed to source control!',
        exampleCode: 'const port = process.env.PORT || 3000;\nserver.listen(port);',
        keyTakeaway: 'Keep configuration and secrets separate from your source code using environment variables.'
      },
      {
        id: 'm1-c9',
        title: 'BUILD, START AND SERVE',
        explanation: 'The basic deployment lifecycle usually follows a sequence:\n\n1. Write Code\n2. Install Dependencies\n3. Configure Environment\n4. Build (If Required)\n5. Start Application\n6. Serve Requests\n\nNote that "build" and "start" are different concepts. Not every Node.js application requires a build step. Plain JavaScript Node apps may run immediately without a separate build step.',
        visualFlow: ['CODE', 'DEPENDENCIES', 'CONFIGURATION', 'BUILD (IF REQUIRED)', 'START', 'SERVE REQUESTS'],
        keyTakeaway: 'Deployment is a sequence of steps to prepare and launch an application in a new environment.'
      },
      {
        id: 'm1-c10',
        title: 'HOW DEPLOYMENT WORKS',
        explanation: 'A generic deployment workflow moves your application from your repository to a hosting environment. The exact steps differ between platforms, but generally include:\n\n- Pulling application source code to the host\n- Installing dependencies\n- Configuring environment variables\n- Starting the Node application process',
        keyTakeaway: 'Deployment is the process of moving and configuring an application into an environment where it can operate.'
      },
      {
        id: 'm1-c11',
        title: 'DEPLOYMENT TECHNIQUES',
        explanation: 'There are many ways to host and deploy applications. No single technique is universally better; they represent different approaches:\n\n1. **Traditional Server / VM**: You manage a virtual computer entirely.\n2. **Platform-as-a-Service (PaaS)**: The platform manages the infrastructure; you just provide the code.\n3. **Containers**: You package your app and its exact runtime environment together.\n4. **Managed Hosting**: A third party handles server maintenance.\n5. **Separate Deployments**: Hosting frontend code (static files) on a CDN and the Node backend elsewhere.',
        keyTakeaway: 'Deployment encompasses various techniques tailored to different application and operational needs.'
      }
    ],
    guidedTask: {
      task: 'Build a basic Node.js HTTP server AND conceptually plan its deployment.',
      requirements: [
        'Use a Node.js built-in module to create an HTTP server (Evaluated automatically).',
        'Listen on the required port 3000 (Evaluated automatically).',
        'Identify what belongs to development vs production (Conceptual).',
        'Identify which values should be configurable (Conceptual).',
        'Identify what must exist in the hosting environment (Conceptual).',
        'Identify whether a build step is required (Conceptual).',
        'NOTE: This is a conceptual/hypothetical deployment-planning exercise. You are NOT required to actually deploy the application or create a cloud account.'
      ],
      successCondition: 'The evaluation engine receives a 200 OK response with "System Online" from port 3000, and you understand the conceptual steps required to eventually deploy it.'
    },
    progressiveHints: [
      { label: 'CONCEPT', text: 'Node provides built-in modules to run servers. Also, remember that localhost only represents the local development environment.' },
      { label: 'DIRECTION', text: 'You need the built-in HTTP module to create a server. Ask yourself: What changes when the application needs to run somewhere other than the developer\'s laptop?' },
      { label: 'PARTIAL SOLUTION', text: 'Use http.createServer(). When planning for production, think about configuration + dependencies + runtime + network access.' },
      { label: 'STRONG GUIDANCE', text: 'Ensure the server listens on port 3000. For deployment, remember the generic sequence: configure -> install -> build if required -> start -> serve.' }
    ],
    failureGuidance: {
      whyItMatters: 'A server needs to be actively listening on the correct port to accept connections. Furthermore, an application that works locally still needs a suitable runtime, configuration, and environment before other users can access it.',
      thinkAbout: 'Did you bind the server to port 3000? For deployment concepts, ask whether the application is still running only on the developer\'s machine or whether it has been placed into an environment designed to serve users.'
    },
    successGuidance: {
      whatYouDid: 'You initialized a basic Node.js HTTP server and learned the conceptual steps to deploy it.',
      whyItWorks: 'The HTTP module handles local network requests. By distinguishing local development from production and understanding deployment workflows, you can eventually share applications securely with real users.'
    },
    reflection: {
      whatYouLearned: [
        'Node.js uses core modules for networking.',
        'Localhost is strictly local; Hosting makes apps accessible.',
        'Environment variables separate configuration from code.'
      ],
      whyItMatters: 'Everything built on top of Node.js fundamentally relies on this exact request-response cycle and module system. Deployment is the essential next step to make that code useful to the world.',
      prompt: 'Why does localhost work for you but not normally for another person on the internet?\nWhat does a hosting environment actually provide to a Node application?\nWhy should configuration such as ports and secrets be separated from source code?\nDoes every Node.js application require a build step? Why or why not?\nWhat is the difference between deploying an application and hosting an application?\nWhich deployment approach would you want to learn more about and why?'
    },
    conceptCheck: [
      {
        question: 'Which statement best describes a Node.js built-in module?',
        options: [
          'A package that must be downloaded from NPM',
          'Functionality provided by Node.js itself',
          'A database table',
          'A browser-only library'
        ],
        correctAnswerIndex: 1,
        explanation: 'Built-in (core) modules come pre-packaged with Node.js.'
      },
      {
        question: 'What does localhost normally refer to?',
        options: [
          'A public cloud server',
          'The local machine',
          'A DNS server',
          'A database'
        ],
        correctAnswerIndex: 1,
        explanation: 'Localhost refers to the local machine you are currently working on. It is not publicly accessible across the internet.'
      },
      {
        question: 'Does every Node.js application require a separate build step before it can run?',
        options: [
          'Yes, always',
          'No, it depends on the application',
          'Only Express applications do',
          'Only applications using npm do'
        ],
        correctAnswerIndex: 1,
        explanation: 'Plain JavaScript Node applications may run immediately without a separate build step. Frameworks like TypeScript or React generally require a build step.'
      },
      {
        question: 'What is the primary difference between an IP Address and a Port?',
        options: [
          'An IP address is human-readable, a Port is a number.',
          'An IP address identifies a network destination (machine), a Port identifies a specific service on that machine.',
          'An IP address is for production, a Port is for development.',
          'They are exactly the same thing.'
        ],
        correctAnswerIndex: 1,
        explanation: 'The IP address routes traffic to the correct computer, while the port routes traffic to the correct application running on that computer.'
      },
      {
        question: 'Why should environment variables be used for configuration like database passwords?',
        options: [
          'Because they magically secure all secrets from hackers.',
          'Because Node.js cannot read passwords from normal strings.',
          'Because configuration should be separated from source code, preventing secrets from being committed to version control.',
          'Because environment variables automatically deploy the application.'
        ],
        correctAnswerIndex: 2,
        explanation: 'Environment variables allow different environments (like Dev vs Prod) to have different configurations without hardcoding sensitive data in the shared source code.'
      },
      {
        question: 'Which of the following best describes the difference between a development and production environment?',
        options: [
          'Production is just development on a bigger computer.',
          'Development is for debugging on a local machine, while production prioritizes reliability for real users.',
          'Development uses localhost, while production always uses Docker.',
          'There is no difference.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Production is configured for stability, security, and real users, while development focuses on speed of iteration and debugging locally.'
      }
    ],
    
    narrative: {
      act: 'ACT I — AWAKEN',
      systemName: 'NODE CORE',
      threatStatus: 'The castle\'s Node core is offline.',
      objective: 'Bring the basic server online.',
      systemConnection: 'This server becomes the foundation for every system that follows.',
      successMessage: 'NODE CORE ONLINE',
      systemStatus: 'The server is listening for connections.',
      nextThreat: 'The core is awake, but there is no structured way to communicate.',
      nextObjective: 'NEXT SYSTEM: SMART DOOR'
    },
    instructorGuide: {
      timeLabel: '25 minutes',
      durationMinutes: 25,
      purpose: 'Understand Node.js runtime, modules, basic HTTP server setup, and foundational deployment concepts.',
      teach: [
        'Node.js runtime and core modules',
        'require() and module.exports',
        'localhost',
        'hosting',
        'IP/port/domain',
        'development vs production',
        'environment variables',
        'deployment workflow',
        'deployment techniques'
      ],
      demonstrate: 'First, demonstrate require("http"). Then run a server on localhost:3000. Ask what must change for people outside this computer to access it.',
      ask: 'Is http installed through NPM?\nIf my Node server works perfectly on localhost, why can\'t my friend automatically open it from their laptop?\nWhy shouldn\'t I hardcode a database password into my source code?\nDoes deploying an application always mean using AWS?',
      watchFor: 'Students confusing Node.js, modules, and NPM.\nCommon misconceptions: localhost means internet; hosting and deployment are exactly the same thing; every Node application needs a build step; production is just development on another computer; environment variables automatically make secrets secure; deployment always means a specific cloud provider.',
      letStudentsCode: 'Allow students to implement the basic HTTP server while conceptually planning its deployment.',
      debrief: 'Connect the code they wrote to the module system, and explain how deployment workflows prepare that code for the world.',
      transition: 'The server is alive and we know how to deploy it conceptually. Now it needs routes and external dependencies via NPM.'
    }
  },
  'mission-02': {
    missionId: 'mission-02',
    title: 'SMART DOOR',
    briefing: 'The castle needs an intelligent door. We will use the Express framework to build an API that handles door operations.',
    learningObjectives: [
      { id: 'm2-obj1', description: 'Understand NPM and package.json' },
      { id: 'm2-obj2', description: 'Differentiate between dependencies and devDependencies' },
      { id: 'm2-obj3', description: 'Install external packages using npm install' },
      { id: 'm2-obj4', description: 'Initialize an Express application' },
      { id: 'm2-obj5', description: 'Define routes for different HTTP methods (GET, POST) and return JSON' }
    ],
    concepts: [
      {
        id: 'm2-c0',
        title: 'Module vs Package vs Dependency',
        explanation: 'MODULE: reusable JavaScript functionality.\nCORE MODULE: provided by Node.js (e.g. http).\nPACKAGE: distributable piece of software (e.g. express).\nNPM DEPENDENCY: package declared as a project dependency (e.g. express in package.json).',
        visualFlow: ['package.json', 'dependencies', 'express', 'node_modules'],
        keyTakeaway: 'NPM manages external packages; Node runs the code.'
      },
      {
        id: 'm2-c1',
        title: 'NPM & package.json',
        explanation: 'NPM is the package manager / ecosystem. \n`npm init` initializes a project.\n`package.json` declares dependencies and scripts.\n`npm install` resolves and installs packages.\n`node_modules` contains installed packages.\n`package-lock.json` records the resolved dependency tree.',
        exampleCode: 'npm init -y\nnpm install express',
        walkthrough: [
          { codeFragment: 'package.json', explanation: 'declares dependencies and scripts' },
          { codeFragment: 'npm install', explanation: 'resolves and installs packages' },
          { codeFragment: 'node_modules', explanation: 'contains installed packages' },
          { codeFragment: 'package-lock.json', explanation: 'records the resolved dependency tree' }
        ],
        visualFlow: ['PROJECT', 'package.json', 'npm install', 'node_modules', 'EXPRESS'],
        keyTakeaway: 'Node.js is the runtime. NPM is the package manager.'
      },
      {
        id: 'm2-c2',
        title: 'dependencies vs devDependencies',
        explanation: '\n`dependencies` → packages required by the application at runtime (like express).\n`devDependencies` → packages primarily needed during development/testing/building.',
        keyTakeaway: 'Separate what your app needs to run from what you need to build it.'
      },
      {
        id: 'm2-c3',
        title: 'NPM Scripts',
        explanation: 'The `scripts` section in `package.json` defines commands. Running `npm start` runs the corresponding script from package.json.',
        exampleCode: '"scripts": {\n  "start": "node app.js"\n}',
        keyTakeaway: 'NPM scripts automate common tasks.'
      },
      {
        id: 'm2-c4',
        title: 'Express Framework',
        explanation: 'Express is an external package, NOT a built-in Node module. It makes creating APIs much simpler than using the raw HTTP module.',
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
        'Use the Express package.',
        'Define the required routes.',
        'Return the required JSON responses.',
        'Use the required HTTP methods.'
      ],
      successCondition: 'The evaluator can successfully request and receive the door status in JSON format.'
    },
    progressiveHints: [
      { label: 'CONCEPT', text: 'Applications often depend on functionality that is not built into Node itself.' },
      { label: 'DIRECTION', text: 'Which project file records the packages your application depends on?' },
      { label: 'PARTIAL SOLUTION', text: 'External packages such as Express are installed through NPM.' },
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
      prompt: 'Why is Express installed through NPM while http is not?\nWhat is the relationship between Node.js, NPM, and Express?'
    },
    conceptCheck: [
      {
        question: 'What does package.json primarily contain?',
        options: [
          'HTML markup',
          'Project metadata, scripts, and dependencies',
          'HTTP response data',
          'Database records'
        ],
        correctAnswerIndex: 1,
        explanation: 'package.json manages project configuration and dependencies for NPM.'
      },
      {
        question: 'Which statement correctly describes http and express?',
        options: [
          'Both are Node core modules',
          'http is built into Node, while Express is an external package',
          'Express is built into Node',
          'Neither is importable'
        ],
        correctAnswerIndex: 1,
        explanation: 'http is a built-in core module. Express is an external package from NPM.'
      },
      {
        question: 'What does npm install express do?',
        options: [
          'Creates an HTTP server',
          'Installs Express as a project dependency',
          'Starts the Express server',
          'Creates a custom Node module'
        ],
        correctAnswerIndex: 1,
        explanation: 'npm install retrieves the external package and stores it in node_modules.'
      }
    ],
    
    narrative: {
      act: 'ACT I — AWAKEN',
      systemName: 'API GATEWAY',
      threatStatus: 'The Node core is alive, but the castle has no structured entrance system.',
      objective: 'Build the Smart Door so requests can reach the right destination.',
      systemConnection: 'The server from Mission 01 now becomes the foundation for your API routes.',
      successMessage: 'API ROUTES ACTIVE',
      systemStatus: 'The doors now respond to structured requests.',
      nextThreat: 'The doors work, but anyone may attempt to access protected areas.',
      nextObjective: 'NEXT SYSTEM: SECURITY GATE'
    },
    instructorGuide: {
      timeLabel: '15 minutes',
      durationMinutes: 15,
      purpose: 'Understand NPM, Express routing and JSON APIs.',
      teach: [
        'NPM',
        'package.json',
        'dependencies',
        'devDependencies',
        'node_modules',
        'package-lock.json',
        'NPM scripts',
        'external packages'
      ],
      demonstrate: 'npm init -y\nnpm install express\nnpm start',
      ask: 'Where does Express come from?\nWhat does package.json remember?\nWhat is node_modules?\nWhat is the difference between a core module and an external package?',
      watchFor: 'Students thinking NPM = Node.js, or Express = built into Node.js.',
      letStudentsCode: 'Allow students to implement the door status API.',
      debrief: 'Connect NPM concepts to the Express server they built.',
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
    
    narrative: {
      act: 'ACT II — SECURE',
      systemName: 'ACCESS CONTROL',
      threatStatus: 'The API works, but anyone can attempt to access protected areas.',
      objective: 'Build the access-control pipeline.',
      systemConnection: 'Routes can receive requests, but middleware determines how those requests are processed and protected.',
      successMessage: 'SECURITY GATE SECURED',
      systemStatus: 'Identity is verified. Permissions now control access.',
      nextThreat: 'Access is protected, but important resources need persistent storage.',
      nextObjective: 'NEXT SYSTEM: RESOURCE VAULT'
    },
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
    
    narrative: {
      act: 'ACT II — SECURE',
      systemName: 'RESOURCE VAULT',
      threatStatus: 'The castle now has protected routes, but resources have nowhere to live permanently.',
      objective: 'Implement persistent storage for castle resources.',
      systemConnection: 'Protected resources need persistent storage that lives safely behind the security gate.',
      successMessage: 'RESOURCE VAULT SECURED',
      systemStatus: 'The vault can now safely manage its resources.',
      nextThreat: 'The resources exist, but poorly handled operations could block the entire system.',
      nextObjective: 'NEXT SYSTEM: ASYNC OPERATIONS'
    },
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
    
    narrative: {
      act: 'ACT III — STABILIZE',
      systemName: 'ASYNC ENGINE',
      threatStatus: 'The system works, but operations must remain responsive while asynchronous work happens.',
      objective: 'Stabilize operations so the system does not block.',
      systemConnection: 'Database and application operations must be handled without unnecessarily blocking the server.',
      successMessage: 'OPERATIONS STABILIZED',
      systemStatus: 'Operations now complete through a controlled asynchronous flow.',
      nextThreat: 'The system is stable, but defenders are blind to what is happening inside it.',
      nextObjective: 'NEXT SYSTEM: LIVE SECURITY MONITOR'
    },
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
      { id: 'm6-obj1', description: 'Explain what an event is and event-driven programming' },
      { id: 'm6-obj2', description: 'Understand Node.js EventEmitter, emit(), on(), and once()' },
      { id: 'm6-obj3', description: 'Explain event listeners vs handlers and multiple listeners' },
      { id: 'm6-obj4', description: 'Understand why event-driven architecture can reduce coupling' },
      { id: 'm6-obj5', description: 'Distinguish EventEmitter events from ordinary function calls' },
      { id: 'm6-obj6', description: 'Explain the conceptual relationship between EventEmitter and Socket.IO' }
    ],
    concepts: [
      {
        id: 'm6-c1',
        title: 'WHAT IS AN EVENT?',
        explanation: 'An event represents something that happened or should be reacted to (e.g., user login, connection, attack detected, resource changed).\n\nUnlike directly calling a function, emitting an event simply announces that something occurred. Listeners can then decide how to react.\n\nNote: Events in Node.js EventEmitter are NOT automatically asynchronous. By default, listeners are invoked synchronously.',
        exampleCode: 'console.log("Server started");\n\n// Contrast with event-driven:\n// 1. Something happens\n// 2. Event is emitted\n// 3. Listener reacts',
        walkthrough: [
          { codeFragment: 'Event is emitted', explanation: 'An announcement that a specific action occurred.' },
          { codeFragment: 'Listener reacts', explanation: 'Code that executes in response to the event.' }
        ],
        visualFlow: ['SOMETHING HAPPENS', 'EVENT EMITTED', 'LISTENER REACTS'],
        keyTakeaway: 'An event represents something that happened; listeners define what should happen in response.'
      },
      {
        id: 'm6-c2',
        title: 'EVENT-DRIVEN PROGRAMMING',
        explanation: 'Event-driven programming changes how parts of your application communicate.\n\nIn DIRECT FLOW, Component A explicitly calls Component B. This creates tight coupling (A must know about B).\n\nIn EVENT-DRIVEN FLOW, Component A emits an event. Components B, C, and D can listen and react independently without A needing to know they exist.',
        visualFlow: ['DIRECT FLOW: A -> B', 'EVENT FLOW: A -> EVENT -> B & C'],
        keyTakeaway: 'Event-driven architecture reduces tight coupling by separating the event producer from the event consumers.'
      },
      {
        id: 'm6-c3',
        title: 'EVENTEMITTER',
        explanation: '`events` is a Node.js CORE MODULE. It provides the `EventEmitter` class, which is the foundational mechanism for creating and handling events inside a Node process. You do not need to `npm install` it.',
        exampleCode: 'const EventEmitter = require("events");\nconst emitter = new EventEmitter();',
        walkthrough: [
          { codeFragment: 'require("events")', explanation: 'Loads the built-in events module.' },
          { codeFragment: 'new EventEmitter()', explanation: 'Creates a new instance capable of emitting and listening to events.' }
        ],
        visualFlow: ['NODE PROCESS', 'require("events")', 'EventEmitter INSTANCE'],
        keyTakeaway: 'EventEmitter is a built-in Node.js feature for managing events within your application process.'
      },
      {
        id: 'm6-c4',
        title: 'emit() AND on()',
        explanation: '`emit()` triggers/emits an event.\n`on()` registers a listener.\n\nThe event name must match exactly. The function provided to `on()` is the event handler that reacts when the event is emitted.',
        exampleCode: 'emitter.on("alarm", () => {\n  console.log("Alarm triggered");\n});\n\nemitter.emit("alarm");',
        walkthrough: [
          { codeFragment: 'emitter.on("alarm", ...)', explanation: 'Registers a listener for the "alarm" event.' },
          { codeFragment: '() => { ... }', explanation: 'The event handler (the code that reacts).' },
          { codeFragment: 'emitter.emit("alarm")', explanation: 'Triggers the event, causing the registered handler to run.' }
        ],
        keyTakeaway: 'emit() announces that an event happened; on() registers a function to react to it.'
      },
      {
        id: 'm6-c5',
        title: 'once()',
        explanation: '`on()` registers a listener that will react every time the event is emitted.\n`once()` registers a listener that reacts only the first time, and is then immediately removed.',
        exampleCode: 'emitter.once("ready", () => {\n  console.log("System initialized once!");\n});\n\nemitter.emit("ready"); // Triggers handler\nemitter.emit("ready"); // Ignored, listener was removed',
        visualFlow: ['on() -> reacts repeatedly', 'once() -> reacts once -> removes listener'],
        keyTakeaway: 'Use once() when you only care about an event happening for the very first time.'
      },
      {
        id: 'm6-c6',
        title: 'EVENTS IN NODE ARCHITECTURE',
        explanation: 'A major advantage of events is that multiple distinct systems can listen to the exact same event without modifying the code that emits it.\n\nWhen a security breach occurs, you might want to log it, trigger an alarm, and notify an audit system all at once.',
        visualFlow: ['ONE EVENT', 'LOGGER', 'SECURITY MONITOR', 'AUDIT SYSTEM'],
        keyTakeaway: 'Events allow you to easily add new reactions (listeners) without changing the core application logic.'
      },
      {
        id: 'm6-c7',
        title: 'EVENTEMITTER VS SOCKET.IO',
        explanation: 'This distinction is critical.\n\nEventEmitter is a Node.js process-local mechanism. It allows communication between parts of the same running application/process.\n\nSocket.IO is for networked real-time communication. It connects servers and clients (browsers) across the internet.\n\nSocket.IO is event-driven, but it is NOT the same thing as Node.js EventEmitter.',
        visualFlow: ['EventEmitter: Node component -> Node component', 'Socket.IO: Server <-> Network <-> Client'],
        keyTakeaway: 'Use EventEmitter for internal app communication. Use Socket.IO for client-server communication.'
      }
    ],
    guidedTask: {
      task: 'Construct an event-driven security monitor for the castle.',
      requirements: [
        'Define an event-driven security mechanism.',
        'Create/register a listener for security events.',
        'Trigger the appropriate event when a security situation occurs.',
        'Allow the relevant security component to react.',
        'Connect the internal event-driven mechanism to the real-time Socket.IO monitoring behavior.'
      ],
      successCondition: 'The internal event emitter successfully captures events and forwards them to the real-time Socket.IO broadcast system.'
    },
    progressiveHints: [
      { label: 'CONCEPT', text: 'What programming pattern lets one part of the application announce that something happened while other parts react to it independently?' },
      { label: 'DIRECTION', text: 'To achieve this within the Node.js process, you should use Node\'s built-in EventEmitter.' },
      { label: 'PARTIAL SOLUTION', text: 'You need to connect emitting an event with listening for it. Use `emit()` to trigger it and `on()` to catch it.' },
      { label: 'STRONG GUIDANCE', text: 'Create an instance of EventEmitter. Then register a listener with a generic pattern like: `emitter.on("eventName", handler);`' }
    ],
    failureGuidance: {
      whyItMatters: 'Event-driven systems require precise coordination between the emitter and the listener.',
      thinkAbout: 'Check whether the event being emitted is the exact same event string that your listener is registered to receive. Also, think about which component emits the event and which component should react to it. Are you confusing EventEmitter (in-process) with Socket.IO (network)?'
    },
    successGuidance: {
      whatYouDid: 'You built an event-driven architecture that bridges internal Node.js events with real-time websocket broadcasts.',
      whyItWorks: 'Separating event production from event handling reduces tight coupling. The internal system simply announces "something happened" via emit(), and the listener independently decides to broadcast that information to clients via Socket.IO.'
    },
    reflection: {
      whatYouLearned: [
        'Events represent occurrences, not asynchronous magic.',
        'Event-driven flow reduces tight coupling.',
        'EventEmitter is internal; Socket.IO is networked.'
      ],
      whyItMatters: 'Event-driven design is at the core of Node.js architecture.',
      prompt: 'Why can event-driven design reduce coupling between components?\nWhat is the difference between emitting an event and directly calling a function?\nWhen would you use EventEmitter instead of Socket.IO?\nAre events inherently asynchronous in Node.js? Why or why not?'
    },
    conceptCheck: [
      {
        question: 'What is the primary purpose of emit()?',
        options: [
          'To register a function to be called later.',
          'To trigger an event and announce that something happened.',
          'To send data over the network to a browser.',
          'To load an NPM module into the application.'
        ],
        correctAnswerIndex: 1,
        explanation: 'emit() announces the event, causing any registered listeners to run.'
      },
      {
        question: 'What is the primary purpose of on()?',
        options: [
          'To trigger an event.',
          'To install an external dependency.',
          'To register a listener function that reacts to an event.',
          'To make the application run asynchronously.'
        ],
        correctAnswerIndex: 2,
        explanation: 'on() registers a handler function that will be executed whenever the specified event is emitted.'
      },
      {
        question: 'Are EventEmitter events inherently asynchronous in Node.js?',
        options: [
          'Yes, all events run in the background.',
          'Yes, they always use the event loop to defer execution.',
          'No, by default EventEmitter invokes listeners synchronously.',
          'No, but they pause the entire server until finished.'
        ],
        correctAnswerIndex: 2,
        explanation: 'EventEmitter calls all registered listeners synchronously in the order they were registered. They do not automatically run asynchronously.'
      },
      {
        question: 'Which statement accurately describes the difference between EventEmitter and Socket.IO?',
        options: [
          'EventEmitter is an NPM package, Socket.IO is a built-in module.',
          'EventEmitter is for in-process communication, Socket.IO is for networked client-server communication.',
          'EventEmitter is synchronous, Socket.IO is asynchronous.',
          'They are exactly the same thing, just with different names.'
        ],
        correctAnswerIndex: 1,
        explanation: 'EventEmitter handles events entirely within the Node process. Socket.IO uses WebSockets to transmit events across the network between server and client.'
      },
      {
        question: 'Why does event-driven architecture help reduce tight coupling?',
        options: [
          'It makes the code run faster.',
          'It forces everything to be written in a single file.',
          'The event emitter does not need to know which components are listening or how they react.',
          'It replaces the need for a database.'
        ],
        correctAnswerIndex: 2,
        explanation: 'Because the emitter simply announces the event, you can add, remove, or modify listeners without changing the code that emits the event.'
      }
    ],
    
    narrative: {
      act: 'ACT IV — WATCH',
      systemName: 'EVENT MONITOR',
      threatStatus: 'The system is functioning, but defenders need real-time visibility.',
      objective: 'Install a real-time security monitoring system using events.',
      systemConnection: 'Now that the system is operating, events let components react to important activity.',
      successMessage: 'MONITORING ONLINE',
      systemStatus: 'The security monitor is actively tracking internal events.',
      nextThreat: 'The system is observable, but we must test whether its defenses actually hold.',
      nextObjective: 'NEXT SYSTEM: BREAK IT'
    },
    instructorGuide: {
      timeLabel: '20 minutes',
      durationMinutes: 20,
      purpose: 'Understand Node.js Events, EventEmitter, and event-driven architecture.',
      teach: [
        'event concept',
        'event-driven programming',
        'EventEmitter',
        'on()',
        'emit()',
        'once()',
        'listeners',
        'EventEmitter vs Socket.IO'
      ],
      demonstrate: 'Show a tiny generic EventEmitter example with emit() and on().',
      ask: 'What is the event here?\nWho emits it?\nWho listens for it?\nWhat happens if two listeners subscribe?\nIs emit() automatically asynchronous?\nHow is this different from Socket.IO?',
      watchFor: 'Confusing events with asynchronous execution.\nConfusing EventEmitter with Socket.IO.\nThinking emit() sends data over the network.\nConfusing on() with emit().\nAssuming events require npm packages.\nConfusing listeners with event names.',
      letStudentsCode: 'Allow students to implement the event-driven security monitor.',
      debrief: 'Discuss how separating internal events from Socket.IO logic makes the application more robust.',
      transition: 'The systems are communicating via events. Now let\'s see what happens when access control is broken.'
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
    
    narrative: {
      act: 'ACT V — BREACH',
      systemName: 'SECURITY TEST RANGE',
      threatStatus: 'The castle looks secure. But appearances are not proof.',
      objective: 'Test weaknesses in the system and fix the vulnerability.',
      systemConnection: 'All previous security concepts come together in a controlled vulnerability.',
      successMessage: 'BREACH IDENTIFIED AND CONTAINED',
      systemStatus: 'THE SYSTEM SURVIVED. DEFENDER PHASE COMPLETE.',
      nextThreat: 'NOW THE SYSTEM WILL BE TESTED.',
      nextObjective: 'NEXT PHASE: QUIZ'
    },
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
