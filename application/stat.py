from flask import request, render_template, jsonify, url_for, redirect, g
from .models import Stat, User, Game, League
from index import app, db
from sqlalchemy.exc import IntegrityError
from .utils.auth import requires_auth, requires_admin_auth
import datetime
import random
import math
# input: {"playerA": Int, "playerB": Int}, ELO scores for playerA and playerB
# returns: {"playerA": {"win-probability":float, "win-delta": int, "lose-delta": int}, "playerB": {...}}, Probability that playerA wins
@app.route("/api/stat/simulate", methods=["GET"])
def get_elo_simulate():
    incoming = request.get_json()
    try:
        aElo = int(incoming["playerA"]["elo"])
        aK   = int(incoming["playerA"]["k-factor"])
        bElo = int(incoming["playerB"]["elo"])
        bK   = int(incoming["playerB"]["k-factor"])
    except:
        return jsonify(result=error, message="Incorrect input")
    return jsonify((simulation.to_dict() for simulation in get_elo_simulate(aElo, aK, bElo, bK)))

class EloSimulation:
    def __init__(self, winProb, winDelta, loseDelta):
        self.winProb = winProb
        self.winDelta = winDelta
        self.loseDelta = loseDelta
    def to_dict(self):
        return {
            "winProbability": self.winProb,
            "winDelta": self.winDelta,
            "loseDelta": self.loseDelta
        }

@app.route("/api/stat/compare", methods=["GET"])
@requires_auth 
def compare():
    playerAId = int(request.args.get("playerA"))
    playerBId = int(request.args.get("playerB"))
    playerA = User.query.filter_by(league_id=g.current_user["league_id"], id=playerAId).first()
    playerB = User.query.filter_by(league_id=g.current_user["league_id"], id=playerBId).first()

    (aResults, bResults) = (simulation.to_dict() for simulation in elo_simulate(playerA.current_stat.elo, playerA.kfactor, playerB.current_stat.elo, playerB.kfactor))
    aResults["wins"] = Game.query.filter_by(winner_id=playerAId, loser_id=playerBId).count()
    bResults["wins"] = Game.query.filter_by(winner_id=playerBId, loser_id=playerAId).count()
    return jsonify([aResults, bResults])


def elo_simulate(aElo, aK, bElo, bK):
    probabilityAWins = 1.0 / (1 + 10 ** ((bElo - aElo) / 400))
    probabilityBWins = 1.0 - probabilityAWins

    aWinDelta = aK * ( 1 - probabilityAWins)
    aLoseDelta = aK * ( 0 - probabilityAWins)

    bWinDelta = bK * (1 - probabilityBWins)
    bLoseDelta = bK * (0 - probabilityBWins)
    return (EloSimulation(probabilityAWins, aWinDelta, aLoseDelta), EloSimulation(probabilityBWins, bWinDelta, bLoseDelta))

def stat_update(game):
    # for winner
    winner_stat = game.winner.current_stat
    # for loser
    loser_stat = game.loser.current_stat

    winner, loser = elo_simulate(winner_stat.elo, game.winner.kfactor, loser_stat.elo, game.loser.kfactor)

    new_winner_stat = Stat(
        league       = game.league, 
        season       = game.season, 
        game         = game,
        user         = game.winner, 
        elo          = winner_stat.elo + winner.winDelta, 
        wins         = winner_stat.wins + 1,
        losses       = winner_stat.losses,
        total_points = winner_stat.total_points + game.winner_score,
        time         = game.time
    )

    db.session.add(new_winner_stat)
    game.winner.current_stat = new_winner_stat


    new_loser_stat = Stat(
        league       = game.league, 
        season       = game.season,
        game         = game, 
        user         = game.loser, 
        elo          = loser_stat.elo + loser.loseDelta, 
        wins         = loser_stat.wins,
        losses       = loser_stat.losses + 1,
        total_points = loser_stat.total_points + game.loser_score,
        time         = game.time
    )

    db.session.add(new_loser_stat)

    game.loser.current_stat = new_loser_stat
    db.session.add(game.winner)
    db.session.add(game.loser)

    db.session.commit()
    return (new_winner_stat, new_loser_stat)

def init_stat(user):
    new_stat = Stat(
        league=user.league,
        game=None,
        season = user.league.current_season,
        user=user, 
        elo=1000,
        wins=0,
        losses=0,
        total_points=0,
        time=datetime.datetime.now()
    )
    db.session.add(new_stat)
    db.session.commit()
    user.current_stat_id = new_stat.id
    db.session.add(user)
    db.session.commit()


@app.route("/api/stat/list", methods=["GET"])
@requires_auth
def list_stats():
    stats = Stat.query.filter_by(league_id=g.current_user["league_id"]).all()
    return jsonify([stat.to_dict() for stat in stats]), 200

@app.route("/api/stat/overview/<int:id>", methods=["GET"])
def get_overview(id):
    return jsonify(overview(id))

ranking_algorithms = {
    "Elo": lambda stat: stat.elo,
    "games played": lambda stat: stat.wins + stat.losses,
    "points scored": lambda stat: stat.total_points,
    "recency of play": lambda stat: (stat.time - datetime.datetime.now()).seconds,
    "win-loss ratio": lambda stat: stat.wins/stat.losses if stat.losses > 0 else 100000000
}
def sq(num):
    return num * num


FIRST_PLACE = 'FIRST'
LAST_PLACE = 'LAST'
UNUSUALLY_LOW = 'LOW'
UNUSUALLY_HIGH = 'HIGH'
FINE = 'FINE'

def get_ranks_and_avgs_for_algo(algo, stat, stats):
    total = len(stats)
    metric = sorted([algo(s) for s in stats])
    avg = sum(metric) / total
    std_deviation = math.sqrt(sum([ sq(value - avg) for value in metric ]) / total)
    my_value = algo(stat)
    my_deviance = abs(my_value - avg)

    rank = total - metric.index(my_value)
    if rank == 1:
        return FIRST_PLACE
    if rank == total:
        return LAST_PLACE 
    if my_deviance > std_deviation:
        if my_value < avg:
            return UNUSUALLY_LOW
        else:
            return UNUSUALLY_HIGH

    return FINE

def get_random_quality(user):
    current_stat =  user.current_stat
    competitors = User.query.filter_by(league_id=user.league_id, is_active=True).all()
    competitor_stats = [competitor.current_stat for competitor in competitors]
    ranking = random.choice(list(ranking_algorithms.keys()))
    return ranking, get_ranks_and_avgs_for_algo(ranking_algorithms[ranking], current_stat, competitor_stats)





