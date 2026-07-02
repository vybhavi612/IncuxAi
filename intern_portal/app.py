from flask import Flask, render_template, request, redirect, url_for, flash
import sqlite3
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'internship_secret_key'

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    # Tasks Table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            deadline TEXT,
            status TEXT DEFAULT 'Pending'
        )
    ''')
    # Attendance Table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            status TEXT NOT NULL
        )
    ''')
    # Progress Table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            week_number INTEGER NOT NULL,
            summary TEXT NOT NULL,
            logged_at TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def index():
    return redirect(url_for('tasks_page'))

# --- TASKS MODULE ---
@app.route('/tasks', methods=['GET', 'POST'])
def tasks_page():
    conn = get_db_connection()
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        deadline = request.form['deadline']
        conn.execute('INSERT INTO tasks (title, description, deadline) VALUES (?, ?, ?)', 
                     (title, description, deadline))
        conn.commit()
        flash('Task assigned successfully!')
        return redirect(url_for('tasks_page'))
    
    tasks = conn.execute('SELECT * FROM tasks').fetchall()
    conn.close()
    return render_template('tasks.html', tasks=tasks)

@app.route('/tasks/update/<int:task_id>/<string:status>')
def update_task_status(task_id, status):
    conn = get_db_connection()
    conn.execute('UPDATE tasks SET status = ? WHERE id = ?', (status, task_id))
    conn.commit()
    conn.close()
    flash(f'Task marked as {status}!')
    return redirect(url_for('tasks_page'))

# --- ATTENDANCE MODULE ---
@app.route('/attendance', methods=['GET', 'POST'])
def attendance_page():
    conn = get_db_connection()
    today_date = datetime.now().strftime('%Y-%m-%d')
    
    if request.method == 'POST':
        status = request.form['status']
        try:
            conn.execute('INSERT INTO attendance (date, status) VALUES (?, ?)', (today_date, status))
            conn.commit()
            flash('Attendance recorded for today!')
        except sqlite3.IntegrityError:
            conn.execute('UPDATE attendance SET status = ? WHERE date = ?', (status, today_date))
            conn.commit()
            flash('Attendance updated for today!')
            
    attendance_records = conn.execute('SELECT * FROM attendance ORDER BY date DESC').fetchall()
    conn.close()
    return render_template('attendance.html', attendance=attendance_records, today=today_date)

# --- PROGRESS MODULE ---
@app.route('/progress', methods=['GET', 'POST'])
def progress_page():
    conn = get_db_connection()
    if request.method == 'POST':
        week_number = request.form['week_number']
        summary = request.form['summary']
        logged_at = datetime.now().strftime('%Y-%m-%d %H:%M')
        conn.execute('INSERT INTO progress (week_number, summary, logged_at) VALUES (?, ?, ?)', 
                     (week_number, summary, logged_at))
        conn.commit()
        flash('Progress report logged successfully!')
        return redirect(url_for('progress_page'))

    # Calculate overall metrics
    total_tasks = conn.execute('SELECT COUNT(*) FROM tasks').fetchone()[0]
    completed_tasks = conn.execute('SELECT COUNT(*) FROM tasks WHERE status = "Completed"').fetchone()[0]
    progress_percentage = int((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0

    total_days = conn.execute('SELECT COUNT(*) FROM attendance').fetchone()[0]
    present_days = conn.execute('SELECT COUNT(*) FROM attendance WHERE status = "Present"').fetchone()[0]
    attendance_percentage = int((present_days / total_days) * 100) if total_days > 0 else 0

    logs = conn.execute('SELECT * FROM progress ORDER BY week_number DESC').fetchall()
    conn.close()
    
    return render_template('progress.html', logs=logs, pct=progress_percentage, att_pct=attendance_percentage)

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
