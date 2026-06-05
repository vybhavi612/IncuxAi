const logoutAttendance = async (req, res) => {
  const { id } = req.user;

  try {
    const existing = await pool.query(
      'SELECT * FROM attendance WHERE user_id = $1 AND date = CURRENT_DATE',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(400).json({ message: 'No login record found for today' });
    }

    const result = await pool.query(
      `UPDATE attendance 
       SET logout_time = NOW(), 
           working_time = EXTRACT(EPOCH FROM NOW())::BIGINT - EXTRACT(EPOCH FROM login_time)::BIGINT
       WHERE user_id = $1 AND date = CURRENT_DATE 
       RETURNING *`,
      [id]
    );

    res.json({ message: 'Logout recorded', attendance: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};