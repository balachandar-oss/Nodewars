const fs = require('fs');
const path = require('path');

const defs = [
  // PRINCES (32)
  { rollNumber: 2, username: 'ch.sc.u4cys25002', name: 'Prince02', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-k9X2#mP8q' },
  { rollNumber: 5, username: 'ch.sc.u4cys25005', name: 'Prince05', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-r8N3@tQ5y' },
  { rollNumber: 6, username: 'ch.sc.u4cys25006', name: 'Prince06', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-y2H9$kM7e' },
  { rollNumber: 8, username: 'ch.sc.u4cys25008', name: 'Prince08', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-t7F6*bV9c' },
  { rollNumber: 9, username: 'ch.sc.u4cys25009', name: 'Prince09', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-m3P4#xC2v' },
  { rollNumber: 10, username: 'ch.sc.u4cys25010', name: 'Prince10', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-c8K7!nL5s' },
  { rollNumber: 13, username: 'ch.sc.u4cys25013', name: 'Prince13', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-g7R4$mQ2p' },
  { rollNumber: 16, username: 'ch.sc.u4cys25016', name: 'Prince16', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-b6K2#tL9n' },
  { rollNumber: 17, username: 'ch.sc.u4cys25017', name: 'Prince17', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-v1P5!rC8j' },
  { rollNumber: 18, username: 'ch.sc.u4cys25018', name: 'Prince18', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-x8T3@mB7y' },
  { rollNumber: 19, username: 'ch.sc.u4cys25019', name: 'Prince19', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-h3D9$kJ4e' },
  { rollNumber: 22, username: 'ch.sc.u4cys25022', name: 'Prince22', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-p2B4#tX9r' },
  { rollNumber: 23, username: 'ch.sc.u4cys25023', name: 'Prince23', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-r9K8!vC3m' },
  { rollNumber: 25, username: 'ch.sc.u4cys25025', name: 'Prince25', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-w6T5$nJ2k' },
  { rollNumber: 27, username: 'ch.sc.u4cys25027', name: 'Prince27', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-c1D7*zB4x' },
  { rollNumber: 28, username: 'ch.sc.u4cys25028', name: 'Prince28', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-z7F2#tQ6j' },
  { rollNumber: 29, username: 'ch.sc.u4cys25029', name: 'Prince29', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-k3H9!mX8w' },
  { rollNumber: 30, username: 'ch.sc.u4cys25030', name: 'Prince30', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-v5B4@rK2n' },
  { rollNumber: 31, username: 'ch.sc.u4cys25031', name: 'Prince31', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-t8P1$yL7m' },
  { rollNumber: 32, username: 'ch.sc.u4cys25032', name: 'Prince32', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-g2R6&zV9c' },
  { rollNumber: 39, username: 'ch.sc.u4cys25039', name: 'Prince39', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-j2B9*tK7v' },
  { rollNumber: 41, username: 'ch.sc.u4cys25041', name: 'Prince41', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-r4M7#hX9p' },
  { rollNumber: 42, username: 'ch.sc.u4cys25042', name: 'Prince42', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-y8P2!vL5m' },
  { rollNumber: 43, username: 'ch.sc.u4cys25043', name: 'Prince43', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-w1T6@rC8k' },
  { rollNumber: 44, username: 'ch.sc.u4cys25044', name: 'Prince44', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-m7D3$zQ2y' },
  { rollNumber: 45, username: 'ch.sc.u4cys25045', name: 'Prince45', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-c2F9&tB6n' },
  { rollNumber: 46, username: 'ch.sc.u4cys25046', name: 'Prince46', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-z8H4*hK1w' },
  { rollNumber: 49, username: 'ch.sc.u4cys25049', name: 'Prince49', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-t2P7@zC4m' },
  { rollNumber: 50, username: 'ch.sc.u4cys25050', name: 'Prince50', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-g8R1$tQ5k' },
  { rollNumber: 51, username: 'ch.sc.u4cys25051', name: 'Prince51', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-d3T6&rB8y' },
  { rollNumber: 52, username: 'ch.sc.u4cys25052', name: 'Prince52', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-q7M2*hK4n' },
  { rollNumber: 53, username: 'ch.sc.u4cys25053', name: 'Prince53', team: 'PRINCES', classification: 'PRINCE', role: 'PLAYER', initialPassword: 'nw-b1K9#zL6w' },
  // PRINCESSES (17)
  { rollNumber: 3, username: 'ch.sc.u4cys25003', name: 'Princess03', team: 'PRINCESSES', classification: 'PRINCESS', role: 'PLAYER', initialPassword: 'nw-v4B7!jL3w' },
  { rollNumber: 7, username: 'ch.sc.u4cys25007', name: 'Princess07', team: 'PRINCESSES', classification: 'PRINCESS', role: 'PLAYER', initialPassword: 'nw-w5D1&zJ4a' },
  { rollNumber: 11, username: 'ch.sc.u4cys25011', name: 'Princess11', team: 'PRINCESSES', classification: 'PRINCESS', role: 'PLAYER', initialPassword: 'nw-z2T9@vB4m' },
  { rollNumber: 14, username: 'ch.sc.u4cys25014', name: 'Princess14', team: 'PRINCESSES', classification: 'PRINCESS', role: 'PLAYER', initialPassword: 'nw-d9Y1&hJ6k' },
  { rollNumber: 15, username: 'ch.sc.u4cys25015', name: 'Princess15', team: 'PRINCESSES', classification: 'PRINCESS', role: 'PLAYER', initialPassword: 'nw-q4M8*zX3w' },
  { rollNumber: 20, username: 'ch.sc.u4cys25020', name: 'Princess20', team: 'PRINCESSES', classification: 'PRINCESS', role: 'PLAYER', initialPassword: 'nw-n5F1&qV6z' },
  { rollNumber: 21, username: 'ch.sc.u4cys25021', name: 'Princess21', team: 'PRINCESSES', classification: 'PRINCESS', role: 'PLAYER', initialPassword: 'nw-j7H6*zL2w' },
  { rollNumber: 24, username: 'ch.sc.u4cys25024', name: 'Princess24', team: 'PRINCESSES', classification: 'PRINCESS', role: 'PLAYER', initialPassword: 'nw-y4M1@hQ7p' },
  { rollNumber: 26, username: 'ch.sc.u4cys25026', name: 'Princess26', team: 'PRINCESSES', classification: 'PRINCESS', role: 'PLAYER', initialPassword: 'nw-m8P3&rL9v' },
  { rollNumber: 33, username: 'ch.sc.u4cys25033', name: 'Princess33', team: 'PRINCESSES', classification: 'PRINCESS', role: 'PLAYER', initialPassword: 'nw-d7T3*hJ4e' },
  { rollNumber: 34, username: 'ch.sc.u4cys25034', name: 'Princess34', team: 'PRINCESSES', classification: 'PRINCESS', role: 'PLAYER', initialPassword: 'nw-q1M9#tC8p' },
  { rollNumber: 35, username: 'ch.sc.u4cys25035', name: 'Princess35', team: 'PRINCESSES', classification: 'PRINCESS', role: 'PLAYER', initialPassword: 'nw-b8K5!rX2w' },
  { rollNumber: 36, username: 'ch.sc.u4cys25036', name: 'Princess36', team: 'PRINCESSES', classification: 'PRINCESS', role: 'PLAYER', initialPassword: 'nw-x3D2@nQ6k' },
  { rollNumber: 37, username: 'ch.sc.u4cys25037', name: 'Princess37', team: 'PRINCESSES', classification: 'PRINCESS', role: 'PLAYER', initialPassword: 'nw-h5F8$mB4y' },
  { rollNumber: 38, username: 'ch.sc.u4cys25038', name: 'Princess38', team: 'PRINCESSES', classification: 'PRINCESS', role: 'PLAYER', initialPassword: 'nw-n7H4&rL1z' },
  { rollNumber: 47, username: 'ch.sc.u4cys25047', name: 'Princess47', team: 'PRINCESSES', classification: 'PRINCESS', role: 'PLAYER', initialPassword: 'nw-k1B8#rX7j' },
  { rollNumber: 48, username: 'ch.sc.u4cys25048', name: 'Princess48', team: 'PRINCESSES', classification: 'PRINCESS', role: 'PLAYER', initialPassword: 'nw-v6M3!nL9p' },
  // ADMINS (2)
  { rollNumber: 4, username: 'admin04', name: 'Admin04', team: '', classification: '', role: 'ADMIN', initialPassword: 'admin#NW4!9zXp' },
  { rollNumber: 12, username: 'admin12', name: 'Admin12', team: '', classification: '', role: 'ADMIN', initialPassword: 'admin#NW12!8vKm' }
];

defs.sort((a, b) => a.rollNumber - b.rollNumber);

let csv = 'Roll No, Login ID, Name, Team, Classification, Role, Initial Password\n';
for (const acc of defs) {
  const rollStr = acc.rollNumber.toString().padStart(2, '0');
  csv += `${rollStr}, ${acc.username}, ${acc.name}, ${acc.team}, ${acc.classification}, ${acc.role}, ${acc.initialPassword}\n`;
}

fs.writeFileSync(path.join(__dirname, '..', 'seminar-credentials.csv'), csv.trim() + '\n', 'utf8');
console.log('Successfully wrote seminar-credentials.csv with ' + defs.length + ' accounts.');
