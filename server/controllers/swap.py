from flask import Blueprint, request, g
from models.item import Item
from serializers.item import ItemSchema
from models.comment import Comment
from serializers.user import UserSchema
from models.user import User
from decorators.loggings import logging
from decorators.secure_route import secure_route
from decorators.time_taken import time_taken


item_schema = ItemSchema()
user_schema = UserSchema()


router = Blueprint("swap" ,__name__)


@router.route("/swap/<int:item1_id>/<int:item2_id>", methods=["PUT"])
@secure_route
def swap_item(item1_id, item2_id):
    
    item1 = Item.query.get(item1_id)
    item2 = Item.query.get(item2_id)

    user1 = item1.owner
    user2 = item2.owner

    item2.owner = user1
    item1.owner = user2

    user1.successfull_trans = user1.successfull_trans + 1
    user2.successfull_trans = user2.successfull_trans + 1

    item1.listed = True
    item2.listed = True
        
    # change all items in offers list to available...
    offers = item1.offers
    for offer in offers:
        offer.listed = True

    # then clear the offers list
    item1.offers = []

    item1.save()
    user1.save()
    user2.save()


    items = Item.query.all()

    return item_schema.jsonify(items, many=True), 201




    
    
    
    
    
@router.route("/offers/<int:item1_id>/<int:item2_id>", methods=["PUT"])
def add_item_to_offer(item1_id, item2_id):
    item1 = Item.query.get(item1_id)
    item2 = Item.query.get(item2_id)
    
    item2.listed = False
    item1.listed = False
    
    item1.offers.append(item2)
    item2.save()
    item1.save()
    return item_schema.jsonify(item1), 200

    
