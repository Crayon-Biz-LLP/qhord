const http = require('http');

const request = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null }));
    });
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

async function verify() {
  const [, , emailA, passA, emailB, passB] = process.argv;
  if (!emailA || !passA) return console.log("Usage: node verify-sessions.js <emailA> <passA> [emailB passB]");

  console.log("--- 1. Testing Core Revocation Flow ---");
  const loginA1 = await request('POST', '/api/auth/login', { email: emailA, password: passA });
  const tokenA1 = loginA1.data.token;
  
  const loginA2 = await request('POST', '/api/auth/login', { email: emailA, password: passA });
  const tokenA2 = loginA2.data.token;

  console.log("Logged in Session A1 and A2.");

  let sessions = await request('GET', '/api/auth/sessions', null, tokenA1);
  const sessionA2 = sessions.data.sessions.find(s => s.id !== loginA1.data.operator.sessionId);
  
  console.log("Found A2 session ID:", sessionA2?.id);
  
  await request('POST', `/api/auth/sessions/${sessionA2.id}/revoke`, null, tokenA1);
  console.log("Revoked A2 using A1.");
  
  const testA2 = await request('GET', '/api/auth/sessions', null, tokenA2);
  console.log("A2 request after revocation status:", testA2.status); // Should be 401

  const testA1 = await request('GET', '/api/auth/sessions', null, tokenA1);
  console.log("A1 request after revocation status:", testA1.status); // Should be 200

  console.log("\n--- 2. Testing Revoke All Other ---");
  await request('POST', '/api/auth/login', { email: emailA, password: passA }); // Create another session
  await request('POST', '/api/auth/sessions/revoke-all', null, tokenA1);
  console.log("Revoked all other sessions using A1.");
  sessions = await request('GET', '/api/auth/sessions', null, tokenA1);
  console.log("Remaining sessions for A1:", sessions.data.sessions.length); // Should be 1

  if (emailB && passB) {
    console.log("\n--- 3. Testing Cross-User Revocation ---");
    const loginB = await request('POST', '/api/auth/login', { email: emailB, password: passB });
    const tokenB = loginB.data.token;
    console.log("Logged in User B.");
    
    sessions = await request('GET', '/api/auth/sessions', null, tokenB);
    const sessionB = sessions.data.sessions[0];
    
    const attack = await request('POST', `/api/auth/sessions/${sessionB.id}/revoke`, null, tokenA1);
    console.log("A1 attempting to revoke B's session status:", attack.status); // Should be 404
  }

  console.log("\n✅ Verification complete.");
}

verify().catch(console.error);
