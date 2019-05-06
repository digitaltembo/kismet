/* eslint camelcase: 0, no-underscore-dangle: 0 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect }            from 'react-redux';

import Paper        from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import TextField    from 'material-ui/TextField';
import Toggle       from 'material-ui/Toggle';

import * as actionCreators from '../../actions/auth';
import { validateEmail }   from '../../utils/misc';

function mapStateToProps(state) {
  return {
    isRegistering: state.auth.isRegistering,
    registerStatusText: state.auth.registerStatusText,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actionCreators, dispatch);
}

const style = {
  marginTop: 50,
  paddingBottom: 50,
  paddingTop: 25,
  width: '100%',
  textAlign: 'center',
  display: 'inline-block',
};

@connect(mapStateToProps, mapDispatchToProps)
export default class RegisterView extends React.Component {

  constructor(props) {
    super(props);
    const redirectRoute = '/login';
    this.state = {
      email: '',
      name:'',
      password: '',
      emailErrorText: null,
      passwordErrorText: null,
      redirectTo: redirectRoute,
      disabled: true,
      leagueExists:true,
      leagueName:'',
      registrationCode: ''
    };
  }

  isDisabled() {
    let validEmail = false;
    let validPassword = false;

    if (this.state.email === '') {
      this.setState({
        emailErrorText: null,
      });
    } else if (validateEmail(this.state.email)) {
      validEmail = true;
      this.setState({
        emailErrorText: null,
      });

    } else {
      this.setState({
        emailErrorText: 'Sorry, this is not a valid email',
      });
    }

    if (this.state.password === '' || !this.state.password) {
      this.setState({
        passwordErrorText: null,
      });
    } else if (this.state.password.length >= 6) {
      validPassword = true;
      this.setState({
        passwordErrorText: null,
      });
    } else {
      this.setState({
        passwordErrorText: 'Your password must be at least 6 characters',
      });

    }

    const validLeague = this.state.leagueExists || ( this.state.leagueName != '' && this.state.name != '');

    if (validEmail && validPassword && validLeague) {
      this.setState({
        disabled: false,
      });
    }

  }

  changeValue(e, type) {
    const value = e.target.value;
    const next_state = {};
    next_state[type] = value;
    this.setState(next_state, () => {
      this.isDisabled();
    });
  }

  _handleKeyPress(e) {
    if (e.key === 'Enter') {
      if (!this.state.disabled) {
        this.login(e);
      }
    }
  }

  submit(e) {
    e.preventDefault();
    const {email, password, name, redirectTo, leagueExists, leagueName, registrationCode} = this.state;
    if(leagueExists){
      this.props.registerUser(registrationCode, name, email, password);
    } else {
      this.props.registerLeagueAndUser(leagueName, name, email, password);
    }

  }

  render() {
    const {leagueExists} = this.state;

    return (
      <div className="col-md-6 col-md-offset-3" onKeyPress={(e) => this._handleKeyPress(e)}>
        <Paper style={style}>
          <div className="text-center">
            <h2>Register!</h2>
            {
              this.props.registerStatusText &&
                <div className="alert alert-info">
                  {this.props.registerStatusText}
                </div>
            }

            <div className="col-md-12">
              <Toggle 
                toggled={leagueExists} 
                labelPosition="right"
                label={ (leagueExists) ? "Register Myself (invitation needed)" : "Register And Create League" }
                onToggle={() => this.setState({leagueExists:!leagueExists})}
              />
            </div>
            { 
              (this.state.leagueExists) ? 
                <div className="col-md-12">
                  <TextField
                    hintText="Registration Code"
                    floatingLabelText="Registration Code"
                    type="text"
                    onChange={(e) => this.changeValue(e, 'registrationCode')}
                  />
                </div> :
                <div className="col-md-12">
                  <TextField
                    hintText="League Name"
                    floatingLabelText="Name your League"
                    type="text"
                    onChange={(e) => this.changeValue(e, 'leagueName')}
                  />
                </div>

            }
            <div className="col-md-12">
              <TextField
                hintText="Name"
                floatingLabelText="Your Name"
                type="text"
                onChange={(e) => this.changeValue(e, 'name')}
              />
            </div>
            <div className="col-md-12">
              <TextField
                hintText="Email"
                floatingLabelText="Email"
                type="email"
                errorText={this.state.emailErrorText}
                onChange={(e) => this.changeValue(e, 'email')}
              />
            </div>
            <div className="col-md-12">
              <TextField
                hintText="Password"
                floatingLabelText="Password"
                type="password"
                errorText={this.state.passwordErrorText}
                onChange={(e) => this.changeValue(e, 'password')}
              />
            </div>
            <RaisedButton
              disabled={this.state.disabled}
              style={{ marginTop: 50 }}
              label="Submit"
              onClick={(e) => this.submit(e)}
            />

          </div>
        </Paper>

      </div>
    );

  }
}

RegisterView.propTypes = {
  registerUser: React.PropTypes.func,
  registerStatusText: React.PropTypes.string,
};
