import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actionCreators from '../actions/players';
import Table from 'material-ui/Table/Table';
import TableBody from 'material-ui/Table/TableBody';
import TableRowColumn from 'material-ui/Table/TableRowColumn';
import TableHeaderColumn from 'material-ui/Table/TableHeaderColumn';
import TableHeader from 'material-ui/Table/TableHeader';
import TableRow from 'material-ui/Table/TableRow';
import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import { get_users, delete_user, approve_user, remove_user_approval } from '../utils/http_functions';
import { parseJSON } from '../utils/misc';

function mapStateToProps(state) {
    return {
        user: state.auth.data,
        players: state.players.players,
        games:state.players.games
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(actionCreators, dispatch);
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
            new_email: ''
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

    deleteUser = (user) =>  {
        const token = this.props.token;
        if(user.registered){
            delete_user(token, user)
                .then(parseJSON)
                .then(() => {
                    this.setState({
                        registered_users: this.state.registered_users.slice().filter( i => i.id != user.id),
                    })
                });
        } else {
            remove_user_approval(token, user)
                .then(parseJSON)
                .then(() => {
                    this.setState({
                        unregistered_users: this.state.unregistered_users.slice().filter( i => i.id != user.id)
                    })
                });
        }
        this.setState({deleteModal: false});
    }

    deleteModal = (user) => {
        this.setState({deleteModal: user})
    };

    approveUser = () => {
        const token = this.props.token;
        approve_user(token, {email: this.state.approvingUser})
            .then(parseJSON)
            .then(user => {
                this.setState({
                    unregistered_users: [...this.state.unregistered_users, user],
                    approvingUser: ""
                })
            });
    }


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

    updateUser = () => {
        const {email, name, password} = this.state;
        const user_id = this.props.user.id;
        this.props.editUser(this.props.token, {email, name, password, id: user_id});
    }

    addUser = () => {
        this.props.addUser(this.props.token, {email: this.state.new_email, name: this.state.new_name});
    };



    render() {
        const {is_superuser, is_league_admin, name, email} = this.props.user;
        const user_id = this.props.user.id;
        return (
            <div className="col-md-8">
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
                <br />
                { 
                    (is_league_admin) && 

                    <Paper className="with-padding">
                        Add User? <br/>
                        <TextField
                            className="menu-icon"
                            floatingLabelText="Email"
                            hint="for@example.com"
                            value={this.state.new_email}
                            onChange={(event, newValue) => this.setState({new_email: newValue})}
                        />
                        <TextField
                            floatingLabelText="Name"
                            hint="John 'Pongman' Smith"
                            value={this.state.new_name}
                            onChange={(event, newValue) => this.setState({new_name: newValue})}
                        /> <br />

                        <RaisedButton
                            label="Add"
                            disabled={this.state.new_email == '' || this.state.new_name == ''}
                            onClick={() => this.addUser()}
                        />
                    </Paper>
                }


            </div>
        );
    }
}

export default Settings;



            //     <Dialog
            //         title="Delete user?"
            //         actions={[
            //             <FlatButton
            //                 label="Cancel"
            //                 primary={true}
            //                 onClick={() => this.deleteModal(false)}
            //             />,
            //             <FlatButton
            //                 label="Submit"
            //                 primary={true}
            //                 onClick={() => this.deleteUser(this.state.deleteModal)}
            //             />,
            //         ]}
            //         modal={true}
            //         open={this.state.deleteModal !== false}
            //     >
            //       { this.state.deleteModal && <span>Are you sure you want to delete the user {this.state.deleteModal.email}?</span> }
            //     </Dialog>


            //     <h1>Users</h1>
            //     <hr />
            //     <Table className="movies" aria-labelledby="movies"  selectable={false}>
            //         <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            //             <TableRow>
            //                 <TableHeaderColumn>email</TableHeaderColumn>
            //                 <TableHeaderColumn>admin?</TableHeaderColumn>
            //                 <TableHeaderColumn>registered?</TableHeaderColumn>
            //                 <TableHeaderColumn>delete?</TableHeaderColumn>
            //             </TableRow>
            //         </TableHeader>
            //         <TableBody displayRowCheckbox={false}>
            //             {registered_users.map( user => (
            //                 <TableRow key={user.id}>
            //                     <TableRowColumn>{user.email}</TableRowColumn>
            //                     <TableRowColumn><Checkbox checked={user.is_admin} disabled={user.email == this.props.userName} onClick={(event) => this.toggleAdmin(event, user)} /></TableRowColumn>
            //                     <TableRowColumn><Checkbox disabled={true} checked={true}/></TableRowColumn>
            //                     <TableRowColumn><RaisedButton label="Delete?" disabled={user.email == this.props.userName} onClick={() => this.deleteModal({...user, registered:true})} /></TableRowColumn>
            //                 </TableRow>
            //             ))}
            //             {unregistered_users.map( user => (
            //                 <TableRow key={user.id}>
            //                     <TableRowColumn>{user.email}</TableRowColumn>
            //                     <TableRowColumn><Checkbox disabled={true} checked={false}/></TableRowColumn>
            //                     <TableRowColumn><Checkbox disabled={true} checked={false}/></TableRowColumn>
            //                     <TableRowColumn><RaisedButton label="Unapprove?" onClick={() => this.deleteModal({...user, registered:false})}/></TableRowColumn>
            //                 </TableRow>
            //             ))}
            //             <TableRow>
            //                 <TableRowColumn>
            //                     <TextField 
            //                         floatingLabelText="Approve User" 
            //                         hintText="email@some.address" 
            //                         value={this.state.approvingUser}
            //                         onChange={(event, newValue) => this.setState({approvingUser: newValue})}
            //                     /> 
            //                 </TableRowColumn>
            //                 <TableRowColumn>
            //                     <RaisedButton label="Add" onClick={this.approveUser}/>
            //                 </TableRowColumn>
            //             </TableRow>
            //         </TableBody>
            //     </Table>

            // </div>
