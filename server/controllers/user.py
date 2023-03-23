from flask import Blueprint, request, g
from models.user import User
from serializers.user import UserSchema
from models.item import Item
from models.comment import Comment
from serializers.comment import CommentSchema
from marshmallow.exceptions import ValidationError
from decorators.logger import logger
from decorators.secure_route import secure_route

user_schema = UserSchema()
comment_schema = CommentSchema()

router = Blueprint("users",__name__)

#POST new user (Signup)

@router.route("/signup", methods=["POST"])
def signup():
    # try:
    # print('something went well')
    user = user_schema.load(request.json)
    # except ValidationError as e:
    #     print('something went wrong')
    #     return { 'errors': e.messages, 'messages': 'Something went wrong.' }, 401
    user.save()
    return user_schema.jsonify(user)

 #POST existing user (Login)

@router.route("/login", methods=["POST"])
@logger
def login():
    user = User.query.filter_by(email=request.json['email']).first()
    if not user:
        return { "message": "No user found with that email..." }

    if not user.validate_password(request.json['password']):
        return { "message": "Unauthorized" }

    token = user.generate_token()
    return { "token": token, "message": "login successfull" }, 201

#GET all users

@router.route("/users", methods=["GET"])
@logger
def get_all_users():
    try:
        users = User.query.all()
    except ValidationError as e:
        return { "errors": e.messages, "messages": "Something went wrong" }
    return user_schema.jsonify(users, many=True), 200

#GET single user

@router.route("/users/<int:user_id>", methods=["GET"])
@logger
def get_single_user(user_id):
    try:
        user = User.query.get(user_id)
    except ValidationError as e:
        return { "errors": e.messages, "messages": "Something went wrong" }
    return user_schema.jsonify(user), 200

#PUT single user

@router.route("/users/<int:user_id>", methods=["PUT"])
@secure_route
def update_user(user_id):
    existing_user = User.query.get(user_id)
    user_dict = request.json
    try:
        user = user_schema.load(user_dict, instance=existing_user, partial=True)
    except ValidationError as e:
        return { "errors": e.messages, "messages": "Too bad, something went wrong" }
    user.save()
    return user_schema.jsonify(user), 201

#DELETE single user

@router.route("/users/<int:user_id>", methods=["DELETE"])
@secure_route
@logger
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        User.remove(user)
    except ValidationError as e:
        return { "errors": e.messages, "messages": "Something went wrong" }
    return { 'message': 'User deleted successfully' }, 200

#GET current user

@router.route('/current_user', methods=['GET'])
@secure_route
def get_user_profile():

    print(g.current_user.inventory)
    return user_schema.jsonify(g.current_user)

# ! WISHLIST

#ADD a wishlist item to a user

@router.route('/users/<int:user_id>/items/<int:item_id>', methods=["POST"])
@logger
def add_item_to_wishlist(user_id, item_id):
    user = User.query.get(user_id)
    item = Item.query.get(item_id)
    user.wishlist.append(item)
    user.save()
    return user_schema.jsonify(user), 200


@router.route('/users/<int:user_id>/updatewishlist/<int:item_id>', methods=["PUT"])
@secure_route
def remove_from_wishlist(user_id, item_id):
    user = User.query.get(user_id)
    item = Item.query.get(item_id)
    user.wishlist.remove(item)
    user.save()
    return user_schema.jsonify(user), 200

# ! COMMENTS

#GET comment

@router.route("/users/<int:user_id>/comments/<int:comment_id>", methods=["GET"])
def get_single_comment(user_id, comment_id):
    comment = Comment.query.get(comment_id)
    user = User.query.get(user_id)
    return comment_schema.jsonify(comment), 200

#GET all comments

@router.route("/comments", methods=["GET"])
@logger
def get_all_user_comments():
    try:
        comments = Comment.query.all()
    except ValidationError as e:
        return { "errors": e.messages, "messages": "Something went wrong" }
    return comment_schema.jsonify(comments, many=True), 200

#POST comment on another user

# @router.route("/users/<int:user1_id>/comments/<int:user2_id>", methods=["POST"])
# def review_user(user1_id, user2_id):
#     comment_dict = request.json
#     user1 = User.query.get(user1_id)
#     user2 = User.query.get(user2_id)
#     comment = comment_schema.load(comment_dict)
#     comment.user = author
#     print(comment.user)
#     comment.reviewee = reviewee
#     print(comment.reviewee)
#     comment.save()
#     return comment_schema.jsonify(comment)


@router.route("/users/<int:user_id>/comments/<int:comment_id>", methods=["DELETE"])
@secure_route
def delete_comment(user_id, comment_id):
    comment = Comment.query.get(comment_id)
    comment.remove()
    user = User.query.get(user_id)
    return user_schema.jsonify(user), 202

# UPDATE comment

@router.route("/items/<int:user_id>/comments/<int:comment_id>", methods=["PUT"])
@secure_route
def update_comment(user_id, comment_id):
    comment_dictionary = request.json
    existing_comment = Comment.query.get(comment_id)
    try:
        comment = comment_schema.load(
            comment_dictionary, instance=existing_comment, partial=True
        )
    except ValidationError as e:
        return {"errors": e.messages, "messages": "Something went wrong"}
    comment.save()
    user = User.query.get(user_id)
    return comment_schema.jsonify(comment), 201

# ! FOLLOW USER

@router.route('/users/<int:user_id>/users/<int:followed_user_id>', methods=["POST"])
@logger
@secure_route
def follow_user(user_id, followed_user_id):
    user = User.query.get(user_id)
    followed_user = User.query.get(followed_user_id)
    user.follows.append(followed_user)
    followed_user.followers.append(user)
    user.save()
    return user_schema.jsonify(user), 200


@router.route('/users/<int:user1_id>/removefollower/<int:user2_id>', methods=["PUT"])
@secure_route
def user_unfollow(user1_id, user2_id):
    user1 = User.query.get(user1_id)
    user2 = User.query.get(user2_id)
    user1.follows.remove(user2)
    user2.save()
    user1.save()
    return user_schema.jsonify(user2), 200