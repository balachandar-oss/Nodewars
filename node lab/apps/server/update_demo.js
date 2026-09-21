const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { username: 'demo_player' },
    data: { role: 'DEMO' }
  });
  console.log('Updated user:', user.username, 'role:', user.role);
}

main().catch(console.error).finally(() => prisma.$disconnect());
