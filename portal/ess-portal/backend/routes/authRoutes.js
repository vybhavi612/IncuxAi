const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readDB, writeDB } = require('../utils/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const db = readDB();
  if (!db) return res.status(500).json({ error: 'Database error' });

  const userExists = db.employees.find(emp => emp.email === email);
  if (userExists) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password: hashedPassword,
    role: role || 'Employee',
    joining_date: new Date().toISOString(),
    status: 'Active'
  };

  db.employees.push(newUser);
  if (writeDB(db)) {
    // don't send password back
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ message: 'User registered successfully', user: userWithoutPassword });
  } else {
    res.status(500).json({ error: 'Failed to save user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const db = readDB();
  if (!db) return res.status(500).json({ error: 'Database error' });

  const user = db.employees.find(emp => emp.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordIsValid = await bcrypt.compare(password, user.password);
  if (!passwordIsValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, {
    expiresIn: '24h'
  });

  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json({ auth: true, token, user: userWithoutPassword });
});

module.exports = router;
