from index import db
from werkzeug.security import generate_password_hash, check_password_hash
import pickle


from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    email = db.Column(db.String(255), unique=True)
    name = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    league_id = db.Column(db.Integer(), db.ForeignKey('league.id'))

    is_league_admin = db.Column(db.Boolean(), default=False)
    is_superuser = db.Column(db.Boolean(), default=False)
    profile_pic = db.Column(db.String(255))
    kfactor = db.Column(db.Integer(), default=28)
    current_stat_id = db.Column(db.Integer(), db.ForeignKey('stat.id'))

    league = db.relationship('League', back_populates='users')
    current_stat = db.relationship('Stat', foreign_keys=[current_stat_id])
    stats = db.relationship('Stat', back_populates='user')
    won_games = db.relationship('Game', back_populates='winner', foreign_keys='[Game.winner_id]')
    lost_games = db.relationship('Game', back_populates='loser', foreign_keys='[Game.loser_id]')
    stats = db.relationship('Stat', back_populates='user', foreign_keys='[Stat.user_id]')


    def __init__(self, email, password, name, league, is_league_admin=False, is_superuser=False, profile_pic="", ):
        self.email = email
        self.name = name
        self.active = True
        self.password = User.hashed_password(password)
        self.is_league_admin = is_league_admin
        self.is_superuser = is_superuser
        self.profile_pic = profile_pic

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "profile_pic": self.profile_pic,
            "is_league_admin": self.is_league_admin,
            "is_superuser": self.is_superuser,
            "kfactor":self.kfactor,
            "league_id": self.league_id
        }

    @staticmethod
    def hashed_password(password):
        return generate_password_hash(password)

    @staticmethod
    def get_user_with_email_and_password(email, password):
        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password, password):
            return user
        else:
            return None

class League(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(255), unique=True)
    current_season_id = db.Column(db.Integer(), db.ForeignKey('season.id'))

    month_start = db.Column(db.DateTime())

    allowed_users = db.Column(db.Integer())
    current_users = db.Column(db.Integer())
    allowed_monthly_games = db.Column(db.Integer())
    current_monthly_games = db.Column(db.Integer())

    users = db.relationship('User', back_populates='league')
    current_season = db.relationship('Season', foreign_keys=[current_season_id])
    seasons = db.relationship('Season', back_populates='league', foreign_keys='[Season.league_id]')
    games = db.relationship('Game', back_populates='league')
    stats = db.relationship('Stat', back_populates='league')



    def __init__(self, name, month_start, allowed_users, current_users, allowed_monthly_games, current_monthly_games):
        self.name                  = name
        self.month_start           = month_start
        self.allowed_users         = allowed_users
        self.current_users         = current_users
        self.allowed_monthly_games = allowed_monthly_games
        self.current_monthly_games = current_monthly_games
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "month_start": self.month_start,
            "allowed_users": self.allowed_users,
            "current_users": self.current_users,
            "allowed_monthly_games": self.allowed_monthly_games,
            "current_monthly_games": self.current_monthly_games
        }

class Season(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    league_id = db.Column(db.Integer(), db.ForeignKey('league.id'))
    name = db.Column(db.String(255), unique=True)
    start = db.Column(db.DateTime())
    end = db.Column(db.DateTime())

    league = db.relationship('League', back_populates='seasons', foreign_keys=[league_id])
    games = db.relationship('Game', back_populates='season')
    stats = db.relationship('Stat', back_populates='season')

    def __init__(self, name, league, start, end=None):
        self.name = name 
        self.league = league
        self.start = start 
        self.end = end
    def to_dict(self):
        return {
            "id": self.id,
            "league": self.league.to_dict(),
            "name": self.name,
            "start": str(self.start),
            "end": str(self.end)
        }

class Game(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    league_id = db.Column(db.Integer(), db.ForeignKey('league.id'))
    season_id = db.Column(db.Integer(), db.ForeignKey('season.id'))
    winner_id = db.Column(db.Integer(), db.ForeignKey('user.id'))
    loser_id = db.Column(db.Integer(), db.ForeignKey('user.id'))
    winner_score = db.Column(db.Integer())
    loser_score = db.Column(db.Integer())
    time = db.Column(db.DateTime())

    league = db.relationship('League', back_populates='games')
    season = db.relationship('Season', back_populates='games')
    winner = db.relationship('User', back_populates='won_games', foreign_keys=[winner_id])
    loser  = db.relationship('User',  back_populates='lost_games', foreign_keys=[loser_id])
    stats = db.relationship('Stat', back_populates='game')


    def __init__(self, league, winner, loser, winner_score, loser_score):
        self.league=league
        self.winner = winner 
        self.loser = loser 
        self.winner_score = winner_score
        self.loser_score = loser_score

    def to_dict(self):
        return {
            "id": self.id,
            "league": self.league.to_dict(),
            "season": self.season.to_dict(),
            "winner": self.winner.to_dict(),
            "loser": self.loser.to_dict(),
            "winner_score": self.winner_score,
            "loser_score": self.loser_score,
            "time": str(self.time)
        }


class Stat(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    league_id = db.Column(db.Integer(), db.ForeignKey('league.id'))
    season_id = db.Column(db.Integer(), db.ForeignKey('season.id'))
    game_id = db.Column(db.Integer(), db.ForeignKey('game.id'))
    user_id = db.Column(db.Integer(), db.ForeignKey('user.id'))
    elo = db.Column(db.Integer())
    wins = db.Column(db.Integer())
    losses = db.Column(db.Integer())
    total_points = db.Column(db.Integer())
    time = db.Column(db.DateTime())

    league = db.relationship('League', back_populates='stats', post_update=True)
    season = db.relationship('Season', back_populates='stats', post_update=True)
    game   = db.relationship('Game', back_populates='stats', post_update=True)
    user   = db.relationship('User', back_populates='stats', foreign_keys=[user_id], post_update=True)


    def __init__(self, league, season, game, user, elo, wins, losses, total_points, time):
        self.league       = league
        self.season       = season
        self.game         = game
        self.user         = user 
        self.elo          = elo
        self.wins         = wins
        self.losses       = losses
        self.total_points = total_points
        self.time         = time

    def to_dict(self):
        return {
            "id":           self.id,
            "elo":          int(self.elo),
            "wins":         self.wins,
            "losses":       self.losses,
            "total_points": self.total_points,
            "time":         self.time
        }







# class KeyValue(db.Model):
#     key = db.Column(db.String(120), primary_key=True)
#     value = db.Column(db.LargeBinary())

#     def __init__(self, key, value):
#         self.key = key 
#         self.value = value
#     @staticmethod
#     def get(key):
#         try:
#             return pickle.loads(KeyValue.query.get(key).value)
#         except:
#             return None

#     @staticmethod
#     def set(key, value):
#         value = pickle.dumps(value, pickle.HIGHEST_PROTOCOL)
#         row = KeyValue.query.get(key)
#         if row:
#             row.value = value 
#         else:
#             row = KeyValue(key, value)
#             db.session.add(row) 
#         db.session.commit()


