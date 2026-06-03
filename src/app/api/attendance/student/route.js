import { NextResponse } from 'next/server';
import db from '../../../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const records = db.prepare('SELECT * FROM attendance WHERE user_id = ? ORDER BY timestamp DESC').all(userId);
    return NextResponse.json({ records });
  } catch (error) {
    console.error('Fetch Attendance Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
