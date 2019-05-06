from flask import request, render_template, jsonify, url_for, redirect, g
from .models import League, Season, User
from index import app, db
from sqlalchemy.exc import IntegrityError
from .utils.auth import requires_auth, requires_admin_auth, generate_token
from .user import add_user_to_league
import datetime
import string
import random
ALPHANUMS = string.digits + string.ascii_uppercase

def random_string(length=10):
    return ''.join([random.choice(ALPHANUMS) for i in range(length)])

@app.route("/api/my/league", methods=["GET"])
@requires_auth
def my_league():
    league = League.query.get(g.current_user['league_id'])
    if league:
        return jsonify(league.to_dict())
    else:
        return jsonify(error="dang")

@app.route("/api/league/create_league_and_user", methods=["POST"])
def create_league():
    incoming = request.get_json(force=True)
    league_name=incoming["league_name"]
    person_name=incoming["name"]
    email=incoming["email"]
    password=incoming["password"]

    new_league = League(
        league_name,
        datetime.datetime.now(),
        5,
        0,
        50,
        0,
        random_string(6)

    )

    db.session.add(new_league)
    db.session.commit()
    new_season = Season(
        "First Season",
        new_league,
        datetime.datetime.now()
    )
    db.session.add(new_season)
    db.session.commit()
    new_league.current_season_id = new_season.id
    db.session.add(new_league)

    (success, user) = add_user_to_league(email, person_name, password, new_league)
    if success:
        user.password = User.hashed_password(password)
        user.is_league_admin = True
        db.session.commit()

        return jsonify(
            id=user.id,
            token=generate_token(user)
        )
    else:
        return user

@app.route("/api/league/players", methods=["GET"])
@requires_auth
def get_leaderboard_json():
    return jsonify(get_leaderboard(g.current_user["league_id"]))

def get_leaderboard(league_id):
    return sorted([
        merge(user.current_stat.to_dict(), user.to_dict()) 
        for user in User.query.filter_by(league_id=league_id, is_active=True) if user.current_stat_id
    ], key=lambda user:-user['elo'])

def merge(dictA, dictB):
    newDict = {}
    for key in dictA:
        newDict[key] = dictA[key]
    for key in dictB:
        newDict[key] = dictB[key]
    return newDict

def update_monthly_cycle(league):
    now = datetime.datetime.now()
    if now.month > league.month_start.month and now.day >= league.month_start.day:
        if league.month_credits > 0:
            league.month_credits -= 1 
            league.month_start = 0 
            league.current_monthly_games = 0
            db.session.commit()
            return True
        else:
            return False 
    else: 
        return True

def can_have_another_game(league):
    return update_monthly_cycle(league) and league.current_monthly_games < league.allowed_monthly_games





