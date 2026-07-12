from flask import (
    Blueprint,
    render_template,
    session,
    redirect,
    url_for,
    request,
    flash
)

from models import Task
from database import db
from routes.progress import update_progress

tasks = Blueprint("tasks", __name__)


# -------------------------
# View Assigned Tasks
# -------------------------
@tasks.route("/tasks")
def tasks_page():

    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    user_tasks = Task.query.filter_by(intern_id=session["user_id"]).order_by(Task.created_at.desc()).all()

    return render_template("tasks.html", tasks=user_tasks)


# -------------------------
# Add Task
# (Temporary self-service form until Member 3's Admin Panel
#  can assign tasks to interns directly)
# -------------------------
@tasks.route("/tasks/add", methods=["POST"])
def add_task():

    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    title = request.form["title"]
    description = request.form.get("description", "")
    due_date = request.form.get("due_date", "")

    new_task = Task(
        intern_id=session["user_id"],
        title=title,
        description=description,
        due_date=due_date
    )

    db.session.add(new_task)
    db.session.commit()

    update_progress(session["user_id"])

    flash("Task added successfully!", "success")

    return redirect(url_for("tasks.tasks_page"))


# -------------------------
# Mark Task as Completed
# -------------------------
@tasks.route("/tasks/complete/<int:task_id>")
def complete_task(task_id):

    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    task = Task.query.get_or_404(task_id)

    if task.intern_id != session["user_id"]:
        flash("You are not authorized to update this task.", "danger")
        return redirect(url_for("tasks.tasks_page"))

    task.status = "Completed"
    db.session.commit()

    update_progress(session["user_id"])

    flash("Task marked as completed!", "success")

    return redirect(url_for("tasks.tasks_page"))


# -------------------------
# Delete Task
# -------------------------
@tasks.route("/tasks/delete/<int:task_id>")
def delete_task(task_id):

    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    task = Task.query.get_or_404(task_id)

    if task.intern_id != session["user_id"]:
        flash("You are not authorized to delete this task.", "danger")
        return redirect(url_for("tasks.tasks_page"))

    db.session.delete(task)
    db.session.commit()

    update_progress(session["user_id"])

    flash("Task deleted!", "success")

    return redirect(url_for("tasks.tasks_page"))
