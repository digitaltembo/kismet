import * as constants from '../constants';
import { createReducer } from '../utils/misc';

const initialState = {
  players:[],
  games: [],
  stats: []
};

export default createReducer(initialState, {
  [constants.RECEIVED_PLAYERS]: (state, payload) =>
    ({
      ...state,
      players: payload.data.sort( (p1, p2) => p2.elo - p1.elo )
    }),
  [constants.RECEIVED_GAMES]: (state, payload) =>
    ({
      ...state,
      games: payload.data.sort( (g1, g2) => g2.time - g1.time )
    }),
  [constants.RECEIVED_STATS]: (state, payload) =>
    ({
      ...state,
      stats: payload.data.sort( (g1, g2) => g1.time - g2.time )
    }),
  [constants.RECORDED_GAME]: (state, payload) => {
    if(payload.result == "BILLING NEEDED") {
      return ({
        ...state,
        error: 'This action has been prevented due to your current billing status'
      });
    } else { 
      return state;
    }
  },
  [constants.EDITED_USER]: (state, payload) => {
    const editedUserIndex = state.players.findIndex((player) => player.id == payload.id);
    const editedUser = state.players[editedUserIndex];
    return ({
      ...state,
      players: [
        ...state.players,
        [editedUserIndex]: {...editedUser, ...payload}
      ]
    })
  },
  [constants.LOADED_LEAGUE]: (state, payload) => 
    ({
      ...state,
      league: payload
    }),

  [constants.REMOVED_USER]: (state, payload) =>  {
    let players = state.players;
    players.splice(players.findIndex((player) => player.id == payload.id), 1);
    return ({...state, players});
  }

});
