from flask import Blueprint, render_template, session, redirect, url_for
from models import User

dashboard = Blueprint("dashboard", __name__)


@dashboard.route("/dashboard")
def dashboard_page():

    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    user = User.query.get(session["user_id"])

    return render_template(
        "dashboard.html",
        user=user,
        total_tasks=0,
        completed_tasks=0,
        pending_tasks=0,
        attendance="0%",
        progress="0%"
    )