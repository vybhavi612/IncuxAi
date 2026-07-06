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


# =========================================================
# Member 2: Task, Attendance & Progress Module
# =========================================================

class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)

    intern_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    title = db.Column(db.String(150), nullable=False)

    description = db.Column(db.Text, nullable=True)

    status = db.Column(db.String(20), default="Pending")  # Pending / Completed

    due_date = db.Column(db.String(20), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    intern = db.relationship("User", backref="tasks")

    def __repr__(self):
        return f"<Task {self.title}>"


class Attendance(db.Model):
    __tablename__ = "attendance"

    id = db.Column(db.Integer, primary_key=True)

    intern_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    date = db.Column(db.Date, default=datetime.utcnow)

    status = db.Column(db.String(20), default="Present")  # Present / Absent

    intern = db.relationship("User", backref="attendance_records")

    def __repr__(self):
        return f"<Attendance {self.intern_id} {self.date} {self.status}>"


class Progress(db.Model):
    __tablename__ = "progress"

    id = db.Column(db.Integer, primary_key=True)

    intern_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)

    percentage = db.Column(db.Float, default=0.0)

    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

    intern = db.relationship("User", backref="progress_record")

    def __repr__(self):
        return f"<Progress {self.intern_id} {self.percentage}%>"


# =========================================================
# Member 3: Admin Panel & Reports
# =========================================================

class Performance(db.Model):
    __tablename__ = "performance"

    id = db.Column(db.Integer, primary_key=True)

    intern_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    rating = db.Column(db.Integer, nullable=False)  # 1 to 5

    remarks = db.Column(db.Text, nullable=True)

    evaluated_by = db.Column(db.String(50), nullable=True)  # admin username

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    intern = db.relationship("User", backref="performance_records")

    def __repr__(self):
        return f"<Performance {self.intern_id} {self.rating}>"


class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(150), nullable=False)

    content = db.Column(db.Text, nullable=False)

    generated_by = db.Column(db.String(50), nullable=True)  # admin username

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Report {self.title}>"


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(150), nullable=False)

    message = db.Column(db.Text, nullable=False)

    target_type = db.Column(db.String(20), default="all")  # "all" or "specific"

    target_intern_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    target_intern = db.relationship("User", backref="notifications")

    def __repr__(self):
        return f"<Notification {self.title}>"