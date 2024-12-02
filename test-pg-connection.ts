import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testConnection() {
  try {
    console.log('Attempting to connect to the database...')
    const result = await prisma.$queryRaw<[{ now: Date }]>`SELECT NOW()`
    console.log('Connected successfully. Current time:', result[0].now)
    
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)
  } catch (err) {
    console.error('Error connecting to the database:', err)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
