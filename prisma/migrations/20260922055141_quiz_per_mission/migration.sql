-- AlterTable
ALTER TABLE "QuizAttempt" ADD COLUMN "missionId" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Mission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "concepts" TEXT NOT NULL,
    "objectives" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "starterCode" TEXT NOT NULL,
    "hints" TEXT NOT NULL,
    "prerequisites" TEXT NOT NULL,
    "unlockComponent" TEXT NOT NULL,
    "isBonus" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Mission" ("concepts", "createdAt", "description", "difficulty", "hints", "id", "instructions", "objectives", "order", "prerequisites", "starterCode", "title", "unlockComponent", "updatedAt", "xpReward") SELECT "concepts", "createdAt", "description", "difficulty", "hints", "id", "instructions", "objectives", "order", "prerequisites", "starterCode", "title", "unlockComponent", "updatedAt", "xpReward" FROM "Mission";
DROP TABLE "Mission";
ALTER TABLE "new_Mission" RENAME TO "Mission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
