from flask import Flask

from config import Config
from database import db

# Import models
from models import User

# Import blueprints
from routes.auth import auth
from routes.dashboard import dashboard
from routes.profile import profile

app = Flask(__name__)

# Load configuration
app.config.from_object(Config)

# Initialize database
db.init_app(app)

# Register blueprints
app.register_blueprint(auth)
app.register_blueprint(dashboard)
app.register_blueprint(profile)

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)