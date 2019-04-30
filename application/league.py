from flask import request, render_template, jsonify, url_for, redirect, g
from .models import League, Season, User
from index import app, db
from sqlalchemy.exc import IntegrityError
from .utils.auth import requires_auth, requires_admin_auth, generate_token
from .user import add_user_to_league
import datetime

@app.route("/api/my/league", methods=["GET"])
@requires_auth
def my_league():
    return g.current_user.to_dict()

@app.route("/api/league/create_league_and_user", methods=["POST"])
def create_league():
    incoming = request.get_json(force=True)

    print(request)
    print(incoming)
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
        0
    )

    db.session.add(new_league)
    db.session.commit()
    new_season = Season(
        "First Season",
        new_league,
        datetime.datetime.now()
    )
    db.session.add(new_season)
    new_league.current_season = new_season.id
    db.session.add(new_season)

    (success, user) = add_user_to_league(email, person_name, new_league)
    if success:
        user.password = User.hashed_password(password)
        db.session.commit()

        return jsonify(
            id=user.id,
            token=generate_token(user)
        )
    else:
        return user

@app.route("/api/league/players", methods=["GET"])
@requires_auth
def get_leaderboard():
    my_user = User.query.get(g.current_user["id"])

    users = [merge(user.current_stat.to_dict(), user.to_dict()) for user in my_user.league.users if user.current_stat_id]

    return jsonify(
        users
    )

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





