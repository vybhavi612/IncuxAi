import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

export async function POST(request) {
  try {
    const { name, email, phone, role } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(email, role);

    if (existingUser) {
      return NextResponse.json({ user: existingUser });
    }

    // Create new user (Simulated registration on first login)
    const stmt = db.prepare('INSERT INTO users (name, email, phone, role) VALUES (?, ?, ?, ?)');
    const result = stmt.run(name, email, phone || null, role);

    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    
    return NextResponse.json({ user: newUser });
  } catch (error) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
