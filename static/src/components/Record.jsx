import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actionCreators from '../actions/players';
import {List, ListItem} from 'material-ui/List';
import {Card, CardHeader, CardText} from 'material-ui/Card';

import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';
import Table from 'material-ui/Table/Table';
import TableBody from 'material-ui/Table/TableBody';
import TableRowColumn from 'material-ui/Table/TableRowColumn';
import TableHeaderColumn from 'material-ui/Table/TableHeaderColumn';
import TableHeader from 'material-ui/Table/TableHeader';
import TableRow from 'material-ui/Table/TableRow';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import { Pie } from 'react-chartjs-2';

import { compare_players } from '../utils/http_functions';
import { parseJSON } from '../utils/misc';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';


const Player = ({player, rank}) => {
    return (
        <Card>
            <CardHeader title={player.name} avatar={ (player.profile_pic) ? player.profile_pic : "static/pong.png" } />
            <CardText>
                <p>Rank: {rank}</p>
                <p>ELO: {player.elo}</p>
                <p>Win/Loss ratio: {player.wins}:{player.losses}</p>
                <p>Avg points per game: {player.total_points / (player.wins + player.losses)}</p>
            </CardText>
        </Card>
    );
};

function mapStateToProps(state) {
    return {
        players: state.players.players
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(actionCreators, dispatch);
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Record extends React.Component { // eslint-disable-line react/prefer-stateless-function
    constructor() {
        super();
        this.state = {
            aId      : false,
            bId      : false,
            aScore : "",
            bScore : "",
            submitting   : false,
            simulation   : {}
        };
    }

    componentDidMount() {
        if( ! this.props.players || this.props.players.length == 0){
            this.props.getPlayers(this.props.token);
        }
    }

    simulationKey = (playerA, playerB) => {
        if(playerA && playerB){
            return playerA.name + " vs " + playerB.name;
        } else {
            return "X";
        }
    };

    handleSubmit = () => this.setState({submitting: true});
    handleCancel = () => this.setState({submitting: false});
    playerASelect = (event, index, value) => this.setState({aId: value});
    playerBSelect = (event, index, value) => this.setState({bId: value});

    rankOf = (player) => this.props.players.findIndex( (p) => p.id == player.id ) + 1;

    recordGame = () => {
        console.log("recording");
        this.props.recordGame(
            this.props.token, 
            {
                playerA: {id: this.state.aId, score: this.state.aScore},
                playerB: {id: this.state.bId, score: this.state.bScore}
            }
        );
        this.setState({simulation: {}});
        this.handleCancel();
    }


    getPieData = (name1, wins1, name2, wins2) => {
        return {
            datasets: [{
                data: [wins1, wins2],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB'
                ],
                hoverBackgroundColor: [
                    '#FF6384',
                    '#36A2EB'
                ]
            }],
            labels: [name1, name2]
        };
    };


    render() {
        const {aId, bId, aScore, bScore, submitting, simulation} = this.state;
        const {players} = this.props;

        const playerA = (aId) ? players.find( (p) => p.id == aId) : false;
        const playerB = (bId) ? players.find( (p) => p.id == bId) : false;

        const key = this.simulationKey(playerA, playerB);
        console.log(key, playerA, playerB);
        if(key != "X" && !(key in simulation)){
            
            const token = this.props.token;
            compare_players(token, playerA.id, playerB.id)
                .then(parseJSON)
                .then(j => {console.log(j); return j})
                .then(response => {
                    console.log("Recording! " + response);
                    this.setState({
                        simulation: {...simulation, [key]: response}
                    });
                })
        }

        const simulationResult = simulation[this.simulationKey(playerA, playerB)];
        console.log(simulationResult);
        // const numSelected = 0;
        // const rowCount = movies.length;
        const onSelectAllClick = () => 0;

        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onClick={this.handleCancel}
            />  ,
            <FlatButton
                label="Submit"
                primary={true}
                keyboardFocused={true}
                onClick={this.recordGame}
            />,
        ];
 
        return (
            <div className="container" style={{width:"100%", margin:"0 auto"}}>
                <div className="row">
                    <h1> Simulate And Accrue Points </h1>
                    <hr />
                </div>
                <div className="row">
                    <div className="col-md-3">
                        <SelectField 
                            value={aId}
                            onChange={this.playerASelect}
                            floatingLabelText="Player A"
                        >
                            {players.map( (player) => (
                                <MenuItem 
                                    key={player.id}
                                    value={player.id}
                                    primaryText={player.name}
                                />
                            ))}
                        </SelectField> 
                    </div>
                    <div className="col-md-3">
                        <SelectField 
                            value={bId}
                            onChange={this.playerBSelect}
                            floatingLabelText="Player B"
                        >
                            {players.map( (player) => (
                                <MenuItem 
                                    key={player.id}
                                    value={player.id}
                                    primaryText={player.name}
                                />
                            ))}
                        </SelectField>
                    </div>
                    <div className="col-md-6"></div>
                </div>

                {
                    (playerA&& playerB) && 
                    <Paper zDepth={1} style={{margin:"20px 0"}}>
                        <div className="row">
                            <div className="col-md-3">
                                <TextField 
                                    floatingLabelText={playerA.name + "'s points:"} 
                                    hintText="21" 
                                    type="number"
                                    value={aScore}
                                    onChange={(event, newValue) => this.setState({aScore: newValue})}
                                />
                            </div>
                            <div className="col-md-3">
                                <TextField 
                                    floatingLabelText={playerB.name + "'s points:"} 
                                    hintText="21" 
                                    type="number"
                                    value={bScore}
                                    onChange={(event, newValue) => this.setState({bScore: newValue})}
                                />
                            </div>
                            <div className="col-md-6">
                                { 
                                <div className="text-center" style={{margin:"18px"}}>
                                    <RaisedButton label="Record Match" onClick={this.handleSubmit} disabled={!(aScore && bScore)} />
                                    {
                                        (aScore && bScore) &&
                                        <Dialog
                                            title="Record Match"
                                            actions={actions}
                                            modal={false}
                                            open={submitting}
                                            onRequestClose={this.handleCancel}
                                        >   
                                            { 
                                                (aScore > bScore) ?
                                                    (<span> Please confirm: {playerA.name} beat {playerB.name} ({aScore} to {bScore})?</span>) :
                                                    ( (aScore < bScore) ?
                                                        (<span> Please confirm: {playerB.name} beat {playerA.name} ({bScore} to {aScore})?</span>) :
                                                        (<span> A Tie!? You can't record a tie. Go back and finish your game.</span>)
                                                    )
                                            }
                                        </Dialog>
                                    }
                                </div>
                                }
                            </div>
                        </div>
                    </Paper>
                }


                <div className="row">
                    <div className="col-md-3">
                        {   playerA && <Player player={playerA} rank={this.rankOf(playerA)}/> }
                    </div>
                    <div className="col-md-3">
                        {   playerB && <Player player={playerB} rank={this.rankOf(playerB)}/> }
                    </div>
                    <div className="col-md-6">
                        <h2>Match Outcomes</h2>
                        {
                            (simulationResult) ? 
                                (   
                                    <div>
                                        <Table>
                                            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                                                <TableRow>
                                                    <TableHeaderColumn></TableHeaderColumn>
                                                    <TableHeaderColumn>{playerA.name}</TableHeaderColumn>
                                                    <TableHeaderColumn>{playerB.name}</TableHeaderColumn>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody displayRowCheckbox={false}>
                                                <TableRow>
                                                    <TableRowColumn>Chance of Winning</TableRowColumn>
                                                    <TableRowColumn>{Math.round(simulationResult[0].winProbability * 100)}%</TableRowColumn>
                                                    <TableRowColumn>{Math.round(simulationResult[1].winProbability * 100)}%</TableRowColumn>
                                                </TableRow>
                                                <TableRow>
                                                    <TableRowColumn>Points for Win</TableRowColumn>
                                                    <TableRowColumn>+{simulationResult[0].winDelta.toFixed(1)}</TableRowColumn>
                                                    <TableRowColumn>+{simulationResult[1].winDelta.toFixed(1)}</TableRowColumn>
                                                </TableRow>
                                                <TableRow>
                                                    <TableRowColumn>Points for Loss</TableRowColumn>
                                                    <TableRowColumn>{simulationResult[0].loseDelta.toFixed(1)}</TableRowColumn>
                                                    <TableRowColumn>{simulationResult[1].loseDelta.toFixed(1)}</TableRowColumn>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                        <hr/>
                                        <div>
                                            <h3>History</h3>
                                            { 
                                                (simulationResult[0].wins + simulationResult[1].wins == 0) ? 
                                                    (
                                                        <div>
                                                            {playerA.name} has never played {playerB.name}.
                                                            Maybe it is time to <i>make some history.</i>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            {playerA.name} has won {simulationResult[0].wins} games, 
                                                            while {playerB.name} has won {simulationResult[1].wins} games.
                                                            <Pie 
                                                                data={this.getPieData(
                                                                    playerA.name,
                                                                    simulationResult[0].wins, 
                                                                    playerB.name, 
                                                                    simulationResult[1].wins
                                                                )}
                                                            />
                                                        </div>
                                                    )
                                            }
                                        </div>
                                    </div>
                                ) :
                                (
                                    <p>Select two players to see previous statistics and possible outcomes from a match between them</p>
                                )
                        }
                    </div>
                </div>
            </div>
        );
    }
}