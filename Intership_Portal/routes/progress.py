from flask import Blueprint, render_template, session, redirect, url_for
from datetime import datetime

from models import Task, Progress
from database import db

progress = Blueprint("progress", __name__)


# -------------------------
# Helper: Recalculate and store progress percentage
# Called whenever a task is added / completed / deleted
# -------------------------
def update_progress(intern_id):

    total_tasks = Task.query.filter_by(intern_id=intern_id).count()
    completed_tasks = Task.query.filter_by(intern_id=intern_id, status="Completed").count()

    percentage = 0.0
    if total_tasks > 0:
        percentage = round((completed_tasks / total_tasks) * 100, 1)

    record = Progress.query.filter_by(intern_id=intern_id).first()

    if record:
        record.percentage = percentage
        record.updated_at = datetime.utcnow()
    else:
        record = Progress(intern_id=intern_id, percentage=percentage)
        db.session.add(record)

    db.session.commit()

    return percentage


# -------------------------
# View Progress
# -------------------------
@progress.route("/progress")
def progress_page():

    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    record = Progress.query.filter_by(intern_id=session["user_id"]).first()
    percentage = record.percentage if record else 0.0

    total_tasks = Task.query.filter_by(intern_id=session["user_id"]).count()
    completed_tasks = Task.query.filter_by(intern_id=session["user_id"], status="Completed").count()
    pending_tasks = total_tasks - completed_tasks

    return render_template(
        "progress.html",
        percentage=percentage,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        pending_tasks=pending_tasks
    )
