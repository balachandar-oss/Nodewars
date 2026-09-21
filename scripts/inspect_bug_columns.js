const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  const bug = await prisma.bug.findFirst();
  console.log('Sample bug columns:', Object.keys(bug || {}));
  const bugCount = await prisma.bug.count();
  console.log('Total bugs:', bugCount);
  const draftBugs = await prisma.bug.count({ where: { status: 'DRAFT' } });
  console.log('Draft bugs:', draftBugs);
  const plantedBugs = await prisma.bug.count({ where: { status: 'PLANTED' } });
  console.log('Planted bugs:', plantedBugs);
  const teams = await prisma.team.findMany();
  console.log('Teams in DB:', teams.map(t => ({ id: t.id, name: t.name })));
}

inspect()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
