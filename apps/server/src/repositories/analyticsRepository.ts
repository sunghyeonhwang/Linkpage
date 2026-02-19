import { pool } from '../config/db.js';

export const analyticsRepository = {
  async recordView(
    profileId: string,
    referrer: string | null,
    userAgent: string | null,
    ipHash: string | null,
  ): Promise<void> {
    await pool.query(
      `INSERT INTO lp_page_views (profile_id, referrer, user_agent, ip_hash)
       VALUES ($1, $2, $3, $4)`,
      [profileId, referrer, userAgent, ipHash],
    );
  },

  async recordClick(
    linkId: string,
    profileId: string,
    referrer: string | null,
    userAgent: string | null,
    ipHash: string | null,
  ): Promise<void> {
    await pool.query(
      `INSERT INTO lp_link_clicks (link_id, profile_id, referrer, user_agent, ip_hash)
       VALUES ($1, $2, $3, $4, $5)`,
      [linkId, profileId, referrer, userAgent, ipHash],
    );
  },

  async getSummary(profileId: string) {
    const { rows } = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM lp_page_views WHERE profile_id = $1)::int AS "totalViews",
        (SELECT COUNT(*) FROM lp_link_clicks WHERE profile_id = $1)::int AS "totalClicks",
        (SELECT COUNT(*) FROM lp_page_views WHERE profile_id = $1 AND viewed_at >= CURRENT_DATE)::int AS "todayViews",
        (SELECT COUNT(*) FROM lp_link_clicks WHERE profile_id = $1 AND clicked_at >= CURRENT_DATE)::int AS "todayClicks"`,
      [profileId],
    );
    return rows[0];
  },

  async getDailyStats(profileId: string, days: number) {
    const { rows } = await pool.query(
      `SELECT
        d::date::text AS date,
        COALESCE(v.cnt, 0)::int AS views,
        COALESCE(c.cnt, 0)::int AS clicks
      FROM generate_series(
        CURRENT_DATE - ($2::int - 1) * INTERVAL '1 day',
        CURRENT_DATE,
        '1 day'
      ) AS d
      LEFT JOIN (
        SELECT viewed_at::date AS day, COUNT(*) AS cnt
        FROM lp_page_views
        WHERE profile_id = $1 AND viewed_at >= CURRENT_DATE - ($2::int - 1) * INTERVAL '1 day'
        GROUP BY day
      ) v ON v.day = d::date
      LEFT JOIN (
        SELECT clicked_at::date AS day, COUNT(*) AS cnt
        FROM lp_link_clicks
        WHERE profile_id = $1 AND clicked_at >= CURRENT_DATE - ($2::int - 1) * INTERVAL '1 day'
        GROUP BY day
      ) c ON c.day = d::date
      ORDER BY d`,
      [profileId, days],
    );
    return rows;
  },

  async getLinkStats(profileId: string, days: number) {
    const { rows } = await pool.query(
      `SELECT
        l.id AS "linkId",
        l.label,
        l.url,
        COALESCE(c.cnt, 0)::int AS clicks
      FROM lp_profile_links l
      LEFT JOIN (
        SELECT link_id, COUNT(*) AS cnt
        FROM lp_link_clicks
        WHERE profile_id = $1 AND clicked_at >= CURRENT_DATE - ($2::int - 1) * INTERVAL '1 day'
        GROUP BY link_id
      ) c ON c.link_id = l.id
      WHERE l.profile_id = $1
      ORDER BY clicks DESC, l.sort_order ASC`,
      [profileId, days],
    );
    return rows;
  },
};
