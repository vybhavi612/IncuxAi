"""
Run this once, from the project folder, to promote an existing
registered user to Admin role.

Usage:
    python make_admin.py your_username

You must register a normal account first (via /register), then run
this script with that username to grant it Admin access.
"""

import sys
from app import app
from database import db
from models import User

if len(sys.argv) != 2:
    print("Usage: python make_admin.py <username>")
    sys.exit(1)

username = sys.argv[1]

with app.app_context():
    user = User.query.filter_by(username=username).first()

    if not user:
        print(f"No user found with username '{username}'. Register that account first.")
        sys.exit(1)

    user.role = "Admin"
    db.session.commit()

    print(f"'{username}' is now an Admin. Log out and log back in for it to take effect.")
