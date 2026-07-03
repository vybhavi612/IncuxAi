from database import db
from datetime import datetime


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)

    username = db.Column(db.String(50), unique=True, nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False)

    phone = db.Column(db.String(15), nullable=False)

    college = db.Column(db.String(150), nullable=False)

    department = db.Column(db.String(100), nullable=False)

    year = db.Column(db.String(20), nullable=False)

    password = db.Column(db.String(255), nullable=False)

    role = db.Column(db.String(20), default="Intern")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<User {self.username}>"