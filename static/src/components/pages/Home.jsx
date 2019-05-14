import React from 'react';
import { Link } from 'react-router';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';


const builtWithStyle = {
  border: "1px solid #777",
  borderRadius: "5px",
  margin: "0 10px"
};
const BuiltWith = ({label, icon, href}) =>
  <BottomNavigationItem
    label={label}
    icon={<i className={icon}></i>}
    style={builtWithStyle}
    onClick={() => window.location.href = href}
  />;

const Home = () =>
  <section>
    <div className="container text-center">
      <h1>Kismet.js</h1>
      <h2><i>Become your destiny</i></h2>
      <hr/>


      <p> Using interstitial cloud technologies <i className="fas fa-cloud"></i></p>
      <p> And the latest of hatchback optimization <i className="fas fa-swatchbook"></i></p>
      <p> 
        We will bring your previously casual ping pong game to an altogether <b>new level</b> in <b>unhealthy competition,
        useless statistics, </b> and <b>predictive forecasting</b>.
      </p>
      <p>
        Embroil yourself in competition. <Link to="/register">Create your league today.</Link>
      </p>
      <img src="static/Features.jpg" className="collage"alt="List of features include leaderboard, game list, analysis, graphs, and a slack integration"/>
      <figcaption className="figureCaption">Some of the paradigm-shifting features you would get if <b>you</b> used Kismet.js</figcaption>
      <hr />
      <p>Built With:</p>
      <BottomNavigation>
        <BuiltWith
          label="NginX"
          icon="fas fa-server"
          href="https://www.nginx.com/"
        />
        <BuiltWith
          label="Gunicorn"
          icon="fas fa-random"
          href="https://gunicorn.org/"
        />
        <BuiltWith
          label="SQLite"
          icon="fas fa-database"
          href="https://www.sqlite.org/index.html"
        />
        <BuiltWith
          label="Flask"
          icon="fab fa-python"
          href="http://flask.pocoo.org/"
        />
        <BuiltWith
          label="React"
          icon="fab fa-react"
          href="https://reactjs.org/"
        />
        <BuiltWith
          label="Bootstrap"
          icon="fab fa-bootstrap"
          href="https://getbootstrap.com/"
        />
        <BuiltWith
          label="Material UI"
          icon="fas fa-magic"
          href="https://material-ui.com/"
        />
        <BuiltWith
          label="Font Awesome"
          icon="fab fa-font-awesome"
          href="https://fontawesome.com/"
        />
        <BuiltWith
          label="Love"
          icon="fas fa-heart"
          href="https://en.wikipedia.org/wiki/Love"
        />

      </BottomNavigation>
    </div>

  </section>;

export default Home;