/* eslint camelcase: 0, no-underscore-dangle: 0 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';
import Paper from 'material-ui/Paper';

import * as actionCreators from '../actions/auth';

import { validateEmail } from '../utils/misc';

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
            email_error_text: null,
            password_error_text: null,
            redirectTo: redirectRoute,
            disabled: true,
            league_exists:true,
            league_name:''
        };
    }

    isDisabled() {
        let email_is_valid = false;
        let password_is_valid = false;

        if (this.state.email === '') {
            this.setState({
                email_error_text: null,
            });
        } else if (validateEmail(this.state.email)) {
            email_is_valid = true;
            this.setState({
                email_error_text: null,
            });

        } else {
            this.setState({
                email_error_text: 'Sorry, this is not a valid email',
            });
        }

        if (this.state.password === '' || !this.state.password) {
            this.setState({
                password_error_text: null,
            });
        } else if (this.state.password.length >= 6) {
            password_is_valid = true;
            this.setState({
                password_error_text: null,
            });
        } else {
            this.setState({
                password_error_text: 'Your password must be at least 6 characters',
            });

        }

        const league_valid = this.state.league_exists || ( this.state.league_name != '' && this.state.name != '');

        if (email_is_valid && password_is_valid && league_valid) {
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
        const {email, password, name, redirectTo, league_exists, league_name} = this.state;
        if(league_exists){
            this.props.registerUser(email, password);
        } else {
            this.props.registerLeagueAndUser(league_name, name, email, password);
        }

    }

    render() {
        const {league_exists} = this.state;

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
                                toggled={league_exists} 
                                labelPosition="right"
                                label={ (league_exists) ? "Register Myself (invitation needed)" : "Register And Create League" }
                                onToggle={() => this.setState({league_exists:!league_exists})}
                            />
                        </div>
                        { 
                            (!this.state.league_exists) &&
                            <div>
                                <div className="col-md-12">
                                    <TextField
                                      hintText="League Name"
                                      floatingLabelText="Name your League"
                                      type="text"
                                      onChange={(e) => this.changeValue(e, 'league_name')}
                                    />
                                </div>
                                <div className="col-md-12">
                                    <TextField
                                      hintText="Name"
                                      floatingLabelText="Your Name"
                                      type="text"
                                      onChange={(e) => this.changeValue(e, 'name')}
                                    />
                                </div>
                            </div>
                        }
                        <div className="col-md-12">
                            <TextField
                              hintText="Email"
                              floatingLabelText="Email"
                              type="email"
                              errorText={this.state.email_error_text}
                              onChange={(e) => this.changeValue(e, 'email')}
                            />
                        </div>
                        <div className="col-md-12">
                            <TextField
                              hintText="Password"
                              floatingLabelText="Password"
                              type="password"
                              errorText={this.state.password_error_text}
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
