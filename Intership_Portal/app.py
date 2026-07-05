from flask import Flask

from config import Config
from database import db

# Import models
from models import User, Task, Attendance, Progress, Performance, Report, Notification

# Import blueprints
from routes.auth import auth
from routes.dashboard import dashboard
from routes.profile import profile
from routes.tasks import tasks
from routes.attendance import attendance
from routes.progress import progress
from routes.admin import admin

app = Flask(__name__)

# Load configuration
app.config.from_object(Config)

# Initialize database
db.init_app(app)

# Register blueprints
app.register_blueprint(auth)
app.register_blueprint(dashboard)
app.register_blueprint(profile)
app.register_blueprint(tasks)
app.register_blueprint(attendance)
app.register_blueprint(progress)
app.register_blueprint(admin)

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)