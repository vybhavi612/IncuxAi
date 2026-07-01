import sqlite3
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)
DATABASE = "project.db"

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# database and labels creation
def init_db():
    with get_db() as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            status TEXT DEFAULT 'Pending'
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            status TEXT NOT NULL
        )''')
        conn.commit()

init_db()

@app.route('/', methods=['GET', 'POST'])
def home():
    db = get_db()
    
    if request.method == 'POST':
        # 1. adding of a new task
        if 'task_title' in request.form:
            title = request.form['task_title']
            if title:
                db.execute("INSERT INTO tasks (title) VALUES (?)", (title,))
                db.commit()
        
        # 2. marking attendance
        elif 'att_date' in request.form:
            date = request.form['att_date']
            status = request.form['att_status']
            if date:
                try:
                    db.execute("INSERT INTO attendance (date, status) VALUES (?, ?)", (date, status))
                    db.commit()
                except sqlite3.IntegrityError:
                    pass # ignores if marked second time in a day

        return redirect(url_for('home'))

    # taking data from database
    tasks = db.execute("SELECT * FROM tasks").fetchall()
    attendance = db.execute("SELECT * FROM attendance ORDER BY date DESC").fetchall()

    # calculation of progress percentage
    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks if t['status'] == 'Completed'])
    task_p = int((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0

    total_days = len(attendance)
    present_days = len([a for a in attendance if a['status'] == 'Present'])
    att_p = int((present_days / total_days) * 100) if total_days > 0 else 0

    return render_template('index.html', tasks=tasks, attendance=attendance, task_p=task_p, att_p=att_p)

# route for marking task completion
@app.route('/complete/<int:id>')
def complete(id):
    db = get_db()
    db.execute("UPDATE tasks SET status = 'Completed' WHERE id = ?", (id,))
    db.commit()
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)
