import React from 'react';

import { bindActionCreators } from 'redux';
import { connect }            from 'react-redux';
import * as actionCreators    from '../../actions/league';

import Badge             from 'material-ui/Badge';
import Checkbox          from 'material-ui/Checkbox';
import Dialog            from 'material-ui/Dialog';
import Divider           from 'material-ui/Divider';
import FlatButton        from 'material-ui/FlatButton';
import Paper             from 'material-ui/Paper';
import RaisedButton      from 'material-ui/RaisedButton';
import Table             from 'material-ui/Table/Table';
import TableBody         from 'material-ui/Table/TableBody';
import TableHeader       from 'material-ui/Table/TableHeader';
import TableHeaderColumn from 'material-ui/Table/TableHeaderColumn';
import TableRow          from 'material-ui/Table/TableRow';
import TableRowColumn    from 'material-ui/Table/TableRowColumn';
import TextField         from 'material-ui/TextField';

function mapStateToProps(state) {
  return {
    user: state.auth.data,
    players: state.league.players,
    games: state.league.games,
    league: state.league.league
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actionCreators, dispatch);
}

const Warnable = ({children, warning}) => {
  if(warning){
    return (
      <Badge
        badgeContent={<i className="fas fa-exclamation-circle text-warning"></i>}
      >
        <span className="text-warning">{children}</span>
      </Badge>
    );
  } else {
    return <span>{children}</span>;
  }
}

  

