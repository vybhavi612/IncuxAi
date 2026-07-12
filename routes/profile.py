from flask import (
    Blueprint,
    render_template,
    session,
    redirect,
    url_for,
    request,
    flash
)

from models import User
from database import db

profile = Blueprint("profile", __name__)


@profile.route("/profile")
def profile_page():

    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    user = User.query.get(session["user_id"])

    return render_template("profile.html", user=user)


@profile.route("/edit_profile", methods=["GET", "POST"])
def edit_profile():

    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    user = User.query.get(session["user_id"])

    if request.method == "POST":

        user.name = request.form["name"]
        user.email = request.form["email"]
        user.phone = request.form["phone"]
        user.college = request.form["college"]
        user.department = request.form["department"]
        user.year = request.form["year"]

        db.session.commit()

        flash("Profile Updated Successfully!", "success")

        return redirect(url_for("profile.profile_page"))

    return render_template(
        "edit_profile.html",
        user=user
    )