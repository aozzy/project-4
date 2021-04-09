from app import db
from models.base import BaseModel
from models.item_offers import item_offers_join
from models.comment import Comment
from models.image import Image


class Item(db.Model, BaseModel):

    

    __tablename__ = 'items'
    id = db.Column(db.Integer, primary_key=True)
    # ? nullable=False means it's required.
    # ? unique=True means its unique.

    name = db.Column(db.String(40), nullable=False, unique=True)
    typeof = db.Column(db.String(40), nullable=False)
    category = db.Column(db.String(40), nullable=False)
    description = db.Column(db.Text, nullable=True)
    listed = db.Column(db.Boolean, nullable=False )
    image = db.Column(db.Text, nullable=True)
    wishlisted = db.Column(db.Integer, nullable=True)
    address = db.Column(db.Text, nullable=True)

    
    offers = db.relationship(
        'Item',
        backref='sale_item',
        secondary= item_offers_join,
        primaryjoin=id== item_offers_join.c.offer_item,
        secondaryjoin=id== item_offers_join.c.item_id)
    
    comments = db.relationship('Comment', backref='item', cascade="all, delete")
    user = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"))



