const axios = require('axios');
const pool = require('../config/db');

const getCommits = async (req, res) => {
  const { username } = req.user;

  try {
    // Get assigned repo from settings
    const repoResult = await pool.query('SELECT repo_name FROM settings LIMIT 1');

    if (!repoResult.rows[0]?.repo_name) {
      return res.status(400).json({ message: 'No repo assigned yet' });
    }

    const repo = repoResult.rows[0].repo_name;

    // Fetch commits from GitHub API
    const response = await axios.get(
      `https://api.github.com/repos/${repo}/commits?author=${username}&per_page=100`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    res.json({ commits: response.data.length, repo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching commits' });
  }
};

module.exports = { getCommits };