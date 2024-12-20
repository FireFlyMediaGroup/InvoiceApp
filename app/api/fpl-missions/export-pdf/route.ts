import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import prisma from '@/app/utils/db';
import { rbacMiddleware } from '@/app/middleware/rbac';

async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing document ID' }, { status: 400 });
  }

  try {
    const document = await prisma.tailboardDocument.findUnique({
      where: { id },
      include: { fplMission: true },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (typeof document.content !== 'string') {
      return NextResponse.json({ error: 'Invalid document content' }, { status: 500 });
    }

    const content = JSON.parse(document.content);

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(18).text('Tailboard Document', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`FPL Mission ID: ${document.fplMissionId}`);
      doc.text(`Date: ${document.date.toLocaleDateString()}`);
      doc.text(`Status: ${document.status}`);
      doc.moveDown();
      doc.text(`Pilot Name: ${content.pilotName}`);
      doc.text(`Site: ${content.site}`);
      doc.moveDown();
      doc.text('Tailboard Review:', { underline: true });
      doc.text(content.tailboardReview);
      doc.moveDown();
      doc.text('Pre-Flight Briefing:', { underline: true });
      doc.text(content.preFlightBriefing);
      doc.moveDown();
      doc.text('Rules Review:', { underline: true });
      doc.text(content.rulesReview);
      doc.moveDown();
      doc.text('Flight Plan Review:', { underline: true });
      doc.text(content.flightPlanReview);
      doc.moveDown();
      doc.text(`Signature: ${content.signature}`);

      doc.end();
    });

    const response = new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="tailboard-document-${id}.pdf"`,
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = rbacMiddleware(handler, ['ADMIN', 'SUPERVISOR', 'USER']);
