import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from '../reducers';

const debugware = [];
if (process.env.NODE_ENV !== 'production') {
  const createLogger = require('redux-logger');

  debugware.push(createLogger({
    collapsed: true,
  }));
}

const storeEnhancers = (process.env.NODE_ENV !== 'production') ? 
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose :
  compose 
;

export default function configureStore(initialState) {
  const store = createStore(
    rootReducer,
    initialState,
    storeEnhancers(applyMiddleware(thunkMiddleware, ...debugware))
  );

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers/index').default;

      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
