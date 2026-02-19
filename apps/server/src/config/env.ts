import 'dotenv/config';

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  MAIL_FROM: process.env.MAIL_FROM || '"LinkPage" <noreply@linkpage.app>',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;
