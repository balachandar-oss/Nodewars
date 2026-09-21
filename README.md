# Node Wars 🎮 - Complete Workshop System

A 150-minute immersive Node.js + Cybersecurity workshop with interactive castle exploration, bug hunting, and real-time multiplayer gameplay.

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([download](https://git-scm.com/))

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/balachandar-oss/Nodewars.git
cd Nodewars
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create a `.env` file in the root directory:
```env
# Backend
PORT=3001
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD=node-wars-master

# Frontend
VITE_API_URL=http://localhost:3001
```

4. **Initialize database:**
```bash
npx prisma migrate dev --name init
```
This creates SQLite database with all game tables (User, Team, Game, Bug, etc.)

5. **Start development servers:**

**Terminal 1 - Backend (port 3001):**
```bash
npm run dev:server
```

**Terminal 2 - Frontend (port 5173):**
```bash
npm run dev:web
```

6. **Open in browser:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

---

## 🎯 Workshop Flow

### Phase 1: Lab (Missions)
Students build 7 Node.js systems:

| Mission | Concept | Structure |
|---------|---------|-----------|
| 01 | HTTP Server | 💻 TERMINAL |
| 02 | Express Routes | 🚪 SMART DOOR |
| 03 | Middleware & Auth | 🛡️ SECURITY GATE |
| 04 | Database (CRUD) | 📦 RESOURCE VAULT |
| 05 | Async/Await | ⚙️ ASYNC ENGINE |
| 06 | Events & Sockets | 📡 LIVE MONITOR |
| 07 | Security Bugs | 🐛 CORE PATCH |

### Phase 2: Quiz (10 min)
27 questions covering all 7 missions. Top 5 scorers → **Bug Architects**

### Phase 3: Castle Raid (20 min)
- Teams explore castle and find hidden bugs
- Answer bounty questions for points & flag fragments
- Unlock Royal Room with complete flag (4/4 fragments)
- Compete on leaderboard

---

## 👨‍💻 Login Credentials

### Admin Access
- **URL:** http://localhost:5173
- **Click:** Admin Login
- **Password:** `node-wars-master` (from `.env`)

### Player Access
- **URL:** http://localhost:5173
- **Click:** Player Login
- **Credentials:** (to be added by your friend - currently demo only)

---

## 🎮 Testing the Game

### Admin Flow:
1. Login as Admin
2. Click **Start Game** (initializes WAITING state)
3. **Seed Bugs** (pre-generates 20 bugs from difficulty levels)
4. Click **Start Placement** (architects place bugs on castle)
5. Click **Start Hunt** (teams search for bugs)
6. Click **End Game** (reveals leaderboard)

### Player Flow:
1. Login as Player
2. Explore castle with WASD/Arrow keys
3. Press **E** to interact with structures
4. Find bugs planted by architects
5. Answer bounty questions (MCQ)
6. Collect flag fragments
7. Return to Royal Room and unlock with flag

---

## 📁 Project Structure

```
node-wars/
├── apps/
│   ├── server/          # Express backend
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── routes/
│   │   │   └── handlers/
│   │   └── package.json
│   └── web/             # React + Vite frontend
│       ├── src/
│       │   ├── pages/
│       │   │   ├── Lab.tsx
│       │   │   ├── AdminDashboard.tsx
│       │   │   ├── CastleMap.tsx
│       │   └── components/
│       └── package.json
├── prisma/
│   ├── schema.prisma    # Database models
│   └── migrations/      # Schema history
├── NODE_WARS_STUDY_GUIDE.md
├── package.json         # Workspace config
├── .env                 # Environment variables
└── README.md           # This file
```

---

## 🛠️ Key Technologies

- **Backend:** Node.js, Express.js, Prisma ORM, SQLite
- **Frontend:** React, TypeScript, Vite, Phaser 3
- **Real-time:** Socket.IO (team-scoped rooms)
- **Database:** SQLite (dev), Prisma migrations
- **Auth:** Role-based (ADMIN vs regular users)

---

## 📊 Database Models

```
User
  - id, username, email, role (ADMIN/USER), teamId
  
Team
  - id, name, score
  
Game
  - id, status (WAITING/ACTIVE/ENDED), startedAt, endedAt
  
Bug
  - id, gameId, vulnerabilityType, difficulty, location
  - question, options, correctAnswer, fragmentValue
  
BugQuestion
  - id, bugId, difficulty multiplier, points
  
FlagFragment
  - id, bugId, fragmentText (e.g., "MID_", "DL@", etc.)
```

---

## 🔐 Security Features

✅ Server-authoritative validation (client cannot cheat)  
✅ Role-based access control (ADMIN-only endpoints)  
✅ 401/403 status codes for auth/authz  
✅ JWT tokens (if implemented)  
✅ Socket.IO team-scoped rooms  

---

## 📚 Study Material

For workshop participants, see: **NODE_WARS_STUDY_GUIDE.md**
- Covers all 7 missions with code patterns
- Quick reference tables
- Exam tips & common mistakes
- 300 lines of focused material

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process on port 3001
netstat -ano | findstr :3001

# Kill it
taskkill /PID <PID> /F
```

### Database Error
```bash
# Reset database
rm dev.db
npx prisma migrate dev --name init
```

### Node.js Not Found (PowerShell)
```powershell
$env:Path += ";C:\Program Files\nodejs"
```

### Git Not Found (PowerShell)
```powershell
$env:Path += ";C:\Program Files\Git\cmd"
```

---

## ✨ Next Steps (For Your Friend)

- [ ] Add player login system (currently demo only)
- [ ] Implement JWT authentication
- [ ] Add user registration
- [ ] Deploy to production server
- [ ] Add team management UI
- [ ] Create admin panel for quiz management
- [ ] Add progress tracking & analytics

---

## 📝 Notes

- Database uses SQLite (dev.db) - replace with PostgreSQL for production
- Admin password configured in `.env` - change for production
- Study guide ready for participant handout
- All 20 bugs pre-seeded with questions & fragments
- Socket.IO connected for real-time updates

---

## 🎓 Workshop Syllabus

**Duration:** 150 minutes

1. **Welcome & Overview** (5 min)
2. **Lab Phase** (90 min) - 7 missions with instructor guidance
3. **Quiz Phase** (10 min) - 27 questions, identify Bug Architects
4. **Castle Raid** (40 min) - Teams hunt bugs, answer bounties, unlock Royal Room
5. **Wrap-up & Leaderboard** (5 min)

---

**Built with ❤️ for Node.js learners | Ready for workshop deployment**
