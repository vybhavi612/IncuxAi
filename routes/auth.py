from flask import (
    Blueprint,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    session
)

from models import User
from database import db

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

import re

auth = Blueprint("auth", __name__)


# -------------------------
# Home
# -------------------------
@auth.route("/")
def home():
    return redirect(url_for("auth.login"))


# -------------------------
# Register
# -------------------------
@auth.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        name = request.form["name"]
        username = request.form["username"]
        email = request.form["email"]
        phone = request.form["phone"]
        college = request.form["college"]
        department = request.form["department"]
        year = request.form["year"]

        password = request.form["password"]
        confirm_password = request.form["confirm_password"]

        # Check password match
        if password != confirm_password:
            flash("Passwords do not match!", "danger")
            return redirect(url_for("auth.register"))

        # Password strength
        pattern = r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$'

        if not re.match(pattern, password):
            flash(
                "Password must contain uppercase, lowercase, digit and special character.",
                "danger"
            )
            return redirect(url_for("auth.register"))

        # Check username
        if User.query.filter_by(username=username).first():
            flash("Username already exists!", "warning")
            return redirect(url_for("auth.register"))

        # Check email
        if User.query.filter_by(email=email).first():
            flash("Email already registered!", "warning")
            return redirect(url_for("auth.register"))

        hashed_password = generate_password_hash(password)

        new_user = User(
            name=name,
            username=username,
            email=email,
            phone=phone,
            college=college,
            department=department,
            year=year,
            password=hashed_password
        )

        db.session.add(new_user)
        db.session.commit()

        flash("Registration Successful!", "success")

        return redirect(url_for("auth.login"))

    return render_template("register.html")


# -------------------------
# Login
# -------------------------
@auth.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        username = request.form["username"]
        password = request.form["password"]

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):

            session["user_id"] = user.id
            session["username"] = user.username
            session["role"] = user.role

            flash("Login Successful!", "success")

            return redirect(url_for("dashboard.dashboard_page"))

        flash("Invalid Username or Password!", "danger")

    return render_template("login.html")


# -------------------------
# Logout
# -------------------------
@auth.route("/logout")
def logout():

    session.clear()

    flash("Logged out successfully!", "success")

    return redirect(url_for("auth.login"))