@connect(mapStateToProps, mapDispatchToProps)
class Settings extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = { 
      name :'', 
      email : '',
      password: '',
      password_confirmation: '',
      password_error: '',
      password_confirmation_error:'',
      new_name: '',
      new_email: '',
      editing: {}
    };
  }

  componentDidMount() {

    const {name, email} = this.props.user;
    this.setState({name, email});
    if( ! this.props.players || this.props.players.length == 0){
      this.props.getPlayers(this.props.token);
    }
    if( ! this.props.games || this.props.games.length == 0){
      this.props.getGames(this.props.token);
    }
    if( ! this.props.league){
      this.props.getLeague(this.props.token);
    }
  }

  toggleAdmin = (event, user) => {
    event.preventDefault();
    const token = this.props.token;
    const index = this.state.registered_users.findIndex( i => i.id == user.id );
    const newUser = {...user, is_admin: !user.is_admin};

    update_user(token, newUser)
      .then(parseJSON)
      .then(user => {
        this.setState({
          registered_users: Object.assign(
            [...this.state.registered_users],
            {[index]: user}
          )
        });
      })
  };



  deleteModal = (user) => {
    this.setState({deleteModal: user})
  };



  updatePassword = (password) => {
    if(password.length > 0){
      if(password.length < 6){
        this.setState({password_error:'Too short', password: password});
      } else {
        this.setState({password_error:'', password: password});
      }
      if(password !== this.state.password_confirmation){
        this.setState({password_confirmation_error: 'Passwords do not match'});
      }
    } else {
      this.setState({password_error:'', password: password, password_confirmation_error:''});
    }
  };

  updatePasswordConfirmation = (password) => {
    if(this.state.password.length > 0 && this.state.password !== password){
      this.setState({password_confirmation: password, password_confirmation_error:'Passwords do not match'});
    } else {
      this.setState({password_confirmation: password, password_confirmation_error:''});
    }
  }

  updateUser = (user_id) => {
    if(user_id) {

      this.props.editUser(this.props.token, this.state.editing[user_id]);
      this.setState({
        editing: {
          ...this.state.editing,
          [user_id]: undefined 
        }
      });
    } else {
      const {email, name, password} = this.state;
      const user_id = this.props.user.id;
      this.props.editUser(this.props.token, {email, name, password, id: user_id});
    }
  }

  deleteUser = (user_id) => {
    this.props.deleteUser(this.props.token, {id: user_id});
  };

  handleNameChange(player, event, newValue) {
    event.preventDefault();
    console.log(newValue);
    this.setState({
      editing: {
        ...this.state.editing,
        [player.id]: {
          ...player,
          name: newValue
        }
      }
    });
  }

  handleEmailChange(player, event, newValue) {
    event.preventDefault();
    this.setState({
      editing: {
        ...this.state.editing,
        [player.id]: {
          ...player,
          email: newValue
        }
      }
    });
  }

  handleAdminChange(player) {
    event.preventDefault();
    this.setState({
      editing: {
        ...this.state.editing,
        [player.id]: {
          ...player,
          is_league_admin: !player.is_league_admin
        }
      }
    });
  }


  render() {
    const {editing} = this.state;
    const {is_superuser, is_league_admin, name, email} = this.props.user;
    const {league } = this.props;
    const user_id = this.props.user.id;
    return (
      <div className="container">
        { league &&
          <div className="row">
            <div className="col-md-4">
              <Paper className="with-padding">
                <span>League Name</span><br/>
                <h3><b>{league.name}</b></h3>
              </Paper>
            </div>
            <div className="col-md-4">
              <Paper className="with-padding">
                <span>Registration Code:</span><br/>
                <h3><b>{league.registration_code}</b></h3>
              </Paper>
            </div>
            <div className="col-md-4">
              <Paper className="with-padding">
                <span>Subscription</span><br/>
                <ul>
                  <li>
                    <Warnable
                      warning={ league.current_monthly_games == league.allowed_monthly_games}
                    >
                      <b>Monthly Games:</b> {league.current_monthly_games} / {league.allowed_monthly_games}
                    </Warnable>
                  </li>
                  <li>
                    <Warnable
                      warning={ league.current_users == league.allowed_users}
                    >
                      <b>Users:</b> {league.current_users} / {league.allowed_users}
                    </Warnable>
                  </li>
                  <li>
                    <Warnable
                      warning={ league.month_credits == 0}
                    >
                      <b>Month Credits:</b> {league.month_credits} 
                    </Warnable>
                  </li>
                </ul>
              </Paper>
            </div>
          </div>
        }
        <br/>
        <div className="row">
          <div className="col-md-12">

            <Paper className="with-padding">
              Modify User? <br/>
              <TextField
                className="menu-icon"
                floatingLabelText="Email"
                hint="for@example.com"
                value={this.state.email}
                onChange={(event, newValue) => this.setState({email: newValue})}
              />
              <TextField
                floatingLabelText="Name"
                hint="John 'Pongman' Smith"
                value={this.state.name}
                onChange={(event, newValue) => this.setState({name: newValue})}
              /> <br />

              <TextField
                className="menu-icon"
                floatingLabelText="Update Password (optional)"
                type="password"
                value={this.state.password}
                onChange={(event, newValue) => this.updatePassword(newValue)}
                errorText={this.state.password_error}
              />
              <TextField
                floatingLabelText="Confirm Password"
                type="password"

                value={this.state.password_confirmation}
                onChange={(event, newValue) => this.updatePasswordConfirmation(newValue)}
                errorText={this.state.password_confirmation_error}
              /> <br />

              <RaisedButton
                label="Edit"
                disabled={this.state.password_confirmation_error || this.state.password_error}
                onClick={() => this.updateUser()}
              />
            </Paper>
          </div>
        </div>
        <br/>
        {
          is_league_admin &&

          <div className="row">
            <div className="col-md-12">
              <Paper className="with-padding">
                {
                  this.props.players &&
                  <Table aria-labelledby="Leaderboard" selectable={false} >
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                      <TableRow>
                        <TableHeaderColumn>Email</TableHeaderColumn>
                        <TableHeaderColumn>Name</TableHeaderColumn>
                        <TableHeaderColumn>League Admin?</TableHeaderColumn>
                        <TableHeaderColumn>Edit?</TableHeaderColumn>
                        <TableHeaderColumn>Delete</TableHeaderColumn>
                      </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                    { this.props.players.map( (player, index) => {
                      return (
                        <TableRow key={player.id} >
                          <TableRowColumn>
                            <TextField
                              floatingLabelText="Email"
                              value={editing[player.id] ? editing[player.id].email : player.email}
                              onChange={this.handleEmailChange.bind(this, player)}
                            />
                          </TableRowColumn>
                          <TableRowColumn>
                            <TextField
                              floatingLabelText="Name"
                              value={editing[player.id] ? editing[player.id].name : player.name}
                              onChange={this.handleNameChange.bind(this, player)}
                            />
                          </TableRowColumn>
                          <TableRowColumn>
                            <Checkbox
                              checked={editing[player.id] ? editing[player.id].is_league_admin : player.is_league_admin}
                              disabled={!player.id == this.props.user.id}
                              onClick={this.handleAdminChange.bind(this, player)}
                            />
                          </TableRowColumn>
                          <TableRowColumn>
                            <RaisedButton
                              label="Edit"
                              disabled={!editing[player.id]}
                              onClick={() => this.updateUser(player.id)}
                            />
                          </TableRowColumn>
                          <TableRowColumn>
                            <RaisedButton
                              label="Delete"
                              disabled={!player.id == this.props.user.id}
                              onClick={() => this.deleteUser(player.id)}
                            />
                          </TableRowColumn>
                        </TableRow>
                      );
                    })}
                    </TableBody>
                  </Table>
                }
                <br/>
                <Divider />
                <br/>
                { league && 
                  <span>
                    To add more users, tell them to register at https:/pong.by.nolanhawk.in/register with
                    the registration code "{league.registration_code}"
                  </span>
                }
              </Paper>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default Settings;
