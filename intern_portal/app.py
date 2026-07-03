from flask import Flask
from database import init_db

# బ్లూప్రింట్లను నేరుగా వాటి ఫైళ్ల నుండి ఇంపోర్ట్ చేస్తున్నాం
from routes.home import home_bp
from routes.tasks import tasks_bp
from routes.attendance import attendance_bp
from routes.progress import progress_bp

app = Flask(__name__)
app.secret_key = 'enterprise_level_secure_key'

# Blueprints Registration
app.register_blueprint(home_bp)
app.register_blueprint(tasks_bp)
app.register_blueprint(attendance_bp)
app.register_blueprint(progress_bp)

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
