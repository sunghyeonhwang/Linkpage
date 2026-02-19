import { pool } from '../../config/db.js';
import { signToken } from '../../utils/jwt.js';
import { hashPassword } from '../../utils/hash.js';

export const TEST_EMAIL_PREFIX = `test_${Date.now()}`;

let counter = 0;
export function uniqueEmail(): string {
  return `${TEST_EMAIL_PREFIX}_${counter++}@test.com`;
}

export async function createTestUser(email?: string): Promise<{
  id: string;
  email: string;
  token: string;
}> {
  const userEmail = email || uniqueEmail();
  const hash = await hashPassword('test1234');
  const result = await pool.query(
    `INSERT INTO lp_users (id, email, password_hash, email_verified)
     VALUES (gen_random_uuid(), $1, $2, true)
     RETURNING id, email`,
    [userEmail, hash],
  );
  const user = result.rows[0];
  const token = signToken({ userId: user.id, email: user.email });
  return { id: user.id, email: user.email, token };
}

export async function cleanupTestData() {
  await pool.query(`DELETE FROM lp_users WHERE email LIKE $1`, [`${TEST_EMAIL_PREFIX}%`]);
}

export async function closePool() {
  await pool.end();
}
