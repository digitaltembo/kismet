import { RECEIVED_PLAYERS, FETCH_PLAYERS, RECORDED_GAME, RECEIVED_GAMES, ADDED_USER, EDITED_USER, RECEIVED_STATS } from '../constants/index';
import { parseJSON } from '../utils/misc';
import { get_players, record_game, get_games, update_user, add_user, get_stats} from '../utils/http_functions';
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
export function receiveStats(data) {
    return {
        type: RECEIVED_STATS,
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

export function getStats(token) {
    return (dispatch) => {
        get_stats(token)
            .then(parseJSON)
            .then(response => {
                dispatch(receiveStats(response));
            });
    };
}



export function userEdited(payload) {
    return {
        type: EDITED_USER,
        payload: payload
    };
}

export function editUser(token, user) {
    return (dispatch) => {
        update_user(token, user)
            .then(parseJSON)
            .then(response => {
                dispatch(userEdited(response));
            });
    };
}

export function userAdded(payload) {
    return {
        type: ADDED_USER,
        payload: payload
    };
}

export function addUser(token, user) {
    return (dispatch) => {
        add_user(token, user)
            .then(parseJSON)
            .then(response => {
                dispatch(userAdded(response));
            });
    };
}


