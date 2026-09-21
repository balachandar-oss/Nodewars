import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

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

  console.log(`\nSeeding ${admins.length} admin accounts...`);
  for (const admin of admins) {
    const passwordHash = await bcrypt.hash(admin.password, 10);
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
