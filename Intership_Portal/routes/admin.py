from flask import (
    Blueprint,
    render_template,
    session,
    redirect,
    url_for,
    request,
    flash
)
from functools import wraps

from models import User, Task, Attendance, Progress, Performance, Report, Notification
from database import db

from werkzeug.security import generate_password_hash

admin = Blueprint("admin", __name__, url_prefix="/admin")


# -------------------------
# Admin-only access guard
# -------------------------
def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("auth.login"))

        if session.get("role") != "Admin":
            flash("Admin access only.", "danger")
            return redirect(url_for("dashboard.dashboard_page"))

        return f(*args, **kwargs)
    return wrapper


# -------------------------
# Admin Dashboard
# -------------------------
@admin.route("/")
@admin_required
def admin_dashboard():

    total_interns = User.query.filter_by(role="Intern").count()
    total_tasks = Task.query.count()
    completed_tasks = Task.query.filter_by(status="Completed").count()

    total_attendance = Attendance.query.count()
    present_attendance = Attendance.query.filter_by(status="Present").count()
    avg_attendance = 0
    if total_attendance > 0:
        avg_attendance = round((present_attendance / total_attendance) * 100, 1)

    progress_records = Progress.query.all()
    avg_progress = 0
    if len(progress_records) > 0:
        avg_progress = round(sum(p.percentage for p in progress_records) / len(progress_records), 1)

    return render_template(
        "admin_dashboard.html",
        total_interns=total_interns,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        avg_attendance=avg_attendance,
        avg_progress=avg_progress
    )


# -------------------------
# Manage Interns: List + Add
# -------------------------
@admin.route("/interns", methods=["GET", "POST"])
@admin_required
def manage_interns():

    if request.method == "POST":

        username = request.form["username"]
        email = request.form["email"]

        if User.query.filter_by(username=username).first():
            flash("Username already exists!", "warning")
            return redirect(url_for("admin.manage_interns"))

        if User.query.filter_by(email=email).first():
            flash("Email already registered!", "warning")
            return redirect(url_for("admin.manage_interns"))

        new_intern = User(
            name=request.form["name"],
            username=username,
            email=email,
            phone=request.form["phone"],
            college=request.form["college"],
            department=request.form["department"],
            year=request.form["year"],
            password=generate_password_hash(request.form["password"]),
            role="Intern"
        )

        db.session.add(new_intern)
        db.session.commit()

        flash("Intern added successfully!", "success")

        return redirect(url_for("admin.manage_interns"))

    interns = User.query.filter_by(role="Intern").all()

    return render_template("admin_interns.html", interns=interns)


# -------------------------
# Edit Intern
# -------------------------
@admin.route("/interns/edit/<int:user_id>", methods=["GET", "POST"])
@admin_required
def edit_intern(user_id):

    intern = User.query.get_or_404(user_id)

    if request.method == "POST":

        intern.name = request.form["name"]
        intern.email = request.form["email"]
        intern.phone = request.form["phone"]
        intern.college = request.form["college"]
        intern.department = request.form["department"]
        intern.year = request.form["year"]

        db.session.commit()

        flash("Intern updated successfully!", "success")

        return redirect(url_for("admin.manage_interns"))

    return render_template("admin_edit_intern.html", intern=intern)


# -------------------------
# Delete Intern
# -------------------------
@admin.route("/interns/delete/<int:user_id>")
@admin_required
def delete_intern(user_id):

    intern = User.query.get_or_404(user_id)

    # Clean up related records to avoid orphaned data
    Task.query.filter_by(intern_id=intern.id).delete()
    Attendance.query.filter_by(intern_id=intern.id).delete()
    Progress.query.filter_by(intern_id=intern.id).delete()
    Performance.query.filter_by(intern_id=intern.id).delete()
    Notification.query.filter_by(target_intern_id=intern.id).delete()

    db.session.delete(intern)
    db.session.commit()

    flash("Intern deleted successfully!", "success")

    return redirect(url_for("admin.manage_interns"))


# -------------------------
# Performance Evaluation
# -------------------------
@admin.route("/performance", methods=["GET", "POST"])
@admin_required
def performance_page():

    if request.method == "POST":

        new_eval = Performance(
            intern_id=request.form["intern_id"],
            rating=int(request.form["rating"]),
            remarks=request.form.get("remarks", ""),
            evaluated_by=session.get("username")
        )

        db.session.add(new_eval)
        db.session.commit()

        flash("Performance evaluation added!", "success")

        return redirect(url_for("admin.performance_page"))

    interns = User.query.filter_by(role="Intern").all()
    evaluations = Performance.query.order_by(Performance.created_at.desc()).all()

    return render_template(
        "admin_performance.html",
        interns=interns,
        evaluations=evaluations
    )


# -------------------------
# Reports
# -------------------------
@admin.route("/reports", methods=["GET", "POST"])
@admin_required
def reports_page():

    if request.method == "POST":

        total_interns = User.query.filter_by(role="Intern").count()
        total_tasks = Task.query.count()
        completed_tasks = Task.query.filter_by(status="Completed").count()

        progress_records = Progress.query.all()
        avg_progress = 0
        if len(progress_records) > 0:
            avg_progress = round(sum(p.percentage for p in progress_records) / len(progress_records), 1)

        content = (
            f"Total Interns: {total_interns}\n"
            f"Total Tasks: {total_tasks}\n"
            f"Completed Tasks: {completed_tasks}\n"
            f"Average Progress: {avg_progress}%"
        )

        new_report = Report(
            title=request.form.get("title", "Internship Progress Report"),
            content=content,
            generated_by=session.get("username")
        )

        db.session.add(new_report)
        db.session.commit()

        flash("Report generated successfully!", "success")

        return redirect(url_for("admin.reports_page"))

    reports = Report.query.order_by(Report.created_at.desc()).all()

    return render_template("admin_reports.html", reports=reports)


# -------------------------
# Notifications
# -------------------------
@admin.route("/notifications", methods=["GET", "POST"])
@admin_required
def notifications_page():

    if request.method == "POST":

        target_type = request.form["target_type"]
        target_intern_id = request.form.get("target_intern_id") or None

        new_notification = Notification(
            title=request.form["title"],
            message=request.form["message"],
            target_type=target_type,
            target_intern_id=target_intern_id if target_type == "specific" else None
        )

        db.session.add(new_notification)
        db.session.commit()

        flash("Notification sent!", "success")

        return redirect(url_for("admin.notifications_page"))

    interns = User.query.filter_by(role="Intern").all()
    notifications = Notification.query.order_by(Notification.created_at.desc()).all()

    return render_template(
        "admin_notifications.html",
        interns=interns,
        notifications=notifications
    )
