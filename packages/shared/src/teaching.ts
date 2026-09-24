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
    title: 'IGNITION',
    briefing: 'The castle\'s core is broken. A critical element is offline due to a missing connection. We must establish the connection using Node\'s module system.',
    learningObjectives: [
      { id: 'm1-obj1', description: 'Understand what a Node.js module is' },
      { id: 'm1-obj2', description: 'Understand why modules exist' },
      { id: 'm1-obj3', description: 'Import Node.js modules using require()' },
      { id: 'm1-obj4', description: 'Understand module.exports and custom modules' }
    ],
    concepts: [
      {
        id: 'm1-c1',
        title: 'Node.js Runtime & Modules',
        explanation: 'Node.js allows you to run JavaScript outside the browser. To organize code, Node uses Modules. A module is a reusable piece of JavaScript functionality. Modules exist so you don\'t have to keep all your code in one giant file.',
        keyTakeaway: 'Modules keep backend code organized and reusable.'
      },
      {
        id: 'm1-c2',
        title: 'Custom Modules & module.exports',
        explanation: 'You can create your own custom local modules. By assigning functionality to `module.exports`, you allow other files to require() it. This is how different parts of our castle communicate.',
        exampleCode: '// gate.js\nmodule.exports = {\n  status: "locked"\n};\n\n// castle.js\nconst gate = require("./gate");\nconsole.log(gate.status);',
        walkthrough: [
          { codeFragment: 'module.exports = { ... }', explanation: 'Exposes the gate object from gate.js.' },
          { codeFragment: 'require("./gate")', explanation: 'Loads your custom module from the local file system.' }
        ],
        visualFlow: ['castle.js', 'require("./gate")', 'gate.js', 'module.exports'],
        keyTakeaway: 'module.exports exposes functionality; require() imports it.'
      }
    ],
    guidedTask: {
      task: 'Repair the broken castle core by connecting the Lever to the Gate.',
      requirements: [
        'Export the Lever object from lever.js.',
        'Require the lever module inside gate.js.'
      ],
      successCondition: 'The Gate successfully imports the Lever and reads its state.'
    },
    progressiveHints: [
      { label: 'CONCEPT', text: 'Files in Node.js cannot automatically see variables in other files. They must be exported and required.' },
      { label: 'DIRECTION', text: 'You need to expose the Lever object so other files can use it.' },
      { label: 'PARTIAL SOLUTION', text: 'In lever.js, use `module.exports = lever;`. In gate.js, use `const lever = require("./lever");`.' },
      { label: 'STRONG GUIDANCE', text: 'Check that the path in require() is correct, e.g., require("./lever").' }
    ],
    failureGuidance: {
      whyItMatters: 'If modules cannot be imported, the elements of the castle are isolated and cannot work together.',
      thinkAbout: 'Did you spell `module.exports` correctly? Did you require the correct file path?'
    },
    successGuidance: {
      whatYouDid: 'You reconnected the castle elements using the Node.js module system.',
      whyItWorks: 'require() and module.exports allow separate JavaScript files to share functionality safely.'
    },
    reflection: {
      whatYouLearned: [
        'Node.js uses modules to organize code.',
        'module.exports shares code; require() imports it.'
      ],
      whyItMatters: 'Every Node.js application uses the module pattern to build complex systems out of small, manageable files.',
      prompt: 'What does module.exports actually do?\nWhy is it better to have many small modules instead of one massive file?'
    },
    conceptCheck: [
      {
        question: 'Which of the following allows a file to expose its variables to other files?',
        options: [
          'import.all',
          'module.exports',
          'global.share',
          'require.expose'
        ],
        correctAnswerIndex: 1,
        explanation: 'module.exports is the CommonJS mechanism for exporting functionality from a module.'
      },
      {
        question: 'How do you bring an exported module into your current file?',
        options: [
          'include()',
          'load()',
          'require()',
          'fetch()'
        ],
        correctAnswerIndex: 2,
        explanation: 'require() is the Node.js function used to load modules.'
      }
    ],
    narrative: {
      act: 'ACT I — AWAKEN',
      systemName: 'IGNITION',
      threatStatus: 'The castle\'s Node core is offline.',
      objective: 'Repair the core by linking the broken modules.',
      systemConnection: 'Modules are the fundamental building blocks of the entire castle infrastructure.',
      successMessage: 'NODE CORE ONLINE',
      systemStatus: 'The castle modules are communicating.',
      nextThreat: 'The core is awake, but it lacks advanced capabilities.',
      nextObjective: 'NEXT SYSTEM: SUPPLY RUN'
    },
    instructorGuide: {
      timeLabel: '15 minutes',
      durationMinutes: 15,
      purpose: 'Understand Node.js runtime and modules.',
      teach: [
        'Node.js runtime',
        'require()',
        'module.exports'
      ],
      demonstrate: 'First, demonstrate a broken require. Then show how module.exports fixes it.',
      ask: 'Why can\'t gate.js just read variables from lever.js directly?',
      watchFor: 'Students mistyping module.exports as modules.export.',
      letStudentsCode: 'Allow students to fix the module export/import.',
      debrief: 'Connect the code they wrote to how the castle elements are constructed.',
      transition: 'The core is alive. Now we need to add capabilities we didn\'t write ourselves using NPM.'
    }
  },
  'mission-02': {
    missionId: 'mission-02',
    title: 'SUPPLY RUN',
    briefing: 'The castle needs a specific capability to function, but we do not have the code for it. We must supply the missing capability using NPM (Node Package Manager).',
    learningObjectives: [
      { id: 'm2-obj1', description: 'Understand NPM and package.json' },
      { id: 'm2-obj2', description: 'Differentiate between dependencies and devDependencies' },
      { id: 'm2-obj3', description: 'Install external packages using npm install' }
    ],
    concepts: [
      {
        id: 'm2-c0',
        title: 'Module vs Package vs Dependency',
        explanation: 'MODULE: reusable JavaScript functionality.\nPACKAGE: distributable piece of software published by someone else.\nNPM DEPENDENCY: package declared as a project dependency in package.json.',
        visualFlow: ['package.json', 'dependencies', 'capability-package', 'node_modules'],
        keyTakeaway: 'NPM manages external packages; Node runs the code.'
      },
      {
        id: 'm2-c1',
        title: 'NPM & package.json',
        explanation: 'NPM is the package manager. `package.json` declares the packages your castle needs. `npm install` downloads them into `node_modules`.',
        exampleCode: 'npm install chalk',
        walkthrough: [
          { codeFragment: 'package.json', explanation: 'Declares what your project needs.' },
          { codeFragment: 'npm install', explanation: 'Downloads the packages into node_modules.' }
        ],
        visualFlow: ['PROJECT', 'package.json', 'npm install', 'node_modules', 'EXTERNAL CAPABILITY'],
        keyTakeaway: 'NPM saves you from reinventing the wheel.'
      }
    ],
    guidedTask: {
      task: 'Supply the missing castle capability by fixing the package dependencies.',
      requirements: [
        'Identify the missing package from the error message.',
        'Add the missing package dependency.'
      ],
      successCondition: 'The castle successfully utilizes the external capability without throwing an error.'
    },
    progressiveHints: [
      { label: 'CONCEPT', text: 'Applications often depend on code written by others, distributed as packages.' },
      { label: 'DIRECTION', text: 'If a module is not found, you might need to install it.' },
      { label: 'PARTIAL SOLUTION', text: 'Look at the require() statement that is failing. That is the name of the package you need.' },
      { label: 'STRONG GUIDANCE', text: 'In your code, you need to `npm install` the missing package, or add it to package.json dependencies.' }
    ],
    failureGuidance: {
      whyItMatters: 'If a required dependency is missing from node_modules, Node.js will crash trying to load it.',
      thinkAbout: 'Did you spell the package name correctly in your package.json?'
    },
    successGuidance: {
      whatYouDid: 'You successfully provided a third-party capability to the castle.',
      whyItWorks: 'NPM resolves the missing dependency and downloads it to node_modules so require() can find it.'
    },
    reflection: {
      whatYouLearned: [
        'NPM is used to download external packages.',
        'package.json tracks dependencies.',
        'node_modules stores the actual code.'
      ],
      whyItMatters: 'Modern Node.js development relies heavily on the open-source NPM ecosystem.',
      prompt: 'Why is it a bad idea to commit the node_modules folder to Git?'
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
        question: 'What happens when you run `npm install`?',
        options: [
          'It compiles the code.',
          'It downloads the packages listed in package.json into node_modules.',
          'It starts the Node.js server.',
          'It creates a new module.'
        ],
        correctAnswerIndex: 1,
        explanation: 'npm install reads package.json and downloads all required packages.'
      }
    ],
    narrative: {
      act: 'ACT II — SUPPLY',
      systemName: 'SUPPLY RUN',
      threatStatus: 'The core is alive, but a critical component is missing external dependencies.',
      objective: 'Supply the missing capability through NPM.',
      systemConnection: 'The modules we built now rely on external capabilities to function fully.',
      successMessage: 'CAPABILITY SUPPLIED',
      systemStatus: 'The castle is now utilizing external packages.',
      nextThreat: 'The components are built and supplied, but they do not communicate in real-time.',
      nextObjective: 'NEXT SYSTEM: SPARK'
    },
    instructorGuide: {
      timeLabel: '15 minutes',
      durationMinutes: 15,
      purpose: 'Understand NPM and packages.',
      teach: [
        'NPM',
        'package.json',
        'dependencies',
        'node_modules'
      ],
      demonstrate: 'npm init -y\nnpm install <package>',
      ask: 'What is the difference between a core module and an external package?',
      watchFor: 'Students confusing Node.js with NPM.',
      letStudentsCode: 'Allow students to identify and install the missing dependency.',
      debrief: 'Connect NPM concepts to the capability they just added to the castle.',
      transition: 'The castle has its capabilities. Now they need to talk to each other dynamically.'
    }
  },
  'mission-03': {
    missionId: 'mission-03',
    title: 'SPARK',
    briefing: 'The castle\'s circuits are dead. The Lever is pulled, but the Gate does not respond. We must repair the circuit using the Node.js Event system.',
    learningObjectives: [
      { id: 'm3-obj1', description: 'Explain what an event is and event-driven programming' },
      { id: 'm3-obj2', description: 'Understand Node.js EventEmitter, emit(), and on()' },
      { id: 'm3-obj3', description: 'Understand why event-driven architecture reduces coupling' }
    ],
    concepts: [
      {
        id: 'm3-c1',
        title: 'WHAT IS AN EVENT?',
        explanation: 'An event represents something that happened (e.g., lever pulled). Emitting an event announces it occurred; listeners can then react.',
        exampleCode: '// 1. Something happens\n// 2. Event is emitted\n// 3. Listener reacts',
        walkthrough: [
          { codeFragment: 'Event is emitted', explanation: 'An announcement that a specific action occurred.' },
          { codeFragment: 'Listener reacts', explanation: 'Code that executes in response to the event.' }
        ],
        visualFlow: ['LEVER PULLED', 'EVENT EMITTED', 'GATE LISTENS', 'GATE OPENS'],
        keyTakeaway: 'An event represents something that happened; listeners define what should happen in response.'
      },
      {
        id: 'm3-c2',
        title: 'EVENTEMITTER: emit() AND on()',
        explanation: '`emit()` triggers an event. `on()` registers a listener. The event names must match exactly.',
        exampleCode: 'const EventEmitter = require("events");\nconst castle = new EventEmitter();\n\ncastle.on("lever_pulled", () => {\n  console.log("Gate opening!");\n});\n\ncastle.emit("lever_pulled");',
        walkthrough: [
          { codeFragment: 'castle.on("lever_pulled", ...)', explanation: 'Registers a listener for the event.' },
          { codeFragment: 'castle.emit("lever_pulled")', explanation: 'Triggers the event, causing the handler to run.' }
        ],
        keyTakeaway: 'emit() announces the event; on() reacts to it.'
      }
    ],
    guidedTask: {
      task: 'Repair the event circuit between the Lever and the Gate.',
      requirements: [
        'Ensure the Lever emits the correct event name.',
        'Ensure the Gate listens for the correct event name.'
      ],
      successCondition: 'When the lever is pulled, the gate reacts successfully.'
    },
    progressiveHints: [
      { label: 'CONCEPT', text: 'Events must have matching names. If I shout "Hello", you must be listening for "Hello".' },
      { label: 'DIRECTION', text: 'Check the event name being emitted by the Lever. Is it the exact same string the Gate is listening for?' },
      { label: 'PARTIAL SOLUTION', text: 'Make sure both `emit("lever_pulled")` and `on("lever_pulled")` use the exact same string.' },
      { label: 'STRONG GUIDANCE', text: 'Fix the typo in the event name so that the `.emit()` and `.on()` match perfectly.' }
    ],
    failureGuidance: {
      whyItMatters: 'If event strings don\'t match, the listener will never hear the emission, and the circuit remains dead.',
      thinkAbout: 'Look very closely at the spelling of the event name in both the emitter and the listener.'
    },
    successGuidance: {
      whatYouDid: 'You successfully bridged two castle elements using event-driven architecture.',
      whyItWorks: 'The Lever doesn\'t need to know the Gate exists; it just emits the event. The Gate listens independently. This reduces tight coupling.'
    },
    reflection: {
      whatYouLearned: [
        'Event-driven programming decouples systems.',
        'EventEmitter uses emit() to broadcast and on() to listen.'
      ],
      whyItMatters: 'Events are how complex systems stay organized without every file importing every other file.',
      prompt: 'Why is emitting an event sometimes better than just calling a function directly?'
    },
    conceptCheck: [
      {
        question: 'What is the primary purpose of emit()?',
        options: [
          'To register a function to be called later.',
          'To trigger an event and announce that something happened.',
          'To load an NPM module into the application.'
        ],
        correctAnswerIndex: 1,
        explanation: 'emit() announces the event, causing any registered listeners to run.'
      },
      {
        question: 'What is the primary purpose of on()?',
        options: [
          'To trigger an event.',
          'To register a listener function that reacts to an event.',
          'To install an external dependency.'
        ],
        correctAnswerIndex: 1,
        explanation: 'on() registers a handler function that will be executed whenever the specified event is emitted.'
      }
    ],
    narrative: {
      act: 'ACT III — CONNECT',
      systemName: 'SPARK',
      threatStatus: 'The systems are built, but they are isolated and dead.',
      objective: 'Connect the castle elements using events.',
      systemConnection: 'Events allow isolated modules to communicate seamlessly in real time.',
      successMessage: 'CIRCUIT REPAIRED',
      systemStatus: 'Castle elements are now communicating dynamically.',
      nextThreat: 'The castle works internally, but no one on the outside can reach it.',
      nextObjective: 'NEXT SYSTEM: LAUNCH'
    },
    instructorGuide: {
      timeLabel: '20 minutes',
      durationMinutes: 20,
      purpose: 'Understand Node.js Events and EventEmitter.',
      teach: [
        'event-driven programming',
        'EventEmitter',
        'on() and emit()'
      ],
      demonstrate: 'Show a tiny EventEmitter example with a mismatched event string failing silently.',
      ask: 'If the lever doesn\'t know the gate exists, how does the gate open?',
      watchFor: 'Students mistyping event names.',
      letStudentsCode: 'Allow students to fix the broken event circuit.',
      debrief: 'Discuss how decoupling the lever and gate makes the castle more modular.',
      transition: 'The castle is fully operational locally. Now let\'s deploy it to the world.'
    }
  },
  'mission-04': {
    missionId: 'mission-04',
    title: 'LAUNCH',
    briefing: 'The castle works perfectly on your local machine, but it is isolated. We must take it online by fixing its deployment configuration so others can reach it.',
    learningObjectives: [
      { id: 'm4-obj1', description: 'Understand deployment and hosting' },
      { id: 'm4-obj2', description: 'Understand environment variables like process.env.PORT' },
      { id: 'm4-obj3', description: 'Understand package.json start scripts' }
    ],
    concepts: [
      {
        id: 'm4-c1',
        title: 'Deployment & Hosting',
        explanation: 'Deployment means putting your code on a computer (host) that stays on 24/7 so anyone can reach it. Hosting platforms automatically run your code, but you must configure it correctly.',
        keyTakeaway: 'Deployment takes your local app and makes it public.'
      },
      {
        id: 'm4-c2',
        title: 'process.env.PORT',
        explanation: 'When hosting platforms run your app, they assign it a random PORT via an environment variable. If you hardcode your port (e.g., 3000), the platform cannot route traffic to it.',
        exampleCode: 'const PORT = process.env.PORT || 3000;\nserver.listen(PORT);',
        walkthrough: [
          { codeFragment: 'process.env.PORT', explanation: 'Reads the port assigned by the hosting provider.' },
          { codeFragment: '|| 3000', explanation: 'Provides a fallback for local development.' }
        ],
        visualFlow: ['HOST PROVIDES PORT', 'process.env.PORT', 'SERVER LISTENS'],
        keyTakeaway: 'Always use process.env.PORT in deployment.'
      },
      {
        id: 'm4-c3',
        title: 'Start Script',
        explanation: 'Hosting platforms don\'t magically know how to start your app. They usually run `npm start`. You must define this script in your `package.json`.',
        exampleCode: '"scripts": {\n  "start": "node server.js"\n}',
        keyTakeaway: 'The start script tells the host how to launch your application.'
      }
    ],
    guidedTask: {
      task: 'Fix the configuration so the Signal Tower can successfully deploy the castle.',
      requirements: [
        'Ensure the server listens on `process.env.PORT`.',
        'Ensure the `start` script is correctly defined.'
      ],
      successCondition: 'The deployment simulator successfully starts and connects to your application.'
    },
    progressiveHints: [
      { label: 'CONCEPT', text: 'Hosting platforms assign their own ports dynamically using environment variables.' },
      { label: 'DIRECTION', text: 'Look at the server code. Is it listening on a hardcoded port, or is it reading from `process.env`?' },
      { label: 'PARTIAL SOLUTION', text: 'Change `const PORT = 3000;` to `const PORT = process.env.PORT || 3000;`' },
      { label: 'STRONG GUIDANCE', text: 'Also check the `package.json` simulation. The start script needs to run your server file using Node.' }
    ],
    failureGuidance: {
      whyItMatters: 'If your application crashes or binds to the wrong port during deployment, no one will be able to access it.',
      thinkAbout: 'Did you use `process.env.PORT` correctly? Is the start script pointing to your actual server file?'
    },
    successGuidance: {
      whatYouDid: 'You correctly configured the application for a cloud deployment.',
      whyItWorks: 'By reading the dynamic port and providing a standardized start script, the host can automatically run and route traffic to your application.'
    },
    reflection: {
      whatYouLearned: [
        'Deployment exposes your application to the internet.',
        'process.env.PORT allows dynamic port assignment.',
        'package.json start scripts tell hosts how to run the app.'
      ],
      whyItMatters: 'Every modern cloud platform relies on environment variables and standard entry points to manage applications at scale.',
      prompt: 'Why is the `|| 3000` fallback necessary for local development?'
    },
    conceptCheck: [
      {
        question: 'Why should a server read its port from process.env.PORT instead of hardcoding 3000?',
        options: [
          'Hardcoded ports run faster.',
          'Hosting platforms assign their own port at runtime, and your app must listen on whatever they give it.',
          'It is required by JavaScript syntax.'
        ],
        correctAnswerIndex: 1,
        explanation: 'If your app ignores the assigned PORT and only listens on 3000, the host cannot route traffic to it.'
      },
      {
        question: 'What does the "start" script in package.json do?',
        options: [
          'It tells hosting platforms (and `npm start`) the exact command to launch your app.',
          'It lists your project\'s dependencies.',
          'It compiles the code.'
        ],
        correctAnswerIndex: 0,
        explanation: 'Hosting platforms run `npm start` automatically, which executes whatever command is defined under scripts.start.'
      }
    ],
    narrative: {
      act: 'ACT IV — DEPLOY',
      systemName: 'LAUNCH',
      threatStatus: 'The castle is isolated from the outside world.',
      objective: 'Configure the deployment settings to take the castle online.',
      systemConnection: 'The final step is to make all our connected systems publicly accessible.',
      successMessage: 'CASTLE ONLINE',
      systemStatus: 'The Signal Tower is broadcasting. The castle is deployed.',
      nextThreat: 'THE SYSTEM WILL NOW BE TESTED.',
      nextObjective: 'NEXT: THE BUILD'
    },
    instructorGuide: {
      timeLabel: '15 minutes',
      durationMinutes: 15,
      purpose: 'Understand deployment basics, ports, and start scripts.',
      teach: [
        'Deployment concepts',
        'process.env.PORT',
        'package.json start script'
      ],
      demonstrate: 'Show a server crashing on a host because it hardcoded port 3000 instead of process.env.PORT.',
      ask: 'Why can\'t we just tell the hosting platform to use port 3000?',
      watchFor: 'Students forgetting the || 3000 fallback and breaking local dev.',
      letStudentsCode: 'Allow students to fix the deployment configuration.',
      debrief: 'Explain how these standard conventions apply across almost all hosting providers (Render, Heroku, etc.).',
      transition: 'The castle is fully operational and online. It is time for the final showcase.'
    }
  },
  'capstone': {
    missionId: 'capstone',
    title: 'THE BUILD',
    briefing: 'You have all four systems working on their own: a module, a package, an event, and a deployment config. Now combine all four in one build - the Gatehouse - and pull the lever yourself to see it work.',
    learningObjectives: [
      { id: 'cap-obj1', description: 'Combine a local module, an NPM package, an event connection, and a deployment port in one file' },
      { id: 'cap-obj2', description: 'See your own code run and produce a real result' }
    ],
    concepts: [
      {
        id: 'cap-c1',
        title: 'Everything You Built, Combined',
        explanation: 'A local module (require("./file")), an NPM package (require("package")), an event connection (on()/emit()), and a deployment port (process.env.PORT) rarely work alone - real applications combine all four in the same file. The Gatehouse needs all four wired correctly before the lever will work.',
        visualFlow: ['MODULE', 'PACKAGE', 'EVENT', 'PORT', 'GATEHOUSE ONLINE'],
        keyTakeaway: 'These four mechanisms are the real foundation of almost every Node.js application, including multiplayer games.'
      }
    ],
    guidedTask: {
      task: 'Build the Gatehouse: wire together a module, a package, an event, and a deployment port in one file.',
      requirements: [
        'Export the lever object with module.exports.',
        'Require an NPM capability package.',
        'Listen for "lever_pulled" and emit it.',
        'Read the port from process.env.PORT with a 3000 fallback.'
      ],
      successCondition: 'All four systems are wired correctly - then you can pull the lever yourself.'
    },
    progressiveHints: [
      { label: 'CONCEPT', text: 'This is exactly the same four things you already did in missions 1 through 4 - just in one file this time.' },
      { label: 'DIRECTION', text: 'Work through it top to bottom: export, require, on()/emit(), then process.env.PORT.' },
      { label: 'PARTIAL SOLUTION', text: 'module.exports = lever; then const capability = require("chalk"); then gate.on(...)/gate.emit(...); then const PORT = process.env.PORT || 3000;' },
      { label: 'STRONG GUIDANCE', text: 'Check each of the four TODOs one at a time - the checklist tells you exactly which one is still missing.' }
    ],
    failureGuidance: {
      whyItMatters: 'If any one of the four pieces is missing, the Gatehouse can\'t fully come online - just like a real app needs all its parts working together.',
      thinkAbout: 'Which of the four systems (module, package, event, port) is still showing as missing below?'
    },
    successGuidance: {
      whatYouDid: 'You combined everything from the whole lab - modules, packages, events, and deployment - into one working build.',
      whyItWorks: 'Every one of these four mechanisms is a real, load-bearing part of how Node.js applications (including multiplayer games) are actually built.'
    },
    narrative: {
      act: 'FINAL BUILD',
      systemName: 'THE BUILD',
      threatStatus: 'Every system works alone. Nothing has been combined yet.',
      objective: 'Wire all four systems together in the Gatehouse.',
      systemConnection: 'This is what a real application looks like - modules, packages, events, and deployment, all in one place.',
      successMessage: 'GATEHOUSE ONLINE',
      systemStatus: 'All four systems are online and wired together.',
      nextThreat: '',
      nextObjective: 'NEXT: THE ROYAL TRIAL'
    }
  }
};
