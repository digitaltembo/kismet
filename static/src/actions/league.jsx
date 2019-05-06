import * as constants from '../constants/index';
import { parseJSON } from '../utils/misc';
import { get_players, record_game, get_games, update_user, add_user, get_stats, get_league, delete_user} from '../utils/http_functions';
import { logoutAndRedirect } from './auth';

export function receivePlayers(data) {
  return {
    type: constants.RECEIVED_PLAYERS,
    payload: {
      data,
    },
  };
}
export function receiveGames(data) {
  return {
    type: constants.RECEIVED_GAMES,
    payload: {
      data,
    },
  };
}
export function receiveStats(data) {
  return {
    type: constants.RECEIVED_STATS,
    payload: {
      data,
    },
  };
}
export function fetchPlayers() {
  return {
    type: constants.FETCH_PLAYERS,
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
    type: constants.RECORDED_GAME,
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
    type: constants.EDITED_USER,
    payload: payload
  };
}

export function editUser(token, user) {
  console.log(user);
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
    type: constants.ADDED_USER,
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

export function userDeleted(payload) {
  return {
    type: constants.REMOVED_USER,
    payload: payload
  };
}

export function deleteUser(token, user) {
  return (dispatch) => {
    delete_user(token, user)
      .then(parseJSON)
      .then(response => {
        dispatch(userDeleted(response));
      });
  };
}
export function receiveLeague(payload) {
  return {
    type: constants.LOADED_LEAGUE,
    payload: payload
  };
}

export function getLeague(token) {
  return (dispatch) => {
    get_league(token)
      .then(parseJSON)
      .then(response => {
        dispatch(receiveLeague(response));
      });
  };
}


