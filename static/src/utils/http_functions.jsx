/* eslint camelcase: 0 */

import axios from 'axios';

const tokenConfig = (token) => ({
  headers: {
    'Authorization': token, // eslint-disable-line quote-props
  },
});

export function validate_token(token) {
  return axios.post('/api/is_token_valid', {
    token,
  });
}

export function create_user(registration_code, name, email, password) {
  return axios.post('/api/user/register', {
    registration_code,
    name, 
    email,
    password,
  });
}

export function create_league_and_user(league_name, name, email, password) {
  return axios.post('/api/league/create_league_and_user', {
    league_name,
    name,
    email,
    password,
  });
}

export function get_token(email, password) {
  return axios.post('/api/get_token', {
    email,
    password,
  });
}

export function data_about_user(token) {
  return axios.get('/api/my/user', tokenConfig(token));
}

export function get_players(token) {
  return axios.get('/api/league/players', tokenConfig(token));
}
export function get_games(token) {
  return axios.get('/api/game/list', tokenConfig(token));
}
export function get_stats(token) {
  return axios.get('/api/stat/list', tokenConfig(token));
}
export function compare_players(token, aId, bId) {
  return axios.get('/api/stat/compare', {...tokenConfig(token), "params": {"playerA": aId, "playerB": bId}});
}
export function record_game(token, payload) {
  return axios.post('/api/game/record', payload, tokenConfig(token)) ;
}

export function update_user(token, user) {
  return axios.post('/api/user/update', user, tokenConfig(token));
}

export function add_user(token, user) {
  return axios.post('/api/user/add', user, tokenConfig(token));
}

export function get_league(token) {
  return axios.get('/api/my/league', tokenConfig(token));
}

export function delete_user(token, user) {
  return axios.delete('/api/user/delete', {params:{id:user.id}, ...tokenConfig(token)});
}

