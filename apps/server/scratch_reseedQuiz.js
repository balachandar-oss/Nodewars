const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const quizQuestions = [
    // Module 1: Node.js + Modules
    {
      missionId: 'mission-01',
      question: 'What is the purpose of the \`require()\` function in Node.js?',
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
      question: 'What does \`module.exports\` do in Node.js?',
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
      question: 'What happens when you run \`npm install\` with no arguments?',
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
        'It tells hosting platforms (and \`npm start\`) the exact command to launch your app',
        'It starts your code editor',
        'It runs your test suite'
      ]),
      correctAnswer: 'It tells hosting platforms (and \`npm start\`) the exact command to launch your app',
      explanation: 'Most hosting platforms run \`npm start\` automatically, which runs whatever command is defined under scripts.start.'
    },
    {
      missionId: 'mission-04',
      question: 'You wrote \`const PORT = process.env.PORT || 3000;\`. What does the \`|| 3000\` do?',
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

async function main() {
  console.log('Resetting QuizQuestions in database...');
  await prisma.attemptQuestion.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  
  for (const q of quizQuestions) {
    await prisma.quizQuestion.create({ data: q });
  }
  console.log("Successfully inserted " + quizQuestions.length + " quiz questions.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
