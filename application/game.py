from flask import request, render_template, jsonify, url_for, redirect, g
from .models import Game, League, User
from index import app, db
from sqlalchemy.exc import IntegrityError
from .utils.auth import requires_auth, requires_admin_auth
from .league import can_have_another_game
from .stat import stat_update

@app.route("/api/game/record", methods=["POST"])
@requires_auth
def record_game():
    json = request.get_json()

    the_league = League.query.get(g.current_user["league_id"])

    if(can_have_another_game(the_league)):
        aid    = int(json["playerA"]["id"])
        ascore = int(json["playerA"]["score"])
        bid    = int(json["playerB"]["id"])
        bscore = int(json["playerB"]["score"])
        userA  = User.query.filter_by(league_id=the_league.id, id=aid).first()
        userB  = User.query.filter_by(league_id=the_league.id, id=bid).first()
        if not userA or not userB:
            return jsonify(message="shoot"), 400
        winner = userA if ascore > bscore else userB 
        loser = userB if ascore > bscore else userA
        winner_score, loser_score = (ascore, bscore) if (ascore > bscore) else (bscore, ascore)

        game = Game(
            the_league,
            winner,
            loser,
            winner_score,
            loser_score
        )
        db.session.commit()
        stat_update(game)
        return jsonify(result="success")
    else:
        return jsonify(result="BILLING NEEDED")

@app.route("/api/game/list", methods=["GET"])
@requires_auth
def list_games():
    games = Game.query.filter_by(league_id=g.current_user["league_id"]).all()
    return jsonify([game.to_dict() for game in games]), 200
