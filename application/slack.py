from flask import request, render_template, jsonify, url_for, redirect, g
from .models import League, User
from index import app, db
from sqlalchemy.exc import IntegrityError
from .utils.auth import requires_slack_auth
import datetime
import re
from .league import get_leaderboard
from .game import record_game
from .stat import FIRST_PLACE, LAST_PLACE, UNUSUALLY_LOW, UNUSUALLY_HIGH, FINE, get_random_quality
import json 
import random
import requests

from .slack_messages import block_message, sections, section, context, divider, actions, button, simple_message, columns

# action types that are passed to the interaction endpoint
GAME_ACTION = 'game'
REJECT_ACTION = 'reject'

registration_help = block_message(
    "Registration Help!",
    sections(
        "Hello :wave:! I'm Kismet, your friendly neighborhood stats tracker. " + 
        "To get started using me, simply follow the steps below:",

        "*:one: Create a League*. If you haven't already, go on down to https://pong.by.nolanhawk.in/register " + 
        "and register a league for yourself",

        "*:two: Recruit your League*. Your Registration Code is shown on the Settings page at " +
        "https://pong.by.nolanhawk.in/settings. Give this to players so that they can register for your league",

        "*:three: Register Slack integration*. To register this slack integration, simply type the command " + 
        "`/kismet register <registration code>`, using the same registration code that was used to register users"
    )
)

registered_help = block_message(
    "Help!",
    sections(
        "Hello :wave:! I'm Kismet. Fate. Destiny. I control all, know all, see all. " + 
        "I care only of your pong game. Tell me how your pong game is going. :table_tennis_paddle_and_ball:",

        "*:one: Record a Game*. Tell me what happened in the game: Type `/kismet @user1 crushed @user2 21-12` " + 
        "or `/kistmet @user1 truly decimated @user2 23-21` or `/kismet @user1 21 @user2 19`. " + 
        "I'll ask to make sure I understood it correctly but like I'll probably understand correctly",

        "*:two: Check out the current leaderboard*. See the top 10 players in your league right now " + 
        "(and where or if you stand in them) with `/kismet leaderboard`",


        "*:three: See how you are doing*. Check out your current stats with `/kismet how am I?`",


        "*:four: Find a worthy opponent*. Pick who you should play with next with `/kismet who should I play?` " + 
        "or a more terse `/kistmet who`",
    ) + [
        divider(), 
        context(
            ":question: Get help at any time with `/kismet help`, and remember this is all accessible on our website, " + 
            "pong.by.nolanhawk.in"
        )
    ]
)


@app.route("/api/slack/command", methods=["POST"])
@requires_slack_auth
def slack_command():
    team_id = request.form['team_id']
    league = League.query.filter_by(slack_team_id=team_id).first()
    if not league:
        return maybe_register(team_id, request.form['text'].lower())

    slack_user_id = request.form['user_id']
    user = User.query.filter_by(league_id=league.id, slack_user_id=slack_user_id).first()

    text = request.form['text'].lower()
    parsers = [parse_as_help, parse_as_sentance, parse_as_simple, parse_as_leaderboard, parse_as_how, parse_as_who]

    for parser in parsers:
        parsed = parser(text, league, user)
        if parsed:
            return parsed 
    return jsonify(simple_message("Hmm?"))

def maybe_register(team_id, text):
    words = text.split(' ')
    if words and words[0].lower() == 'register':
        registration_code = words[1]
        league = League.query.filter_by(registration_code = registration_code).first()
        if league:
            league.slack_team_id = team_id
            db.commit()
            return jsonify(simple_message("Registered as Slack integration for Kismet league \"{}\"".format(league.name)))
        else:
            return jsonify(simple_message("Found no Kismet league with a registration code of \"{}\"".format(registration_code)))
    else:
        return jsonify(registration_help)

def parse_as_help(text, league, user):
    if text == 'help':
        return jsonify(registered_help)
    else:
        return None 

