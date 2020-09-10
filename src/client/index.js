import React from 'react';
import { render } from 'react-dom';
import {
  ConnectedRouter,
  push,
  routerMiddleware
} from 'connected-react-router';
import { CookiesProvider } from 'react-cookie';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore, compose } from 'redux';
import { createStateSyncMiddleware } from 'redux-state-sync';
import thunkMiddleware from 'redux-thunk';
import { createBrowserHistory } from 'history';
import reducers from './redux/reducers';
import './utils/polyfills';
import '../../semantic/dist/semantic.min.css';
import './index.scss';
import App from './App';

const history = createBrowserHistory();

const stateSyncConfig = {
  whitelist: ['LOGOUT_USER']
};

const logOutMiddleware = store => next => action => {
  if (action.type === 'LOGOUT_USER') {
    store.dispatch(push('/login'));
  }
  return next(action);
};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducers(history),
  composeEnhancers(
    applyMiddleware(
      thunkMiddleware,
      routerMiddleware(history),
      logOutMiddleware,
      createStateSyncMiddleware(stateSyncConfig)
    )
  )
);

export default function Index() {
  return (
    <Provider store={store}>
      <CookiesProvider>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </CookiesProvider>
    </Provider>
  );
}

render(<Index store={store} />, document.querySelector('#app'));
