const pool = require('../config/db');

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        a.login_time,
        a.logout_time,
        a.working_time,
        a.date
      FROM users u
      LEFT JOIN attendance a ON u.id = a.user_id
      WHERE u.role = 'user'
      ORDER BY a.date DESC
    `);

    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const assignRepo = async (req, res) => {
  const { repo_name } = req.body;

  try {
    // Check if settings row exists
    const existing = await pool.query('SELECT * FROM settings');

    if (existing.rows.length > 0) {
      // Update existing
      await pool.query(
        'UPDATE settings SET repo_name = $1, updated_at = NOW() WHERE id = $2',
        [repo_name, existing.rows[0].id]
      );
    } else {
      // Insert new
      await pool.query(
        'INSERT INTO settings (repo_name) VALUES ($1)',
        [repo_name]
      );
    }

    res.json({ message: 'Repo assigned successfully', repo_name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRepo = async (req, res) => {
  try {
    const result = await pool.query('SELECT repo_name FROM settings LIMIT 1');
    res.json({ repo_name: result.rows[0]?.repo_name || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllUsers, assignRepo, getRepo };