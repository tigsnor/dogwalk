export type AppEnv = {
  port: number;
  databaseUrl: string;
  redisUrl: string;
  jwtSecret: string;
};

export const getEnv = (): AppEnv => ({
  port: Number(process.env.PORT ?? 3000),
  databaseUrl:
    process.env.DATABASE_URL ??
    'postgresql://dogwalk:dogwalk@localhost:5432/dogwalk',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me',
});
