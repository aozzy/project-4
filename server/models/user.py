from app import db, bcrypt
from models.base import BaseModel
# from models.item import Item
from models.comment import Comment
from models.image import Image
from models.user_follows import user_follows_join
from models.user_items import user_items_join
from models.user_items_wish import user_items_wish_join
from models.review import Review
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
    town = db.Column(db.Text, nullable=True, unique=False)
    location = db.Column(db.Text, nullable=True, unique=False)
    lat = db.Column(db.Float, nullable=True)
    lng = db.Column(db.Float, nullable=True)
    positive_rating = db.Column(db.Integer, nullable=True, unique=False, default=0)
    negative_rating = db.Column(db.Integer, nullable=True, unique=False, default=0)
    barter_number = db.Column(db.Integer, nullable=True, unique=False)
    successfull_trans = db.Column(db.Integer, nullable=True, unique=False, default=0)
    failed_trans = db.Column(db.Integer, nullable=True, unique=False, default=0)
    image = db.Column(db.Text, nullable=True)
    profile_image = db.Column(db.Text, nullable=True)
    password_hash = db.Column(db.String(128), nullable=True)

    inventory = db.relationship('Item', backref='owner', cascade='all, delete')
    image_uploads = db.relationship('Image', backref='user', cascade='all, delete')
    comments = db.relationship('Comment', backref='user', cascade='all, delete')
    wishlist = db.relationship('Item', backref='users', secondary=user_items_wish_join, cascade='all, delete')
    offered = db.relationship('Item', backref='offered', secondary=user_items_join, cascade='all, delete')

    user_reviews = db.relationship('Review', backref='author', cascade='all, delete', foreign_keys=[Review.author_id])
    other_reviews = db.relationship('Review', backref='user', cascade='all, delete', foreign_keys=[Review.user_id])
    
    follows = db.relationship(
        'User', 
        backref='followers',
        secondary= user_follows_join,
        primaryjoin=id== user_follows_join.c.followed_user,
        secondaryjoin=id== user_follows_join.c.user_id)

    # followers = db.relationship(
    #     'User', 
    #     backref='users',
    #     secondary= user_follows_join,
    #     primaryjoin=id== user_follows_join.c.user_id,
    #     secondaryjoin=id== user_follows_join.c.followed_user)

    
    # ! AVATARS

    avatar_hair = db.Column(db.String(40), nullable=False)
    avatar_accessories = db.Column(db.String(40), nullable=False)
    avatar_hair_color = db.Column(db.String(40), nullable=False)
    avatar_facial_hair = db.Column(db.String(40), nullable=False)
    avatar_clothes = db.Column(db.String(40), nullable=False)
    avatar_clothes_color = db.Column(db.String(40), nullable=False)
    avatar_skin = db.Column(db.String(40), nullable=False)

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
