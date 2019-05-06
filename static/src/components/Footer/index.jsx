import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import AppBar from 'material-ui/AppBar';
import LeftNav from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';

import * as actionCreators from '../../actions/auth';

function mapStateToProps(state) {
  return {
    token: state.auth.token,
    userName: state.auth.userName,
    isAdmin: state.auth.isAdmin,
    isAuthenticated: state.auth.isAuthenticated,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actionCreators, dispatch);
}

@connect(mapStateToProps, mapDispatchToProps)
export class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };

  }

  dispatchNewRoute(route) {
    browserHistory.push(route);
    this.setState({
      open: false,
    });

  }


  handleClickOutside() {
    this.setState({
      open: false,
    });
  }


  logout(e) {
    e.preventDefault();
    this.props.logoutAndRedirect();
    this.setState({
      open: false,
    });
  }

  openNav() {
    this.setState({
      open: true,
    });
  }

  sticky = {
    width: '100%',
    position: 'fixed',
    bottom: 0,
  };

  render() {
    return (
      <footer>
        <Paper zDepth={1}>
          { 
            (this.props.isAuthenticated) ? (
              <BottomNavigation selectedIndex={this.state.selectedIndex} style={this.sticky}>
                <BottomNavigationItem
                  label="Leaderboard"
                  icon={<i className="fas fa-award"></i>}
                  onClick={() => this.dispatchNewRoute('/leaderboard')}
                />
                <BottomNavigationItem
                  label="Record Match"
                  icon={<i className="fas fa-fist-raised"></i>}
                  onClick={() => this.dispatchNewRoute('/record')}
                />
                <BottomNavigationItem
                  label="Settings"
                  icon={<i className="fas fa-cogs"></i>}
                  onClick={() => this.dispatchNewRoute('/settings')}
                />
                <BottomNavigationItem
                  label="Logout"
                  icon={<i className="fas fa-sign-out-alt"></i>}
                  onClick={(event) => this.logout(event)}
                />
              </BottomNavigation>
            ) : (
              
              <BottomNavigation selectedIndex={this.state.selectedIndex} style={this.sticky}>
                <BottomNavigationItem
                  label="About"
                  icon={<i className="fas fa-info-circle"></i>}
                  onClick={() => this.dispatchNewRoute('/about')}
                />
                <BottomNavigationItem
                  label="Login"
                  icon={<i className="fas fa-sign-in-alt"></i>}
                  onClick={() => this.dispatchNewRoute('/login')}
                />
                <BottomNavigationItem
                  label="Register"
                  icon={<i className="fas fa-user-plus"></i>}
                  onClick={() => this.dispatchNewRoute('/register')}
                />
              </BottomNavigation>
            )
          }
        </Paper>
      </footer>

    );
  }
}

Footer.propTypes = {
  logoutAndRedirect: React.PropTypes.func,
  isAuthenticated: React.PropTypes.bool,
};
