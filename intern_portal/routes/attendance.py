from flask import Blueprint, render_template, request, redirect, url_for, flash
from database import get_db_connection
from datetime import datetime

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/attendance', methods=['GET', 'POST'])
def index():
    conn = get_db_connection()
    today_date = datetime.now().strftime('%Y-%m-%d')
    
    if request.method == 'POST':
        status = request.form['status']
        try:
            conn.execute('INSERT INTO attendance (date, status) VALUES (?, ?)', (today_date, status))
            conn.commit()
            flash('Attendance logged for today!', 'success')
        except Exception:
            conn.execute('UPDATE attendance SET status = ? WHERE date = ?', (status, today_date))
            conn.commit()
            flash('Attendance updated for today!', 'info')
            
    records = conn.execute('SELECT * FROM attendance ORDER BY date DESC').fetchall()
    conn.close()
    return render_template('attendance.html', attendance=records, today=today_date)
