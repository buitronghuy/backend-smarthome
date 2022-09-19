const { PrismaClient } = require('@prisma/client');

const models = new PrismaClient();

module.exports = { models };
