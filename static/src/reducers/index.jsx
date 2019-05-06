import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import auth from './auth';
import league from './league';

const rootReducer = combineReducers({
  routing: routerReducer,
  /* your reducers */
  auth,
  league,
});

export default rootReducer;
