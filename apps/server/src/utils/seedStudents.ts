import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { gameSeeds, createGameBugConfiguration } from '../seeds/gameSeeds';

const prisma = new PrismaClient();

interface StudentEntry {
  roll: string;
  loginId: string;
  name: string;
  class: 'Prince' | 'Princess';
  password: string;
}

interface AdminEntry {
  username: string;
  password: string;
  displayName: string;
}

interface CredentialsFile {
  admins: AdminEntry[];
  students: StudentEntry[];
}

async function main() {
  const credPath = path.resolve(__dirname, 'credentials.json');
  if (!fs.existsSync(credPath)) {
    throw new Error(
      `credentials.json not found at ${credPath}. This file is git-ignored and must be created locally before seeding.`
    );
  }

  const { admins, students }: CredentialsFile = JSON.parse(fs.readFileSync(credPath, 'utf-8'));

  console.log('Removing stray test teams (leftover from manual API testing)...');
  const strayTeams = await prisma.team.findMany({
    where: { name: { in: ['BOYS', 'GIRLS'] } },
    include: { users: true }
  });
  for (const t of strayTeams) {
    if (t.users.length === 0) {
      // Clean up dependent rows created by earlier manual API testing
      await prisma.bug.deleteMany({
        where: {
          OR: [
            { architectTeamId: t.id },
            { targetTeamId: t.id },
            { claimedByTeamId: t.id }
          ]
        }
      });
      await prisma.game.deleteMany({
        where: { OR: [{ teamAId: t.id }, { teamBId: t.id }] }
      });
      await prisma.team.delete({ where: { id: t.id } });
      console.log(`  Deleted empty stray team: ${t.name}`);
    } else {
      console.log(`  Skipped ${t.name} - has ${t.users.length} users, not empty`);
    }
  }

  const princeTeam = await prisma.team.upsert({
    where: { name: 'PRINCE' },
    update: {},
    create: { name: 'PRINCE', huntScore: 0 }
  });
  const princessTeam = await prisma.team.upsert({
    where: { name: 'PRINCESS' },
    update: {},
    create: { name: 'PRINCESS', huntScore: 0 }
  });

  console.log(`\nSeeding ${admins.length} admin and instructor preview accounts...`);
  for (const admin of admins) {
    const passwordHash = await bcrypt.hash(admin.password, 10);
    // 1. Admin/Control login
    await prisma.user.upsert({
      where: { username: admin.username },
      update: { passwordHash, role: 'ADMIN' },
      create: {
        username: admin.username,
        passwordHash,
        role: 'ADMIN',
        level: 1,
        xp: 0,
        missionsCompleted: 0
      }
    });
    console.log(`  Admin ready: ${admin.username} (${admin.displayName})`);

    // 2. Instructor/Preview login
    const instructorUsername = `${admin.username}-instructor`;
    await prisma.user.upsert({
      where: { username: instructorUsername },
      update: { passwordHash, role: 'INSTRUCTOR' },
      create: {
        username: instructorUsername,
        passwordHash,
        role: 'INSTRUCTOR',
        level: 1,
        xp: 0,
        missionsCompleted: 0
      }
    });
    console.log(`  Instructor ready: ${instructorUsername}`);
  }

  console.log(`\nSeeding ${students.length} student accounts...`);
  let created = 0;
  for (const s of students) {
    const passwordHash = await bcrypt.hash(s.password, 10);
    const teamId = s.class === 'Prince' ? princeTeam.id : princessTeam.id;

    await prisma.user.upsert({
      where: { username: s.loginId },
      update: { passwordHash, teamId, role: 'PLAYER' },
      create: {
        username: s.loginId,
        passwordHash,
        role: 'PLAYER',
        teamId,
        level: 1,
        xp: 0,
        missionsCompleted: 0
      }
    });
    created++;
  }
  console.log(`  ${created} student accounts seeded (Prince -> PRINCE team, Princess -> PRINCESS team)`);

  // Give each student mission-01 as ACTIVE, matching the demo seed's onboarding behavior
  const firstMission = await prisma.mission.findUnique({ where: { id: 'mission-01' } });
  if (firstMission) {
    const allStudentUsers = await prisma.user.findMany({
      where: { username: { in: students.map(s => s.loginId) } }
    });
    for (const u of allStudentUsers) {
      await prisma.missionProgress.upsert({
        where: { userId_missionId: { userId: u.id, missionId: firstMission.id } },
        update: {},
        create: { userId: u.id, missionId: firstMission.id, status: 'ACTIVE' }
      });
    }
    console.log(`  Initialized mission-01 progress for ${allStudentUsers.length} students`);
  } else {
    console.log('  Skipped mission progress init - run the main seed script first for missions');
  }

  // ============================================
  // Seed exactly 5 DRAFT bugs per direction (10 total) from the gameSeeds
  // catalog, varied by difficulty. These are NOT browsable - they are
  // 1-to-1 auto-assigned to promoted Bug Architects inside
  // POST /api/admin/game/reveal-scores. architectUserId here is only a
  // placeholder (the field is required NOT NULL) and gets reassigned to the
  // real architect at reveal-scores time.
  // ============================================
  console.log('\nSeeding DRAFT bugs (5 PRINCE->PRINCESS, 5 PRINCESS->PRINCE)...');

  // Pick 5 varied-difficulty seeds per direction out of the 20 available,
  // re-themed to mirror the syllabus: Node.js+Modules, NPM, Events,
  // Deployment/Hosting, plus 1 wildcard from the generic pool for variety.
  const princeToPrincessSeedIds = [
    'seed-bug-easy-01',   // Modules: forgot module.exports
    'seed-bug-medium-03', // NPM: wrong import subpath for installed package
    'seed-bug-medium-05', // Events: emit() with no registered listener
    'seed-bug-hard-05',   // Deployment: hardcoded config instead of process.env
    'seed-bug-hard-01'    // Wildcard: race condition (generic, difficulty variety)
  ];
  const princessToPrinceSeedIds = [
    'seed-bug-medium-01', // Modules: circular require
    'seed-bug-easy-02',   // NPM: missing dependency
    'seed-bug-medium-06', // Events: listener attached to wrong emitter instance
    'seed-bug-medium-02', // Deployment: hardcoded port ignoring process.env.PORT
    'seed-bug-critical-02' // Wildcard: prototype pollution (generic, difficulty variety)
  ];

  const findSeed = (id: string) => {
    const seed = gameSeeds.find(s => s.id === id);
    if (!seed) throw new Error(`gameSeeds is missing expected seed id: ${id}`);
    return seed;
  };

  // Placeholder architectUserId: prefer the first seeded admin, fall back to
  // the first PRINCE user if no admin exists (architectUserId is NOT NULL).
  const placeholderAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const placeholderPrinceUser = placeholderAdmin
    ? null
    : await prisma.user.findFirst({ where: { teamId: princeTeam.id } });
  const placeholderUserId = placeholderAdmin?.id || placeholderPrinceUser?.id;

  if (!placeholderUserId) {
    console.log('  Skipped DRAFT bug seeding - no admin or PRINCE user available for placeholder architectUserId');
  } else {
    const seedDraftBugs = async (
      seedIds: string[],
      direction: string,
      architectTeamId: string,
      targetTeamId: string
    ) => {
      for (const seedId of seedIds) {
        const seed = findSeed(seedId);
        const configuration = createGameBugConfiguration(seed);
        // gameSeeds.ts uses underscore-separated targetSystem values (e.g.
        // "SMART_DOOR"), but hunt.ts's ALL_SYSTEMS and bugs.ts's BUG_CATALOG
        // use space-separated values (e.g. "SMART DOOR"). Normalize to the
        // space format here so /api/hunt/targets can actually match planted
        // bugs to a system.
        const normalizedTargetSystem = seed.targetSystem.replace(/_/g, ' ');
        await prisma.bug.upsert({
          where: { id: `bug-${direction}-${seed.id}` },
          // idempotent: only fix the targetSystem naming format on rows that
          // already exist, never touch status/location (may be assigned/planted)
          update: { targetSystem: normalizedTargetSystem },
          create: {
            id: `bug-${direction}-${seed.id}`,
            architectUserId: placeholderUserId,
            architectTeamId,
            targetTeamId,
            vulnerabilityType: seed.vulnerabilityType,
            targetSystem: normalizedTargetSystem,
            configuration: JSON.stringify(configuration),
            status: 'DRAFT',
            structureType: seed.targetSystem,
            difficulty: seed.difficulty
          }
        });
      }
    };

    await seedDraftBugs(princeToPrincessSeedIds, 'p2p', princeTeam.id, princessTeam.id);
    await seedDraftBugs(princessToPrinceSeedIds, 'pr2p', princessTeam.id, princeTeam.id);

    const draftCount = await prisma.bug.count({ where: { status: 'DRAFT' } });
    console.log(`  DRAFT bugs seeded. Total DRAFT bugs in DB: ${draftCount}`);
  }

  console.log('\nDone. Team split:');
  const princeCount = students.filter(s => s.class === 'Prince').length;
  const princessCount = students.filter(s => s.class === 'Princess').length;
  console.log(`  PRINCE: ${princeCount}`);
  console.log(`  PRINCESS: ${princessCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
