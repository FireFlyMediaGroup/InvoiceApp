import fetch from 'node-fetch';
import type { RequestInit as FetchRequestInit, Response as FetchResponse } from 'node-fetch';

console.log(`Script started: ${new Date().toISOString()}`);

const BASE_URL = 'http://localhost:3000/api/powra';

interface POWRA {
  id: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
  site: string;
  date: string;
  time: string;
  pilotName: string;
  location: string;
  chiefPilot: string;
  hse: string;
  beforeStartChecklist: string[];
  controlMeasures: Array<{ id: string; hazardNo: string; measures: string; risk: 'L' | 'M' | 'H'; powraId: string }>;
  reviewNames: string[];
  reviewDates: string[];
  lessonsLearned: boolean;
  reviewComments: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

function isPOWRA(obj: unknown): obj is POWRA {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const powra = obj as Record<string, unknown>;
  
  return (
    typeof powra.id === 'string' &&
    ['DRAFT', 'SUBMITTED', 'APPROVED'].includes(powra.status as string) &&
    typeof powra.site === 'string' &&
    typeof powra.date === 'string' &&
    typeof powra.time === 'string' &&
    typeof powra.pilotName === 'string' &&
    typeof powra.location === 'string' &&
    typeof powra.chiefPilot === 'string' &&
    typeof powra.hse === 'string' &&
    Array.isArray(powra.beforeStartChecklist) &&
    Array.isArray(powra.controlMeasures) &&
    Array.isArray(powra.reviewNames) &&
    Array.isArray(powra.reviewDates) &&
    typeof powra.lessonsLearned === 'boolean' &&
    typeof powra.userId === 'string' &&
    typeof powra.createdAt === 'string' &&
    typeof powra.updatedAt === 'string'
  );
}

async function fetchWithTimeout(url: string, options: FetchRequestInit, timeout = 5000): Promise<FetchResponse> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(url, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
}

async function retryFetch(url: string, options: FetchRequestInit, retries = 3): Promise<FetchResponse> {
  try {
    return await fetchWithTimeout(url, options);
  } catch (err) {
    if (retries > 0) {
      console.log(`Retrying... (${retries} attempts left)`);
      return retryFetch(url, options, retries - 1);
    }
    throw err;
  }
}

function createMockTestUser(): string {
  return 'mock-test-user-id';
}

const testPOWRAAPI = async () => {
  try {
    console.log('Starting POWRA API test...');

    // Check network connectivity
    try {
      await fetch('https://www.google.com');
      console.log('Network connectivity: OK');
    } catch (error) {
      console.error('Network connectivity issue:', error);
      return;
    }

    // Create a mock test user
    const testUserId = createMockTestUser();
    console.log('Mock test user created with ID:', testUserId);

    // Test GET all POWRAs
    console.log('Testing GET all POWRAs');
    const getAllResponse = await retryFetch(BASE_URL, {
      method: 'GET',
      headers: { 'X-Test-Auth': JSON.stringify({ user: { id: testUserId } }) },
    });
    console.log('GET all status:', getAllResponse.status);
    const getAllData = await getAllResponse.json();
    console.log('GET all response:', getAllData);

    // Test POST (Create) POWRA
    console.log('\nTesting POST POWRA');
    const newPOWRA = {
      status: 'DRAFT',
      site: 'Test Site',
      date: new Date().toISOString(),
      time: '12:00',
      pilotName: 'Test Pilot',
      location: 'Test Location',
      chiefPilot: 'Test Chief Pilot',
      hse: 'Test HSE',
      beforeStartChecklist: ['Item 1', 'Item 2'],
      controlMeasures: {
        create: [
          { hazardNo: '1', measures: 'Test Measure', risk: 'L' },
        ],
      },
      reviewNames: ['Reviewer 1'],
      reviewDates: [new Date().toISOString()],
      lessonsLearned: false,
    };
    console.log('Sending POST request with data:', JSON.stringify(newPOWRA));
    const createResponse = await retryFetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Auth': JSON.stringify({ user: { id: testUserId } }),
      },
      body: JSON.stringify(newPOWRA),
    });
    console.log('POST status:', createResponse.status);
    const createdPOWRAData = await createResponse.json();
    console.log('POST response:', createdPOWRAData);
    if (!isPOWRA(createdPOWRAData)) {
      throw new Error('Invalid POWRA data received from server');
    }
    const createdPOWRA: POWRA = createdPOWRAData;
    console.log('Created POWRA:', createdPOWRA);

    // Test GET single POWRA
    console.log('\nTesting GET single POWRA');
    const getOneResponse = await retryFetch(`${BASE_URL}?id=${createdPOWRA.id}`, {
      method: 'GET',
      headers: { 'X-Test-Auth': JSON.stringify({ user: { id: testUserId } }) },
    });
    console.log('GET one status:', getOneResponse.status);
    const getOneData = await getOneResponse.json();
    console.log('GET one response:', getOneData);

    // Test PUT (Update) POWRA
    console.log('\nTesting PUT POWRA');
    const updatedPOWRA = {
      ...createdPOWRA,
      site: 'Updated Test Site',
      controlMeasures: {
        upsert: createdPOWRA.controlMeasures.map(cm => ({
          where: { id: cm.id },
          update: cm,
          create: cm,
        })),
      },
    };
    console.log('Sending PUT request with data:', JSON.stringify(updatedPOWRA));
    const updateResponse = await retryFetch(`${BASE_URL}?id=${createdPOWRA.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Auth': JSON.stringify({ user: { id: testUserId } }),
      },
      body: JSON.stringify(updatedPOWRA),
    });
    console.log('PUT status:', updateResponse.status);
    const updatedData = await updateResponse.json();
    console.log('Updated POWRA:', updatedData);

    // Test DELETE POWRA
    console.log('\nTesting DELETE POWRA');
    const deleteResponse = await retryFetch(`${BASE_URL}?id=${createdPOWRA.id}`, {
      method: 'DELETE',
      headers: { 'X-Test-Auth': JSON.stringify({ user: { id: testUserId } }) },
    });
    console.log('DELETE status:', deleteResponse.status);
    const deleteData = await deleteResponse.json();
    console.log('DELETE response:', deleteData);

    console.log('POWRA API test completed successfully.');
  } catch (error) {
    console.error('Error during API testing:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
};

console.log('Starting test script...');
testPOWRAAPI().then(() => console.log('Test script finished.'));
