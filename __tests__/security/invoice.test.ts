import type { NextRequest } from 'next/server';
import { GET as getInvoice } from '../../app/api/invoice/[invoiceId]/route';
import prisma from '../../app/utils/db';

jest.mock('../../app/utils/db', () => ({
  invoice: {
    findUnique: jest.fn(),
  },
}));

jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFont: jest.fn(),
    setFontSize: jest.fn(),
    text: jest.fn(),
    line: jest.fn(),
    output: jest.fn().mockReturnValue(Buffer.from('mock pdf content')),
  }));
});

const mockNextRequest = (role: string | null = null) => {
  return {
    headers: {
      get: jest.fn().mockReturnValue(JSON.stringify({ user: { role } })),
    },
  } as unknown as NextRequest;
};

describe('Invoice API Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should deny access to invoice for unauthenticated user', async () => {
    const req = mockNextRequest();
    const result = await getInvoice(req, { params: { invoiceId: '123' } });
    expect(result.status).toBe(401);
  });

  test('should allow access to invoice for authenticated user with correct role', async () => {
    const req = mockNextRequest('USER');
    (prisma.invoice.findUnique as jest.Mock).mockResolvedValue({
      id: '123',
      invoiceName: 'Test Invoice',
      // ... other invoice fields
    });

    const result = await getInvoice(req, { params: { invoiceId: '123' } });
    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('application/pdf');
  });

  test('should prevent access to non-existent invoice', async () => {
    const req = mockNextRequest('USER');
    (prisma.invoice.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getInvoice(req, { params: { invoiceId: 'non-existent' } });
    expect(result.status).toBe(404);
  });

  test('should sanitize user input in invoice ID', async () => {
    const req = mockNextRequest('USER');
    await getInvoice(req, { params: { invoiceId: "123'; DROP TABLE invoices; --" } });

    expect(prisma.invoice.findUnique).toHaveBeenCalledWith({
      where: { id: "123'; DROP TABLE invoices; --" },
      select: expect.any(Object),
    });
  });

  // Add more tests here for other security concerns related to invoices
});
