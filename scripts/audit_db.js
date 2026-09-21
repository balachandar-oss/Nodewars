const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  const teams = await prisma.team.findMany();
  console.log('--- TEAMS ---');
  console.log(teams);

  const userCounts = await prisma.user.groupBy({
    by: ['teamId'],
    _count: { id: true }
  });
  console.log('--- USER COUNTS PER TEAM ---');
  console.log(userCounts);

  const comps = await prisma.castleComponent.findMany({
    select: { id: true, teamId: true, systemId: true, physicalCode: true, displayName: true }
  });
  console.log('--- CASTLE COMPONENTS ---');
  console.log('Total:', comps.length);
  console.log(comps);

  const bugs = await prisma.bug.findMany();
  console.log('--- BUGS ---');
  console.log('Total:', bugs.length);

  await prisma.$disconnect();
}

inspect();
