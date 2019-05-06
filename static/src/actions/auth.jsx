import { browserHistory } from 'react-router';

import * as constants from '../constants/index';

import { parseJSON } from '../utils/misc';
import { get_token, create_user, create_league_and_user } from '../utils/http_functions';


export function loginUserSuccess(token) {
  localStorage.setItem('token', token);
  return {
    type: constants.LOGIN_USER_SUCCESS,
    payload: {
      token,
    },
  };
}


export function loginUserFailure(error) {
  localStorage.removeItem('token');
  return {
    type: constants.LOGIN_USER_FAILURE,
    payload: {
      status: error.response.status,
      statusText: error.response.statusText,
    },
  };
}

export function loginUserRequest() {
  return {
    type: constants.LOGIN_USER_REQUEST,
  };
}

export function logout() {
  localStorage.removeItem('token');
  return {
    type: constants.LOGOUT_USER,
  };
}

export function logoutAndRedirect() {
  return (dispatch) => {
    dispatch(logout());
    browserHistory.push('/');
  };
}

export function redirectToRoute(route) {
  return () => {
    browserHistory.push(route);
  };
}

export function loginUser(email, password) {
  return function (dispatch) {
    dispatch(loginUserRequest());
    return get_token(email, password)
      .then(parseJSON)
      .then(response => {
        try {
          dispatch(loginUserSuccess(response.token));
          browserHistory.push('/leaderboard');
        } catch (e) {
          alert(e);
          dispatch(loginUserFailure({
            response: {
              status: 403,
              statusText: 'Invalid token',
            },
          }));
        }
      })
      .catch(error => {
        dispatch(loginUserFailure({
          response: {
            status: 403,
            statusText: 'Invalid username or password',
          },
        }));
      });
  };
}


export function registerUserRequest() {
  return {
    type: constants.REGISTER_USER_REQUEST,
  };
}

export function registerUserSuccess(token) {
  localStorage.setItem('token', token);
  return {
    type: constants.REGISTER_USER_SUCCESS,
    payload: {
      token,
    },
  };
}

export function registerUserFailure(error) {
  localStorage.removeItem('token');
  return {
    type: constants.REGISTER_USER_FAILURE,
    payload: {
      status: error.response.status,
      statusText: error.response.statusText,
    },
  };
}

export function registerUser(registration_code, name, email, password) {
  return function (dispatch) {
    dispatch(registerUserRequest());
    return create_user(registration_code, name, email, password)
      .then(parseJSON)
      .then(response => {
        try {
          dispatch(registerUserSuccess(response.token));
          browserHistory.push('/leaderboard');
        } catch (e) {
          dispatch(registerUserFailure({
            response: {
              status: 403,
              statusText: 'Invalid token',
            },
          }));
        }
      })
      .catch(error => {
        dispatch(registerUserFailure({
          response: {
            status: 403,
            statusText: 'User with that email already exists',
          },
        }
        ));
      });
  };
}

export function registerLeagueAndUser(league_name, name, email, password) {
  return function (dispatch) {
    dispatch(registerUserRequest());
    return create_league_and_user(league_name, name, email, password)
      .then(parseJSON)
      .then(response => {
        try {
          dispatch(registerUserSuccess(response.token));
          browserHistory.push('/leaderboard');
        } catch (e) {
          dispatch(registerUserFailure({
            response: {
              status: 403,
              statusText: 'Invalid token',
            },
          }));
        }
      })
      .catch(error => {
        dispatch(registerUserFailure({
          response: {
            status: 403,
            statusText: 'User with that email already exists',
          },
        }
        ));
      });
  };
}
