const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.count()
  .then(c => console.log('DB User count:', c))
  .catch(console.error)
  .finally(() => p.$disconnect());
