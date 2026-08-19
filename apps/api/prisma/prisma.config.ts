import 'dotenv/config';

export const prismaConfig = {
  datasource: {
    adapter: 'postgresql',
    url: process.env.DATABASE_URL!,
  },
};
