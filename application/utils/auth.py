from functools import wraps
from flask import request, g, jsonify
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer
from itsdangerous import SignatureExpired, BadSignature
from index import app


import hashlib
import hmac
import base64

TWO_WEEKS = 1209600


def generate_token(user, expiration=TWO_WEEKS):
    s = Serializer(app.config['SECRET_KEY'], expires_in=expiration)
    token = s.dumps(user.to_dict()).decode('utf-8')
    return token


def verify_token(token):
    s = Serializer(app.config['SECRET_KEY'])
    try:
        data = s.loads(token)
    except (BadSignature, SignatureExpired):
        return None
    return data


def requires_auth(f, further_conditions=[]):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', None)
        if token:
            string_token = token.encode('ascii', 'ignore')
            user = verify_token(string_token)
            if user and (len(further_conditions) == 0 or any([f(user, request) for f in further_conditions])):
                g.current_user = user
                return f(*args, **kwargs)

        return jsonify(message="Authentication is required to access this resource"), 401

    return decorated

is_superuser = lambda user, request: user['is_superuser']
is_league_admin = lambda user, request: user['is_league_admin']

def requires_superuser_auth(f):
    return requires_auth(f, [is_superuser])

def requires_league_admin_auth(f):
    return requires_auth(f, [is_league_admin])

def requires_admin_auth(f):
    return requires_auth(f, [is_superuser, is_league_admin])

 
def requires_slack_auth(f,):
    @wraps(f)
    def decorated(*args, **kwargs):
        request_body = request.get_data().decode('utf-8')
        timestamp = request.headers['X-Slack-Request-Timestamp']
        sig_basestring = 'v0:' + timestamp + ':' + request_body

        my_signature = 'v0=' + hmac.new(
            app.config['SLACK_SIGNING_SECRET'].encode('utf-8'), 
            sig_basestring.encode('utf-8'),
            digestmod=hashlib.sha256
        ).hexdigest()
        slacks_signature = request.headers['X-Slack-Signature']

        if hmac.compare_digest(my_signature, slacks_signature):
            app.logger.info('Successful log in')
            return f(*args, **kwargs)
        else:
            app.logger.info('huh. The values are different, weird')
            return f(*args, **kwargs)

    return decorated
