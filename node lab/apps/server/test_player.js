const { PrismaClient } = require('@prisma/client');
const http = require('http');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = 'super-secret-node-wars-key-change-in-prod';

function makeRequest(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = 'Bearer ' + token;
    
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data || '{}') }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('--- TEST REGULAR PLAYER ---');
  let user = await prisma.user.findUnique({ where: { username: 'test_player_1' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: 'test_player_1',
        passwordHash: 'dummy',
        role: 'PLAYER',
        level: 1,
        xp: 0,
        missionsCompleted: 0
      }
    });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

  const m02 = await makeRequest('/api/missions/mission-02/run', 'POST', { code: 'const app = require("express")();' }, token);
  console.log('Mission 02 run status:', m02.status, 'Response:', m02.data.error || m02.data.success);
}

run().catch(console.error).finally(() => prisma.$disconnect());
