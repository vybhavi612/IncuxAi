from flask import (
    Blueprint,
    render_template,
    session,
    redirect,
    url_for,
    send_from_directory,
    abort
)

from models import Certificate
from file_utils import CERTIFICATES_FOLDER

certificates = Blueprint("certificates", __name__)


@certificates.route("/certificates")
def certificates_page():

    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    certs = Certificate.query.filter_by(
        intern_id=session["user_id"]
    ).order_by(Certificate.issued_at.desc()).all()

    return render_template("certificates.html", certificates=certs)


@certificates.route("/certificates/download/<int:cert_id>")
def download_certificate(cert_id):

    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    cert = Certificate.query.get_or_404(cert_id)

    is_owner = cert.intern_id == session["user_id"]
    is_admin = session.get("role") == "Admin"

    if not (is_owner or is_admin):
        abort(403)

    return send_from_directory(
        CERTIFICATES_FOLDER,
        cert.stored_filename,
        as_attachment=True,
        download_name=f"{cert.title}.pdf"
    )
