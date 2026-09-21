# Node Wars — Full Workshop Flow (Test Before Deploy)

This is the complete run-through, start to finish: booting the servers, running the lab, quiz, bug placement, hunt, and Royal Room unlock. Follow it exactly once end-to-end before the real workshop.

---

## 0. Prerequisites

- Node.js v18+ and Git installed
- Repo cloned: `git clone https://github.com/balachandar-oss/Nodewars.git`
- `credentials.json` copied manually into `apps/server/src/utils/credentials.json` (this file is git-ignored — it will NOT come with `git clone`. Get it directly from Aditya, not from GitHub.)

---

## 1. Install & Configure

```powershell
cd "node lab"
npm install
```

Create `.env` in the project root (also git-ignored, copy from `.env.example` and fill in real values, or get the working one directly):

```env
DATABASE_URL="file:C:/path/to/your/node lab/prisma/dev.db"
PORT=3001
JWT_SECRET="super-secret-node-wars-key-change-in-prod"
ADMIN_PASSWORD="node-wars-master"
```

⚠️ **Windows PowerShell note:** if `npm`/`node`/`git` aren't recognized, run:
```powershell
$env:Path += ";C:\Program Files\nodejs;C:\Program Files\Git\cmd"
```

---

## 2. Set Up the Database

```powershell
npx prisma migrate dev --name init
```

Seed missions, quiz questions, and the 40 demo bugs:
```powershell
npx ts-node --transpile-only apps/server/src/utils/seed.ts
```

Seed real student/admin accounts + the 10 Bug-Architect-assignable bugs:
```powershell
npx ts-node --transpile-only apps/server/src/utils/seedStudents.ts
```

---

## 3. Start Both Servers

**Terminal 1 — Backend:**
```powershell
npm run dev:server
```
Confirm it's up: `Invoke-RestMethod http://localhost:3001/api/health` should return `status: ONLINE`.

**Terminal 2 — Frontend:**
```powershell
npm run dev:web
```
Open the URL it prints (usually `http://localhost:5173`).

---

## 4. THE FULL TEST RUN

### Step 1 — Admin: log in

Go to `http://localhost:5173/admin/login`
Log in as `vaishnav` or `bala` (passwords in `credentials.json`).

### Step 2 — Admin: start the lab phase

On the Admin Dashboard, click **START GAME**. Phase shows `LAB IN PROGRESS`.

### Step 3 — Students: do the missions

Open a separate browser (or incognito window) per student. Log in at `http://localhost:5173/login` with a real student login (or your own test account: `ch.sc.u4cys25004` / `ch.sc.u4cys25012`).

Work through Missions 01–07. Each mission is solved by running the code and passing the checks. **You (as admin) can preview every mission's solved code** by logging into the regular `/login` page (not `/admin/login`) with `vaishnav`/`bala` — all missions show unlocked with the answer pre-loaded, for teaching/demo purposes.

### Step 4 — Students: take the quiz

After completing Mission 07, students go to the Quiz page and complete it. Quiz score determines who becomes a Bug Architect.

**To test quickly without playing every mission:** admins bypass the Mission-07-required lock automatically.

### Step 5 — Admin: reveal scores

Click **REVEAL SCORES** on the Admin Dashboard.
- Top 5 quiz scorers on **PRINCE** and top 5 on **PRINCESS** get promoted to Bug Architect
- Each one is automatically assigned exactly **one** specific bug to plant (not a menu to choose from)

### Step 6 — Admin: start Bug Placement

Click **START BUG PLACEMENT**. This starts a **2-minute countdown**.

### Step 7 — Bug Architects: plant their bug

The 10 promoted students (5 per team) log in normally and go to `/bug-architect`. Each sees:
- Their one assigned vulnerability (type, target system, difficulty, the question tied to it)
- A location/structure picker
- A **PLANT BUG** button

They pick where in the opposing team's castle to hide it and submit. Non-architects visiting `/bug-architect` get redirected to `/dashboard` automatically.

⏱️ After 2 minutes, the phase **automatically** advances to Hunt — whether or not every architect finished. (Admin can also click **START HUNT** manually to skip the wait.)

### Step 8 — Everyone: hunt

All students (not just architects) can now access the Hunt page. They explore the opposing team's castle, discover the planted bugs, and answer the bounty questions tied to each one. Correct answers score points and award a piece of the flag.

Goal: find and solve all **5 bugs per side**.

### Step 9 — Royal Room

Once a team collects enough flag fragments, they attempt to unlock the opposing team's Royal Room:
- **PRINCESS-side hunters** are working to unlock **PRINCE's King**
- **PRINCE-side hunters** are working to unlock **PRINCESS's Queen**

### Step 10 — Admin: wrap up

Back on the Admin Dashboard:
- **END GAME** — locks everything, shows final state
- **RESTART GAME** — resets scores, bug status, and architect promotions back to a clean slate (does NOT wipe quiz results or mission progress, so you can restart the hunt phase repeatedly without students redoing missions/quiz)

---

## 5. Known Limitations (as of this test pass)

- **`FlagAssembly.tsx` fragment counter is hardcoded to 4/4** — it doesn't yet read live fragment-collection state. This is a known gap, not yet fixed. Worth checking visually during your test run.
- The 40 "demo" bugs seeded by `seed.ts` are separate from the 10 real Bug-Architect-assignable ones (`seedStudents.ts`) — they stay pre-planted and don't interact with the Bug Architect flow. This is intentional (kept as fallback demo data) but can be confusing if you're inspecting the database directly.

---

## 6. If Something Breaks Mid-Test

- **Port already in use:** `Get-Process -Name node | Stop-Process -Force`, then restart both servers.
- **"npm not recognized":** run the `$env:Path += ...` line from Step 1 again in that terminal.
- **Game stuck in a weird phase:** log in as admin, click **RESTART GAME**.
- **Wrong password / login fails:** check `apps/server/src/utils/credentials.json` for the exact current password (it's the single source of truth — `CREDENTIALS.md` in project root is a human-readable copy of the same data).

---

## 7. Before Going Live

- [ ] Full test run above completed without errors, by at least 2 people simultaneously (one as PRINCE, one as PRINCESS)
- [ ] Confirm `.env` and `credentials.json` are NOT committed to git (`git status` should not show them)
- [ ] Confirm real student passwords work (spot-check 3–4 random ones from the list)
- [ ] Both admin logins (`vaishnav`, `bala`) tested
- [ ] Decide who's running the Admin Dashboard live during the workshop (recommend one person, on the projector)
- [ ] Run **RESTART GAME** right before the actual workshop starts, so leftover test data doesn't carry over
