import prisma from '../../../utils/db';
import { requireUser } from '../../../utils/hooks';
import { emailClient } from '../../../utils/mailtrap';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rbacMiddleware } from '../../../middleware/rbac';

async function sendEmailReminder(
  request: NextRequest,
  invoiceId: string
): Promise<NextResponse> {
  try {
    const session = await requireUser();

    const invoiceData = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        userId: session.user?.id,
      },
    });

    if (!invoiceData) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const sender = {
      email: 'hello@demomailtrap.com',
      name: 'SkySpecs',
    };

    await emailClient.send({
      from: sender,
      to: [{ email: 'jan@alenix.de' }],
      template_uuid: '03c0c5ec-3f09-42ab-92c3-9f338f31fe2c',
      template_variables: {
        first_name: invoiceData.clientName,
        company_info_name: 'SkySpecs',
        company_info_address: '312 S Ashley St',
        company_info_city: 'Ann Arbor',
        company_info_state: 'MI',
        company_info_zip_code: '48104',
        company_info_country: 'United States',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send Email reminder' },
      { status: 500 }
    );
  }
}

export const POST = rbacMiddleware(
  async (request: NextRequest, context: { params: Record<string, string> }) => {
    const invoiceId = context.params.invoiceId;
    if (!invoiceId) {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 });
    }
    return sendEmailReminder(request, invoiceId);
  },
  ['USER', 'SUPERVISOR', 'ADMIN']
);
