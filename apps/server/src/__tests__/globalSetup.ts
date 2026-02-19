import { pool } from '../../config/db.js';

export async function teardown() {
  await pool.end();
}
