import { pool } from '../config/db.js';
import type { User } from '@linkpage/shared';

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query(
      'SELECT * FROM lp_users WHERE email = $1',
      [email],
    );
    return rows[0] || null;
  },

  async findById(id: string): Promise<User | null> {
    const { rows } = await pool.query(
      'SELECT * FROM lp_users WHERE id = $1',
      [id],
    );
    return rows[0] || null;
  },

  async create(email: string, passwordHash: string, verifyToken: string): Promise<User> {
    const { rows } = await pool.query(
      `INSERT INTO lp_users (email, password_hash, email_verify_token)
       VALUES ($1, $2, $3) RETURNING *`,
      [email, passwordHash, verifyToken],
    );
    return rows[0];
  },

  async verifyEmail(token: string): Promise<User | null> {
    const { rows } = await pool.query(
      `UPDATE lp_users SET email_verified = true, email_verify_token = NULL
       WHERE email_verify_token = $1 RETURNING *`,
      [token],
    );
    return rows[0] || null;
  },

  async setPasswordResetToken(
    email: string,
    token: string,
    expires: Date,
  ): Promise<boolean> {
    const { rowCount } = await pool.query(
      `UPDATE lp_users SET password_reset_token = $1, password_reset_expires = $2
       WHERE email = $3`,
      [token, expires, email],
    );
    return (rowCount ?? 0) > 0;
  },

  async resetPassword(token: string, passwordHash: string): Promise<User | null> {
    const { rows } = await pool.query(
      `UPDATE lp_users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL
       WHERE password_reset_token = $2 AND password_reset_expires > NOW()
       RETURNING *`,
      [passwordHash, token],
    );
    return rows[0] || null;
  },

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await pool.query(
      'UPDATE lp_users SET password_hash = $1 WHERE id = $2',
      [passwordHash, userId],
    );
  },

  async deleteUser(userId: string): Promise<void> {
    await pool.query('DELETE FROM lp_users WHERE id = $1', [userId]);
  },
};
