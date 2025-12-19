require('dotenv').config();

(async () => {
  try {
    const BASE = 'http://localhost:8000/api';

    // 1. Register admin (may already exist)
    const adminBody = { name: 'Admin Test', email: 'admin.test@local', phone: '0000000000', password: 'AdminPass123', role: 'admin' };
    await fetch(`${BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(adminBody) }).catch(() => {});

    // 2. Login as admin
    const loginRes = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin.test@local', password: 'AdminPass123' }) });
    const loginJson = await loginRes.json();
    const token = loginJson.token;
    console.log('Admin token:', token);

    // 3. Create a registration to be approved
    const regBody = {
      full_name: 'Approval Test User',
      mobile: '8889990000',
      email: process.env.EMAIL_USER,
      visit_type: 'pre_registered',
      purpose: 'Testing Approval',
      whom_to_meet: 'Host Test',
      host_email: process.env.EMAIL_USER
    };

    const regRes = await fetch(`${BASE}/visitor/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(regBody) });
    const regJson = await regRes.json();
    console.log('Registration created:', regJson.registration._id);

    // 4. Approve registration
    const regId = regJson.registration._id;
    const approveRes = await fetch(`${BASE}/visitor/registration/${regId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status: 'approved' }) });
    const approveJson = await approveRes.json();
    console.log('Approve response:', approveJson);

    process.exit(0);
  } catch (err) {
    console.error('Test Approval Script Error', err);
    process.exit(1);
  }
})();
