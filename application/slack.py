from flask import request, render_template, jsonify, url_for, redirect, g
from .models import League
from index import app, db
from sqlalchemy.exc import IntegrityError
from .utils.auth import requires_slack_auth
import datetime
import re

@app.route("/api/slack/command", methods=["POST"])
@requires_slack_auth
def slack_command():
    team_id = request.form['team_id']
    league = League.query.filter_by(slack_team_id=team_id).first()

    if not league:
        return jsonify({'text':"Sorry, something horrible has happened and I don't know what is happening. Please call back"})

    text = request.form['text'].lower()
    parsers = [parse_as_help, parse_as_sentance, parse_as_simple, parse_as_leaderboard]

    for parser in parsers:
        parsed = parser(league, text)
        if parsed:
            return parsed 

    return jsonify({'text':"Hmm?"})



help_message = [
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "Hello :wave:! I'm Kismet. Fate. Destiny. I control all, know all, see all. " + 
                    "I care only of your pong game. Tell me how your pong game is going. :table_tennis_paddle_and_ball:"
        }
    },
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "*:one: Record a Game*. Tell me what happened in the game: Type `/kismet @user1 crushed @user2 21-12` " + 
                    "or `/kistmet @user1 truly decimated @user2 23-21` or `/kismet @user1 21 @user2 19`. " + 
                    "I'll ask to make sure I understood it correctly but like I'll probably understand correctly"
        }
    },
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "*:two: Check out the current leaderboard*. See the top 10 players in your league right now " + 
                    "(and where or if you stand in them) with `/kismet leaderboard`"
        }
    },
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "*:three: See how you are doing*. Check out your current stats with `/kismet how am I?`"
        }
    },
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "*:four: Find a worthy opponent*. Pick who you should play with next with `/kismet who should I play?` " + 
                    "or a more terse `/kistmet who`"
        }
    },
    {
        "type": "divider"
    },
    {
        "type": "context",
        "elements": [
            {
                "type": "mrkdwn",
                "text": ":question: Get help at any time with `/kismet help`, and remember this is all accessible on our website, " + 
                        "pong.by.nolanhawk.in"
            }
        ]
    }
]

def parse_as_help(league, text):
    if text == 'help':
        return jsonify(help_message)
    else:
        return None 

sentance_regex = re.compile("\<\@([A-Z0-9]+)?(?:\|\w+)\>.*\<\@([A-Z0-9]+)?(?:\|\w+)\>\s*(\d{1,2})(?:(?: ?\- ?)|(?:\s*to\s*))(\d{1,2})")
def parse_as_sentance(league, text):
    match = sentance_regex.match(text)
    if match:
        (winner, loser, winner_score, loser_score) = match.groups()
        winner_score = int(winner_score)
        loser_score = int(loser_score)
        winner_score, loser_score = winner_score, loser_score if winner_score > loser_score else loser_score, winner_score
        return record_game(winner, winner_score, loser, loser_score)
    else:
        return None

simple_regex = re.compile("\<\@([A-Z0-9]+)?(?:\|\w+)\>\s*(\d{1,2})\s*\<\@([A-Z0-9]+)?(?:\|\w+)\>\s*(\d{1,2})")
def parse_as_simple(league, text):
    match = simple_regex.match(text)
    if match:
        (user1, user1_score, user2, user2_score) = match.groups()
        user1_score = int(user1_score)
        user2_score = int(user2_score)
        return record_game(user1, user1_score, user2, user2_score)
    else:
        return None

numbers = ['one','two','three','four','five','seven','eight','nine','keycap_ten']
def parse_as_leaderboard(league, text):
    if text == 'leaderboard':
        top_users = get_leaderboard(league.id)[:10]
        get_rank_message = lambda i: {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*:{}: {}* ({})".format(numbers[i], top_users[i]['name'], top_users[i]['elo'])
            }
        }

        ranks = [get_rank_message(i, top_users[i]) for i in range(len(top_users))]
        return jsonify([{
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "The current leaderboard:"
            }
        }] + ranks)
    else:
        return None

def record_game(user1, user1_score, user2, user2_score):
    return jsonify({"text":"Eh, maybe later, not super feeling it right now"})







