const http = require('http');

const request = (method, path, body, token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

async function test() {
  console.log('Testing seminar_demo login...');
  let res = await request('POST', '/api/auth/login', { username: 'seminar_demo', password: 'NodeWars@2026' });
  console.log(`Login status: ${res.status}`);
  const data = JSON.parse(res.body);
  const token = data.token;
  console.log(`Token acquired: !!token`);
  console.log(`User payload: ${JSON.stringify(data.user)}`);

  console.log('\nTesting /api/user/me...');
  res = await request('GET', '/api/user/me', null, token);
  console.log(`Me status: ${res.status}`);
  console.log(`Me payload: ${res.body}`);

  console.log('\nTesting Mission 02 run (Should be 403 for PLAYER)...');
  res = await request('POST', '/api/missions/mission-02/run', { code: 'console.log(1)' }, token);
  console.log(`Mission 02 status: ${res.status}`);
  console.log(`Mission 02 response: ${res.body}`);

  console.log('\nTesting Mission 07 run (Should be 403 for PLAYER)...');
  res = await request('POST', '/api/missions/mission-07/run', { code: 'console.log(1)' }, token);
  console.log(`Mission 07 status: ${res.status}`);
  console.log(`Mission 07 response: ${res.body}`);
}

test().catch(console.error);
