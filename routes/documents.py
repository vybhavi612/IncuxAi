import os
import uuid

from flask import (
    Blueprint,
    render_template,
    session,
    redirect,
    url_for,
    request,
    flash,
    send_from_directory,
    abort
)
from werkzeug.utils import secure_filename

from models import Document
from database import db
from file_utils import DOCUMENTS_FOLDER

documents = Blueprint("documents", __name__)

ALLOWED_EXTENSIONS = {"pdf", "doc", "docx", "png", "jpg", "jpeg", "txt"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@documents.route("/documents", methods=["GET", "POST"])
def documents_page():

    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    user_id = session["user_id"]

    if request.method == "POST":

        file = request.files.get("document")

        if not file or file.filename == "":
            flash("Please choose a file to upload.", "warning")
            return redirect(url_for("documents.documents_page"))

        if not allowed_file(file.filename):
            flash("File type not allowed.", "danger")
            return redirect(url_for("documents.documents_page"))

        original_name = secure_filename(file.filename)
        stored_name = f"{uuid.uuid4().hex}_{original_name}"

        file.save(os.path.join(DOCUMENTS_FOLDER, stored_name))

        new_doc = Document(
            intern_id=user_id,
            filename=original_name,
            stored_filename=stored_name
        )

        db.session.add(new_doc)
        db.session.commit()

        flash("Document uploaded successfully!", "success")

        return redirect(url_for("documents.documents_page"))

    docs = Document.query.filter_by(intern_id=user_id).order_by(Document.uploaded_at.desc()).all()

    return render_template("documents.html", documents=docs)


@documents.route("/documents/download/<int:doc_id>")
def download_document(doc_id):

    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    doc = Document.query.get_or_404(doc_id)

    is_owner = doc.intern_id == session["user_id"]
    is_admin = session.get("role") == "Admin"

    if not (is_owner or is_admin):
        abort(403)

    return send_from_directory(
        DOCUMENTS_FOLDER,
        doc.stored_filename,
        as_attachment=True,
        download_name=doc.filename
    )
