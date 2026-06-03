import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, type, timestamp } = body; // timestamp from local disk time

    if (!userId || !type) {
      return NextResponse.json({ error: 'Missing userId or type (entry/exit)' }, { status: 400 });
    }

    if (type !== 'entry' && type !== 'exit') {
      return NextResponse.json({ error: 'Type must be either "entry" or "exit"' }, { status: 400 });
    }

    // Default to server time if timestamp is not provided by the IoT device
    const eventTime = timestamp || new Date().toISOString();

    const stmt = db.prepare('INSERT INTO attendance (user_id, type, timestamp) VALUES (?, ?, ?)');
    stmt.run(userId, type, eventTime);

    return NextResponse.json({ success: true, message: `Logged ${type} for user ${userId} at ${eventTime}` });
  } catch (error) {
    console.error('IoT Attendance API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