sentance_regex = re.compile("\<\@([a-z0-9]+)?(?:\|\w+)\>.*\<\@([a-z0-9]+)?(?:\|\w+)\>\s*(\d{1,2})(?:(?: ?\- ?)|(?:\s*to\s*))(\d{1,2})")
def parse_as_sentance(text, league, user):
    match = sentance_regex.match(text)
    if match:
        (winner, loser, winner_score, loser_score) = match.groups()
        winner_score = int(winner_score)
        loser_score = int(loser_score)
        winner_score, loser_score = (winner_score, loser_score) if (winner_score > loser_score) else (loser_score, winner_score)
        return confirm_recorded_game(league, winner, winner_score, loser, loser_score)
    else:
        return None

simple_regex = re.compile("\<\@([a-z0-9]+)?(?:\|\w+)\>\s*(\d{1,2})\s*\<\@([a-z0-9]+)?(?:\|\w+)\>\s*(\d{1,2})")
def parse_as_simple(text, league, user):
    app.logger.info("HEY - " + text)
    match = simple_regex.match(text)
    if match:
        (user1, user1_score, user2, user2_score) = match.groups()
        user1_score = int(user1_score)
        user2_score = int(user2_score)
        return confirm_recorded_game(league, user1, user1_score, user2, user2_score)
    else:
        return None

numbers = ['one','two','three','four','five','seven','eight','nine','keycap_ten']
def parse_as_leaderboard(text, league, user):
    if text == 'leaderboard':
        top_users = get_leaderboard(league.id)[:10]
        get_rank_message = lambda i: section(
            "*:{}: {}* ({}){}".format(
                numbers[i], 
                top_users[i]['name'], 
                top_users[i]['elo'], 
                ' :point_left: this is you' if user and top_users[i]['id'] == user.id else ''
            )
        )

        ranks = [get_rank_message(i) for i in range(len(top_users))]
        return jsonify(block_message(
            "Leaderboard!",
            [section("The current leaderboard:")] + ranks
        ))
    else:
        return None

QUALITIES = {
    FIRST_PLACE : [
        'You are in first place for {}! Keep up the good work', 
        'Wow: great job on {}, you are #1', 
        '#1 #1 #1 !!!! in: {}',
        '*NO ONE* is better than you at {}'
    ], 
    LAST_PLACE : [
        'You are in last place for {} :( I bet you can do better! Keep trying! And have you considered: sabotaging your enemies?',
        'Your {} is a wee bit sad and a wee bit worse than everyone elses.',
        'I would suggest improving your {}, everyone else is better'
    ], 
    UNUSUALLY_LOW : [
        'Well you don\'t have the worst {}, but you *ARE* significantly worse than usual'
        'I think you could pump up your {} so that you are like, kinda average',
        'I\'ve seen better {}, and in fact most people _are_ better than you'
    ], 
    UNUSUALLY_HIGH : [
        'Cool {}! It is almost the best!',
        'u r *SIGNIFICANT*. As in: significantly above the normal distribution in {}'
    ], 
    FINE : [
        'Well I can say this about you: your {} is fine',
        'You don\'t have the best {}, you don\'t have the worst',
        'I guess: you have an averagish {}? Congrats on not being worse?',
        'I mean you *could* improve your {}, but you could also be worse',
        'Hey! There are _several_ players who have a worse {} than you!! I mean, not all, and really there are a significant number better than you.'
    ]
}

def parse_as_how(text, league, user):
    if text == 'how' or text.startswith('how am i'):
        algo, ranking = get_random_quality(user)
        return jsonify(simple_message(random.choice(QUALITIES[ranking]).format(algo)))
    else:
        return None

WHOS = [
    "I think it looks like a good time to challenge {}",
    "{} is a total sucker, I bet you could *DESTROY* them",
    "Now I think is a good time to play some ping pong against {}",
    "You. {}. The Ping Pong Table. Who will win and conquer the hearts of the populace?",
    "I know for a fact that {} is free right now. If they say otherwise, it's just because of cowardice",
    "It is my earnest wish that you challenge {}",
    "After much consideration I believe a competition between you and {} would be optimal"
]

def parse_as_who(text, league, user):
    if text == 'who' or text.startswith('who should'):
        challenger = random.choice([u.name for u in league.users if u.id != user.id])
        challenge = random.choice(WHOS)
        return jsonify(simple_message(challenge.format(challenger)))
    else:
        return None

