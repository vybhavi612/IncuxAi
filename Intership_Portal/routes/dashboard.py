from flask import Blueprint, render_template, session, redirect, url_for
from models import User, Task, Attendance, Progress, Notification

dashboard = Blueprint("dashboard", __name__)


@dashboard.route("/dashboard")
def dashboard_page():

    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    user = User.query.get(session["user_id"])

    total_tasks = Task.query.filter_by(intern_id=user.id).count()
    completed_tasks = Task.query.filter_by(intern_id=user.id, status="Completed").count()
    pending_tasks = total_tasks - completed_tasks

    attendance_records = Attendance.query.filter_by(intern_id=user.id).all()
    attendance_percent = 0
    if len(attendance_records) > 0:
        present_days = len([r for r in attendance_records if r.status == "Present"])
        attendance_percent = round((present_days / len(attendance_records)) * 100, 1)

    progress_record = Progress.query.filter_by(intern_id=user.id).first()
    progress_percent = progress_record.percentage if progress_record else 0

    notifications = Notification.query.filter(
        (Notification.target_type == "all") |
        (Notification.target_intern_id == user.id)
    ).order_by(Notification.created_at.desc()).limit(5).all()

    return render_template(
        "dashboard.html",
        user=user,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        pending_tasks=pending_tasks,
        attendance=f"{attendance_percent}%",
        progress=f"{progress_percent}%",
        notifications=notifications
    )