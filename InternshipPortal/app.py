from flask import Flask
from config import Config
from database import db, init_db 

# --- Jashwanth's Models Import ---
from models import User

from routes.auth import auth
from routes.dashboard import dashboard
from routes.profile import profile

from routes.home import home_bp
from routes.tasks import tasks_bp
from routes.attendance import attendance_bp
from routes.progress import progress_bp

app = Flask(__name__)

app.config.from_object(Config)

db.init_app(app)

app.register_blueprint(auth)
app.register_blueprint(dashboard)
app.register_blueprint(profile)

app.register_blueprint(home_bp)
app.register_blueprint(tasks_bp)
app.register_blueprint(attendance_bp)
app.register_blueprint(progress_bp)

with app.app_context():
    db.create_all() 
    init_db()       

if __name__ == "__main__":
    app.run(debug=True)
