import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import auth from './auth';
import players from './players';

const rootReducer = combineReducers({
    routing: routerReducer,
    /* your reducers */
    auth,
    players,
});

export default rootReducer;
