require('@testing-library/jest-dom');
const { TextEncoder, TextDecoder } = require('node:util');
const { jest } = require('@jest/globals');

// Mock Next.js router
jest.mock('next/router', () => require('next-router-mock'));
jest.mock('next/navigation', () => require('next-router-mock'));

// Polyfill for TextEncoder and TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Next.js server components
jest.mock('next/headers', () => ({
  headers: () => new Map(),
  cookies: () => new Map(),
}));

// Mock Next Response and Request
class MockResponse {
  json() { return this; }
  status() { return this; }
}

class MockRequest {}

global.Response = MockResponse;
global.Request = MockRequest;

// Add any other setup code here
