from app import db, bcrypt
from models.base import BaseModel
from models.item import Item
from models.comment import Comment
from models.image import Image
from models.user_follows import user_follows_join
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates

import jwt
from datetime import *
from config.environment import secret

class User(db.Model, BaseModel):

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(20), nullable=False, unique=True)
    email = db.Column(db.Text, nullable=False, unique=True)

    @validates('email')
    def validate_email(self, key, email):
        # assert '@' in email
        return email
    
    bio = db.Column(db.Text, nullable=True, unique=False)
    location = db.Column(db.Text, nullable=True, unique=False)
    rating = db.Column(db.Integer, nullable=True, unique=False)
    barter_number = db.Column(db.Integer, nullable=True, unique=False)
    successfull_trans = db.Column(db.Integer, nullable=True, unique=False, default=0)
    failed_trans = db.Column(db.Integer, nullable=True, unique=False, default=0)
    image = db.Column(db.Text, nullable=True)
    password_hash = db.Column(db.String(128), nullable=True)
    inventory = db.relationship('Item', backref='owner', cascade='all, delete')
    image_uploads = db.relationship('Image', backref='user', cascade='all, delete')
    comments = db.relationship('Comment', backref='user', cascade='all, delete')

    follows = db.relationship(
        'User', 
        backref='followed_user',
        secondary= user_follows_join,
        primaryjoin=id== user_follows_join.c.followed_user,
        secondaryjoin=id== user_follows_join.c.user_id)

    @hybrid_property
    def password(self):
        pass

    @password.setter
    def password(self, password_plaintext):
        encoded_pw = bcrypt.generate_password_hash(password_plaintext)
        self.password_hash = encoded_pw.decode('utf-8')


    def validate_password(self, password_plaintext):
        # returns True/False
        return bcrypt.check_password_hash(self.password_hash, password_plaintext)

    def generate_token(self):
        payload = {
            # sub is user_id
            "sub": self.id,
            # Current time when the token is created
            "iat": datetime.utcnow(),
            # Expiry time
            "exp": datetime.utcnow() + timedelta(days=1)
        }

        token = jwt.encode(payload, secret, 'HS256')

        return token