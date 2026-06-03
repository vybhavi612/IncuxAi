import { NextResponse } from 'next/server';
import db from '../../../../../lib/db';

export async function POST(request) {
  try {
    const { userId, faceData } = await request.json();

    if (!userId || !faceData) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const stmt = db.prepare('UPDATE users SET faceData = ? WHERE id = ?');
    stmt.run(faceData, userId);

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Update Face API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
