const BASE_URL = 'http://localhost:3000/api/powra';

// Mock session for testing
const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
  },
};

const headers = {
  'Content-Type': 'application/json',
  'X-Test-Auth': JSON.stringify(mockSession),
};

async function testGetPOWRAs() {
  const response = await fetch(BASE_URL, { headers });
  const data = await response.json();
  console.log('GET POWRAs:', data);
}

async function testCreatePOWRA() {
  const newPOWRA = {
    status: 'DRAFT',
    headerFields: { title: 'Test POWRA' },
    beforeStartChecklist: { item1: true, item2: false },
    controlMeasures: { measure1: 'Test measure' },
    reviewComments: 'Test comment',
  };

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(newPOWRA),
  });
  const data = await response.json();
  console.log('Created POWRA:', data);
  return data.id;
}

async function testUpdatePOWRA(id: string) {
  const updatedPOWRA = {
    status: 'SUBMITTED',
    reviewComments: 'Updated test comment',
  };

  const response = await fetch(`${BASE_URL}?id=${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updatedPOWRA),
  });
  const data = await response.json();
  console.log('Updated POWRA:', data);
}

async function testDeletePOWRA(id: string) {
  const response = await fetch(`${BASE_URL}?id=${id}`, {
    method: 'DELETE',
    headers,
  });
  const data = await response.json();
  console.log('Deleted POWRA:', data);
}

async function runTests() {
  try {
    await testGetPOWRAs();
    const newPOWRAId = await testCreatePOWRA();
    if (newPOWRAId) {
      await testUpdatePOWRA(newPOWRAId);
      await testDeletePOWRA(newPOWRAId);
    }
    await testGetPOWRAs();
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

runTests();