def get_user(league, slack_id):
    user = User.query.filter_by(league_id=league.id, slack_user_id=slack_id.upper()).first()
    if user:
        return True, user 
    else:
        return False, jsonify({"text":"Hey so uh I don't know this person"})


defeated_words = [
    '*demolished*', 'beat', 'beat', 'beat', 
    '*crushed*', '*vanquished*', 'defeated', '*bodied*', 
    '*outplayed*', '*trounced*', '*overwhelmed*', 
    '*pummeled*'
]

def confirm_recorded_game(league, user1_slack_id, user1_score, user2_slack_id, user2_score):
    success1, result1 = get_user(league, user1_slack_id)
    if not success1:
        return result1
    success2, result2 = get_user(league, user2_slack_id)
    if not success2:
        return result2
    return jsonify(block_message(
        "So <@{}> beat <@{}>?".format(user1_slack_id, user2_slack_id),
        [
            section(
                "So you are saying {} {} {}, {} to {}?".format(
                    result1.name, 
                    random.choice(defeated_words), 
                    result2.name, 
                    user1_score, 
                    user2_score
                )
            ),
            actions(
                [
                    button(
                        "Yeah",
                        GAME_ACTION, 
                        {
                            "league_id": league.id,
                            "user1_id": result1.id,
                            "user1_slack_id": user1_slack_id,
                            "user1_score": user1_score,
                            "user2_id": result2.id,
                            "user2_score": user2_score,
                            "user2_slack_id": user2_slack_id
                        },
                        "primary"
                    ),
                    button(
                        "Nah",
                        REJECT_ACTION,
                        {},
                        "danger"
                    )
                ]
            )
        ]
    ))

    # result = record_game(league.id, result1, user1_score, result2, user2_score)
    # if result['result'] == 'BILLING NEEDED':
    #     return jsonify({"text":"I'm sorry, your current subscription will not let you record an additional game"})
    # else:
    # return jsonify({"text":"Cool yeah I did that thing you asked me to do"})


@app.route("/api/slack/interaction", methods=["POST"])
@requires_slack_auth
def slack_interaction():
    slack_payload = json.loads(request.form['payload'])
    response_url = slack_payload['response_url']
    action = slack_payload['actions'][0]
    value = json.loads(action['value'])

    if value['type'] == GAME_ACTION:
        record_game_from_action(response_url, value['payload'])
    elif value['type'] == REJECT_ACTION:
        do_other_thing(response_url)
    return '', 200

def record_game_from_action(response_url, data):
    record_game(data['league_id'], data['user1_id'], data['user1_score'], data['user2_id'], data['user2_score'])
    # result = {'winner':{'name':'Nolan'}, 'loser':{'name':'everyone'}, 'winner_stat':{'elo':'infinity'}, 'loser_stat':{'elo':'not as high'},'game':{'winner_score':21,'loser_score'}}


def send_game_result(league, winner_name, winner_score, winner_rank, winner_elo, loser_name, loser_score, loser_rank, loser_elo):
    if league.slack_webhook:
        send_slack_message(league.slack_webhook, block_message(
            'Match Recorded',
            [
                divider(),
                section(
                    "*Match Recorded!* :table_tennis_paddle_and_ball: :scream_cat: " +
                    "{} {} {} {} to {} :scream_cat: :table_tennis_paddle_and_ball:".format(
                        winner_name,
                        random.choice(defeated_words),
                        loser_name,
                        winner_score,
                        loser_score
                    )
                ),
                divider(),
                columns(
                    [":arrow_up: {} ({}), Rank #{}".format(winner_name, int(winner_elo), winner_rank)],
                    [":arrow_down: {} ({}), Rank #{}".format(loser_name, int(loser_elo), loser_rank)]
                ),
                context(
                    ":question: See more details <https://pong.by.nolanhawk.in/leaderboard|on the website>" 
                )
            ]
        ))

def do_other_thing(response_url):
    send_slack_message(response_url, block_message('Cool', [section('This is a test pls ignore')]))

def send_slack_message(request_url, json):
    r = requests.post(request_url, json=json)
