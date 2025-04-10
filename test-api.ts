import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function testCRUD() {
  try {
    // 1. Test GET Services
    console.log('Testing GET /public/services...');
    const servicesRes = await fetch(`${API_BASE}/public/services`);
    const services = await servicesRes.json();
    console.log('Services:', services);

    // 2. Test GET Incidents
    console.log('\nTesting GET /public/incidents...');
    const incidentsRes = await fetch(`${API_BASE}/public/incidents`);
    const incidents = await incidentsRes.json();
    console.log('Incidents:', incidents);

    // 3. Test POST Incident (requires authentication)
    console.log('\nTesting POST /incidents...');
    const newIncident = {
      title: 'Test Incident',
      description: 'This is a test incident',
      serviceId: services[0].id, // Use first service's ID
      severity: 'MEDIUM'
    };

    const postRes = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newIncident)
    });
    console.log('POST Response:', await postRes.json());

    // 4. Test PATCH Incident (requires authentication)
    console.log('\nTesting PATCH /incidents/[id]...');
    const patchRes = await fetch(`${API_BASE}/incidents/${incidents[0].id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'RESOLVED',
        description: 'Updated description'
      })
    });
    console.log('PATCH Response:', await patchRes.json());

  } catch (error) {
    console.error('Error during testing:', error);
  }
}

testCRUD(); 