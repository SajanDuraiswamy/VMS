require('dotenv').config();

(async () => {
  try {
    const BASE = 'http://localhost:8000/api';

    // Register a visitor
    const visitorBody = { name: 'Visitor Test', email: 'visitor.test@example.com', phone: '7776665555', password: 'VisitorPass1', role: 'visitor' };
    await fetch(`${BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(visitorBody) }).catch(()=>{});

    // Login as visitor
    const loginRes = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: visitorBody.email, password: visitorBody.password }) });
    const loginJson = await loginRes.json();
    const token = loginJson.token;
    if (!token) throw new Error('Login failed: ' + JSON.stringify(loginJson));
    console.log('Visitor token:', token);

    // Check-in
    const checkInRes = await fetch(`${BASE}/visitor/checkin`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    const checkInJson = await checkInRes.json();
    console.log('Check-in response:', checkInJson);

    process.exit(0);
  } catch (err) {
    console.error('Test CheckIn Script Error', err);
    process.exit(1);
  }
})();
