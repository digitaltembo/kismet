import { RECEIVED_PLAYERS, FETCH_PLAYERS, RECORDED_GAME, RECEIVED_GAMES } from '../constants/index';
import { parseJSON } from '../utils/misc';
import { get_players, record_game, get_games } from '../utils/http_functions';
import { logoutAndRedirect } from './auth';

export function receivePlayers(data) {
    console.log("wow");
    console.log(data);
    return {
        type: RECEIVED_PLAYERS,
        payload: {
            data,
        },
    };
}
export function receiveGames(data) {
    return {
        type: RECEIVED_GAMES,
        payload: {
            data,
        },
    };
}
export function fetchPlayers() {
    return {
        type: FETCH_PLAYERS,
    };
}

export function getPlayers(token) {
    return (dispatch) => {
        console.log('fetching players');
        dispatch(fetchPlayers());
        get_players(token)
            .then(parseJSON)
            .then(response => {
                dispatch(receivePlayers(response));
            });
    };
}

export function recordedGame(data) {
    return {
        type: RECORDED_GAME,
        payload: {
            data 
        }
    };
}

export function recordGame(token, payload) {
    return (dispatch) => {
        record_game(token, payload)
            .then(parseJSON)
            .then(response => {
                dispatch(recordedGame(response));
            }).then(() => dispatch(getPlayers(token)));
    };
}

export function getGames(token) {
    return (dispatch) => {
        get_games(token)
            .then(parseJSON)
            .then(response => {
                dispatch(receiveGames(response));
            });
    };
}