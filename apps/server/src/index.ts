import app from './app.js';
import { env } from './config/env.js';
import { testConnection } from './config/db.js';

async function start() {
  const dbOk = await testConnection();
  if (!dbOk) {
    console.error('Failed to connect to database. Exiting.');
    process.exit(1);
  }
  console.log('Database connected successfully');

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
}

start();
