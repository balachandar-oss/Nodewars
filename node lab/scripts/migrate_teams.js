const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defs = [
  // PRINCES (32)
  { rollNumber: 2, username: 'ch.sc.u4cys25002', name: 'Prince02', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-k9X2#mP8q' },
  { rollNumber: 5, username: 'ch.sc.u4cys25005', name: 'Prince05', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-r8N3@tQ5y' },
  { rollNumber: 6, username: 'ch.sc.u4cys25006', name: 'Prince06', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-y2H9$kM7e' },
  { rollNumber: 8, username: 'ch.sc.u4cys25008', name: 'Prince08', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-t7F6*bV9c' },
  { rollNumber: 9, username: 'ch.sc.u4cys25009', name: 'Prince09', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-m3P4#xC2v' },
  { rollNumber: 10, username: 'ch.sc.u4cys25010', name: 'Prince10', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-c8K7!nL5s' },
  { rollNumber: 13, username: 'ch.sc.u4cys25013', name: 'Prince13', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-g7R4$mQ2p' },
  { rollNumber: 16, username: 'ch.sc.u4cys25016', name: 'Prince16', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-b6K2#tL9n' },
  { rollNumber: 17, username: 'ch.sc.u4cys25017', name: 'Prince17', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-v1P5!rC8j' },
  { rollNumber: 18, username: 'ch.sc.u4cys25018', name: 'Prince18', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-x8T3@mB7y' },
  { rollNumber: 19, username: 'ch.sc.u4cys25019', name: 'Prince19', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-h3D9$kJ4e' },
  { rollNumber: 22, username: 'ch.sc.u4cys25022', name: 'Prince22', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-p2B4#tX9r' },
  { rollNumber: 23, username: 'ch.sc.u4cys25023', name: 'Prince23', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-r9K8!vC3m' },
  { rollNumber: 25, username: 'ch.sc.u4cys25025', name: 'Prince25', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-w6T5$nJ2k' },
  { rollNumber: 27, username: 'ch.sc.u4cys25027', name: 'Prince27', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-c1D7*zB4x' },
  { rollNumber: 28, username: 'ch.sc.u4cys25028', name: 'Prince28', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-z7F2#tQ6j' },
  { rollNumber: 29, username: 'ch.sc.u4cys25029', name: 'Prince29', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-k3H9!mX8w' },
  { rollNumber: 30, username: 'ch.sc.u4cys25030', name: 'Prince30', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-v5B4@rK2n' },
  { rollNumber: 31, username: 'ch.sc.u4cys25031', name: 'Prince31', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-t8P1$yL7m' },
  { rollNumber: 32, username: 'ch.sc.u4cys25032', name: 'Prince32', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-g2R6&zV9c' },
  { rollNumber: 39, username: 'ch.sc.u4cys25039', name: 'Prince39', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-j2B9*tK7v' },
  { rollNumber: 41, username: 'ch.sc.u4cys25041', name: 'Prince41', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-r4M7#hX9p' },
  { rollNumber: 42, username: 'ch.sc.u4cys25042', name: 'Prince42', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-y8P2!vL5m' },
  { rollNumber: 43, username: 'ch.sc.u4cys25043', name: 'Prince43', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-w1T6@rC8k' },
  { rollNumber: 44, username: 'ch.sc.u4cys25044', name: 'Prince44', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-m7D3$zQ2y' },
  { rollNumber: 45, username: 'ch.sc.u4cys25045', name: 'Prince45', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-c2F9&tB6n' },
  { rollNumber: 46, username: 'ch.sc.u4cys25046', name: 'Prince46', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-z8H4*hK1w' },
  { rollNumber: 49, username: 'ch.sc.u4cys25049', name: 'Prince49', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-t2P7@zC4m' },
  { rollNumber: 50, username: 'ch.sc.u4cys25050', name: 'Prince50', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-g8R1$tQ5k' },
  { rollNumber: 51, username: 'ch.sc.u4cys25051', name: 'Prince51', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-d3T6&rB8y' },
  { rollNumber: 52, username: 'ch.sc.u4cys25052', name: 'Prince52', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-q7M2*hK4n' },
  { rollNumber: 53, username: 'ch.sc.u4cys25053', name: 'Prince53', classification: 'Prince', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-b1K9#zL6w' },
  // PRINCESSES (17)
  { rollNumber: 3, username: 'ch.sc.u4cys25003', name: 'Princess03', classification: 'Princess', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-v4B7!jL3w' },
  { rollNumber: 7, username: 'ch.sc.u4cys25007', name: 'Princess07', classification: 'Princess', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-w5D1&zJ4a' },
  { rollNumber: 11, username: 'ch.sc.u4cys25011', name: 'Princess11', classification: 'Princess', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-z2T9@vB4m' },
  { rollNumber: 14, username: 'ch.sc.u4cys25014', name: 'Princess14', classification: 'Princess', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-d9Y1&hJ6k' },
  { rollNumber: 15, username: 'ch.sc.u4cys25015', name: 'Princess15', classification: 'Princess', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-q4M8*zX3w' },
  { rollNumber: 20, username: 'ch.sc.u4cys25020', name: 'Princess20', classification: 'Princess', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-n5F1&qV6z' },
  { rollNumber: 21, username: 'ch.sc.u4cys25021', name: 'Princess21', classification: 'Princess', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-j7H6*zL2w' },
  { rollNumber: 24, username: 'ch.sc.u4cys25024', name: 'Princess24', classification: 'Princess', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-y4M1@hQ7p' },
  { rollNumber: 26, username: 'ch.sc.u4cys25026', name: 'Princess26', classification: 'Princess', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-m8P3&rL9v' },
  { rollNumber: 33, username: 'ch.sc.u4cys25033', name: 'Princess33', classification: 'Princess', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-d7T3*hJ4e' },
  { rollNumber: 34, username: 'ch.sc.u4cys25034', name: 'Princess34', classification: 'Princess', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-q1M9#tC8p' },
  { rollNumber: 35, username: 'ch.sc.u4cys25035', name: 'Princess35', classification: 'Princess', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-b8K5!rX2w' },
  { rollNumber: 36, username: 'ch.sc.u4cys25036', name: 'Princess36', classification: 'Princess', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-x3D2@nQ6k' },
  { rollNumber: 37, username: 'ch.sc.u4cys25037', name: 'Princess37', classification: 'Princess', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-h5F8$mB4y' },
  { rollNumber: 38, username: 'ch.sc.u4cys25038', name: 'Princess38', classification: 'Princess', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-n7H4&rL1z' },
  { rollNumber: 47, username: 'ch.sc.u4cys25047', name: 'Princess47', classification: 'Princess', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-k1B8#rX7j' },
  { rollNumber: 48, username: 'ch.sc.u4cys25048', name: 'Princess48', classification: 'Princess', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-v6M3!nL9p' },
  // ADMINS (2)
  { rollNumber: 4, username: 'admin04', name: 'Admin04', classification: null, team: null, role: 'ADMIN', initialPassword: 'admin#NW4!9zXp' },
  { rollNumber: 12, username: 'admin12', name: 'Admin12', classification: null, team: null, role: 'ADMIN', initialPassword: 'admin#NW12!8vKm' }
];

async function migrate() {
  console.log('--- Starting Safe Phase 8B Team Migration ---');

  // 1. Check existing teams
  const teams = await prisma.team.findMany();
  console.log('Current DB teams:', teams.map(t => ({ id: t.id, name: t.name })));

  let princesTeam = teams.find(t => t.name === 'PRINCES');
  let princessesTeam = teams.find(t => t.name === 'PRINCESSES');

  // If TEAM_OMEGA exists and PRINCES does not, rename TEAM_OMEGA -> PRINCES to preserve team ID!
  const omegaTeam = teams.find(t => t.name === 'TEAM_OMEGA' || t.name === 'TEAM OMEGA');
  if (omegaTeam && !princesTeam) {
    console.log(`Renaming existing Team row ${omegaTeam.id} from ${omegaTeam.name} -> PRINCES`);
    princesTeam = await prisma.team.update({
      where: { id: omegaTeam.id },
      data: { name: 'PRINCES' }
    });
  } else if (!princesTeam) {
    console.log('Creating new PRINCES team row');
    princesTeam = await prisma.team.create({
      data: { name: 'PRINCES' }
    });
  }

  // If TEAM_BETA exists and PRINCESSES does not, rename TEAM_BETA -> PRINCESSES to preserve team ID!
  const betaTeam = teams.find(t => t.name === 'TEAM_BETA' || t.name === 'TEAM BETA');
  if (betaTeam && !princessesTeam) {
    console.log(`Renaming existing Team row ${betaTeam.id} from ${betaTeam.name} -> PRINCESSES`);
    princessesTeam = await prisma.team.update({
      where: { id: betaTeam.id },
      data: { name: 'PRINCESSES' }
    });
  } else if (!princessesTeam) {
    console.log('Creating new PRINCESSES team row');
    princessesTeam = await prisma.team.create({
      data: { name: 'PRINCESSES' }
    });
  }

  console.log('PRINCES Team ID:', princesTeam.id);
  console.log('PRINCESSES Team ID:', princessesTeam.id);

  console.log(`Processing ${defs.length} accounts...`);

  let princesCount = 0;
  let princessesCount = 0;
  let adminCount = 0;

  for (const acc of defs) {
    let targetTeamId = null;
    if (acc.team === 'PRINCES') {
      targetTeamId = princesTeam.id;
      princesCount++;
    } else if (acc.team === 'PRINCESSES') {
      targetTeamId = princessesTeam.id;
      princessesCount++;
    } else {
      targetTeamId = null;
      adminCount++;
    }

    await prisma.user.updateMany({
      where: { rollNumber: acc.rollNumber },
      data: {
        teamId: targetTeamId
      }
    });
  }

  console.log(`Assigned: ${princesCount} to PRINCES, ${princessesCount} to PRINCESSES, ${adminCount} admins with null teamId.`);

  // 3. Clean up any remaining obsolete team rows if separate from PRINCES and PRINCESSES
  const remainingOldTeams = await prisma.team.findMany({
    where: {
      name: { in: ['TEAM_OMEGA', 'TEAM_BETA', 'TEAM OMEGA', 'TEAM BETA'] }
    }
  });

  for (const old of remainingOldTeams) {
    const usersOnOld = await prisma.user.count({ where: { teamId: old.id } });
    const compsOnOld = await prisma.castleComponent.count({ where: { teamId: old.id } });
    const bugsOnOld = await prisma.bug.count({
      where: { OR: [{ architectTeamId: old.id }, { targetTeamId: old.id }, { claimerTeamId: old.id }] }
    });

    if (usersOnOld === 0 && compsOnOld === 0 && bugsOnOld === 0) {
      console.log(`Safely removing unreferenced old team: ${old.name} (${old.id})`);
      await prisma.team.delete({ where: { id: old.id } });
    }
  }

  // 4. Verification
  const allTeams = await prisma.team.findMany();
  console.log('Final DB Teams:', allTeams.map(t => ({ id: t.id, name: t.name })));

  const finalPrincesUsers = await prisma.user.count({ where: { teamId: princesTeam.id } });
  const finalPrincessesUsers = await prisma.user.count({ where: { teamId: princessesTeam.id } });
  const nullTeamUsers = await prisma.user.count({ where: { teamId: null } });

  console.log('--- FINAL DATABASE TEAM AUDIT ---');
  console.log(`PRINCES users: ${finalPrincesUsers} (Expected: 32)`);
  console.log(`PRINCESSES users: ${finalPrincessesUsers} (Expected: 17)`);
  console.log(`Admins with null team: ${nullTeamUsers} (Expected: 2)`);

  await prisma.$disconnect();
}

migrate().catch(e => {
  console.error('Migration error:', e);
  process.exit(1);
});
