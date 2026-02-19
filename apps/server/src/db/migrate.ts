import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const migrationDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationDir, file), 'utf-8');
      await pool.query(sql);
      console.log(`  ✓ ${file} completed`);
    }

    console.log('\nAll migrations completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
