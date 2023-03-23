from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config.environment import db_URI
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt


app = Flask(__name__, static_folder='dist')

# from decorators import logging, errors, logger

app.config['SQLALCHEMY_DATABASE_URI'] = db_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
ma = Marshmallow(app)
bcrypt = Bcrypt(app)

from controllers import items, images, user, swap, failed, reviews

app.register_blueprint(items.router, url_prefix="/api")
app.register_blueprint(images.router, url_prefix="/api")
app.register_blueprint(user.router, url_prefix="/api")
app.register_blueprint(swap.router, url_prefix="/api")
app.register_blueprint(failed.router, url_prefix="/api")
app.register_blueprint(reviews.router, url_prefix="/api")

import os

@app.route('/', defaults={'path': ''}) 
@app.route('/<path:path>') 
def catch_all(path):
    dirname = os.path.dirname(__file__)
    filename = os.path.join(dirname, 'dist/' + path)

    if os.path.isfile(filename): 
        return app.send_static_file(path)

    return app.send_static_file('index.html') 



