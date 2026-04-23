export type AppEnv = {
  port: number;
  databaseUrl: string;
  redisUrl: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresInSec: number;
  jwtRefreshExpiresInSec: number;
};

export const getEnv = (): AppEnv => ({
  port: Number(process.env.PORT ?? 3000),
  databaseUrl:
    process.env.DATABASE_URL ??
    'postgresql://dogwalk:dogwalk@localhost:5432/dogwalk',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh',
  jwtAccessExpiresInSec: Number(process.env.JWT_ACCESS_EXPIRES_IN_SEC ?? 900),
  jwtRefreshExpiresInSec: Number(
    process.env.JWT_REFRESH_EXPIRES_IN_SEC ?? 60 * 60 * 24 * 7,
  ),
});
