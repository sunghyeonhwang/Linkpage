import { pool } from '../config/db.js';
import { generateSlug } from '@linkpage/shared';
import type { Profile } from '@linkpage/shared';

export const profileRepository = {
  async findByUserId(userId: string): Promise<Profile[]> {
    const { rows } = await pool.query(
      'SELECT * FROM lp_profiles WHERE user_id = $1 ORDER BY created_at ASC',
      [userId],
    );
    return rows;
  },

  async findById(id: string): Promise<Profile | null> {
    const { rows } = await pool.query(
      'SELECT * FROM lp_profiles WHERE id = $1',
      [id],
    );
    return rows[0] || null;
  },

  async findBySlug(slug: string): Promise<Profile | null> {
    const { rows } = await pool.query(
      'SELECT * FROM lp_profiles WHERE slug = $1',
      [slug],
    );
    return rows[0] || null;
  },

  async create(userId: string, displayName?: string): Promise<Profile> {
    const slug = generateSlug();
    const { rows } = await pool.query(
      `INSERT INTO lp_profiles (user_id, slug, display_name)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, slug, displayName || 'My Page'],
    );
    return rows[0];
  },

  async update(id: string, data: Partial<Profile>): Promise<Profile | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowedFields = [
      'display_name', 'bio', 'avatar_url', 'background_image_url',
      'social_links', 'theme_preset', 'theme_overrides',
    ];

    for (const field of allowedFields) {
      if (field in data) {
        const val = (data as any)[field];
        if (field === 'social_links' || field === 'theme_overrides') {
          fields.push(`${field} = $${idx++}`);
          values.push(val ? JSON.stringify(val) : null);
        } else {
          fields.push(`${field} = $${idx++}`);
          values.push(val);
        }
      }
    }

    if (!fields.length) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE lp_profiles SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0] || null;
  },

  async updateSlug(id: string, slug: string): Promise<Profile | null> {
    const { rows } = await pool.query(
      'UPDATE lp_profiles SET slug = $1 WHERE id = $2 RETURNING *',
      [slug, id],
    );
    return rows[0] || null;
  },

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM lp_profiles WHERE id = $1', [id]);
  },

  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    const query = excludeId
      ? 'SELECT 1 FROM lp_profiles WHERE slug = $1 AND id != $2'
      : 'SELECT 1 FROM lp_profiles WHERE slug = $1';
    const params = excludeId ? [slug, excludeId] : [slug];
    const { rows } = await pool.query(query, params);
    return rows.length === 0;
  },
};
