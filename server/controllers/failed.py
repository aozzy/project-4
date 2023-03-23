
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

router = Blueprint("failed" ,__name__)


@router.route("/failed/<int:item1_id>/<int:item2_id>", methods=["PUT"])
@secure_route
def swap_item(item1_id, item2_id):
    
    item1 = Item.query.get(item1_id)
    item2 = Item.query.get(item2_id)

    user1 = item1.owner
    user2 = item2.owner

    

    
    user2.failed_trans = user2.failed_trans + 1

    user1.save()
    user2.save()

    items = Item.query.all()

    return item_schema.jsonify(items, many=True), 201