from flask import (
    Blueprint,
    render_template,
    session,
    redirect,
    url_for,
    request,
    flash
)
from sqlalchemy import or_

from models import User, Message
from database import db

messages = Blueprint("messages", __name__)


@messages.route("/messages", methods=["GET", "POST"])
def messages_page():

    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    user_id = session["user_id"]

    if request.method == "POST":

        content = request.form["content"].strip()

        mentor = User.query.filter_by(role="Admin").first()

        if not mentor:
            flash("No mentor/admin is available to message right now.", "warning")
            return redirect(url_for("messages.messages_page"))

        if content:
            new_message = Message(
                sender_id=user_id,
                receiver_id=mentor.id,
                content=content
            )
            db.session.add(new_message)
            db.session.commit()

        return redirect(url_for("messages.messages_page"))

    thread = Message.query.filter(
        or_(Message.sender_id == user_id, Message.receiver_id == user_id)
    ).order_by(Message.created_at.asc()).all()

    return render_template("messages.html", thread=thread, current_user_id=user_id)
