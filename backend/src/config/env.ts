import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID, PORT, NODE_ENV, ALLOW_GOOGLE_SIMULATOR, ALLOWED_ORIGINS } = process.env;

if (!DATABASE_URL || DATABASE_URL.trim() === '') {
  throw new Error('DATABASE_URL environment variable is required');
}

if (!JWT_SECRET || JWT_SECRET.trim() === '') {
  throw new Error('JWT_SECRET environment variable is required');
}

if (JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

const origins = ALLOWED_ORIGINS
  ? ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['http://localhost:3000'];

export const env = {
  DATABASE_URL,
  JWT_SECRET,
  GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID || '',
  PORT: PORT ? parseInt(PORT, 10) : 5000,
  NODE_ENV: NODE_ENV || 'development',
  ALLOW_GOOGLE_SIMULATOR: ALLOW_GOOGLE_SIMULATOR === 'true',
  ALLOWED_ORIGINS: origins,
};

export default env;
