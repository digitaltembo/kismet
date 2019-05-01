import { RECEIVED_PLAYERS, RECORDED_GAME, RECEIVED_GAMES, RECEIVED_STATS } from '../constants';
import { createReducer } from '../utils/misc';

const initialState = {
    players:[],
    games: [],
    stats: []
};

export default createReducer(initialState, {
    [RECEIVED_PLAYERS]: (state, payload) =>
        Object.assign({}, state, {
            players: payload.data.sort( (p1, p2) => p2.elo - p1.elo )
        }),
    [RECEIVED_GAMES]: (state, payload) =>
        Object.assign({}, state, {
            games: payload.data.sort( (g1, g2) => g2.time - g1.time )
        }),
    [RECEIVED_STATS]: (state, payload) =>
        Object.assign({}, state, {
            stats: payload.data.sort( (g1, g2) => g1.time - g2.time )
        }),
    [RECORDED_GAME]: (state, payload) => {
        if(payload.result == "BILLING NEEDED") {
            return Object.assign({}, state, {
                error: 'This action has been prevented due to your current billing status'
            })
        } else { 
            return state;
        }
    } 
});
