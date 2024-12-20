import { PrismaClient, DocumentStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const sampleFPLMission = await prisma.fPLMission.create({
    data: {
      siteId: 'SITE001',
      status: DocumentStatus.DRAFT,
      user: {
        create: {
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'USER',
        },
      },
    },
  })

  const tailboardDocuments = [
    {
      status: DocumentStatus.DRAFT,
      content: {
        pilotName: 'John Doe',
        site: 'Site A',
        tailboardReview: 'Review for Site A',
        preFlightBriefing: 'Briefing for Site A',
        rulesReview: 'Rules for Site A',
        flightPlanReview: 'Flight plan for Site A',
        signature: 'John Doe',
      },
      date: new Date(),
      fplMissionId: sampleFPLMission.id,
      createdById: sampleFPLMission.userId,
    },
    {
      status: DocumentStatus.PENDING,
      content: {
        pilotName: 'Jane Smith',
        site: 'Site B',
        tailboardReview: 'Review for Site B',
        preFlightBriefing: 'Briefing for Site B',
        rulesReview: 'Rules for Site B',
        flightPlanReview: 'Flight plan for Site B',
        signature: 'Jane Smith',
      },
      date: new Date(),
      fplMissionId: sampleFPLMission.id,
      createdById: sampleFPLMission.userId,
    },
  ]

  for (const doc of tailboardDocuments) {
    await prisma.tailboardDocument.create({
      data: {
        ...doc,
        content: JSON.stringify(doc.content),
      },
    })
  }

  console.log('Seed data inserted successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
