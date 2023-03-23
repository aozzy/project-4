from flask import Blueprint, jsonify, request, g
from models.image import Image
from serializers.image import ImageSchema
from marshmallow.exceptions import ValidationError
from decorators.secure_route import secure_route

image_schema = ImageSchema()
router = Blueprint('images' ,__name__)

#GET all images

@router.route("/images", methods=["GET"])
def get_images():
    images = Image.query.all()
    return image_schema.jsonify(images, many=True), 200


#GET individual image

@router.route('/images/<int:id>', methods=['GET'])
def get_single_image(id):
    image = Image.query.get(id)
    if not Image:
        return jsonify({'message': 'Image not found'}), 404
    return image_schema.jsonify(image), 200


#POST image

@router.route('/images', methods=['POST'])
@secure_route
def create_image():
    image_dict = request.json
    try:
        image = image_schema.load(image_dict)
        image.user = g.current_user
    except ValidationError as e:
        return { 'errors': e.messages, 'messages': 'Something went wrong' }
    image.save()
    return image_schema.jsonify(image), 200

#PUT image

@router.route("/images/<int:image_id>", methods=["PUT"])
@secure_route
def update_image(image_id):
    existing_image = Image.query.get(image_id)
    image_dict = request.json
    try:
        image = image_schema.load(
            image_dict,
            instance=existing_image,
            partial=True,
        )
    except ValidationError as e:
        return {"errors": e.messages, "messages": "Something went wrong"}
    image.save()
    return image_schema.jsonify(image), 201

#DELETE image

@router.route("/images/<int:image_id>", methods=["DELETE"])
@secure_route
def delete_image(image_id):
    image = Image.query.get(image_id)
    image.remove()
    return {'message': '💀 Image deleted'}, 200

