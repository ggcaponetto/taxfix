/* eslint-env node, browser */
import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

import AppContainer from './containers/AppContainer';
import taxfixApp from './reducers';

const initStore = (preloadedState = {}) => {
  const logger = createLogger();
  const middleware = [thunk, logger];
  const store = createStore(
    taxfixApp,
    preloadedState,
    applyMiddleware(...middleware)
  );
  return store;
};

const store = initStore();

export default class MainComponent extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <AppContainer />
      </Provider>
    );
  }
}
