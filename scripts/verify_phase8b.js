const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAll() {
  console.log('==================================================');
  console.log('NODE LAB — FULL PHASE 8B DATABASE & TEAM AUDIT');
  console.log('==================================================');

  // 1. Teams
  const teams = await prisma.team.findMany();
  console.log('\n1. DATABASE TEAMS:');
  console.table(teams.map(t => ({ id: t.id, name: t.name, huntScore: t.huntScore })));

  // 2. User Count & Breakdown
  const totalUsers = await prisma.user.count();
  const princesUsers = await prisma.user.count({ where: { team: { name: 'PRINCES' } } });
  const princessesUsers = await prisma.user.count({ where: { team: { name: 'PRINCESSES' } } });
  const nullTeamUsers = await prisma.user.count({ where: { teamId: null } });

  console.log('\n2. PARTICIPANT COUNTS:');
  console.log(`- Total Accounts: ${totalUsers} (Expected: 51)`);
  console.log(`- Team PRINCES: ${princesUsers} (Expected: 32)`);
  console.log(`- Team PRINCESSES: ${princessesUsers} (Expected: 17)`);
  console.log(`- Organizers (Null Team): ${nullTeamUsers} (Expected: 2)`);

  // 3. Admin Verification
  const admin04 = await prisma.user.findUnique({ where: { username: 'admin04' }, include: { team: true } });
  const admin12 = await prisma.user.findUnique({ where: { username: 'admin12' }, include: { team: true } });
  console.log('\n3. ORGANIZERS AUDIT:');
  console.log(`- admin04: Role=${admin04?.role}, TeamId=${admin04?.teamId}, Team=${admin04?.team?.name || 'NULL (ORGANIZER)'}`);
  console.log(`- admin12: Role=${admin12?.role}, TeamId=${admin12?.teamId}, Team=${admin12?.team?.name || 'NULL (ORGANIZER)'}`);

  // 4. Absent Rolls Verification
  const roll01 = await prisma.user.findUnique({ where: { rollNumber: 1 } });
  const roll40 = await prisma.user.findUnique({ where: { rollNumber: 40 } });
  console.log('\n4. ABSENT ROLLS:');
  console.log(`- Roll 01 exists? ${roll01 !== null ? 'FAIL' : 'NO (PASSED)'}`);
  console.log(`- Roll 40 exists? ${roll40 !== null ? 'FAIL' : 'NO (PASSED)'}`);

  // 5. Stale Team Names in DB
  const oldOmega = await prisma.team.findMany({ where: { name: { contains: 'OMEGA' } } });
  const oldBeta = await prisma.team.findMany({ where: { name: { contains: 'BETA' } } });
  console.log('\n5. STALE TEAM DB ROWS:');
  console.log(`- OMEGA records: ${oldOmega.length} (Expected: 0)`);
  console.log(`- BETA records: ${oldBeta.length} (Expected: 0)`);

  // 6. Data Preservation Sample Check
  const samplePrince = await prisma.user.findUnique({ where: { rollNumber: 2 }, include: { team: true } });
  const samplePrincess = await prisma.user.findUnique({ where: { rollNumber: 3 }, include: { team: true } });
  console.log('\n6. SAMPLE PARTICIPANTS:');
  console.log(`- Roll 02: Login=${samplePrince?.username}, Name=${samplePrince?.name}, Class=${samplePrince?.classification}, Team=${samplePrince?.team?.name}`);
  console.log(`- Roll 03: Login=${samplePrincess?.username}, Name=${samplePrincess?.name}, Class=${samplePrincess?.classification}, Team=${samplePrincess?.team?.name}`);

  await prisma.$disconnect();
}

verifyAll();
