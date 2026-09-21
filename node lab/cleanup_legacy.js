const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  const nullRollUsers = await prisma.user.findMany({
    where: { rollNumber: null },
    select: { id: true, username: true }
  });

  console.log('Removing legacy demo accounts without roll numbers:', nullRollUsers.map(u => u.username));

  for (const u of nullRollUsers) {
    await prisma.missionProgress.deleteMany({ where: { userId: u.id } });
    await prisma.quizAttempt.deleteMany({ where: { userId: u.id } });
    await prisma.submission.deleteMany({ where: { userId: u.id } });
    await prisma.bug.deleteMany({ where: { architectUserId: u.id } });
    await prisma.user.delete({ where: { id: u.id } });
  }

  const count = await prisma.user.count();
  console.log('Total users remaining in database:', count);
}

cleanup().catch(console.error).finally(() => prisma.$disconnect());
