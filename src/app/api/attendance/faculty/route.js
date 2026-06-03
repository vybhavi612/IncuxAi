import { NextResponse } from 'next/server';
import db from '../../../../../lib/db';

export async function GET(request) {
  try {
    // In a real app, verify faculty session/token here
    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get('facultyId');

    if (!facultyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all students
    const students = db.prepare('SELECT id, name, email, phone, faceData FROM users WHERE role = "student"').all();
    
    // Get all attendance records
    const attendance = db.prepare('SELECT * FROM attendance ORDER BY timestamp DESC').all();

    // Group attendance by student
    const studentData = students.map(student => {
      return {
        ...student,
        records: attendance.filter(record => record.user_id === student.id)
      };
    });

    return NextResponse.json({ students: studentData });
  } catch (error) {
    console.error('Fetch Faculty Data Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
