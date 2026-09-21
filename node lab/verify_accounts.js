const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: {
      username: true,
      name: true,
      classification: true,
      rollNumber: true,
      role: true
    },
    orderBy: { rollNumber: 'asc' }
  });

  console.log('Total accounts:', users.length);
  const princes = users.filter(u => u.classification === 'PRINCE');
  const princesses = users.filter(u => u.classification === 'PRINCESS');
  const admins = users.filter(u => u.role === 'ADMIN');
  console.log('Princes count:', princes.length);
  console.log('Princesses count:', princesses.length);
  console.log('Admins count:', admins.length);

  const roll1 = users.find(u => u.rollNumber === 1);
  const roll40 = users.find(u => u.rollNumber === 40);
  console.log('Roll 1 exists?:', !!roll1);
  console.log('Roll 40 exists?:', !!roll40);

  console.log('\nSample accounts:');
  console.log(users.slice(0, 5));
}

check().catch(console.error).finally(() => prisma.$disconnect());
