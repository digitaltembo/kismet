import os

from setup import basedir


class BaseConfig(object):
    SECRET_KEY = os.environ['KISMET_SECRET'] if 'KISMET_SECRET' in os.environ else 'SO_SECRET'
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']
    SQLALCHEMY_TRACK_MODIFICATIONS = True
    UPLOAD_FOLDER = os.path.join(basedir, 'uploads')


class TestingConfig(object):
    """Development configuration."""
    TESTING = True
    DEBUG = True
    WTF_CSRF_ENABLED = False
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    DEBUG_TB_ENABLED = True
    PRESERVE_CONTEXT_ON_EXCEPTION = False
    UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
