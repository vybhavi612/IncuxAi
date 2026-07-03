from flask import Blueprint, render_template, session, redirect, url_for
from models import User
from database import get_db_connection 
dashboard = Blueprint("dashboard", __name__)


@dashboard.route("/dashboard")
def dashboard_page():

    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    user = User.query.get(session["user_id"])

    conn = get_db_connection()
    
    total_tasks_row = conn.execute('SELECT COUNT(*) FROM tasks').fetchone()
    completed_tasks_row = conn.execute('SELECT COUNT(*) FROM tasks WHERE status = "Completed"').fetchone()
    pending_tasks_row = conn.execute('SELECT COUNT(*) FROM tasks WHERE status = "Pending"').fetchone()
    
    total_tasks = total_tasks_row[0] if total_tasks_row else 0
    completed_tasks = completed_tasks_row[0] if completed_tasks_row else 0
    pending_tasks = pending_tasks_row[0] if pending_tasks_row else 0
    
    progress_percentage = int((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0

    total_days_row = conn.execute('SELECT COUNT(*) FROM attendance').fetchone()
    present_days_row = conn.execute('SELECT COUNT(*) FROM attendance WHERE status = "Present"').fetchone()
    
    total_days = total_days_row[0] if total_days_row else 0
    present_days = present_days_row[0] if present_days_row else 0
    attendance_percentage = int((present_days / total_days) * 100) if total_days > 0 else 0

    conn.close()

    return render_template(
        "dashboard.html",
        user=user,
        total_tasks=total_tasks,               
        completed_tasks=completed_tasks,
        pending_tasks=pending_tasks,
        attendance=f"{attendance_percentage}%", 
        progress=f"{progress_percentage}%"      
    )
