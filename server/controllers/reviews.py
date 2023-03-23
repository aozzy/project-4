from flask import Blueprint, request, g
from models.user import User
from serializers.user import UserSchema
from models.item import Item
from models.comment import Comment
from serializers.comment import CommentSchema
from models.review import Review
from serializers.review import ReviewSchema
from marshmallow.exceptions import ValidationError
from decorators.logger import logger
from decorators.secure_route import secure_route

user_schema = UserSchema()
comment_schema = CommentSchema()
review_schema = ReviewSchema()

router = Blueprint("reviews" ,__name__)


@router.route("/reviews", methods=["GET"])
@secure_route
def get_all_reviews():
    reviews = Review.query.all()
    return review_schema.jsonify(review, many=True), 200


@router.route("/users/<int:user_id>/review", methods=["POST"])
@secure_route
def create_review(user_id):
    review_dictionary = request.json
    user = User.query.get(user_id)
    author = g.current_user
    try:
        review = review_schema.load(review_dictionary)
        review.user_id = user.id
        review.author_id = author.id
    except ValidationError as e:
        return {"errors": e.messages, "message": "Something went wrong"}
    review.save()
    return review_schema.jsonify(review)


@router.route("/reviews/<int:review_id>", methods=["PUT"])
@secure_route
def update_review(user_id, review_id):
    existing_review = Review.query.get(review_id)
    review_dict = request.json

    try:
        review = review_schema.load(review_dict, instance=existing_review, partial=True)
    except ValidationError as e:
        return { "errors": e.messages, "messages": "Too bad, something went wrong" }

    review.save()
    return review_schema.jsonify(review), 201


@router.route("/reviews/<int:review_id>",  methods=["DELETE"])
@secure_route
def delete_review(review_id): 
    review = Review.query.get(review_id)

    # if review.author_id != g.current_user:
    #     return { "errors": "THis is not your review!" }, 402
    review.remove()
    return { "message": "Review deleted successfully" }, 200