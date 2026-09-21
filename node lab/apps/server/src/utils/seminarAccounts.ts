// Specification for the 51 seminar participants
// 49 students (32 Princes on Team PRINCES + 17 Princesses on Team PRINCESSES) and 2 organizers (admin04, admin12 with NO student team)
// Absent roll numbers: 01 and 40 (no accounts created)

export type CharacterClass = 'PRINCE' | 'PRINCESS';
export type GameplayTeam = 'PRINCES' | 'PRINCESSES';

export interface SeminarAccountDef {
  rollNumber: number;
  username: string; // Login ID: ch.sc.u4cys250XX or adminXX
  name: string;     // Display Name: PrinceXX, PrincessXX, or AdminXX
  classification?: CharacterClass;
  team: GameplayTeam | null; // Explicit gameplay team: PRINCES or PRINCESSES (null for admins)
  role: 'PLAYER' | 'ADMIN';
  initialPassword: string;
}

export const SEMINAR_ACCOUNTS: SeminarAccountDef[] = [
  // -------------------------------------------------------------
  // BOYS / PRINCES (32 Students) -> Team: PRINCES
  // -------------------------------------------------------------
  { rollNumber: 2, username: 'ch.sc.u4cys25002', name: 'Prince02', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-k9X2#mP8q' },
  { rollNumber: 5, username: 'ch.sc.u4cys25005', name: 'Prince05', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-r8N3@tQ5y' },
  { rollNumber: 6, username: 'ch.sc.u4cys25006', name: 'Prince06', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-y2H9$kM7e' },
  { rollNumber: 8, username: 'ch.sc.u4cys25008', name: 'Prince08', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-t7F6*bV9c' },
  { rollNumber: 9, username: 'ch.sc.u4cys25009', name: 'Prince09', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-m3P4#xC2v' },
  { rollNumber: 10, username: 'ch.sc.u4cys25010', name: 'Prince10', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-c8K7!nL5s' },
  { rollNumber: 13, username: 'ch.sc.u4cys25013', name: 'Prince13', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-g7R4$mQ2p' },
  { rollNumber: 16, username: 'ch.sc.u4cys25016', name: 'Prince16', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-b6K2#tL9n' },
  { rollNumber: 17, username: 'ch.sc.u4cys25017', name: 'Prince17', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-v1P5!rC8j' },
  { rollNumber: 18, username: 'ch.sc.u4cys25018', name: 'Prince18', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-x8T3@mB7y' },
  { rollNumber: 19, username: 'ch.sc.u4cys25019', name: 'Prince19', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-h3D9$kJ4e' },
  { rollNumber: 22, username: 'ch.sc.u4cys25022', name: 'Prince22', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-p2B4#tX9r' },
  { rollNumber: 23, username: 'ch.sc.u4cys25023', name: 'Prince23', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-r9K8!vC3m' },
  { rollNumber: 25, username: 'ch.sc.u4cys25025', name: 'Prince25', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-w6T5$nJ2k' },
  { rollNumber: 27, username: 'ch.sc.u4cys25027', name: 'Prince27', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-c1D7*zB4x' },
  { rollNumber: 28, username: 'ch.sc.u4cys25028', name: 'Prince28', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-z7F2#tQ6j' },
  { rollNumber: 29, username: 'ch.sc.u4cys25029', name: 'Prince29', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-k3H9!mX8w' },
  { rollNumber: 30, username: 'ch.sc.u4cys25030', name: 'Prince30', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-v5B4@rK2n' },
  { rollNumber: 31, username: 'ch.sc.u4cys25031', name: 'Prince31', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-t8P1$yL7m' },
  { rollNumber: 32, username: 'ch.sc.u4cys25032', name: 'Prince32', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-g2R6&zV9c' },
  { rollNumber: 39, username: 'ch.sc.u4cys25039', name: 'Prince39', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-j2B9*tK7v' },
  { rollNumber: 41, username: 'ch.sc.u4cys25041', name: 'Prince41', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-r4M7#hX9p' },
  { rollNumber: 42, username: 'ch.sc.u4cys25042', name: 'Prince42', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-y8P2!vL5m' },
  { rollNumber: 43, username: 'ch.sc.u4cys25043', name: 'Prince43', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-w1T6@rC8k' },
  { rollNumber: 44, username: 'ch.sc.u4cys25044', name: 'Prince44', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-m7D3$zQ2y' },
  { rollNumber: 45, username: 'ch.sc.u4cys25045', name: 'Prince45', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-c2F9&tB6n' },
  { rollNumber: 46, username: 'ch.sc.u4cys25046', name: 'Prince46', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-z8H4*hK1w' },
  { rollNumber: 49, username: 'ch.sc.u4cys25049', name: 'Prince49', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-t2P7@zC4m' },
  { rollNumber: 50, username: 'ch.sc.u4cys25050', name: 'Prince50', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-g8R1$tQ5k' },
  { rollNumber: 51, username: 'ch.sc.u4cys25051', name: 'Prince51', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-d3T6&rB8y' },
  { rollNumber: 52, username: 'ch.sc.u4cys25052', name: 'Prince52', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-q7M2*hK4n' },
  { rollNumber: 53, username: 'ch.sc.u4cys25053', name: 'Prince53', classification: 'PRINCE', team: 'PRINCES', role: 'PLAYER', initialPassword: 'nw-b1K9#zL6w' },

  // -------------------------------------------------------------
  // GIRLS / PRINCESSES (17 Students) -> Team: PRINCESSES
  // -------------------------------------------------------------
  { rollNumber: 3, username: 'ch.sc.u4cys25003', name: 'Princess03', classification: 'PRINCESS', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-v4B7!jL3w' },
  { rollNumber: 7, username: 'ch.sc.u4cys25007', name: 'Princess07', classification: 'PRINCESS', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-w5D1&zJ4a' },
  { rollNumber: 11, username: 'ch.sc.u4cys25011', name: 'Princess11', classification: 'PRINCESS', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-z2T9@vB4m' },
  { rollNumber: 14, username: 'ch.sc.u4cys25014', name: 'Princess14', classification: 'PRINCESS', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-d9Y1&hJ6k' },
  { rollNumber: 15, username: 'ch.sc.u4cys25015', name: 'Princess15', classification: 'PRINCESS', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-q4M8*zX3w' },
  { rollNumber: 20, username: 'ch.sc.u4cys25020', name: 'Princess20', classification: 'PRINCESS', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-n5F1&qV6z' },
  { rollNumber: 21, username: 'ch.sc.u4cys25021', name: 'Princess21', classification: 'PRINCESS', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-j7H6*zL2w' },
  { rollNumber: 24, username: 'ch.sc.u4cys25024', name: 'Princess24', classification: 'PRINCESS', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-y4M1@hQ7p' },
  { rollNumber: 26, username: 'ch.sc.u4cys25026', name: 'Princess26', classification: 'PRINCESS', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-m8P3&rL9v' },
  { rollNumber: 33, username: 'ch.sc.u4cys25033', name: 'Princess33', classification: 'PRINCESS', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-d7T3*hJ4e' },
  { rollNumber: 34, username: 'ch.sc.u4cys25034', name: 'Princess34', classification: 'PRINCESS', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-q1M9#tC8p' },
  { rollNumber: 35, username: 'ch.sc.u4cys25035', name: 'Princess35', classification: 'PRINCESS', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-b8K5!rX2w' },
  { rollNumber: 36, username: 'ch.sc.u4cys25036', name: 'Princess36', classification: 'PRINCESS', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-x3D2@nQ6k' },
  { rollNumber: 37, username: 'ch.sc.u4cys25037', name: 'Princess37', classification: 'PRINCESS', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-h5F8$mB4y' },
  { rollNumber: 38, username: 'ch.sc.u4cys25038', name: 'Princess38', classification: 'PRINCESS', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-n7H4&rL1z' },
  { rollNumber: 47, username: 'ch.sc.u4cys25047', name: 'Princess47', classification: 'PRINCESS', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-k1B8#rX7j' },
  { rollNumber: 48, username: 'ch.sc.u4cys25048', name: 'Princess48', classification: 'PRINCESS', team: 'PRINCESSES', role: 'PLAYER', initialPassword: 'nw-v6M3!nL9p' },

  // -------------------------------------------------------------
  // ORGANIZERS / ADMINS (4 Accounts) -> Seeded dynamically via seed.ts using env vars
  // -------------------------------------------------------------
  // 4 organizer accounts are handled explicitly in seed.ts:
  // - bala (ADMIN), bala-instructor (INSTRUCTOR)
  // - vaishnav (ADMIN), vaishnav-instructor (INSTRUCTOR)
];
