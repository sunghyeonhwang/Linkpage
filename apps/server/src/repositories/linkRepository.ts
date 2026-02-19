import { pool } from '../config/db.js';
import type { ProfileLink } from '@linkpage/shared';

export const linkRepository = {
  async findByProfileId(profileId: string): Promise<ProfileLink[]> {
    const { rows } = await pool.query(
      'SELECT * FROM lp_profile_links WHERE profile_id = $1 ORDER BY sort_order ASC',
      [profileId],
    );
    return rows;
  },

  async findById(id: string): Promise<ProfileLink | null> {
    const { rows } = await pool.query(
      'SELECT * FROM lp_profile_links WHERE id = $1',
      [id],
    );
    return rows[0] || null;
  },

  async create(profileId: string, data: Partial<ProfileLink>): Promise<ProfileLink> {
    // Get next sort_order
    const { rows: countRows } = await pool.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM lp_profile_links WHERE profile_id = $1',
      [profileId],
    );
    const sortOrder = countRows[0].next_order;

    const { rows } = await pool.query(
      `INSERT INTO lp_profile_links (profile_id, label, url, description, icon, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        profileId,
        data.label,
        data.url,
        data.description || null,
        data.icon || null,
        data.is_active ?? true,
        sortOrder,
      ],
    );
    return rows[0];
  },

  async update(id: string, data: Partial<ProfileLink>): Promise<ProfileLink | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowedFields = ['label', 'url', 'description', 'icon', 'is_active'];

    for (const field of allowedFields) {
      if (field in data) {
        fields.push(`${field} = $${idx++}`);
        values.push((data as any)[field]);
      }
    }

    if (!fields.length) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE lp_profile_links SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0] || null;
  },

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM lp_profile_links WHERE id = $1', [id]);
  },

  async reorder(links: { id: string; sort_order: number }[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const link of links) {
        await client.query(
          'UPDATE lp_profile_links SET sort_order = $1 WHERE id = $2',
          [link.sort_order, link.id],
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async findActiveByProfileId(profileId: string): Promise<ProfileLink[]> {
    const { rows } = await pool.query(
      'SELECT * FROM lp_profile_links WHERE profile_id = $1 AND is_active = true ORDER BY sort_order ASC',
      [profileId],
    );
    return rows;
  },
};
