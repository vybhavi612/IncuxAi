from flask import Blueprint, render_template, request, redirect, url_for, flash
from database import get_db_connection

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/tasks', methods=['GET', 'POST'])
def index():
    conn = get_db_connection()
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        deadline = request.form['deadline']
        conn.execute('INSERT INTO tasks (title, description, deadline) VALUES (?, ?, ?)', 
                     (title, description, deadline))
        conn.commit()
        flash('Task assigned successfully!', 'success')
        return redirect(url_for('tasks.index'))
    
    tasks = conn.execute('SELECT * FROM tasks').fetchall()
    conn.close()
    return render_template('tasks.html', tasks=tasks)

@tasks_bp.route('/tasks/update/<int:task_id>/<string:status>')
def update_status(task_id, status):
    conn = get_db_connection()
    conn.execute('UPDATE tasks SET status = ? WHERE id = ?', (status, task_id))
    conn.commit()
    conn.close()
    flash(f'Task status updated to {status}!', 'info')
    return redirect(url_for('tasks.index'))
