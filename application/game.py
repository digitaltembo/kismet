from flask import request, render_template, jsonify, url_for, redirect, g
from .models import Game, League, User
from index import app, db
from sqlalchemy.exc import IntegrityError
from .utils.auth import requires_auth, requires_admin_auth
from .league import can_have_another_game
from .stat import stat_update
import datetime

@app.route("/api/game/record", methods=["POST"])
@requires_auth
def record_game_request():
    json = request.get_json()

    aid    = int(json["playerA"]["id"])
    ascore = int(json["playerA"]["score"])
    bid    = int(json["playerB"]["id"])
    bscore = int(json["playerB"]["score"])

    result = record_game(g.current_user["league_id"], aid, ascore, bid, bscore)
    response_code = result["response_code"]
    return jsonify(result), response_code

def record_game(league_id, aid, ascore, bid, bscore):
    the_league = League.query.get(league_id)

    userA  = User.query.filter_by(league_id=league_id, id=aid).first()
    userB  = User.query.filter_by(league_id=league_id, id=bid).first()
    if not userA or not userB:
        return {'result': "failed", 'message':"could not find users",'response_code': 400}

    if(can_have_another_game(the_league)):
        winner = userA if ascore > bscore else userB 
        loser = userB if ascore > bscore else userA
        winner_score, loser_score = (ascore, bscore) if (ascore > bscore) else (bscore, ascore)

        game = Game(
            the_league,
            the_league.current_season,
            winner,
            loser,
            winner_score,
            loser_score,
            datetime.datetime.now()
        )
        the_league.current_monthly_games += 1
        db.session.commit()
        winner_stat, loser_stat = stat_update(game)
        return {
            'result':      "success", 
            'response_code': 200,
            'game':        game.to_dict(), 
            'winner':      game.winner.to_dict(), 
            'loser':       game.loser.to_dict(), 
            'winner_stat': winner_stat.to_dict(), 
            'loser_stat':  loser_stat.to_dict() 
        }
    else:
        return {'result': "BILLING NEEDED", 'response_code': 402}

@app.route("/api/game/list", methods=["GET"])
@requires_auth
def list_games():
    games = Game.query.filter_by(league_id=g.current_user["league_id"]).all()
    return jsonify([game.to_dict() for game in games]), 200
