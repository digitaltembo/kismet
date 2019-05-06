/* eslint camelcase: 0, no-underscore-dangle: 0 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Paper        from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import TextField    from 'material-ui/TextField';

import * as actionCreators from '../../actions/auth';
import { validateEmail } from '../../utils/misc';

function mapStateToProps(state) {
  return {
    isAuthenticating: state.auth.isAuthenticating,
    statusText: state.auth.statusText,
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
export default class LoginView extends React.Component {

  constructor(props) {
    super(props);
    const redirectRoute = '/login';
    this.state = {
      email: '',
      password: '',
      emailErrorText: null,
      passwordErrorText: null,
      redirectTo: redirectRoute,
      disabled: true,
    };
  }

  isDisabled() {
    let email_is_valid = false;
    let password_is_valid = false;

    if (this.state.email === '') {
      this.setState({
        emailErrorText: null,
      });
    } else if (validateEmail(this.state.email)) {
      email_is_valid = true;
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
      password_is_valid = true;
      this.setState({
        passwordErrorText: null,
      });
    } else {
      this.setState({
        passwordErrorText: 'Your password must be at least 6 characters',
      });

    }

    if (email_is_valid && password_is_valid) {
      this.setState({
        disabled: false,
      });
    }

  }

  changeValue(e, type) {
    const value = e.target.value;
    const nextState = {};
    nextState[type] = value;
    this.setState(nextState, () => {
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

  login(e) {
    e.preventDefault();
    this.props.loginUser(this.state.email, this.state.password, this.state.redirectTo);
  }

  render() {
    return (
      <div className="col-md-6 col-md-offset-3" onKeyPress={(e) => this._handleKeyPress(e)}>
        <Paper style={style}>
          <form role="form">
            <div className="text-center">
              <h2>Login to view protected content!</h2>
              {
                this.props.statusText &&
                  <div className="alert alert-info">
                    {this.props.statusText}
                  </div>
              }

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
                onClick={(e) => this.login(e)}
              />

            </div>
          </form>
        </Paper>

      </div>
    );

  }
}

LoginView.propTypes = {
  loginUser: React.PropTypes.func,
  statusText: React.PropTypes.string,
};
