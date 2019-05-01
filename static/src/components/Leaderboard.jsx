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
import { randomColor } from 'randomcolor';
import {Line} from 'react-chartjs-2';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import moment from 'moment';
import {Card, CardTitle, CardText} from 'material-ui/Card';


function mapStateToProps(state) {
    return {
        players: state.players.players,
        games: state.players.games,
        stats: state.players.stats
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(actionCreators, dispatch);
}

 @connect(mapStateToProps, mapDispatchToProps)
export default class Leaderboard extends React.Component { // eslint-disable-line react/prefer-stateless-function
    constructor() {
        super();
        this.charts = {
            elo: (stat) => stat.elo,
            avgPts: (stat) => stat.total_points / (stat.wins + stat.losses),
            totalPts: (stat) => stat.total_points
        };

        this.state = {
            leaderboard: [],
            currentChart: "elo",
            expandedLeaderboard: true
        };
        this.chartOptions = {
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                }]
            }
        };
    }

    componentDidMount() {
        if( ! this.props.players || this.props.players.length == 0){
            this.props.getPlayers(this.props.token);
        }
        if( ! this.props.games || this.props.games.length == 0){
            this.props.getGames(this.props.token);
        }
        if( ! this.props.stats || this.props.stats.length == 0){
            this.props.getStats(this.props.token);
        }
    }

    getAveragePoints(stat) {
        if(stat.wins + stat.losses == 0) {
            return 0;
        } else {
            return ;
        }
    }

    getDataPoint = (stat) => {
        if(stat.wins + stat.losses == 0){
            return [];
        } else {
            return [{y: this.charts[this.state.currentChart](stat), t: new Date(stat.time*1000)}];
        }
    };

    getChartData = () => {
        const stats_by_user_id = this.props.stats.reduce( (users, stat) => {
            (users[stat.user_id] = users[stat.user_id] || []).push(stat); 
            return users;
        }, {});

        const datasets = Object.keys(stats_by_user_id).flatMap( (user_id) => {
            const player = this.props.players.find((user) => user.id == user_id);
            if(player) {
                const stats = stats_by_user_id[user_id];
                const color = randomColor();
                return [{
                    label: player.name,
                    fill: false,
                    lineTension: 0.1,
                    borderColor: color,
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: color,
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: color,
                    pointHoverBorderColor: color,
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: stats.flatMap(this.getDataPoint)
                }];
            } else {
                return [];
            }
        });
        console.log('wow!!',datasets);
        return  {datasets};
    }

    render() {
        return (
            <div>
                <Card expanded={this.state.expandedLeaderboard}>
                    <CardTitle
                      title="Leaderboard"
                      subtitle="All players, ranked by ELO score"
                      actAsExpander={true}
                      showExpandableButton={true}
                    />
                    <CardText expandable={true}>

                        {
                            this.props.players &&
                            <Table aria-labelledby="Leaderboard" >
                                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                                    <TableRow>
                                        <TableHeaderColumn>Rank</TableHeaderColumn>
                                        <TableHeaderColumn>Name</TableHeaderColumn>
                                        <TableHeaderColumn>ELO</TableHeaderColumn>
                                        <TableHeaderColumn>W/L Ratio</TableHeaderColumn>
                                    </TableRow>
                                </TableHeader>
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
                    </CardText>
              </Card>
                <br/>
                <Card>
                    <CardTitle
                      title="Games"
                      subtitle="All games of this season"
                      actAsExpander={true}
                      showExpandableButton={true}
                    />
                    <CardText expandable={true}>
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
                                            <TableRowColumn>{moment(game.time * 1000).fromNow()}</TableRowColumn>
                                        </TableRow>
                                    );
                                })}
                                </TableBody>
                            </Table>
                        }
                    </CardText>
                </Card>
                <br/>


                <Card>
                    <CardTitle
                      title="Trends"
                      subtitle="How do you know you are having fun if there aren't any charts?"
                      actAsExpander={true}
                      showExpandableButton={true}
                    />
                    <CardText expandable={true}>
                        {
                            this.props.games &&
                            <div>
                                <RadioButtonGroup 
                                    valueSelected={this.state.currentChart}
                                    onChange={(event, newValue) => this.setState({currentChart:newValue})}
                                >
                                    <RadioButton
                                        value="elo"
                                        label="ELO"
                                    />
                                    <RadioButton
                                        value="avgPts"
                                        label="Avg Pts"
                                    />
                                    <RadioButton
                                        value="totalPts"
                                        label="Total Pts"
                                    />
                                </RadioButtonGroup>

                                <Line data={this.getChartData()} options={this.chartOptions}/>
                            </div>
                        }
                    </CardText>
                </Card>
            </div>
        );
    }
}