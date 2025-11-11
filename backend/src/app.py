"""
Flask application factory for Meridian Dashboard backend
"""
import os
from pathlib import Path
from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager

from .config import get_config
from .models.user import get_user_by_id


def create_app(config_name=None):
    """
    Application factory for creating Flask app instances

    Args:
        config_name: Configuration name (development, production, test)

    Returns:
        Configured Flask application
    """
    app = Flask(__name__)

    # Load configuration
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')

    config = get_config(config_name)
    app.config.from_object(config)

    # Initialize CORS
    CORS(app, supports_credentials=True, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS']
        }
    })

    # Initialize Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'

    @login_manager.user_loader
    def load_user(user_id):
        """Load user for Flask-Login"""
        users_json_path = Path(app.config['JSON_DIR']) / app.config['JSON_USERS']
        return get_user_by_id(user_id, users_json_path)

    # Register blueprints
    from .api.auth import auth_bp
    from .api.capital_partners import capital_partners_bp
    from .api.sponsors import sponsors_bp
    from .api.counsel import counsel_bp
    from .api.agents import agents_bp
    from .api.investment import investment_bp
    from .api.excel import excel_bp
    from .api.data import data_bp
    from .api.deals import deals_bp
    from .api.deal_participants import deal_participants_bp
    from .api.users import users_bp
    from .api.profile import profile_bp
    from .api.whiteboard import whiteboard_bp
    from .api.countries import bp as countries_bp
    from .api.admin import admin_bp
    from .api.playbook import playbook_bp
    from .api.countries_master import countries_master_bp, countries_public_bp
    from .api.reports import reports_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(capital_partners_bp)
    app.register_blueprint(sponsors_bp)
    app.register_blueprint(counsel_bp)
    app.register_blueprint(agents_bp)
    app.register_blueprint(investment_bp)
    app.register_blueprint(excel_bp)
    app.register_blueprint(data_bp)
    app.register_blueprint(deals_bp)
    app.register_blueprint(deal_participants_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(whiteboard_bp)
    app.register_blueprint(countries_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(playbook_bp)
    app.register_blueprint(countries_master_bp)
    app.register_blueprint(countries_public_bp)
    app.register_blueprint(reports_bp)

    # Log registered routes (development only)
    if app.config['DEBUG']:
        with app.app_context():
            routes = []
            for rule in app.url_map.iter_rules():
                routes.append(f"{rule.endpoint}: {rule.rule} {list(rule.methods)}")
            print(f"\n[*] Registered {len(routes)} routes")

    return app


# Create app instance for direct execution
app = create_app()


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
