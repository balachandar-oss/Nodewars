const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const teams = await prisma.team.findMany();
  console.log('Current DB Teams:', teams);
  const sampleUsers = await prisma.user.findMany({
    take: 5,
    select: { rollNumber: true, username: true, teamId: true, team: { select: { name: true } } }
  });
  console.log('Sample Users:', sampleUsers);
  await prisma.$disconnect();
}

run();
