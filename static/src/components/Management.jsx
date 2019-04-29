import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actionCreators from '../actions/auth';
import Table from 'material-ui/Table/Table';
import TableBody from 'material-ui/Table/TableBody';
import TableRowColumn from 'material-ui/Table/TableRowColumn';
import TableHeaderColumn from 'material-ui/Table/TableHeaderColumn';
import TableHeader from 'material-ui/Table/TableHeader';
import TableRow from 'material-ui/Table/TableRow';
import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import { get_users, update_user, delete_user, approve_user, remove_user_approval } from '../utils/http_functions';
import { parseJSON } from '../utils/misc';

function mapStateToProps(state) {
    return {
        isAdmin: state.auth.isAdmin
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(actionCreators, dispatch);
}

@connect(mapStateToProps, mapDispatchToProps)
class Management extends React.Component { // eslint-disable-line react/prefer-stateless-function
    constructor() {
        super();
        this.state = {
            registered_users: [],
            unregistered_users: [],
            deleteModal: false,
            approvingUser: ""
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        const token = this.props.token;
        get_users(token)
            .then(parseJSON)
            .then(j => {console.log(j); return j})
            .then(response => {
                this.setState({
                    registered_users: response.registered_users,
                    unregistered_users: response.unregistered_users
                });
            })
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

    render() {
        const {registered_users, unregistered_users} = this.state;
        return (
            <div className="col-md-8">
                <Dialog
                    title="Delete user?"
                    actions={[
                        <FlatButton
                            label="Cancel"
                            primary={true}
                            onClick={() => this.deleteModal(false)}
                        />,
                        <FlatButton
                            label="Submit"
                            primary={true}
                            onClick={() => this.deleteUser(this.state.deleteModal)}
                        />,
                    ]}
                    modal={true}
                    open={this.state.deleteModal !== false}
                >
                  { this.state.deleteModal && <span>Are you sure you want to delete the user {this.state.deleteModal.email}?</span> }
                </Dialog>


                <h1>Users</h1>
                <hr />
                <Table className="movies" aria-labelledby="movies"  selectable={false}>
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow>
                            <TableHeaderColumn>email</TableHeaderColumn>
                            <TableHeaderColumn>admin?</TableHeaderColumn>
                            <TableHeaderColumn>registered?</TableHeaderColumn>
                            <TableHeaderColumn>delete?</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        {registered_users.map( user => (
                            <TableRow key={user.id}>
                                <TableRowColumn>{user.email}</TableRowColumn>
                                <TableRowColumn><Checkbox checked={user.is_admin} disabled={user.email == this.props.userName} onClick={(event) => this.toggleAdmin(event, user)} /></TableRowColumn>
                                <TableRowColumn><Checkbox disabled={true} checked={true}/></TableRowColumn>
                                <TableRowColumn><RaisedButton label="Delete?" disabled={user.email == this.props.userName} onClick={() => this.deleteModal({...user, registered:true})} /></TableRowColumn>
                            </TableRow>
                        ))}
                        {unregistered_users.map( user => (
                            <TableRow key={user.id}>
                                <TableRowColumn>{user.email}</TableRowColumn>
                                <TableRowColumn><Checkbox disabled={true} checked={false}/></TableRowColumn>
                                <TableRowColumn><Checkbox disabled={true} checked={false}/></TableRowColumn>
                                <TableRowColumn><RaisedButton label="Unapprove?" onClick={() => this.deleteModal({...user, registered:false})}/></TableRowColumn>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableRowColumn>
                                <TextField 
                                    floatingLabelText="Approve User" 
                                    hintText="email@some.address" 
                                    value={this.state.approvingUser}
                                    onChange={(event, newValue) => this.setState({approvingUser: newValue})}
                                /> 
                            </TableRowColumn>
                            <TableRowColumn>
                                <RaisedButton label="Add" onClick={this.approveUser}/>
                            </TableRowColumn>
                        </TableRow>
                    </TableBody>
                </Table>

            </div>
        );
    }
}

export default Management;
