import os
from datetime import datetime

from config import BASE_DIR

DOCUMENTS_FOLDER = os.path.join(BASE_DIR, "uploads", "documents")
CERTIFICATES_FOLDER = os.path.join(BASE_DIR, "uploads", "certificates")

os.makedirs(DOCUMENTS_FOLDER, exist_ok=True)
os.makedirs(CERTIFICATES_FOLDER, exist_ok=True)


def generate_certificate_pdf(filepath, intern_name, title, issued_by):
    """Generates a simple certificate PDF at the given filepath."""

    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4

    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4

    c.setLineWidth(3)
    c.rect(30, 30, width - 60, height - 60)

    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(width / 2, height - 150, "Certificate of Completion")

    c.setFont("Helvetica", 14)
    c.drawCentredString(width / 2, height - 220, "This is to certify that")

    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2, height - 260, intern_name)

    c.setFont("Helvetica", 14)
    c.drawCentredString(width / 2, height - 300, "has successfully completed")

    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2, height - 335, title)

    c.setFont("Helvetica", 12)
    date_str = datetime.utcnow().strftime("%d %B %Y")
    c.drawCentredString(width / 2, height - 400, f"Issued by: {issued_by or 'Admin'}")
    c.drawCentredString(width / 2, height - 420, f"Date: {date_str}")

    c.save()
