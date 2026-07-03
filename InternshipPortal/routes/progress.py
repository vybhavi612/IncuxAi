from flask import Blueprint, render_template, request, redirect, url_for, flash
from database import get_db_connection
from datetime import datetime

progress_bp = Blueprint('progress', __name__)

@progress_bp.route('/progress', methods=['GET', 'POST'])
def index():
    conn = get_db_connection()
    if request.method == 'POST':
        week_number = request.form['week_number']
        summary = request.form['summary']
        logged_at = datetime.now().strftime('%Y-%m-%d %H:%M')
        conn.execute('INSERT INTO progress (week_number, summary, logged_at) VALUES (?, ?, ?)', 
                     (week_number, summary, logged_at))
        conn.commit()
        flash('Progress matrix report logged!', 'success')
        return redirect(url_for('progress.index'))

    # Analytics Counters
    total_tasks = conn.execute('SELECT COUNT(*) FROM tasks').fetchone()[0]
    completed = conn.execute('SELECT COUNT(*) FROM tasks WHERE status = "Completed"').fetchone()[0]
    task_pct = int((completed / total_tasks) * 100) if total_tasks > 0 else 0

    total_days = conn.execute('SELECT COUNT(*) FROM attendance').fetchone()[0]
    present_days = conn.execute('SELECT COUNT(*) FROM attendance WHERE status = "Present"').fetchone()[0]
    att_pct = int((present_days / total_days) * 100) if total_days > 0 else 0

    logs = conn.execute('SELECT * FROM progress ORDER BY week_number DESC').fetchall()
    conn.close()
    
    return render_template('progress.html', logs=logs, pct=task_pct, att_pct=att_pct)
