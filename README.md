# Kismet.js

This project is a web-application for keeping track of of the results of 1v1 games using the [Elo rating system](https://en.wikipedia.org/wiki/Elo_rating_system). It remembers games, calculates Elo scores and other statistics, generates graphs, and endeavors to foment competition.
In particular, it is themed around keeping track of ping pong in the workplace, but could theoretically be used for a wide variety of things.

![List of features include leaderboard, game list, analysis, graphs, and a slack integration](https://raw.githubusercontent.com/digitaltembo/kismet/master/static/Features.jpg)
## How its made

Specifically, it is a simple web-server that I have running on a Raspberry Pi (please don't break it) that I am using with Nginx and Gunicorn, with SSL provided by certbot/letsencrypt, written using the python web framework Flask and sqlite for a DB, using React and Redux for the front end. It is based on the boilerplate project [React-Redux-Flask](https://github.com/dternyak/React-Redux-Flask). The back-end APIs are also used to power an associated Slack integration. It has been pretty fun!

## Running it locally

Running the Flask/React app locally and doing development is super easy, most changes to any frontend or backend code (python, JS, CSS) are loaded pretty quickly into the running application. To get this running locally you need to:

### 1. Install the dependencies

To install the python dependencies, you need python3 and pip
```
$ python3 -m venv venv        # Creates a python3 virtual environment
$ source venv/bin/activate    # puts your terminal into that virtual environment
$ pip install -r requirements # installs the requirements
```
To install the js dependencies, I use npm version 5.6.0.
``` 
$ cd static
$ npm install
```

These steps should take a bit, and may require some finagling with outside dependencies (apt/brew) depending on your machine.

### 2. Prepare the DB

I use sqlite, but technically it should work with postgres or mysql as well; the project uses [SQLAlchemy](https://www.sqlalchemy.org/) with [Alembic](https://alembic.sqlalchemy.org/en/latest/) for DB management.

To specify the DB, it is necessary that you set the environment variable `DATABASE_URL`. You can use 
```
$ export DATABASE_URL="postgresql://username:password@localhost/mydatabase"
or
$ export DATABASE_URL="mysql+mysqlconnector://username:password@localhost/mydatabase"
or
$ export DATABASE_URL="sqlite:///your.db"
```
(I put this definition in the venv/bin/activate bash script, but it just needs to be accessible whenever you run the server)

Having specified the DATABASE_URL, and while within the python virtual environment, run 
```
$ python manage.py create_db # (this creates the DB)
$ python manage.py db upgrade # (this runs any and all unrun migrations)
```

(In general, use `python manage.py db migrate` to generate the necessary migration files from changes to the `models.py` file, and `python manage.py db upgrade` to run these migrations)

### 3. Run in development mode

To run the Flask backend, while in the python3 virtual environment do
```
$ python manage.py runserver
```

To run the node frontend, do
```
cd static
npm start
```

(To compile the frontend, do `npm run build:production`) 
