# Node Wars — Code Answers

Working solution code for all 4 missions, in order. Each passes the exact checks run by the mission's evaluator.

---

## Mission 01: NODE CORE

```js
const lever = { state: "pulled" };

// TODO 1: export the lever
module.exports = lever;


// --- In gate.js ---
// TODO 2: require the lever
const lever = require("./lever");
```

**Checks passed:**
- `module.exports = ...` present
- `require("./...")` present

---

## Mission 02: NPM SUPPLY

```js
const capability = require("chalk");

console.log("Capability loaded!");
```

**Checks passed:**
- `require("package-name")` present (any package name without a `./` or `../` prefix)

---

## Mission 03: EVENT SYSTEM

```js
const EventEmitter = require("events");
const castle = new EventEmitter();

// TODO 1: listen for "lever_pulled"
castle.on("lever_pulled", () => {
  console.log("Gate opening!");
});

// TODO 2: emit "lever_pulled"
castle.emit("lever_pulled");
```

**Checks passed:**
- `.on("lever_pulled", ...)` present
- `.emit("lever_pulled")` present

---

## Mission 04: SIGNAL TOWER

```js
const http = require("http");

// TODO 1: use process.env.PORT with a fallback to 3000
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.end("Castle is online");
});

server.listen(PORT, () => console.log(`Listening on ${PORT}`));
```

**Checks passed:**
- `process.env.PORT` present
- `|| <number>` fallback present
