const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:C:/Users/Balachandar A/Downloads/node-wars/node lab/prisma/dev.db'
    }
  }
});

async function runEndToEndVerification() {
  console.log('====================================================');
  console.log('CONTROLLED MERGE PHASE 1: END-TO-END VERIFICATION');
  console.log('====================================================\n');

  // 1. Verify Phase 8A/8B Account and Team Integrity
  const totalUsers = await prisma.user.count();
  const princesCount = await prisma.user.count({ where: { team: { name: 'PRINCES' } } });
  const princessesCount = await prisma.user.count({ where: { team: { name: 'PRINCESSES' } } });
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });

  console.log(`[CHECK 1] Account Baseline:`);
  console.log(`  Total Users in DB: ${totalUsers} (Expected: 51)`);
  console.log(`  PRINCES Players: ${princesCount} (Expected: 32)`);
  console.log(`  PRINCESSES Players: ${princessesCount} (Expected: 17)`);
  console.log(`  ADMIN Users: ${adminCount} (Expected: 2)`);

  if (totalUsers !== 51 || princesCount !== 32 || princessesCount !== 17 || adminCount !== 2) {
    throw new Error('Account baseline mismatch!');
  }

  // 2. Verify 10 Dedicated Seminar DRAFT Bugs
  const seminarBugs = await prisma.bug.findMany({
    where: { isSeminarPool: true },
    include: { architectTeam: true, targetTeam: true }
  });
  console.log(`\n[CHECK 2] Dedicated Seminar Bug Pool:`);
  console.log(`  Total Seminar Pool Bugs: ${seminarBugs.length} (Expected: 10)`);

  const p2pBugs = seminarBugs.filter(b => b.architectTeam?.name === 'PRINCES' && b.targetTeam?.name === 'PRINCESSES');
  const pr2pBugs = seminarBugs.filter(b => b.architectTeam?.name === 'PRINCESSES' && b.targetTeam?.name === 'PRINCES');

  console.log(`  PRINCES -> PRINCESSES: ${p2pBugs.length} (Expected: 5)`);
  console.log(`  PRINCESSES -> PRINCES: ${pr2pBugs.length} (Expected: 5)`);

  if (p2pBugs.length !== 5 || pr2pBugs.length !== 5) {
    throw new Error('Seminar bug direction mismatch!');
  }

  // Check no placeholder architect ownership on DRAFT bugs
  const unassignedDrafts = seminarBugs.filter(b => b.status === 'DRAFT' && b.architectUserId === null);
  console.log(`  Unassigned DRAFT bugs (architectUserId === null): ${unassignedDrafts.length} (Expected: 10)`);
  if (unassignedDrafts.length !== 10) {
    throw new Error('Found placeholder ownership on DRAFT bugs!');
  }

  // 3. Create sample quiz attempts to test deterministic selection & reveal
  console.log(`\n[CHECK 3] Deterministic Promotion & Assignment Simulation:`);
  const princeUsers = await prisma.user.findMany({ where: { team: { name: 'PRINCES' } }, take: 6 });
  const princessUsers = await prisma.user.findMany({ where: { team: { name: 'PRINCESSES' } }, take: 6 });

  // Clean any previous quiz attempts for test users
  await prisma.attemptQuestion.deleteMany({});
  await prisma.quizAttempt.deleteMany({});

  // Seed quiz attempts with specific scores
  for (let i = 0; i < princeUsers.length; i++) {
    await prisma.quizAttempt.create({
      data: {
        userId: princeUsers[i].id,
        isCompleted: true,
        score: 100 - (i * 10), // 100, 90, 80, 70, 60, 50
        correctAnswers: 20 - (i * 2),
        percentage: 100 - (i * 10),
        completedAt: new Date(Date.now() - (10 - i) * 60000)
      }
    });
  }

  for (let i = 0; i < princessUsers.length; i++) {
    await prisma.quizAttempt.create({
      data: {
        userId: princessUsers[i].id,
        isCompleted: true,
        score: 95 - (i * 10),
        correctAnswers: 19 - (i * 2),
        percentage: 95 - (i * 10),
        completedAt: new Date(Date.now() - (10 - i) * 60000)
      }
    });
  }

  // Execute reveal-scores logic
  const princesTeam = await prisma.team.findUnique({ where: { name: 'PRINCES' } });
  const princessesTeam = await prisma.team.findUnique({ where: { name: 'PRINCESSES' } });

  // Authoritative ranking function test
  async function rankEligible(teamId, limit = 5) {
    const attempts = await prisma.quizAttempt.findMany({
      where: { isCompleted: true, user: { teamId, role: { not: 'ADMIN' } } },
      include: { user: true }
    });
    return attempts.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
      const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      if (aTime !== bTime) return aTime - bTime;
      const aRoll = a.user.rollNumber ?? Number.MAX_SAFE_INTEGER;
      const bRoll = b.user.rollNumber ?? Number.MAX_SAFE_INTEGER;
      if (aRoll !== bRoll) return aRoll - bRoll;
      return a.userId.localeCompare(b.userId);
    }).slice(0, limit).map(a => a.userId);
  }

  const pTop5 = await rankEligible(princesTeam.id, 5);
  const prTop5 = await rankEligible(princessesTeam.id, 5);

  console.log(`  Top 5 PRINCES Selected: ${pTop5.length} (Expected: 5)`);
  console.log(`  Top 5 PRINCESSES Selected: ${prTop5.length} (Expected: 5)`);

  // Verify 6th candidate was excluded
  if (pTop5.includes(princeUsers[5].id)) {
    throw new Error('6th prince was not excluded!');
  }
  if (prTop5.includes(princessUsers[5].id)) {
    throw new Error('6th princess was not excluded!');
  }

  // 4. Simulate Transaction & Idempotency
  await prisma.$transaction(async (tx) => {
    for (const uId of [...pTop5, ...prTop5]) {
      await tx.user.update({ where: { id: uId }, data: { role: 'BUG_ARCHITECT' } });
    }

    const pBugs = await tx.bug.findMany({
      where: { isSeminarPool: true, architectTeamId: princesTeam.id, architectUserId: null, status: 'DRAFT' },
      orderBy: { id: 'asc' }
    });

    const prBugs = await tx.bug.findMany({
      where: { isSeminarPool: true, architectTeamId: princessesTeam.id, architectUserId: null, status: 'DRAFT' },
      orderBy: { id: 'asc' }
    });

    for (let i = 0; i < pTop5.length; i++) {
      await tx.bug.update({ where: { id: pBugs[i].id }, data: { architectUserId: pTop5[i] } });
    }
    for (let i = 0; i < prTop5.length; i++) {
      await tx.bug.update({ where: { id: prBugs[i].id }, data: { architectUserId: prTop5[i] } });
    }

    await tx.gameState.upsert({
      where: { id: 'singleton' },
      update: { scoresRevealed: true },
      create: { id: 'singleton', scoresRevealed: true, phase: 'ENGINEERING' }
    });
  });

  console.log(`  Transaction successfully executed.`);

  // Verify DB state after reveal
  const assignedBugsCount = await prisma.bug.count({
    where: { isSeminarPool: true, architectUserId: { not: null } }
  });
  console.log(`  Assigned Seminar Bugs: ${assignedBugsCount} (Expected: 10)`);
  if (assignedBugsCount !== 10) {
    throw new Error(`Expected 10 assigned bugs, got ${assignedBugsCount}`);
  }

  // Verify planting flow
  const testArchitect = pTop5[0];
  const assignedBug = await prisma.bug.findFirst({
    where: { architectUserId: testArchitect, isSeminarPool: true }
  });
  console.log(`\n[CHECK 4] Planting Flow for architect ${testArchitect}:`);
  console.log(`  Assigned bug ID: ${assignedBug.id}, Initial status: ${assignedBug.status}`);

  await prisma.bug.update({
    where: { id: assignedBug.id },
    data: { status: 'PLANTED', location: 'GATE_01', structureType: 'SMART_DOOR' }
  });

  const plantedBug = await prisma.bug.findUnique({ where: { id: assignedBug.id } });
  console.log(`  Planted bug status: ${plantedBug.status}, location: ${plantedBug.location}`);
  if (plantedBug.status !== 'PLANTED' || plantedBug.location !== 'GATE_01') {
    throw new Error('Planting verification failed!');
  }

  // 5. Clean up test attempts and reset seminar bugs back to unassigned DRAFT
  console.log(`\n[CHECK 5] Cleanup & Reset Simulation:`);
  await prisma.attemptQuestion.deleteMany({});
  await prisma.quizAttempt.deleteMany({});
  await prisma.user.updateMany({ where: { role: 'BUG_ARCHITECT' }, data: { role: 'PLAYER' } });
  await prisma.bug.updateMany({
    where: { isSeminarPool: true },
    data: { status: 'DRAFT', architectUserId: null, location: null, structureType: null }
  });
  await prisma.gameState.upsert({
    where: { id: 'singleton' },
    update: { scoresRevealed: false },
    create: { id: 'singleton', scoresRevealed: false }
  });

  const cleanDraftCount = await prisma.bug.count({
    where: { isSeminarPool: true, status: 'DRAFT', architectUserId: null }
  });
  console.log(`  Seminar bugs cleanly reset to unassigned DRAFT: ${cleanDraftCount} (Expected: 10)`);
  if (cleanDraftCount !== 10) {
    throw new Error('Cleanup verification failed!');
  }

  console.log('\n====================================================');
  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
  console.log('====================================================');
}

runEndToEndVerification()
  .catch((err) => {
    console.error('VERIFICATION ERROR:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
