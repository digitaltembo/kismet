import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';
import Table from 'material-ui/Table/Table';
import TableBody from 'material-ui/Table/TableBody';
import TableRowColumn from 'material-ui/Table/TableRowColumn';
import TableHeaderColumn from 'material-ui/Table/TableHeaderColumn';
import TableHeader from 'material-ui/Table/TableHeader';
import TableRow from 'material-ui/Table/TableRow';
import Checkbox from 'material-ui/Checkbox';
import * as actionCreators from '../actions/players';
import { parseJSON } from '../utils/misc';

function mapStateToProps(state) {
    return {
        players: state.players.players,
        games: state.players.games
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(actionCreators, dispatch);
}

 @connect(mapStateToProps, mapDispatchToProps)
export default class Leaderboard extends React.Component { // eslint-disable-line react/prefer-stateless-function
    constructor() {
        super();
        this.state = {
            leaderboard: [] 
        };
    }

    componentDidMount() {
        if( ! this.props.players || this.props.players.length == 0){
            this.props.getPlayers(this.props.token);
        }
        if( ! this.props.games || this.props.games.length == 0){
            this.props.getGames(this.props.token);
        }
    }
    render() {
        // const players = this.state.players;
        // const numSelected = 0;
        // const rowCount = movies.length;
        const onSelectAllClick = () => 0;
        return (
            <div className="col-md-8">
                <h1>Leaderboard</h1>
                <hr />
                {
                    this.props.players &&
                    <Table aria-labelledby="Leaderboard" >
                        <TableBody displayRowCheckbox={false}>
                        { this.props.players.map( (player, index) => {
                            return (
                                <TableRow key={player.id} >
                                    <TableRowColumn>#{index + 1}</TableRowColumn>
                                    <TableRowColumn>{player.name}</TableRowColumn>
                                    <TableRowColumn>{player.elo}</TableRowColumn>
                                    <TableRowColumn>{player.wins}:{player.losses}</TableRowColumn>
                                </TableRow>
                            );
                        })}
                        </TableBody>
                    </Table>
                }
                <h1>Games</h1>
                <hr/>

                {
                    this.props.games &&
                    <Table aria-labelledby="Leaderboard" >
                        <TableBody displayRowCheckbox={false}>
                        { this.props.games.map( (game) => {
                            return (
                                <TableRow key={game.id} >
                                    <TableRowColumn>{game.winner.name}</TableRowColumn>
                                    <TableRowColumn>{game.winner_score}</TableRowColumn>
                                    <TableRowColumn>{game.loser.name}</TableRowColumn>
                                    <TableRowColumn>{game.loser_score}</TableRowColumn>
                                </TableRow>
                            );
                        })}
                        </TableBody>
                    </Table>
                }



            </div>
        );
    }
}