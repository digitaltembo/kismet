from flask import request, render_template, jsonify, url_for, redirect, g
from .models import League, Season, User
from index import app, db
from sqlalchemy.exc import IntegrityError
from .utils.auth import requires_auth, requires_admin_auth
import datetime

@app.route("/api/my/league", methods=["GET"])
@requires_auth
def my_league():
    return g.current_user.to_dict()

@app.route("/api/league/create")
def create_league():
    new_league = League(
        request.args.get("name"),
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
    db.session.commit()


    return jsonify(new_league.to_dict())

@app.route("/api/league/players", methods=["GET"])
@requires_auth
def get_leaderboard():
    my_user = User.query.get(g.current_user["id"])

    users = [merge(user.current_stat.to_dict(), user.to_dict()) for user in my_user.league.users]

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

def can_have_another_user(league):
    return league.current_users < league.allowed_users




