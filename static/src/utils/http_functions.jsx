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

export function create_user(email, password) {
    return axios.post('/api/user/register', {
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



export function get_book_authors(token) {
    return axios.get('/api/book/list/authors', tokenConfig(token));
}
export function get_book_genres(token) {
    return axios.get('/api/book/list/genres', tokenConfig(token));
}
export function get_book_series(token) {
    return axios.get('/api/book/list/series', tokenConfig(token));
}
export function get_book_countries(token) {
    return axios.get('/api/book/list/countries', tokenConfig(token));
}
export function get_book_languages(token) {
    return axios.get('/api/book/list/languages', tokenConfig(token));
}
export function get_book_original_languages(token) {
    return axios.get('/api/book/list/original_languages', tokenConfig(token));
}
export function get_movies(token) {
    return axios.get('/api/movie/list', tokenConfig(token));
}

export function get_users(token) {
    return axios.get('/api/user/list', tokenConfig(token));
}
export function delete_user(token, user) {
    return axios.delete('/api/user/delete', {params:{id:user.id}, ...tokenConfig(token)});
}

export function approve_user(token, user) {
    return axios.post('/api/user/approve', user, tokenConfig(token));
}
export function remove_user_approval(token, user) {
    return axios.delete('/api/user/delete-approval', {params:{email:user.email}, ...tokenConfig(token)});
}









