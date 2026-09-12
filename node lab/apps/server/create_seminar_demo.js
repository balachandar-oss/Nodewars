const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const team = await prisma.team.findFirst();
  
  const passwordHash = await bcrypt.hash('NodeWars@2026', 10);
  
  const user = await prisma.user.upsert({
    where: { username: 'seminar_demo' },
    update: {
      passwordHash,
      role: 'PLAYER',
      teamId: team ? team.id : null,
    },
    create: {
      username: 'seminar_demo',
      passwordHash,
      role: 'PLAYER',
      level: 1,
      xp: 0,
      missionsCompleted: 0,
      teamId: team ? team.id : null,
    }
  });

  console.log(`Updated user: ${user.username} role: ${user.role}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
