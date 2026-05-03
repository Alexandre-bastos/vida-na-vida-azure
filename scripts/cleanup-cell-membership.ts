import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanup() {
  // Find cell with name containing 'Next Pavuna' (to handle typos)
  const cell = await prisma.cell.findFirst({
    where: {
      name: {
        contains: 'Next Pavuna',
        mode: 'insensitive'
      }
    }
  })
  if (!cell) {
    console.log('Cell not found')
    return
  }
  console.log(`Found cell: ${cell.name} (${cell.id})`)
  // Delete all memberships for this cell
  const result = await prisma.cellMembership.deleteMany({
    where: { cellId: cell.id }
  })
  console.log(`Deleted ${result.count} membership(s) for cell ${cell.name}`)
}

cleanup()
