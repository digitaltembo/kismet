from flask import request, render_template, jsonify, url_for, redirect, g
from .models import User
from index import app, db
from sqlalchemy.exc import IntegrityError
from .utils.auth import generate_token, requires_auth, requires_league_admin_auth, verify_token
from .stat import init_stat


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/<path:path>', methods=['GET'])
def any_root_path(path):
    return render_template('index.html')


@app.route("/api/my/user", methods=["GET"])
@requires_auth
def get_my_user():
    return jsonify(result=g.current_user)

@app.route("/api/user/<int:path>", methods=["GET"])
@requires_auth
def get_user(id):
    user = User.query.get(id)
    if user:
        if user.league == g.current_user.league or g.current_user.is_superuser:
            return jsonify(result=user)
        else:
            return jsonify(result="failure", message="Do not have permissions, bad!"), 401
    else:
        return jsonify(result="failure", message="Poorly formed request"), 409


@app.route("/api/add_user", methods=["POST"])
@requires_league_admin_auth
def add_user():
    incoming = request.get_json()

    (success, result) =  add_user_to_league(email=incoming["email"], name=incoming["name"], league = g.current_user.league)
    if success:
        return jsonify(result="success", user=result.to_dict())
    else:
        return result

@app.route("/api/reset_password", methods=["POST"])
@requires_league_admin_auth
def reset_password():
    incoming = request.get_json()

    user = User.query.filter(league_id = g.current_user["league_id"], id=incoming["id"]).first()
    user.password = ""
    db.session.add(user)
    db.session.commit()
    return jsonify(result="success", user=result.to_dict())

def add_user_to_league(email, name, league):
    if league.current_users < league.allowed_users:
        user = User(
            email=email,
            name=name,
            password='',
            league=league
        )
        user.password='' #it would be impossible to change this otherwise
        db.session.add(user)
        init_stat(user)

        try:
            db.session.commit()
        except IntegrityError:
            return (False, (jsonify(result="error", message="Cannot add user"), 409))

        return (True, user)
    else:
        return (False, jsonify(result="BILLING NEEDED"))

@app.route("/api/create_user", methods=["POST"])
def create_user():
    incoming = request.get_json()
    user = User.query.filter_by(email=incoming["email"], password="").first()
    if user:
        user.password = User.hashed_password(incoming["password"])

        try:
            db.session.commit()
        except IntegrityError:
            return jsonify(message="Cannot add user"), 409

        return jsonify(
            result="success",
            id=user.id,
            token=generate_token(user)
        )
    else:
        return jsonify(result="failure", message="You need an invitation to register.")


@app.route("/api/get_token", methods=["POST"])
def get_token():
    incoming = request.get_json()
    user = User.get_user_with_email_and_password(incoming["email"], incoming["password"])
    if user:
        return jsonify(token=generate_token(user))

    return jsonify(error=True), 403


@app.route("/api/is_token_valid", methods=["POST"])
def is_token_valid():
    incoming = request.get_json()
    is_valid = verify_token(incoming["token"])

    if is_valid:
        return jsonify(token_is_valid=True)
    else:
        return jsonify(token_is_valid=False), 403

@app.route("/api/user/list", methods=["GET"])
@requires_auth
def list_users():
    users = [g.current_user.to_dict()]
    if g.current_user.is_superuser:
        users = [user.to_dict() for user in User.query.all()]
    elif g.current_user.is_league_admin:
        users = [user.to_dict() for user in User.query.filter(league=user.league)]

    return jsonify(
        users
    )

@app.route("/api/user/update", methods=["POST"])
@requires_auth
def update_user():
    user_id = int(incoming["id"])
    if user_id != g.current_user.id and not g.current_user.is_superuser and not g.current_user.is_league_admin:
        return jsonify(result="failure", message="Not Authorized"), 401

    user = User.query.get(user_id)
    if g.current_user.is_league_admin and not g.current_user.is_superuser and user.league != g.current_user.league:
        return jsonify(result="failure", message="Not Authorized"), 401

    incoming = request.get_json()
    
    user.email = incoming["email"]
    user.name = incoming["name"]
    if "password" in incoming and incoming["password"] != None:
        user.password = User.hashed_password(incoming["password"])

    if g.current_user.is_league_admin and "is_league_admin" in incoming and incoming["is_league_admin"] != None:
        user.is_admin = incoming["is_admin"]
    if g.current_user.is_superuser and "is_league_admin" in incoming and incoming["is_league_admin"] != None:
        user.is_admin = incoming["is_admin"]
    db.session.commit()
    return jsonify(user.to_dict()), 200

@app.route("/api/user/delete", methods=["DELETE"])
@requires_league_admin_auth
def delete_user():
    incoming = request.get_json()
    User.query.filter_by(id=int(request.args.get("id"))).delete()
    db.session.commit()
    return jsonify(message="success"), 200

# @app.route("/api/user/approve", methods=["POST"])
# @requires_league_admin_auth
# def approve_user():
#     incoming = request.get_json()
#     user = ApprovedUser(incoming["email"])
#     db.session.add(user)
#     db.session.commit()
#     return jsonify(user.to_dict()), 200

# @app.route("/api/user/delete-approval", methods=["DELETE"])
# @requires_league_admin_auth
# def delete_approval():
#     ApprovedUser.query.filter_by(email=request.args.get("email")).delete()
#     db.session.commit()
#     return jsonify(message="success"), 200

