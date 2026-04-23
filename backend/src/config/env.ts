export type AppEnv = {
  port: number;
  databaseUrl: string;
  redisUrl: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresInSec: number;
  jwtRefreshExpiresInSec: number;
};

const INSECURE_SECRET_VALUES = new Set([
  'change-me',
  'change-me-refresh',
  'replace-with-strong-random-secret',
  'replace-with-strong-random-refresh-secret',
]);

const MIN_SECRET_LENGTH = 32;

const readRequiredEnv = (key: string): string => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  if (INSECURE_SECRET_VALUES.has(value)) {
    throw new Error(`Environment variable ${key} must be replaced with a strong secret`);
  }

  if (value.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `Environment variable ${key} must be at least ${MIN_SECRET_LENGTH} characters long`,
    );
  }

  return value;
};

const readPositiveInt = (key: string, fallback: number): number => {
  const raw = process.env[key];
  if (!raw) return fallback;

  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Environment variable ${key} must be a positive integer`);
  }

  return value;
};

let cachedEnv: AppEnv | undefined;

export const getEnv = (): AppEnv => {
  if (cachedEnv) return cachedEnv;

  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('Environment variable PORT must be a positive integer');
  }

  cachedEnv = {
    port,
    databaseUrl:
      process.env.DATABASE_URL ??
      'postgresql://dogwalk:dogwalk@localhost:5432/dogwalk',
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
    jwtSecret: readRequiredEnv('JWT_SECRET'),
    jwtRefreshSecret: readRequiredEnv('JWT_REFRESH_SECRET'),
    jwtAccessExpiresInSec: readPositiveInt('JWT_ACCESS_EXPIRES_IN_SEC', 900),
    jwtRefreshExpiresInSec: readPositiveInt('JWT_REFRESH_EXPIRES_IN_SEC', 60 * 60 * 24 * 7),
  };

  return cachedEnv;
};
