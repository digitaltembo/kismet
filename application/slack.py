from flask import request, render_template, jsonify, url_for, redirect, g
from .models import League
from index import app, db
from sqlalchemy.exc import IntegrityError
from .utils.auth import requires_slack_auth
import datetime

@app.route("/api/slack/command", methods=["POST"])
@requires_slack_auth
def slack_command():
    data = request.form
    print(data)
    return jsonify({
        "text": "It's 80 degrees right now."
    })