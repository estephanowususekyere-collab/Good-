import prisma from './prisma.js'

async function main() {
  const packages = [
    { name: 'Starter', description: '10 analysis credits', price: 500, credits: 10, popular: false },
    { name: 'Pro', description: '30 analysis credits — best value', price: 1200, credits: 30, popular: true },
    { name: 'Elite', description: '75 analysis credits', price: 2500, credits: 75, popular: false },
  ]

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { name: pkg.name },
      update: pkg,
      create: pkg,
    })
  }

  console.log('Seeded packages:', packages.map(p => p.name).join(', '))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
