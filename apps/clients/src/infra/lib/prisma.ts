import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from 'apps/clients/generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL_CLIENTS}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
