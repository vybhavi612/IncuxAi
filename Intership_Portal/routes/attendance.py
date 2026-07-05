from flask import (
    Blueprint,
    render_template,
    session,
    redirect,
    url_for,
    flash
)

from datetime import date

from models import Attendance
from database import db

attendance = Blueprint("attendance", __name__)


# -------------------------
# View Attendance History
# -------------------------
@attendance.route("/attendance")
def attendance_page():

    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    records = Attendance.query.filter_by(
        intern_id=session["user_id"]
    ).order_by(Attendance.date.desc()).all()

    total_days = len(records)
    present_days = len([r for r in records if r.status == "Present"])

    attendance_percent = 0
    if total_days > 0:
        attendance_percent = round((present_days / total_days) * 100, 1)

    already_marked_today = Attendance.query.filter_by(
        intern_id=session["user_id"],
        date=date.today()
    ).first() is not None

    return render_template(
        "attendance.html",
        records=records,
        attendance_percent=attendance_percent,
        already_marked_today=already_marked_today
    )


# -------------------------
# Mark Today's Attendance
# -------------------------
@attendance.route("/attendance/mark")
def mark_attendance():

    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    existing = Attendance.query.filter_by(
        intern_id=session["user_id"],
        date=date.today()
    ).first()

    if existing:
        flash("Attendance already marked for today!", "warning")
        return redirect(url_for("attendance.attendance_page"))

    new_record = Attendance(
        intern_id=session["user_id"],
        date=date.today(),
        status="Present"
    )

    db.session.add(new_record)
    db.session.commit()

    flash("Attendance marked as Present for today!", "success")

    return redirect(url_for("attendance.attendance_page"))
