import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import ReduxPromise from 'redux-promise';

import WeatherWatcher from './components/WeatherWatcher';
import reducers from './reducers';

//Connect ReduxPromise into the applciation as a middleware.
const createStoreWithMiddleware = applyMiddleware(ReduxPromise)(createStore);

/**
 * ReactDOM renderer
 */
ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>
    <WeatherWatcher />
  </Provider>
  , document.querySelector('.container'));