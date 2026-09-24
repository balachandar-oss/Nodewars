const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const mission = await prisma.mission.findUnique({
    where: { id: 'mission-04' }
  });
  console.log(mission.starterCode);
}

main().finally(() => prisma.$disconnect());
